// src/controllers/user.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import { ProtectedRequest } from '../middleware/auth.middleware';
import sendSms from '../utils/sendSms'; 

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * @desc    Upload user profile picture
 * @route   PUT /api/users/profile-picture
 * @access  Private
 */
const uploadProfilePicture = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  // The path will be something like 'public/uploads/avatars/filename.png'
  // We want to store the accessible URL part: '/uploads/avatars/filename.png'
  const filePath = req.file.path.replace('public', '');

  user.profilePictureUrl = filePath;
  await user.save();

  res.json({
    message: 'Profile picture uploaded successfully',
    profilePictureUrl: user.profilePictureUrl,
  });
});

/**
 * @desc    Send OTP to user's phone for verification
 * @route   POST /api/users/send-phone-otp
 * @access  Private
 */
const sendPhoneOtp = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { phone } = req.body;
  const user = req.user;

  if (!user) throw new Error('User not found');

  const otp = generateOtp();
  user.phoneOtp = otp;
  user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await sendSms({
    to: phone, // Expecting E.164 format from frontend
    body: `Your verification code is: ${otp}`,
  });

  res.json({ message: 'OTP sent to your phone number.' });
});

/**
 * @desc    Verify user's phone OTP
 * @route   POST /api/users/verify-phone-otp
 * @access  Private
 */
const verifyPhoneOtp = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { otp } = req.body;
  const user = await User.findOne({ 
    _id: req.user?._id, 
    phoneOtpExpires: { $gt: Date.now() } 
  });

  if (!user || user.phoneOtp !== otp) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.isPhoneVerified = true;
  user.phoneOtp = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();

  res.json({ message: 'Phone number verified successfully!' });
});

export { uploadProfilePicture, sendPhoneOtp, verifyPhoneOtp };