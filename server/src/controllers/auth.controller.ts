// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/user.model';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/sendEmail';
import sendSms from '../utils/sendSms';
import { Types } from 'mongoose';

// --- Helper Functions ---
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
    // This function is now using your updated sendEmail utility
    await sendEmail({
        to: email,
        subject: 'Your TeacherRecruit Verification Code',
        html: `<h1>Email Verification</h1><p>Your verification code for TeacherRecruit is: <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`
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
  if (existingUser && (existingUser.isEmailVerified || existingUser.isPhoneVerified)) {
    res.status(400);
    throw new Error('A user with this email or phone number already exists.');
  }

  let user = existingUser || new User();

  if (!existingUser) {
    if (role === 'school') {
      const schoolCount = await User.countDocuments({ role: 'school' });
      user.registrationFeePaid = schoolCount < 200;
    } else {
      user.registrationFeePaid = true;
    }
  }

  // --- THIS IS THE NEW UNIFIED LOGIC ---
  user.name = name;
  user.email = email;
  user.phone = phone;
  user.password = password;
  user.role = role;
  
  // If the role is school, attach the detailed school information
  if (role === 'school') {
      user.schoolDetails = schoolDetails;
      user.profileCompleted = true; // Mark profile as complete from the start
  }

  const emailOtp = generateOtp();
  user.emailOtp = emailOtp;
  user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.isEmailVerified = false;

  const phoneOtp = generateOtp();
  user.phoneOtp = phoneOtp;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.isPhoneVerified = false;

  await user.save();
  
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


// ... (The rest of the file: verifyOtp, loginUser, resendOtp, forgotPassword, resetPassword remains the same as the last version you approved)
const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, emailOtp, phoneOtp } = req.body;

    if (!email || !emailOtp || !phoneOtp) {
        res.status(400);
        throw new Error('Email and both OTPs are required.');
    }

    const trimmedEmailOtp = emailOtp.trim();
    const trimmedPhoneOtp = phoneOtp.trim();
    
    const user = await User.findOne({ 
        email, 
        emailOtpExpires: { $gt: Date.now() },
        phoneOtpExpires: { $gt: Date.now() },
    });

    if (!user || user.emailOtp !== trimmedEmailOtp || user.phoneOtp !== trimmedPhoneOtp) {
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
        throw new Error('Registration payment is pending. Cannot log in.');
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
    res.status(404);
    throw new Error('There is no user with that email address.');
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

    console.error('FORGOT PASSWORD EMAIL ERROR:', err);
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