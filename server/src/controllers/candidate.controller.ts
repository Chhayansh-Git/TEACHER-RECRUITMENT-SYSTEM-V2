// src/controllers/candidate.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import CandidateProfile from '../models/candidateProfile.model';
import User from '../models/user.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

/**
 * @desc    Get candidate profile
 * @route   GET /api/candidate/profile
 * @access  Private
 */
const getCandidateProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const profile = await CandidateProfile.findOne({ user: req.user?._id });

  if (profile) {
    res.json(profile);
  } else {
    res.status(404);
    throw new Error('Profile not found');
  }
});

/**
 * @desc    Create or Update candidate profile
 * @route   PUT /api/candidate/profile
 * @access  Private
 */
const updateCandidateProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const profileData = req.body;
  const userId = req.user?._id;

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { ...profileData, user: userId },
    { new: true, upsert: true, runValidators: true }
  );

  // Also, update the main user model to reflect that the profile is complete
  await User.findByIdAndUpdate(userId, { profileCompleted: true });

  res.status(200).json(profile);
});

export { getCandidateProfile, updateCandidateProfile };
