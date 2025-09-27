// src/models/user.model.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface to define the User document structure for TypeScript
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'candidate' | 'school' | 'admin' | 'super-admin';
  isVerified: boolean;
  isSuspended: boolean;
  profileCompleted: boolean;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['candidate', 'school', 'admin', 'super-admin'],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Middleware: Encrypt password BEFORE saving user document
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method: Compare entered password with the hashed password in the database
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;