import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user.model';

export interface IOrganization extends Document {
  name: string;
  owner: IUser['_id']; // The 'group-admin' user
  schools: IUser['_id'][]; // Array of school user IDs
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { 
    type: String, 
    required: [true, 'Organization name is required.'],
    trim: true,
  },
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // An owner can only have one organization
  },
  schools: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
}, { timestamps: true });

const Organization: Model<IOrganization> = mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;