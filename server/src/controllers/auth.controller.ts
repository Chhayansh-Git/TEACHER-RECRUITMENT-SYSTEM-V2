// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { Types } from 'mongoose'; // Import Types
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import generateToken from '../utils/generateToken';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 2. Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // 3. Respond with user data and token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      // FIX: Explicitly cast user._id to the correct type
      token: generateToken(user._id as Types.ObjectId),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email }).select('+password');

  // 2. Check if user exists and password is correct
  if (user && (await user.comparePassword(password))) {
    // 3. Respond with user data and a new token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id as Types.ObjectId),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

export { registerUser, loginUser };