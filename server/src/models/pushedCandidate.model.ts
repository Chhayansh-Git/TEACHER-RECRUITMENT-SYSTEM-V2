// src/models/pushedCandidate.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPushedCandidate extends Document {
  requirement: mongoose.Schema.Types.ObjectId;
  candidate: mongoose.Schema.Types.ObjectId;
  school: mongoose.Schema.Types.ObjectId;
  status: 'pushed' | 'viewed' | 'shortlisted' | 'rejected' | 'interview scheduled';
  shortlistedAt?: Date; // when the candidate was shortlisted
}

const PushedCandidateSchema: Schema<IPushedCandidate> = new Schema({
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
    enum: ['pushed', 'viewed', 'shortlisted', 'rejected', 'interview scheduled'], // Add new status
    default: 'pushed',
  },
  shortlistedAt: { type: Date },
}, {
  timestamps: true,
});

// Ensure that a candidate can only be pushed once for the same requirement
PushedCandidateSchema.index({ requirement: 1, candidate: 1 }, { unique: true });

const PushedCandidate: Model<IPushedCandidate> = mongoose.model<IPushedCandidate>('PushedCandidate', PushedCandidateSchema);

export default PushedCandidate;