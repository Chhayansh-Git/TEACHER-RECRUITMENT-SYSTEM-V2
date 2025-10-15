// src/controllers/candidate.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import CandidateProfile from '../models/candidateProfile.model';
import User from '../models/user.model';
import PushedCandidate from '../models/pushedCandidate.model'; // Import PushedCandidate model
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

  await User.findByIdAndUpdate(userId, { profileCompleted: true });

  res.status(200).json(profile);
});

/**
 * @desc    Get all applications for the logged-in candidate
 * @route   GET /api/candidate/my-applications
 * @access  Private/Candidate
 */
const getMyApplications = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const applications = await PushedCandidate.find({ candidate: req.user?._id })
        .populate({
            path: 'school',
            select: 'name profilePictureUrl', // Anonymize school details if needed, but name is useful here
        })
        .populate({
            path: 'requirement',
            select: 'title location',
        })
        .sort({ createdAt: -1 });

    res.json(applications);
});

const getDashboardStats = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const candidateId = req.user?._id;
    
    const applicationsCount = await PushedCandidate.countDocuments({ candidate: candidateId });
    const interviewsCount = await PushedCandidate.countDocuments({ candidate: candidateId, status: 'interview scheduled' });
    const profileCompleted = req.user?.profileCompleted || false;

    res.json({ applicationsCount, interviewsCount, profileCompleted });
});


export { getCandidateProfile, updateCandidateProfile, getMyApplications, getDashboardStats };