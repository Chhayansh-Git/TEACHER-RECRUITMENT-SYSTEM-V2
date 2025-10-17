// src/models/organization.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  owner: mongoose.Schema.Types.ObjectId; // The 'group-admin' user
  schools: mongoose.Schema.Types.ObjectId[]; // Array of school user IDs
}

const OrganizationSchema: Schema<IOrganization> = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  schools: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Organization: Model<IOrganization> = mongoose.model<IOrganization>('Organization', OrganizationSchema);

export default Organization;