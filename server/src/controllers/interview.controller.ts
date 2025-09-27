// src/controllers/interview.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Interview from '../models/interview.model';
import User from '../models/user.model'; // Import User model
import sendEmail from '../utils/sendEmail'; // Import email utility
import { ProtectedRequest } from '../middleware/auth.middleware';

/**
 * @desc    Get all scheduled interviews for the logged-in candidate
 * @route   GET /api/interviews/my-interviews
 * @access  Private/Candidate
 */
const getMyInterviews = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const interviews = await Interview.find({ candidate: req.user?._id })
    .populate({
      path: 'school',
      select: 'name',
    })
    .sort({ interviewDate: 1 });

  res.json(interviews);
});

/**
 * @desc    Respond to an interview invitation
 * @route   PUT /api/interviews/:id/respond
 * @access  Private/Candidate
 */
const respondToInterview = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { status } = req.body; // Expecting 'Accepted' or 'Declined'
  const { id: interviewId } = req.params;
  const candidateUser = req.user; // The logged-in candidate

  if (!['Accepted', 'Declined'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status update');
  }

  const interview = await Interview.findOne({
    _id: interviewId,
    candidate: candidateUser?._id,
  });

  if (!interview) {
    res.status(404);
    throw new Error('Interview not found');
  }

  interview.status = status;
  const updatedInterview = await interview.save();

  // --- TRIGGER EMAIL NOTIFICATION TO SCHOOL ---
  const schoolUser = await User.findById(interview.school);
  if (schoolUser && candidateUser) {
    const subject = `Interview Response: ${candidateUser.name} has ${status}`;
    const message = `
      <h1>Interview Response Received</h1>
      <p>Hello ${schoolUser.name},</p>
      <p>The candidate, <strong>${candidateUser.name}</strong>, has <strong>${status}</strong> your interview invitation scheduled for ${new Date(interview.interviewDate).toLocaleString()}.</p>
      <p>You can view the status on your dashboard.</p>
      <p>Thank you!</p>
    `;

    try {
      await sendEmail({
        to: schoolUser.email,
        subject: subject,
        html: message,
      });
    } catch (error) {
      console.error('Email could not be sent to school:', error);
      // Log error but do not fail the request
    }
  }
  // --- END OF EMAIL LOGIC ---

  res.json(updatedInterview);
});

export { getMyInterviews, respondToInterview };