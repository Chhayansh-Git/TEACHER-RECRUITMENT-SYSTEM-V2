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
  qualifications: string[];
  benefits: string[];
  status: 'open' | 'closed' | 'filled';
  numberOfVacancies: number; // Add this
  hiredCandidates: mongoose.Schema.Types.ObjectId[]; // Add this
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
  experienceRequired: { type: String, required: true },
  qualifications: [{ type: String, required: true }],
  benefits: [{ type: String }],
  status: {
    type: String,
    enum: ['open', 'closed', 'filled'],
    default: 'open',
  },
  numberOfVacancies: { type: Number, required: true, default: 1 }, // Add this
  hiredCandidates: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Add this
}, {
  timestamps: true,
});

const Requirement: Model<IRequirement> = mongoose.model<IRequirement>('Requirement', RequirementSchema);

export default Requirement;