// src/models/candidateProfile.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// Reusable Address Schema
const AddressSchema = new Schema({
  street: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
}, { _id: false });


interface IEducation extends Document {
  degree: string;
  institution: string;
  startYear: number;
  endYear: number;
}

interface IExperience extends Document {
  jobTitle: string;
  company: string;
  companyAddress: typeof AddressSchema; // Add company address
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface ICandidateProfile extends Document {
  user: mongoose.Schema.Types.ObjectId;
  phone: string;
  address: typeof AddressSchema; // Use the structured address
  preferredLocations: string[];
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
  companyAddress: AddressSchema, // Use the address schema here
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String },
});

const CandidateProfileSchema: Schema<ICandidateProfile> = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  phone: { type: String },
  address: AddressSchema, // Use the address schema here
  preferredLocations: [{ type: String }],
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [{ type: String }],
  resumeUrl: { type: String },
}, {
  timestamps: true,
});

const CandidateProfile: Model<ICandidateProfile> = mongoose.model<ICandidateProfile>('CandidateProfile', CandidateProfileSchema);

export default CandidateProfile;