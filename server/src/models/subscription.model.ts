// src/models/subscription.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
  school: mongoose.Schema.Types.ObjectId;
  plan: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema({
  school: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], required: true },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
}, { timestamps: true });

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;