// src/controllers/report.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import Requirement from '../models/requirement.model';
import PushedCandidate from '../models/pushedCandidate.model';
import Subscription from '../models/subscription.model';

/**
 * @desc    Generate a system report for a given date range
 * @route   GET /api/reports
 * @access  Private/Admin
 */
const generateReport = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide both a start and end date');
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  end.setHours(23, 59, 59, 999); // Ensure the end date includes the entire day

  const dateFilter = { createdAt: { $gte: start, $lte: end } };

  // Aggregate data
  const newCandidates = await User.countDocuments({ role: 'candidate', ...dateFilter });
  const newSchools = await User.countDocuments({ role: 'school', ...dateFilter });
  const requirementsPosted = await Requirement.countDocuments(dateFilter);
  const candidatesPushed = await PushedCandidate.countDocuments(dateFilter);
  const newSubscriptions = await Subscription.countDocuments(dateFilter);

  res.json({
    reportPeriod: {
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0],
    },
    userGrowth: {
      newCandidates,
      newSchools,
    },
    platformActivity: {
      requirementsPosted,
      candidatesPushed,
    },
    monetization: {
      newSubscriptions,
    },
  });
});

export { generateReport };