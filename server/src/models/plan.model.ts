// server/src/models/plan.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  
  // Feature Limits
  maxJobs: number;
  maxUsers: number;
  candidateMatchesLimit: number;
  canViewFullProfile: boolean; // This now signifies unlimited viewing
  weeklyProfileViews: number; // The new limit for Basic plan users
  hasAdvancedAnalytics: boolean;
}

const PlanSchema: Schema<IPlan> = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  annualPrice: { type: Number, required: true },
  features: [{ type: String }],
  
  maxJobs: { type: Number, required: true, default: 1 },
  maxUsers: { type: Number, required: true, default: 1 },
  candidateMatchesLimit: { type: Number, required: true, default: 5 },
  canViewFullProfile: { type: Boolean, required: true, default: false },
  weeklyProfileViews: { type: Number, required: true, default: 5 }, // Added field
  hasAdvancedAnalytics: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const Plan: Model<IPlan> = mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;