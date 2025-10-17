// src/models/profileViewCredit.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfileViewCredit extends Document {
  school: mongoose.Schema.Types.ObjectId;
  viewsUsed: number;
  weekStartDate: Date; // The Sunday of the current week
}

const ProfileViewCreditSchema: Schema<IProfileViewCredit> = new Schema({
  school: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  viewsUsed: { type: Number, default: 0 },
  weekStartDate: { type: Date, required: true },
}, { timestamps: true });

const ProfileViewCredit: Model<IProfileViewCredit> = mongoose.model<IProfileViewCredit>('ProfileViewCredit', ProfileViewCreditSchema);

export default ProfileViewCredit;