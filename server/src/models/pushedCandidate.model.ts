// src/models/pushedCandidate.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushedCandidate extends Document {
  requirement: mongoose.Schema.Types.ObjectId;
  candidate: mongoose.Schema.Types.ObjectId;
  school: mongoose.Schema.Types.ObjectId;
  status: 'pushed' | 'viewed' | 'shortlisted' | 'interview scheduled' | 'offer sent' | 'hired' | 'rejected'; // Add new statuses
  shortlistedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PushedCandidateSchema = new mongoose.Schema<IPushedCandidate>({
  requirement: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Requirement',
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pushed', 'viewed', 'shortlisted', 'interview scheduled', 'offer sent', 'hired', 'rejected'], // Add new statuses
    default: 'pushed',
  },
  shortlistedAt: { type: Date },
}, { timestamps: true });

PushedCandidateSchema.index({ requirement: 1, candidate: 1 }, { unique: true });

const PushedCandidate: Model<IPushedCandidate> = mongoose.model<IPushedCandidate>('PushedCandidate', PushedCandidateSchema);

export default PushedCandidate;