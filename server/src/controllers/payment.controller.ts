// src/controllers/payment.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto'; // Import the crypto module
import Plan from '../models/plan.model';
import Subscription from '../models/subscription.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('FATAL ERROR: Razorpay API Keys are not defined in .env file');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create a razorpay payment order
 * @route   POST /api/payments/create-order
 * @access  Private/School
 */
const createOrder = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { planId } = req.body;
  const school = req.user;

  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }

  const options = {
    amount: plan.price * 100, // Amount in the smallest currency unit (paise for INR)
    currency: 'INR',
    // --- THIS IS THE FIX ---
    // Generate a shorter, random, and unique receipt ID
    receipt: `rcpt_${crypto.randomBytes(12).toString('hex')}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

/**
 * @desc    Verify payment and create subscription
 * @route   POST /api/payments/verify-payment
 * @access  Private/School
 */
const verifyPayment = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
  const schoolId = req.user?._id;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const plan = await Plan.findById(planId);
    if (!plan || !schoolId) {
      throw new Error('Plan or School not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    await Subscription.findOneAndUpdate(
        { school: schoolId },
        {
            plan: planId,
            startDate,
            endDate,
            status: 'active',
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
        },
        { upsert: true, new: true }
    );

    res.json({ message: 'Payment verified and subscription activated successfully' });
  } else {
    res.status(400);
    throw new Error('Payment verification failed');
  }
});

export { createOrder, verifyPayment };