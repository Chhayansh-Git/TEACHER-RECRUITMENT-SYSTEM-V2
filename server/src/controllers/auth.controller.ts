// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Types } from 'mongoose';
import User from '../models/user.model';
import Plan from '../models/plan.model'; // Import Plan model
import Subscription from '../models/subscription.model'; // Import Subscription model
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/sendEmail';
import sendSms from '../utils/sendSms';

// --- Helper Functions ---
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
    await sendEmail({
        to: email,
        templateKey: 'email-verification-otp',
        payload: { otp }
    });
};

const sendOtpSms = async (phone: string, otp: string) => {
    const message = `Your TeacherRecruit verification code is: ${otp}`;
    await sendSms({ to: phone, body: message });
};


// --- Controller Functions ---
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, ...schoolDetails } = req.body;
  
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser && (existingUser.isVerified)) {
    res.status(400);
    throw new Error('A verified user with this email or phone number already exists.');
  }

  // Use the existing unverified user or create a new one
  const user = existingUser || new User();

  // Set/update user properties
  user.set({
    name,
    email,
    phone,
    password,
    role,
  });
  
  if (role === 'school') {
      user.schoolDetails = schoolDetails;
      user.profileCompleted = true;
  }

  // --- NEW SUBSCRIPTION LOGIC FOR NEW SCHOOLS ---
  if (!user.isNew && user.role !== 'school') {
    // If user exists but is not a school, just continue
  } else if (user.isNew && role === 'school') {
    const schoolCount = await User.countDocuments({ role: 'school' });
    
    if (schoolCount < 200) {
        // Early Adopter: Waive fee and grant 1-year Premium trial
        user.registrationFeePaid = true;
        // The subscription will be created *after* the user is saved to get an ID
    } else {
        // Standard Registration: Fee required
        user.registrationFeePaid = false;
    }
  } else if (user.isNew && role !== 'school') {
    user.registrationFeePaid = true; // Not applicable to candidates
  }
  
  const emailOtp = generateOtp();
  user.emailOtp = emailOtp;
  user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.isEmailVerified = false;

  const phoneOtp = generateOtp();
  user.phoneOtp = phoneOtp;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.isPhoneVerified = false;
  user.isVerified = false; // Reset verification status on re-registration attempt

  await user.save();

  // --- CREATE FREE PREMIUM SUBSCRIPTION IF EARLY ADOPTER ---
  if (user.role === 'school' && user.registrationFeePaid && !existingUser) { // only for brand new, fee-waived schools
    const premiumPlan = await Plan.findOne({ name: 'Premium' });
    if (premiumPlan) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1); // 1 year from now
        
        await Subscription.create({
            school: user._id,
            plan: premiumPlan._id,
            startDate,
            endDate,
            status: 'active',
        });
        console.log(`Created 1-year Premium trial for early adopter school: ${user.name}`);
    }
  }
  
  const formattedPhone = `+91${phone}`;
  await sendOtpEmail(user.email, emailOtp);
  if (phone) {
    await sendOtpSms(formattedPhone, phoneOtp);
  }

  res.status(201).json({
    message: 'Registration initiated. Please check your email and phone for verification codes.',
    email: user.email,
    phone: user.phone,
  });
});

const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, emailOtp, phoneOtp } = req.body;

    const user = await User.findOne({ 
        email, 
        emailOtpExpires: { $gt: Date.now() },
        phoneOtpExpires: { $gt: Date.now() },
    });

    if (!user || user.emailOtp !== emailOtp.trim() || user.phoneOtp !== phoneOtp.trim()) {
        res.status(400);
        throw new Error('Invalid or expired OTPs');
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    
    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    user.isVerified = true;
    
    await user.save();
    
    // This logic correctly handles both early adopters and standard registrations
    if (user.role === 'school' && !user.registrationFeePaid) {
        res.json({
            paymentRequired: true,
            userId: user._id,
            email: user.email,
            schoolName: user.name,
            message: 'Verification successful. Please complete the registration payment.'
        });
    } else {
        res.json({
            paymentRequired: false,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isPhoneVerified: user.isPhoneVerified,
            profileCompleted: user.profileCompleted,
            profilePictureUrl: user.profilePictureUrl,
            token: generateToken(user._id as Types.ObjectId),
        });
    }
});


const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    if (!user.isVerified) {
        res.status(401);
        throw new Error('Your account is not fully verified. Please complete the OTP verification process.');
    }
    if (user.role === 'school' && !user.registrationFeePaid) {
        res.status(401);
        throw new Error('Registration payment is pending. Please log in after completing the payment.');
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      profileCompleted: user.profileCompleted,
      profilePictureUrl: user.profilePictureUrl,
      token: generateToken(user._id as Types.ObjectId),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


const resendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (user.isVerified) {
        res.status(400);
        throw new Error('This account is already verified.');
    }

    const emailOtp = generateOtp();
    user.emailOtp = emailOtp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const phoneOtp = generateOtp();
    user.phoneOtp = phoneOtp;
    user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const formattedPhone = `+91${user.phone}`;
    await sendOtpEmail(user.email, emailOtp);
    if (user.phone) {
        await sendOtpSms(formattedPhone, phoneOtp);
    }
    
    res.json({ message: 'New OTPs have been sent to your email and phone.' });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // To prevent email enumeration, we send a success response even if user is not found.
    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, a reset link has been sent.',
    });
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      templateKey: 'forgot-password-link',
      payload: { resetURL },
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error('There was an error sending the email. Try again later!');
  }
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Token is invalid or has expired');
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully!',
  });
});

export { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword };