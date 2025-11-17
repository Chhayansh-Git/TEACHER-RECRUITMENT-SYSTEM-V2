// server/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Plan from '../models/plan.model';
import Subscription, { ISubscription } from '../models/subscription.model';
import User from '../models/user.model';
import Organization from '../models/organization.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('FATAL ERROR: Razorpay API Keys are not defined in .env file');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

/**
 * @desc    Create a subscription order for a school or group admin
 * @route   POST /api/payments/create-order
 * @access  Private/School, Private/Group-Admin
 */
const createOrder = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { planId, isAnnual } = req.body;
  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }

  const amount = isAnnual ? plan.annualPrice : plan.price;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `rcpt_sub_${crypto.randomBytes(10).toString('hex')}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

/**
 * @desc    Verify a subscription payment and activate the subscription
 * @route   POST /api/payments/verify-payment
 * @access  Private/School, Private/Group-Admin
 */
const verifyPayment = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, isAnnual } = req.body;
  const user = req.user!; // ensured by middleware

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404);
      throw new Error('Plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();
    const durationInDays = isAnnual ? 365 : 30;
    endDate.setDate(startDate.getDate() + durationInDays);

    const subscriptionData: Partial<ISubscription> = {
      plan: planId,
      startDate,
      endDate,
      status: 'active',
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    };

    // Query will use concrete mongoose ObjectId instances to avoid type collisions
    let query: Record<string, mongoose.Types.ObjectId>;

    if (user.role === 'group-admin' && user.organization) {
      // user.organization might be a string or ObjectId-like. Coerce to a mongoose ObjectId.
      const orgId = new mongoose.Types.ObjectId(String(user.organization));
      subscriptionData.organization = orgId as any;
      query = { organization: orgId };
    } else {
      // user._id might already be an ObjectId. Coerce to a mongoose ObjectId.
      const schoolId = new mongoose.Types.ObjectId(String(user._id));
      subscriptionData.school = schoolId as any;
      query = { school: schoolId };
    }

    // Update or create the subscription
    await Subscription.findOneAndUpdate(query, subscriptionData, { upsert: true, new: true });

    res.json({ message: 'Payment verified and subscription activated successfully' });
  } else {
    res.status(400);
    throw new Error('Payment verification failed');
  }
});

/**
 * @desc    Create a registration fee order for a school or group admin
 * @route   POST /api/payments/create-registration-order
 * @access  Public
 */
const createRegistrationOrder = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found for creating registration order.');
  }

  let registrationFee = parseInt(process.env.REGISTRATION_FEE || '1000', 10);

  // Apply early adopter discount for the first 50 groups
  if (user.role === 'group-admin') {
    const groupCount = await Organization.countDocuments();
    if (groupCount < 50) {
      registrationFee = registrationFee / 2; // 50% discount
    }
  }

  const options = {
    amount: registrationFee * 100,
    currency: 'INR',
    receipt: `reg_rcpt_${userId}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

/**
 * @desc    Verify a registration fee payment and activate the user account
 * @route   POST /api/payments/verify-registration-payment
 * @access  Public
 */
const verifyRegistrationPayment = asyncHandler(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.registrationFeePaid = true;
    await user.save();

    res.json({
      message: 'Payment successful! Your account is now active. Please log in.',
    });
  } else {
    res.status(400);
    throw new Error('Payment verification failed.');
  }
});

export {
  createOrder,
  verifyPayment,
  createRegistrationOrder,
  verifyRegistrationPayment,
};
