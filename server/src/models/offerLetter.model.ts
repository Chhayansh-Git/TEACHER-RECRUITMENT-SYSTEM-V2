// src/models/offerLetter.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOfferLetter extends Document {
  pushedCandidate: mongoose.Schema.Types.ObjectId;
  school: mongoose.Schema.Types.ObjectId;
  candidate: mongoose.Schema.Types.ObjectId;
  requirement: mongoose.Schema.Types.ObjectId;
  jobTitle: string;
  offeredSalary: number;
  joiningDate: Date;
  offerDetails: string; // A general text/html field for the body of the offer
  status: 'sent' | 'accepted' | 'rejected' | 'withdrawn';
}

const OfferLetterSchema: Schema<IOfferLetter> = new Schema({
  pushedCandidate: { type: Schema.Types.ObjectId, ref: 'PushedCandidate', required: true, unique: true },
  school: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  requirement: { type: Schema.Types.ObjectId, ref: 'Requirement', required: true },
  jobTitle: { type: String, required: true },
  offeredSalary: { type: Number, required: true },
  joiningDate: { type: Date, required: true },
  offerDetails: { type: String, required: true },
  status: {
    type: String,
    enum: ['sent', 'accepted', 'rejected', 'withdrawn'],
    default: 'sent',
  },
}, { timestamps: true });

const OfferLetter: Model<IOfferLetter> = mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);

export default OfferLetter;