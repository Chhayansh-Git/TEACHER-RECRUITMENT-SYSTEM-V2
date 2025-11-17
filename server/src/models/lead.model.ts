// server/src/models/lead.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user.model';

export interface ILead extends Document {
  school: IUser['_id'];
  planOfInterest: 'Premium' | 'Enterprise';
  interactionCount: number;
  status: 'active' | 'contacted' | 'converted' | 'closed';
  notes?: string;
  // Fields for detailed enterprise interest form
  contactPerson?: {
    name: string;
    email: string;
    phone: string;
  };
  organizationName?: string;
  numberOfSchools?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema<ILead> = new Schema({
  school: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planOfInterest: {
    type: String,
    enum: ['Premium', 'Enterprise'],
    required: true
  },
  interactionCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'contacted', 'converted', 'closed'],
    default: 'active'
  },
  notes: {
    type: String
  },
  // --- Enterprise-specific fields ---
  contactPerson: {
    name: String,
    email: String,
    phone: String,
  },
  organizationName: String,
  numberOfSchools: Number,
}, { timestamps: true });

// Ensures a school can only have one 'active' lead per plan type to prevent duplicates.
LeadSchema.index({ school: 1, planOfInterest: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });

const Lead: Model<ILead> = mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;