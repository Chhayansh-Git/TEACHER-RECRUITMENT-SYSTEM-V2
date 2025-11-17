// server/src/controllers/groupAdmin.controller.ts
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ProtectedRequest } from '../middleware/auth.middleware';
import Organization from '../models/organization.model';
import Requirement from '../models/requirement.model';
import PushedCandidate from '../models/pushedCandidate.model';
import Invitation from '../models/invitation.model';
import User from '../models/user.model';
import sendEmail from '../utils/sendEmail';

/**
 * @desc    Get high-level statistics for the group admin dashboard
 * @route   GET /api/group-admin/stats
 * @access  Private/Group-Admin
 */
const getDashboardStats = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const groupAdmin = req.user!;

    const organization = await Organization.findOne({ owner: groupAdmin._id });
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found for this administrator.');
    }

    const schoolIds = organization.schools;

    const totalSchools = schoolIds.length;
    const totalOpenRequirements = await Requirement.countDocuments({ school: { $in: schoolIds }, status: 'open' });
    const totalHires = await PushedCandidate.countDocuments({ school: { $in: schoolIds }, status: 'hired' });
    const totalPushed = await PushedCandidate.countDocuments({ school: { $in: schoolIds } });

    res.json({
        totalSchools,
        totalOpenRequirements,
        totalHires,
        totalPushed,
        organizationName: organization.name
    });
});

/**
 * @desc    Get all schools managed by the group admin
 * @route   GET /api/group-admin/schools
 * @access  Private/Group-Admin
 */
const getManagedSchools = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const organization = await Organization.findOne({ owner: req.user!._id })
        .populate('schools', 'name email createdAt');
        
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }
    res.json(organization.schools);
});

/**
 * @desc    Create and send an invitation to a school
 * @route   POST /api/group-admin/invitations
 * @access  Private/Group-Admin
 */
const createInvitation = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { email } = req.body;
    const organization = await Organization.findOne({ owner: req.user!._id });

    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }

    // Check if the user is already in an organization or if an invite is pending
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.organization) {
        res.status(400);
        throw new Error('This school is already part of another organization.');
    }
    const pendingInvite = await Invitation.findOne({ email, status: 'pending' });
    if (pendingInvite) {
        res.status(400);
        throw new Error('An invitation is already pending for this email address.');
    }

    const invitation = new Invitation({ organization: organization._id, email });
    await invitation.save();

    const invitationURL = `${process.env.FRONTEND_URL}/accept-invitation/${invitation.token}`;

    await sendEmail({
        to: email,
        templateKey: 'group-invitation-school',
        payload: {
            organizationName: organization.name,
            invitationURL: invitationURL,
        }
    });

    res.status(201).json({ message: `Invitation sent to ${email}.` });
});

/**
 * @desc    Remove a school from the organization
 * @route   DELETE /api/group-admin/schools/:schoolId
 * @access  Private/Group-Admin
 */
const removeSchoolFromGroup = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { schoolId } = req.params;
    const organization = await Organization.findOne({ owner: req.user!._id });
    
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
    }

    // Remove school from organization's list
    await Organization.updateOne({ _id: organization._id }, { $pull: { schools: schoolId } });
    
    // Unlink organization from the school's user document
    await User.updateOne({ _id: schoolId }, { $unset: { organization: "" } });

    res.json({ message: 'School removed from the group successfully.' });
});

/**
 * @desc    Get aggregated analytics for the entire organization
 * @route   GET /api/group-admin/analytics
 * @access  Private/Group-Admin
 */
interface School {
    _id: any;
    name: string;
}

const getGroupAnalytics = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const organization = await Organization.findOne({ owner: req.user!._id }).populate<{ schools: School[] }>('schools', 'name');
    if (!organization || organization.schools.length === 0) {
        res.status(404);
        throw new Error('Organization not found or no schools have been added yet.');
    }

    const schoolIds = organization.schools.map(s => s._id);

    // 1. Aggregated Funnel Data
    const funnelCounts = await PushedCandidate.aggregate([
        { $match: { school: { $in: schoolIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $group: { _id: null, statuses: { $push: { k: '$_id', v: '$count' } } } },
        { $replaceRoot: { newRoot: { $arrayToObject: '$statuses' } } }
    ]);
    
    const statusCounts = funnelCounts[0] || {};
    const hired = statusCounts.hired || 0;
    const offerSent = (statusCounts['offer sent'] || 0) + hired;
    const interviewScheduled = (statusCounts['interview scheduled'] || 0) + offerSent;
    const shortlisted = (statusCounts.shortlisted || 0) + interviewScheduled;
    const recommended = (statusCounts.pushed || 0) + (statusCounts.viewed || 0) + shortlisted;

    // 2. School Benchmarking Data
    const schoolPerformance = await PushedCandidate.aggregate([
        { $match: { school: { $in: schoolIds } } },
        {
            $group: {
                _id: '$school',
                totalPushed: { $sum: 1 },
                totalHires: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } },
                avgTimeToFill: { $avg: { $cond: [{ $eq: ['$status', 'hired'] }, { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] }, null] } }
            }
        }
    ]);

    // Map school names to the performance data
    const schoolMap = new Map(organization.schools.map(s => [s._id.toString(), s.name]));
    const benchmarkingData = schoolPerformance.map(perf => ({
        schoolId: perf._id,
        schoolName: schoolMap.get(perf._id.toString()) || 'Unknown School',
        totalPushed: perf.totalPushed,
        totalHires: perf.totalHires,
        conversionRate: perf.totalPushed > 0 ? Math.round((perf.totalHires / perf.totalPushed) * 100) : 0,
        avgTimeToFill: perf.avgTimeToFill ? Math.round(perf.avgTimeToFill) : null
    }));

    // 3. Value Realization Metrics (ROI)
    // Assuming 5 minutes saved per candidate review vs manual screening
    const estimatedHoursSaved = Math.round((recommended * 5) / 60);

    res.json({
        funnel: { recommended, shortlisted, interviewScheduled, offerSent, hired },
        benchmarking: benchmarkingData,
        roi: { estimatedHoursSaved }
    });
});

export { getDashboardStats, getManagedSchools, createInvitation, removeSchoolFromGroup, getGroupAnalytics };