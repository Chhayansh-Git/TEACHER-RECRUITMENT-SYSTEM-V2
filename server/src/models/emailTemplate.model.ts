// src/models/emailTemplate.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailTemplate extends Document {
  key: string; // Unique identifier for the template
  name: string; // Friendly name, e.g., "Interview Scheduled (To Candidate)"
  subject: string;
  body: string; // HTML body with placeholders like {{candidateName}}
  placeholders: string[];
}

const EmailTemplateSchema: Schema<IEmailTemplate> = new Schema({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  placeholders: [{ type: String }],
}, { timestamps: true });

const EmailTemplate: Model<IEmailTemplate> = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;