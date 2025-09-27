// src/models/interview.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInterview extends Document {
  pushedCandidate: mongoose.Schema.Types.ObjectId;
  school: mongoose.Schema.Types.ObjectId;
  candidate: mongoose.Schema.Types.ObjectId;
  interviewDate: Date;
  interviewType: 'Online' | 'In-person';
  locationOrLink: string;
  notes?: string;
  status: 'Scheduled' | 'Accepted' | 'Declined' | 'Completed';
}

const InterviewSchema: Schema<IInterview> = new Schema({
  pushedCandidate: { type: Schema.Types.ObjectId, ref: 'PushedCandidate', required: true },
  school: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  interviewDate: { type: Date, required: true },
  interviewType: { type: String, enum: ['Online', 'In-person'], required: true },
  locationOrLink: { type: String, required: true },
  notes: { type: String },
  status: {
    type: String,
    enum: ['Scheduled', 'Accepted', 'Declined', 'Completed'],
    default: 'Scheduled',
  },
}, { timestamps: true });

const Interview: Model<IInterview> = mongoose.model<IInterview>('Interview', InterviewSchema);

export default Interview;