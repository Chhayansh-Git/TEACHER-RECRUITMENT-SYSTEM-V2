// src/controllers/admin.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import Requirement from '../models/requirement.model';
import { getRankedCandidatesForRequirement } from '../services/aiMatching.service';
import PushedCandidate from '../models/pushedCandidate.model';
import { ProtectedRequest } from '../middleware/auth.middleware';

/**
 * @desc    Get all candidates
 * @route   GET /api/admin/candidates
 * @access  Private/Admin
 */
const getAllCandidates = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const candidates = await User.find({ role: 'candidate' }).select('-password');
  res.json(candidates);
});

const getAllRequirements = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirements = await Requirement.find({})
    .populate('school', 'name')
    .sort({ createdAt: -1 });
  res.json(requirements);
});

/**
 * @desc    Get single requirement by ID (for Admin)
 * @route   GET /api/admin/requirements/:id
 * @access  Private/Admin
 */
const getRequirementById = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirement = await Requirement.findById(req.params.id).populate('school', 'name');
  if (requirement) {
    res.json(requirement);
  } else {
    res.status(404);
    throw new Error('Requirement not found');
  }
});

const pushCandidateToSchool = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { candidateId, requirementId } = req.body;

  // Validate presence of IDs
  if (!candidateId || !requirementId) {
    res.status(400);
    throw new Error('candidateId and requirementId are required');
  }

  const requirement = await Requirement.findById(requirementId);
  if (!requirement) {
    res.status(404);
    throw new Error('Requirement not found');
  }

  // Optional: only allow pushing to open requirements
  if (requirement.status && requirement.status !== 'open') {
    res.status(400);
    throw new Error('Cannot push candidate to a non-open requirement');
  }

  const candidate = await User.findById(candidateId);
  if (!candidate) {
    res.status(404);
    throw new Error('Candidate not found');
  }
  if (candidate.role !== 'candidate') {
    res.status(400);
    throw new Error('User is not a candidate');
  }

  const alreadyPushed = await PushedCandidate.findOne({
    requirement: requirementId,
    candidate: candidateId,
  });
  if (alreadyPushed) {
    res.status(400);
    throw new Error('Candidate already pushed for this requirement');
  }

  const pushedCandidate = await PushedCandidate.create({
    requirement: requirementId,
    candidate: candidateId,
    school: requirement.school,
    pushedBy: (req.user as any)?._id,
  });

  // Populate returned document for client convenience
  const populated = await PushedCandidate.findById(pushedCandidate._id)
    .populate('candidate', '-password')
    .populate({
      path: 'requirement',
      populate: { path: 'school', select: 'name' },
    })
    .lean();

  res.status(201).json(populated);
});

/**
 * @desc    Get the entire recruitment pipeline for the admin
 * @route   GET /api/admin/pipeline
 * @access  Private/Admin
 */
const getPipeline = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const pipeline = await PushedCandidate.find({})
    .populate('candidate', 'name email')
    .populate('school', 'name')
    .populate('requirement', 'title')
    .sort({ createdAt: -1 });

  res.json(pipeline);
});

/**
 * @desc    Get AI-ranked candidates for a specific requirement
 * @route   GET /api/admin/requirements/:id/ranked-candidates
 * @access  Private/Admin
 */
const getRankedCandidates = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { id: requirementId } = req.params;
  const candidates = await getRankedCandidatesForRequirement(requirementId);
  res.json(candidates);
});

export { getAllCandidates, getAllRequirements, pushCandidateToSchool, getRequirementById, getPipeline, getRankedCandidates };