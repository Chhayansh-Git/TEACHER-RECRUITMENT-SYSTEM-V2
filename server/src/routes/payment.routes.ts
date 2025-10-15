// src/routes/payment.routes.ts

import express from 'express';
import { createOrder, verifyPayment, createRegistrationOrder, verifyRegistrationPayment } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

// Subscription Routes
router.post('/create-order', protect, authorizeRoles('school'), createOrder);
router.post('/verify-payment', protect, authorizeRoles('school'), verifyPayment);

// Registration Fee Routes
router.post('/create-registration-order', createRegistrationOrder);
router.post('/verify-registration-payment', verifyRegistrationPayment);

export default router;