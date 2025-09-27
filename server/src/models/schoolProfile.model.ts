// src/models/schoolProfile.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchoolProfile extends Document {
  user: mongoose.Schema.Types.ObjectId; // Link to the main User model
  address: string;
  city: string;
  state: string;
  pinCode: string;
  principalName: string;
  directorName: string;
  cbseAffiliationNumber?: string;
  studentStrength?: number;
  about?: string;
}

const SchoolProfileSchema: Schema<ISchoolProfile> = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
  principalName: { type: String, required: true },
  directorName: { type: String, required: true },
  cbseAffiliationNumber: { type: String },
  studentStrength: { type: Number },
  about: { type: String },
}, { timestamps: true });

const SchoolProfile: Model<ISchoolProfile> = mongoose.model<ISchoolProfile>('SchoolProfile', SchoolProfileSchema);

export default SchoolProfile;