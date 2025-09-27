// src/controllers/requirement.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Requirement from '../models/requirement.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

/**
 * @desc    Create a new requirement
 * @route   POST /api/requirements
 * @access  Private/School
 */
const createRequirement = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { title, description, subject, gradeLevel, employmentType, location, salary } = req.body;

  const requirement = new Requirement({
    school: req.user?._id,
    title,
    description,
    subject,
    gradeLevel,
    employmentType,
    location,
    salary,
  });

  const createdRequirement = await requirement.save();
  res.status(201).json(createdRequirement);
});

const getSchoolRequirements = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirements = await Requirement.find({ school: req.user?._id }).sort({ createdAt: -1 });
  res.json(requirements);
});

const getPublicRequirements = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirements = await Requirement.find({ status: 'open' })
    .select('-school -__v') // Exclude school ID and version key
    .sort({ createdAt: -1 });
  res.json(requirements);
});

export { createRequirement, getSchoolRequirements, getPublicRequirements };
