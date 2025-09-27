// src/models/plan.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
  name: string; // e.g., "Basic", "Premium"
  price: number; // Price in INR
  durationInDays: number; // e.g., 30 for monthly, 365 for yearly
  features: string[]; // List of features for this plan
}

const PlanSchema: Schema<IPlan> = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  durationInDays: { type: Number, required: true },
  features: [{ type: String }],
}, { timestamps: true });

const Plan: Model<IPlan> = mongoose.model<IPlan>('Plan', PlanSchema);

export default Plan;