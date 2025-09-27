// src/utils/generateToken.ts

import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const generateToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '30d', // The token will be valid for 30 days
  });
};

export default generateToken;