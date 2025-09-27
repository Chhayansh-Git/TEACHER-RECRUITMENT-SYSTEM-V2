// src/models/requirement.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRequirement extends Document {
  school: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  location: string;
  salary?: number;
  experienceRequired: string;
  qualifications: string[]; // Add this
  benefits: string[]; // Add this
  status: 'open' | 'closed' | 'filled';
}

const RequirementSchema: Schema<IRequirement> = new Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract'],
  },
  location: { type: String, required: true },
  salary: { type: Number },
  experienceRequired: { type: String }, // Made optional to match older data
  qualifications: [{ type: String }], // Add this
  benefits: [{ type: String }], // Add this
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open',
  },
}, {
  timestamps: true,
});

const Requirement: Model<IRequirement> = mongoose.model<IRequirement>('Requirement', RequirementSchema);

export default Requirement;