// src/models/user.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Reusable Address Schema for consistency
const AddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pinCode: { type: String, required: true },
}, { _id: false });

// Schema for detailed school information, as per SRS
const SchoolDetailsSchema = new Schema({
    principalName: { type: String, required: true },
    directorName: { type: String, required: true },
    address: { type: AddressSchema, required: true },
    contactNumber: { type: String, required: true },
    whatsappNumber: { type: String },
    website: { type: String },
    schoolUpTo: { type: String, required: true },
    board: { type: String, required: true },
    cbseAffiliationNumber: { type: String },
    studentStrength: { type: Number },
}, { _id: false });


export interface IUser extends Document {
  name: string; // School Name or Candidate Name
  email: string;
  phone: string; // Primary contact for OTP
  password?: string;
  role: 'candidate' | 'school' | 'admin' | 'super-admin';
  isVerified: boolean;
  isSuspended: boolean;
  profileCompleted: boolean;
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  emailOtp?: string;
  emailOtpExpires?: Date;
  isPhoneVerified: boolean;
  phoneOtp?: string;
  phoneOtpExpires?: Date;
  registrationFeePaid: boolean;
  schoolDetails?: typeof SchoolDetailsSchema; // Embed school details directly
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true, sparse: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['candidate', 'school', 'admin', 'super-admin'], required: true },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    profilePictureUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp: String,
    emailOtpExpires: Date,
    isPhoneVerified: { type: Boolean, default: false },
    phoneOtp: String,
    phoneOtpExpires: Date,
    registrationFeePaid: { type: Boolean, default: false },
    schoolDetails: { type: SchoolDetailsSchema, required: function(this: IUser) { return this.role === 'school'; } },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// ... (pre-save hooks, methods, etc., remain the same)

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return resetToken;
};


const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;