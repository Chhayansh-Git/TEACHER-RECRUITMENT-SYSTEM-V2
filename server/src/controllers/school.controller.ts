// src/controllers/school.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import PushedCandidate from '../models/pushedCandidate.model';
import SchoolProfile from '../models/schoolProfile.model';
import Interview from '../models/interview.model';
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
      select: '-password', // Exclude password from the populated candidate
    })
    .populate({
      path: 'requirement',
      select: 'title', // Only populate the requirement title
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
    school: req.user?._id, // Ensure the school owns this record
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

  // --- TRIGGER EMAIL NOTIFICATION ---
  const candidateUser = await User.findById(pushedCandidate.candidate);
  if (candidateUser) {
    const message = `
      <h1>Interview Invitation</h1>
      <p>Hello ${candidateUser.name},</p>
      <p>You have been invited for an interview by ${req.user?.name}.</p>
      <p><strong>Date & Time:</strong> ${new Date(interviewDate).toLocaleString()}</p>
      <p><strong>Type:</strong> ${interviewType}</p>
      <p><strong>Location/Link:</strong> ${locationOrLink}</p>
      <p>Please log in to your dashboard to accept or decline this invitation.</p>
      <p>Thank you!</p>
    `;

    try {
      await sendEmail({
        to: candidateUser.email,
        subject: 'You Have a New Interview Invitation!',
        html: message,
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
    // It's not an error to not have a profile yet, send an empty object
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

export { getPushedCandidates, shortlistCandidate, scheduleInterview, getSchoolProfile, updateSchoolProfile };