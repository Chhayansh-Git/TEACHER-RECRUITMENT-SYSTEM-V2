// src/routes/auth.routes.ts

import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword, verifyEmailOtp, resendEmailOtp } from '../controllers/auth.controller';


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword); // Use patch for updating
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);

export default router;