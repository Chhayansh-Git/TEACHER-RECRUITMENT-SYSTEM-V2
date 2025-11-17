// server/src/routes/user.routes.ts

import express from 'express';
import { uploadProfilePicture, sendPhoneOtp, verifyPhoneOtp } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
// FIX: Use a named import for uploadAvatar
import { uploadAvatar } from '../middleware/upload.middleware';

const router = express.Router();

// FIX: Use the correctly imported uploadAvatar middleware
router.put('/profile-picture', protect, uploadAvatar.single('profilePicture'), uploadProfilePicture);

// Add phone verification routes
router.post('/send-phone-otp', protect, sendPhoneOtp);
router.post('/verify-phone-otp', protect, verifyPhoneOtp);

export default router;