// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import generateToken from '../utils/generateToken';
import sendEmail from '../utils/sendEmail'; // Our template-based email service

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
  await sendEmail({
    to: email,
    templateKey: 'email-verification-otp',
    payload: { otp },
  });
};

/**
 * @desc    Register a new user and send OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });

  if (user) {
    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.status(201).json({
      message: 'Registration successful. Please check your email for a verification code.',
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Verify email OTP
 * @route   POST /api/auth/verify-email-otp
 * @access  Public
 */
const verifyEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, emailOtpExpires: { $gt: Date.now() } });

    if (!user || user.emailOtp !== otp) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        profilePictureUrl: user.profilePictureUrl,
        token: generateToken(user._id as Types.ObjectId),
    });
});

/**
 * @desc    Resend email OTP
 * @route   POST /api/auth/resend-email-otp
 * @access  Public
 */
const resendEmailOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    await sendOtpEmail(user.email, otp);

    res.json({ message: 'A new OTP has been sent to your email.' });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      profilePictureUrl: user.profilePictureUrl,
      token: generateToken(user._id as Types.ObjectId),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email address.');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Use the frontend URL for the reset link
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      templateKey: 'forgot-password',
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

/**
 * @desc    Reset Password
 * @route   PATCH /api/auth/reset-password/:token
 * @access  Public
 */
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

export { registerUser, loginUser, forgotPassword, resetPassword, verifyEmailOtp, resendEmailOtp };