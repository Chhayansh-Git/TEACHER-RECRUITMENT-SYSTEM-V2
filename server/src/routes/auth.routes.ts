// src/routes/auth.routes.ts

import express from 'express';
import { 
    registerUser, 
    loginUser, 
    verifyOtp, // Changed from verifyEmailOtp
    resendOtp, // Changed from resendEmailOtp
    forgotPassword, 
    resetPassword 
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Corrected OTP routes
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

export default router;