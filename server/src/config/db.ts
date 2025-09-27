// src/config/db.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[error]: ${error.message}`);
    } else {
      console.error('[error]: An unknown error occurred during DB connection');
    }
    process.exit(1);
  }
};

export default connectDB;