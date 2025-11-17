// server/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { Types } from 'mongoose';
import User from '../models/user.model';
import Plan from '../models/plan.model';
import Subscription from '../models/subscription.model';
import Organization from '../models/organization.model';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/sendEmail';
import sendSmsUtil from '../utils/sendSms';

// --- Helper Functions (remain the same) ---
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
    await sendEmail({
        to: email,
        templateKey: 'email-verification-otp',
        payload: { otp }
    });
};

const sendSms = async (phone: string, otp: string) => {
    const message = `Your TeacherRecruit verification code is: ${otp}`;
    await sendSmsUtil({ to: phone, body: message });
};

// --- Controller Functions ---
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, ...details } = req.body;
  
  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser && existingUser.isVerified) {
    res.status(400);
    throw new Error('A verified user with this email or phone number already exists.');
  }

  const user = existingUser || new User();
  const isNewUser = user.isNew;

  user.set({ name, email, phone, password, role });
  
  if (role === 'school') {
      user.schoolDetails = details;
      // Profile is considered complete on registration for schools
      user.profileCompleted = true; 
  }

  // --- NEW REGISTRATION & SUBSCRIPTION LOGIC ---
  if (isNewUser) {
    if (role === 'school') {
        const schoolCount = await User.countDocuments({ role: 'school' });
        
        // Early Adopter Program: First 200 schools get their fee waived.
        if (schoolCount < 200) {
            user.registrationFeePaid = true;
        } else {
            user.registrationFeePaid = false;
        }
    } else if (role === 'group-admin') {
        // Group admins have a separate registration fee, also with an early adopter program.
        const groupCount = await Organization.countDocuments();
        // The discount logic will be handled in the payment controller, but payment is still required.
        user.registrationFeePaid = false;
    } else { // Candidates
        user.registrationFeePaid = true;
    }
  }
  
  // Reset verification for any registration attempt
  user.isEmailVerified = false;
  user.isPhoneVerified = false;
  user.isVerified = false;
  const emailOtp = generateOtp();
  user.emailOtp = emailOtp;
  user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  const phoneOtp = generateOtp();
  user.phoneOtp = phoneOtp;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  // --- POST-SAVE ACTIONS ---
  if (isNewUser) {
      if (user.role === 'school' && user.registrationFeePaid) {
          // Grant 1-year Premium trial to early adopter schools
          const premiumPlan = await Plan.findOne({ name: 'Premium' });
          if (premiumPlan) {
              const startDate = new Date();
              const endDate = new Date(startDate);
              endDate.setFullYear(startDate.getFullYear() + 1);
              
              await Subscription.create({
                  school: user._id,
                  plan: premiumPlan._id,
                  startDate,
                  endDate,
                  status: 'active',
              });
              console.log(`Created 1-year Premium trial for early adopter school: ${user.name}`);
          }
      } else if (user.role === 'group-admin') {
          // Create the organization owned by this new group admin
          await Organization.create({
              name: details.organizationName || `${user.name}'s Group`,
              owner: user._id,
              schools: [],
          });
      }
  }
  
  // Send OTPs
  await sendOtpEmail(user.email, emailOtp);
  if (phone) {
    // Assuming phone numbers from India
    await sendSms(`+91${phone}`, phoneOtp);
  }

  res.status(201).json({
    message: 'Registration initiated. Please check your email and phone for verification codes.',
    email: user.email,
    phone: user.phone,
  });
});


// ... (verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword remain functionally the same)
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
    
    if ((user.role === 'school' || user.role === 'group-admin') && !user.registrationFeePaid) {
        res.json({
            paymentRequired: true,
            userId: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
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
  
  // Populate organization details if they exist when logging in
  const user = await User.findOne({ email }).populate('organization', 'name').select('+password');

  if (user && (await user.comparePassword(password))) {
    if (!user.isVerified) {
        res.status(401);
        throw new Error('Your account is not fully verified. Please complete the OTP verification process.');
    }
    if ((user.role === 'school' || user.role === 'group-admin') && !user.registrationFeePaid) {
        res.status(401);
        throw new Error('Registration payment is pending. Please complete the payment to log in.');
    }
    
    // The user object now contains the populated organization name if it exists
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      profileCompleted: user.profileCompleted,
      profilePictureUrl: user.profilePictureUrl,
      organization: user.organization, // This will be included in the response
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

    await sendOtpEmail(user.email, emailOtp);
    if (user.phone) {
        await sendSms(`+91${user.phone}`, phoneOtp);
    }
    
    res.json({ message: 'New OTPs have been sent to your email and phone.' });
});

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
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
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error('There was an error sending the email. Try again later!');
  }
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
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

  res.status(200).json({ status: 'success', message: 'Password reset successfully!' });
});

export { registerUser, loginUser, verifyOtp, resendOtp, forgotPassword, resetPassword };