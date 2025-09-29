// src/controllers/school.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import PushedCandidate from '../models/pushedCandidate.model';
import SchoolProfile from '../models/schoolProfile.model';
import Interview from '../models/interview.model';
import Requirement from '../models/requirement.model';
import User from '../models/user.model';
import sendEmail from '../utils/sendEmail';
import { ProtectedRequest } from '../middleware/auth.middleware';

/**
 * @desc    Get all candidates pushed to the logged-in school
 * @route   GET /api/school/pushed-candidates
 * @access  Private/School
 */
const getPushedCandidates = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const pushedCandidates = await PushedCandidate.find({ school: req.user?._id })
    .populate({
      path: 'candidate',
      select: '-password',
    })
    .populate({
      path: 'requirement',
      select: 'title',
    })
    .sort({ createdAt: -1 });

  res.json(pushedCandidates);
});

/**
 * @desc    Shortlist a pushed candidate
 * @route   PUT /api/school/pushed-candidates/:pushId/shortlist
 * @access  Private/School
 */
const shortlistCandidate = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { pushId } = req.params;

  const pushedCandidate = await PushedCandidate.findOne({
    _id: pushId,
    school: req.user?._id,
  });

  if (!pushedCandidate) {
    res.status(404);
    throw new Error('Pushed candidate record not found');
  }

  pushedCandidate.status = 'shortlisted';
  pushedCandidate.shortlistedAt = new Date();

  const updatedPushedCandidate = await pushedCandidate.save();

  res.json(updatedPushedCandidate);
});

/**
 * @desc    Schedule an interview for a shortlisted candidate
 * @route   POST /api/school/interviews/schedule
 * @access  Private/School
 */
const scheduleInterview = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { pushId, interviewDate, interviewType, locationOrLink, notes } = req.body;
  const schoolId = req.user?._id;

  const pushedCandidate = await PushedCandidate.findOne({
    _id: pushId,
    school: schoolId,
    status: 'shortlisted',
  });

  if (!pushedCandidate) {
    res.status(404);
    throw new Error('Shortlisted candidate record not found');
  }

  const interview = await Interview.create({
    pushedCandidate: pushId,
    school: schoolId,
    candidate: pushedCandidate.candidate,
    interviewDate,
    interviewType,
    locationOrLink,
    notes,
  });

  pushedCandidate.status = 'interview scheduled';
  await pushedCandidate.save();

  // --- TRIGGER EMAIL NOTIFICATION (CORRECTED) ---
  const candidateUser = await User.findById(pushedCandidate.candidate);
  if (candidateUser) {
    try {
      await sendEmail({
        to: candidateUser.email,
        templateKey: 'interview-scheduled-candidate',
        payload: {
          candidateName: candidateUser.name,
          schoolName: req.user?.name,
          interviewDate: new Date(interviewDate).toLocaleString(),
        },
      });
    } catch (error) {
      console.error('Email could not be sent:', error);
      // Don't block the request, just log the error
    }
  }
  // --- END OF EMAIL LOGIC ---

  res.status(201).json(interview);
});

/**
 * @desc    Get the logged-in school's profile
 * @route   GET /api/school/profile
 * @access  Private/School
 */
const getSchoolProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const profile = await SchoolProfile.findOne({ user: req.user?._id });
  if (profile) {
    res.json(profile);
  } else {
    res.json({}); 
  }
});

/**
 * @desc    Create or update the school's profile
 * @route   PUT /api/school/profile
 * @access  Private/School
 */
const updateSchoolProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const profileData = req.body;
  const userId = req.user?._id;

  const profile = await SchoolProfile.findOneAndUpdate(
    { user: userId },
    { ...profileData, user: userId },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json(profile);
});

/**
 * @desc    Get statistics for the school dashboard
 * @route   GET /api/school/stats
 * @access  Private/School
 */
const getDashboardStats = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const schoolId = req.user?._id;

  const totalRequirements = await Requirement.countDocuments({ school: schoolId });
  const openRequirements = await Requirement.countDocuments({ school: schoolId, status: 'open' });
  const totalPushed = await PushedCandidate.countDocuments({ school: schoolId });
  const interviewsScheduled = await Interview.countDocuments({ school: schoolId });

  res.json({
    totalRequirements,
    openRequirements,
    totalPushed,
    interviewsScheduled,
  });
});

export { getPushedCandidates, shortlistCandidate, scheduleInterview, getSchoolProfile, updateSchoolProfile, getDashboardStats };