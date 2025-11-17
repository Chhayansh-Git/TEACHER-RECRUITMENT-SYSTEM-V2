// server/src/models/subscription.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
  school?: mongoose.Schema.Types.ObjectId; // Optional: for Premium plan
  organization?: mongoose.Schema.Types.ObjectId; // Optional: for Enterprise plan
  plan: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema({
  school: { type: Schema.Types.ObjectId, ref: 'User' },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], required: true },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
}, { timestamps: true });

// Add a validator to ensure either school or organization is present, but not both
SubscriptionSchema.pre('save', function(next) {
  if (!this.school && !this.organization) {
    next(new Error('Subscription must be linked to either a school or an organization.'));
  }
  if (this.school && this.organization) {
    next(new Error('Subscription cannot be linked to both a school and an organization.'));
  }
  next();
});

const Subscription: Model<ISubscription> = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;