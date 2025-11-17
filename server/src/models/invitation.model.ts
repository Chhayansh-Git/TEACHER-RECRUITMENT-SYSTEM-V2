// server/src/models/invitation.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IInvitation extends Document {
  organization: mongoose.Schema.Types.ObjectId;
  email: string; // Email of the school admin to be invited
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires: Date;
}

const InvitationSchema: Schema<IInvitation> = new Schema({
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'],
    default: 'pending',
  },
  expires: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// Before saving, generate a unique token and expiry date
InvitationSchema.pre('save', function(next) {
  if (this.isNew) {
    this.token = crypto.randomBytes(32).toString('hex');
    // Set token to expire in 7 days
    this.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Invitation: Model<IInvitation> = mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;