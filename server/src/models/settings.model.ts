// src/models/settings.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  defaultTheme: 'light' | 'dark';
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
}

const SettingsSchema: Schema<ISettings> = new Schema({
  siteName: { type: String, default: 'TeacherRecruit' },
  defaultTheme: { type: String, enum: ['light', 'dark'], default: 'light' },
  razorpayKeyId: { type: String },
  razorpayKeySecret: { type: String },
  twilioAccountSid: { type: String },
  twilioAuthToken: { type: String },
});

const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;