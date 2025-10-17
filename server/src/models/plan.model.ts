// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/models/plan.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  
  maxJobs: number;
  maxUsers: number;
  candidateMatchesLimit: number;
  canViewFullProfile: boolean; // This will now mean "unlimited" viewing
  weeklyProfileViews: number; // New limit for Basic plan (use -1 for unlimited)
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
  weeklyProfileViews: { type: Number, required: true, default: 5 }, // Add new field with a default
  hasAdvancedAnalytics: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const Plan: Model<IPlan> = mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;