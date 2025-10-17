// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/controllers/school.controller.ts
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import PushedCandidate from '../models/pushedCandidate.model';
import Requirement from '../models/requirement.model';
import Interview from '../models/interview.model';
import User from '../models/user.model';
import CandidateProfile from '../models/candidateProfile.model';
import sendEmail from '../utils/sendEmail';
import { ProtectedRequest } from '../middleware/auth.middleware';
import { SubscriptionRequest } from '../middleware/subscription.middleware';
import mongoose from 'mongoose';
import OfferLetter from '../models/offerLetter.model';

/**
 * @desc    Get all candidates pushed to the logged-in school, grouped by requirement
 * @route   GET /api/school/pushed-candidates
 * @access  Private/School
 */
const getPushedCandidates = asyncHandler(async (req: SubscriptionRequest, res: Response) => {
    const plan = req.plan;
    const limit = plan?.candidateMatchesLimit;

    const pipeline: any[] = [
      { $match: { school: req.user?._id } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidateDetails'
        }
      },
      { $unwind: '$candidateDetails' },
      {
        $lookup: {
          from: 'requirements',
          localField: 'requirement',
          foreignField: '_id',
          as: 'requirementDetails'
        }
      },
      { $unwind: '$requirementDetails' },
      {
        $group: {
          _id: '$requirement',
          requirement: { $first: '$requirementDetails' },
          candidates: {
            $push: {
              _id: '$_id',
              status: '$status',
              candidate: {
                _id: '$candidateDetails._id',
                name: '$candidateDetails.name',
                email: '$candidateDetails.email',
              },
              createdAt: '$createdAt',
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          requirement: {
            _id: '$requirement._id',
            title: '$requirement.title',
            location: '$requirement.location',
          },
          candidates: (limit && limit !== -1) ? { $slice: ['$candidates', limit] } : '$candidates',
          totalCandidates: { $size: '$candidates' }
        }
      },
      {
        $addFields: {
          latestPush: { $max: "$candidates.createdAt" }
        }
      },
      { $sort: { "latestPush": -1 } }
    ];
    
    const pushedCandidates = await PushedCandidate.aggregate(pipeline);

    res.json(pushedCandidates);
});

/**
 * @desc    Get full requirement details and its associated candidate pipeline with detailed history
 * @route   GET /api/school/requirements/:id/details
 * @access  Private/School
 */
const getRequirementDetailsWithCandidates = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { id: requirementId } = req.params;
    const schoolId = req.user?._id;

    const requirement = await Requirement.findOne({
        _id: requirementId,
        school: schoolId
    });

    if (!requirement) {
        res.status(404);
        throw new Error('Requirement not found or you are not authorized.');
    }

    const candidatesPipeline = await PushedCandidate.aggregate([
        { $match: { requirement: new mongoose.Types.ObjectId(requirementId) } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'candidate',
                foreignField: '_id',
                as: 'candidateInfo'
            }
        },
        { $unwind: '$candidateInfo' },
        {
            $lookup: {
                from: 'interviews',
                localField: '_id',
                foreignField: 'pushedCandidate',
                as: 'interviewInfo'
            }
        },
        { $unwind: { path: '$interviewInfo', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'offerletters',
                localField: '_id',
                foreignField: 'pushedCandidate',
                as: 'offerInfo'
            }
        },
        { $unwind: { path: '$offerInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                status: 1,
                candidate: {
                    _id: '$candidateInfo._id',
                    name: '$candidateInfo.name',
                },
                timeline: [
                    { event: 'Recommended', date: '$createdAt', status: 'pushed' },
                    { event: 'Shortlisted', date: '$shortlistedAt', status: 'shortlisted' },
                    { event: 'Interview Scheduled', date: '$interviewInfo.interviewDate', status: 'interview scheduled' },
                    { event: 'Offer Sent', date: '$offerInfo.createdAt', status: 'offer sent' },
                    { 
                        event: 'Offer Accepted', 
                        date: '$offerInfo.updatedAt',
                        status: 'hired', 
                        condition: { $eq: ['$offerInfo.status', 'accepted'] } 
                    },
                     { 
                        event: 'Offer Rejected', 
                        date: '$offerInfo.updatedAt',
                        status: 'rejected',
                        condition: { $eq: ['$offerInfo.status', 'rejected'] }
                    },
                ]
            }
        },
        {
            $project: {
                _id: 1,
                status: 1,
                candidate: 1,
                timeline: {
                    $filter: {
                        input: '$timeline',
                        as: 'item',
                        cond: { 
                            $and: [
                                { $ne: ['$$item.date', null] },
                                { $ifNull: ['$$item.condition', true] }
                            ]
                        }
                    }
                }
            }
        }
    ]);
    res.json({ requirement, candidates: candidatesPipeline });
});

/**
 * @desc    Get detailed analytics for the school dashboard
 * @route   GET /api/school/dashboard-analytics
 * @access  Private/School
 */
const getDashboardAnalytics = asyncHandler(async (req: SubscriptionRequest, res: Response) => {
    const schoolId = req.user?._id;
    const plan = req.plan;

    if (!plan?.hasAdvancedAnalytics) {
        const openRequirements = await Requirement.countDocuments({ school: schoolId, status: 'open' });
        const recommended = await PushedCandidate.countDocuments({ school: schoolId });
        res.json({
            hasAdvancedAnalytics: false,
            kpis: { openRequirements },
            funnel: { recommended }
        });
        return;
    }

    const funnelCounts = await PushedCandidate.aggregate([
        { $match: { school: schoolId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $group: { _id: null, statuses: { $push: { k: '$_id', v: '$count' } } } },
        { $replaceRoot: { newRoot: { $arrayToObject: '$statuses' } } }
    ]);
    
    const currentStatusCounts = funnelCounts[0] || {};

    const hired = currentStatusCounts.hired || 0;
    const offerSent = (currentStatusCounts['offer sent'] || 0) + hired;
    const interviewScheduled = (currentStatusCounts['interview scheduled'] || 0) + offerSent;
    const shortlisted = (currentStatusCounts.shortlisted || 0) + interviewScheduled;
    const recommended = (currentStatusCounts.pushed || 0) + (currentStatusCounts.viewed || 0) + shortlisted;

    const openRequirements = await Requirement.countDocuments({ school: schoolId, status: 'open' });
    const offerAcceptanceRate = offerSent > 0 ? Math.round((hired / offerSent) * 100) : 0;

    const recentHires = await PushedCandidate.find({ school: schoolId, status: 'hired' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('candidate', 'name')
        .populate('requirement', 'title');

    res.json({
        hasAdvancedAnalytics: true,
        funnel: {
            recommended,
            shortlisted,
            interviewScheduled,
            offerSent,
            hired
        },
        kpis: {
            openRequirements,
            offerAcceptanceRate,
            totalHires: hired
        },
        recentHires: recentHires.map(hire => ({
            candidateName: (hire.candidate as any).name,
            jobTitle: (hire.requirement as any).title,
            timeToFill: (hire.updatedAt && hire.createdAt) 
                ? Math.ceil((hire.updatedAt.getTime() - hire.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                : 0
        }))
    });
});

/**
 * @desc    Get a candidate's public-facing professional profile for a school
 * @route   GET /api/school/candidate-profile/:candidateId
 * @access  Private/School
 */
const getPublicCandidateProfile = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { candidateId } = req.params;
    const schoolId = req.user?._id;

    const isPushed = await PushedCandidate.findOne({
        school: schoolId,
        candidate: new mongoose.Types.ObjectId(candidateId),
    });

    if (!isPushed) {
        res.status(403);
        throw new Error("You are not authorized to view this candidate's profile.");
    }

    const profile = await CandidateProfile.findOne({ user: candidateId })
        .populate('user', 'name profilePictureUrl');

    if (!profile) {
        res.status(404);
        throw new Error('Candidate profile not found.');
    }

    res.json({
        user: profile.user,
        education: profile.education,
        experience: profile.experience,
        skills: profile.skills,
        preferredLocations: profile.preferredLocations,
    });
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
                interviewType,
                locationOrLink,
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
    school.schoolDetails = req.body;
    school.profileCompleted = true; 

    const updatedSchool = await school.save();
    res.json(updatedSchool.schoolDetails);
  } else {
    res.status(404);
    throw new Error('School not found');
  }
});

/**
 * @desc    Get simple statistics for the dashboard (legacy)
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

/**
 * @desc    Get the current user's active plan details
 * @route   GET /api/school/my-plan
 * @access  Private/School
 */
const getMyActivePlan = asyncHandler(async (req: SubscriptionRequest, res: Response) => {
    res.json(req.plan);
});

export { 
    getPushedCandidates,
    getPublicCandidateProfile,
    getRequirementDetailsWithCandidates,
    getDashboardAnalytics,
    shortlistCandidate, 
    scheduleInterview, 
    getSchoolProfile, 
    updateSchoolProfile,
    getDashboardStats,
    getMyActivePlan
};