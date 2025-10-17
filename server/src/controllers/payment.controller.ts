// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/controllers/payment.controller.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Plan from '../models/plan.model';
import Subscription from '../models/subscription.model';
import User from '../models/user.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('FATAL ERROR: Razorpay API Keys are not defined in .env file');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

const createOrder = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  // --- NEW: Handle monthly vs annual billing ---
  const { planId, isAnnual } = req.body;

  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }

  // Choose price based on billing cycle
  const amount = isAnnual ? plan.annualPrice : plan.price;

  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `rcpt_${crypto.randomBytes(12).toString('hex')}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

const verifyPayment = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, isAnnual } = req.body;
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
    
    // --- NEW: Set end date based on billing cycle ---
    const durationInDays = isAnnual ? 365 : 30; // Simplified duration
    endDate.setDate(startDate.getDate() + durationInDays);

    // Update or create the subscription for the school
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

const createRegistrationOrder = asyncHandler(async (req: Request, res: Response) => {
    const registrationFee = parseInt(process.env.REGISTRATION_FEE || '1000');
    const { userId } = req.body;
    const options = {
        amount: registrationFee * 100,
        currency: 'INR',
        receipt: `reg_rcpt_${userId}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
});

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
        res.json({ message: 'Payment successful! Your account is now active. Please log in.' });
    } else {
        res.status(400);
        throw new Error('Payment verification failed.');
    }
});

// --- NEW LOGIC IN AUTH CONTROLLER ---
// This logic should be moved to your auth.controller.ts during registration
const handleSchoolRegistration = async (user: any) => {
    const schoolCount = await User.countDocuments({ role: 'school' });

    if (schoolCount < 200) {
        // --- THIS IS THE "FIRST 200" RULE ---
        user.registrationFeePaid = true; // Mark fee as paid
        
        const premiumPlan = await Plan.findOne({ name: 'Premium' });
        if (premiumPlan) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(startDate.getFullYear() + 1); // 1 year free trial

            // Create a free 1-year premium subscription
            await Subscription.create({
                school: user._id,
                plan: premiumPlan._id,
                startDate,
                endDate,
                status: 'active',
            });
        }
        return { paymentRequired: false };
    } else {
        // Normal flow for schools after the first 200
        user.registrationFeePaid = false;
        return { paymentRequired: true };
    }
};

export { createOrder, verifyPayment, createRegistrationOrder, verifyRegistrationPayment };
// Note: The `handleSchoolRegistration` logic should be integrated into your `auth.controller.ts`.
// I will provide the full `auth.controller.ts` in the next step to ensure it's done correctly.