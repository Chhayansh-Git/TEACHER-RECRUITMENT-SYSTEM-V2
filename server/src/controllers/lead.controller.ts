// server/src/controllers/lead.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Lead from '../models/lead.model';
import { ProtectedRequest } from '../middleware/auth.middleware';
import User from '../models/user.model'; // Import User model

/**
 * @desc    Track a school's interest in a subscription plan (simple click tracking)
 * @route   POST /api/leads/track
 * @access  Private/School
 */
const trackSubscriptionInterest = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { planName } = req.body;
    const schoolId = req.user?._id;

    if (!['Premium', 'Enterprise'].includes(planName)) {
        res.status(400);
        throw new Error('Invalid plan name for tracking.');
    }

    const existingLead = await Lead.findOne({
        school: schoolId,
        planOfInterest: planName,
        status: 'active'
    });

    if (existingLead) {
        existingLead.interactionCount += 1;
        await existingLead.save();
        res.status(200).json({ message: 'Interest tracked.' });
    } else {
        await Lead.create({
            school: schoolId,
            planOfInterest: planName,
        });
        res.status(201).json({ message: 'New lead created and interest tracked.' });
    }
});

/**
 * @desc    Create a detailed lead from the Enterprise Interest form
 * @route   POST /api/leads/enterprise-interest
 * @access  Private/School
 */
const createEnterpriseLead = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { name, email, phone, organizationName, numberOfSchools, message } = req.body;
    const schoolId = req.user?._id;

    // Upsert logic: Find an existing active lead for this school, or create a new one.
    // This prevents duplicate leads if a user fills out the form multiple times.
    const lead = await Lead.findOneAndUpdate(
        { school: schoolId, planOfInterest: 'Enterprise', status: 'active' },
        { 
            school: schoolId,
            planOfInterest: 'Enterprise',
            status: 'active',
            contactPerson: { name, email, phone },
            organizationName,
            numberOfSchools,
            notes: message, // Use the 'notes' field for the message
            $inc: { interactionCount: 1 } // Increment interaction count on form submission
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // Optional: Here you could trigger an email notification to your sales team.
    
    res.status(201).json({ message: 'Your interest has been registered. Our team will contact you shortly.' });
});

/**
 * @desc    Admin gets all leads
 * @route   GET /api/leads
 * @access  Private/Admin
 */
const getAllLeads = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const leads = await Lead.find({})
        .populate('school', 'name email')
        .sort({ updatedAt: -1 });
    res.json(leads);
});

export { trackSubscriptionInterest, createEnterpriseLead, getAllLeads };