// src/routes/user.routes.ts

import express from 'express';
import { uploadProfilePicture, sendPhoneOtp, verifyPhoneOtp } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

router.put('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

// Add phone verification routes
router.post('/send-phone-otp', protect, sendPhoneOtp);
router.post('/verify-phone-otp', protect, verifyPhoneOtp);

export default router;