// src/controllers/school.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import PushedCandidate from '../models/pushedCandidate.model';
import Requirement from '../models/requirement.model';
import Interview from '../models/interview.model';
import User from '../models/user.model'; // We will only use the User model now
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
      throw new Error('Shortlisted candidate record not found or interview already scheduled');
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
  
    const candidateUser = await User.findById(pushedCandidate.candidate);
    if (candidateUser && req.user) {
        await sendEmail({
            to: candidateUser.email,
            templateKey: 'interview-scheduled-candidate',
            payload: {
                candidateName: candidateUser.name,
                schoolName: req.user.name,
                interviewDate: new Date(interviewDate).toLocaleString(),
            },
        });
    }
  
    res.status(201).json(interview);
});


/**
 * @desc    Get the logged-in school's profile details
 * @route   GET /api/school/profile
 * @access  Private/School
 */
const getSchoolProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  // We now fetch the school's details directly from the User model
  const school = await User.findById(req.user?._id);
  
  if (school && school.schoolDetails) {
    res.json(school.schoolDetails);
  } else if (school) {
    res.status(404);
    throw new Error('School details not found. Please complete your profile.');
  } else {
    res.status(404);
    throw new Error('School not found.');
  }
});

/**
 * @desc    Update the school's profile details
 * @route   PUT /api/school/profile
 * @access  Private/School
 */
const updateSchoolProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const school = await User.findById(req.user?._id);

  if (school) {
    // Update the nested schoolDetails object
    school.schoolDetails = req.body;
    school.profileCompleted = true; // Mark as completed on first update

    const updatedSchool = await school.save();
    res.json(updatedSchool.schoolDetails);
  } else {
    res.status(404);
    throw new Error('School not found');
  }
});


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

export { 
    getPushedCandidates, 
    shortlistCandidate, 
    scheduleInterview, 
    getSchoolProfile, 
    updateSchoolProfile,
    getDashboardStats
};