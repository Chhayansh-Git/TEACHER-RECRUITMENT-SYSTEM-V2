import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user.model';

export interface IProfileViewCredit extends Document {
  school: IUser['_id'];
  viewsUsed: number;
  weekStartDate: Date; // The start date (Sunday) of the current tracking week
}

const ProfileViewCreditSchema: Schema<IProfileViewCredit> = new Schema({
  school: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // Each school gets one credit document
  },
  viewsUsed: { 
    type: Number, 
    default: 0 
  },
  weekStartDate: { 
    type: Date, 
    required: true 
  },
}, { timestamps: true });

const ProfileViewCredit: Model<IProfileViewCredit> = mongoose.model<IProfileViewCredit>('ProfileViewCredit', ProfileViewCreditSchema);

export default ProfileViewCredit;