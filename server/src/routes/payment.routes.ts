// src/routes/payment.routes.ts

import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.post('/create-order', protect, authorizeRoles('school'), createOrder);
router.post('/verify-payment', protect, authorizeRoles('school'), verifyPayment);

export default router;