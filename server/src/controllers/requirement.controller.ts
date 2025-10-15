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
  const { title, description, subject, gradeLevel, employmentType, location, salary, experienceRequired, qualifications, benefits } = req.body;
  
  const requirement = new Requirement({
    school: req.user?._id,
    title,
    description,
    subject,
    gradeLevel,
    employmentType,
    location,
    salary,
    experienceRequired,
    qualifications,
    benefits,
  });

  const createdRequirement = await requirement.save();
  res.status(201).json(createdRequirement);
});

/**
 * @desc    Get all requirements for the logged-in school
 * @route   GET /api/requirements
 * @access  Private/School
 */
const getSchoolRequirements = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirements = await Requirement.find({ school: req.user?._id }).sort({ createdAt: -1 });
  res.json(requirements);
});

/**
 * @desc    Get a single requirement by ID
 * @route   GET /api/requirements/:id
 * @access  Private/School
 */
const getRequirementById = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const requirement = await Requirement.findById(req.params.id);

    if (requirement && requirement.school.toString() === (req.user?._id as string).toString()) {
        res.json(requirement);
    } else {
        res.status(404);
        throw new Error('Requirement not found or you are not authorized to view it.');
    }
});

/**
 * @desc    Update a requirement
 * @route   PUT /api/requirements/:id
 * @access  Private/School
 */
const updateRequirement = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const requirement = await Requirement.findById(req.params.id);

    if (requirement && requirement.school.toString() === (req.user?._id as string).toString()) {
        const { title, description, subject, gradeLevel, employmentType, location, salary, experienceRequired, qualifications, benefits, status } = req.body;
        
        requirement.title = title || requirement.title;
        requirement.description = description || requirement.description;
        requirement.subject = subject || requirement.subject;
        requirement.gradeLevel = gradeLevel || requirement.gradeLevel;
        requirement.employmentType = employmentType || requirement.employmentType;
        requirement.location = location || requirement.location;
        requirement.salary = salary; // Can be set to null/undefined
        requirement.experienceRequired = experienceRequired || requirement.experienceRequired;
        requirement.qualifications = qualifications || requirement.qualifications;
        requirement.benefits = benefits || requirement.benefits;
        requirement.status = status || requirement.status;

        const updatedRequirement = await requirement.save();
        res.json(updatedRequirement);
    } else {
        res.status(404);
        throw new Error('Requirement not found or you are not authorized to update it.');
    }
});

/**
 * @desc    Delete a requirement
 * @route   DELETE /api/requirements/:id
 * @access  Private/School
 */
const deleteRequirement = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const requirement = await Requirement.findById(req.params.id);

    if (requirement && requirement.school.toString() === (req.user?._id as string).toString()) {
        await requirement.deleteOne();
        res.json({ message: 'Requirement removed' });
    } else {
        res.status(404);
        throw new Error('Requirement not found or you are not authorized to delete it.');
    }
});


/**
 * @desc    Get all open requirements for candidates (anonymized)
 * @route   GET /api/requirements/public
 * @access  Private/Candidate
 */
const getPublicRequirements = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const requirements = await Requirement.find({ status: 'open' })
    .select('-school -__v')
    .sort({ createdAt: -1 });
  res.json(requirements);
});

export { 
    createRequirement, 
    getSchoolRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement,
    getPublicRequirements
};