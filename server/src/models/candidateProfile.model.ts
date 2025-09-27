// src/models/candidateProfile.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IEducation extends Document {
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
}

interface IExperience extends Document {
  jobTitle: string;
  company: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface ICandidateProfile extends Document {
  user: mongoose.Schema.Types.ObjectId;
  phone: string;
  address: string;
  preferredLocations: string[]; // Add this line
  education: IEducation[];
  experience: IExperience[];
  skills: string[];
  resumeUrl?: string;
}

const EducationSchema: Schema<IEducation> = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
});

const ExperienceSchema: Schema<IExperience> = new Schema({
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
});

const CandidateProfileSchema: Schema<ICandidateProfile> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User is required'],
    ref: 'User',
  },
  phone: { type: String },
  address: { type: String },
  preferredLocations: [{ type: String }], // Add this line
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [{ type: String }],
  resumeUrl: { type: String }
}, {
  timestamps: true,
});

CandidateProfileSchema.index({ user: 1 }, { unique: true });
const CandidateProfile: Model<ICandidateProfile> = mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);

export default CandidateProfile;