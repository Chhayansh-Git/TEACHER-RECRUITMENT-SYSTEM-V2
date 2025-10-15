// src/models/schoolProfile.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

// Reusable Address Schema
const AddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
}, { _id: false });

export interface ISchoolProfile extends Document {
  user: mongoose.Schema.Types.ObjectId;
  address: typeof AddressSchema;
  principalName: string;
  directorName: string;
  contactNumber: string; // Added from SRS
  whatsappNumber?: string; // Added from SRS
  website?: string; // Added from SRS
  schoolUpTo: string; // E.g., 'V', 'X', 'XII' - Added from SRS
  board: string; // E.g., 'CBSE', 'ICSE' - Added from SRS
  cbseAffiliationNumber?: string;
  studentStrength?: number;
  about?: string;
}

const SchoolProfileSchema: Schema<ISchoolProfile> = new Schema({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
  address: AddressSchema,
  principalName: { type: String, required: true },
  directorName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  whatsappNumber: { type: String },
  website: { type: String },
  schoolUpTo: { type: String, required: true },
  board: { type: String, required: true },
  cbseAffiliationNumber: { type: String },
  studentStrength: { type: Number },
  about: { type: String },
}, { timestamps: true });

const SchoolProfile: Model<ISchoolProfile> = mongoose.model<ISchoolProfile>('SchoolProfile', SchoolProfileSchema);

export default SchoolProfile;