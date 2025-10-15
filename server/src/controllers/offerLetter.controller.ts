// src/controllers/offerLetter.controller.ts

import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import OfferLetter from '../models/offerLetter.model';
import PushedCandidate, { IPushedCandidate } from '../models/pushedCandidate.model';
import User, { IUser } from '../models/user.model';
import Requirement, { IRequirement } from '../models/requirement.model';
import { ProtectedRequest } from '../middleware/auth.middleware';
import sendEmail from '../utils/sendEmail';

/**
 * @desc    School creates and sends an offer letter
 * @route   POST /api/offers/send
 * @access  Private/School
 */
const sendOfferLetter = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { pushedCandidateId, offeredSalary, joiningDate, offerDetails } = req.body;
    const school = req.user as IUser; // We know user exists because of 'protect' middleware

    const pushedCandidate = await PushedCandidate.findById(pushedCandidateId)
        .populate<{ candidate: IUser, requirement: IRequirement }>('candidate requirement');

    if (!pushedCandidate || !school._id || pushedCandidate.school.toString() !== school._id.toString()) {
        res.status(404);
        throw new Error('Application record not found for this school.');
    }

    const offer = await OfferLetter.create({
        pushedCandidate: pushedCandidateId,
        school: school._id,
        candidate: pushedCandidate.candidate._id,
        requirement: pushedCandidate.requirement._id,
        jobTitle: pushedCandidate.requirement.title, // Now correctly typed
        offeredSalary,
        joiningDate,
        offerDetails,
    });

    pushedCandidate.status = 'offer sent';
    await pushedCandidate.save();

    const candidateUser = pushedCandidate.candidate;
    await sendEmail({
        to: candidateUser.email,
        templateKey: 'offer-letter-sent-candidate',
        payload: {
            candidateName: candidateUser.name,
            schoolName: school.name,
            jobTitle: pushedCandidate.requirement.title,
        },
    });

    res.status(201).json(offer);
});

/**
 * @desc    Candidate gets their offer letters
 * @route   GET /api/offers/my-offers
 * @access  Private/Candidate
 */
const getMyOfferLetters = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const offers = await OfferLetter.find({ candidate: req.user?._id })
        .populate('school', 'name profilePictureUrl')
        .sort({ createdAt: -1 });

    res.json(offers);
});

/**
 * @desc    Candidate responds to an offer letter
 * @route   PUT /api/offers/:id/respond
 * @access  Private/Candidate
 */
const respondToOffer = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const offer = await OfferLetter.findOne({ _id: req.params.id, candidate: req.user?._id });

    if (!offer) {
        res.status(404);
        throw new Error('Offer letter not found.');
    }
    if (offer.status !== 'sent') {
        res.status(400);
        throw new Error('This offer has already been responded to or withdrawn.');
    }

    offer.status = status;
    await offer.save();

    // --- NEW LOGIC FOR AUTO-CLOSING REQUIREMENT ---
    const pushedCandidate = await PushedCandidate.findById(offer.pushedCandidate);
    if (pushedCandidate) {
        if (status === 'accepted') {
            pushedCandidate.status = 'hired';
            const requirement = await Requirement.findById(pushedCandidate.requirement);
            if (requirement) {
                requirement.hiredCandidates.push(pushedCandidate.candidate);
                // Check if all vacancies are filled
                if (requirement.hiredCandidates.length >= requirement.numberOfVacancies) {
                    requirement.status = 'filled';
                }
                await requirement.save();
            }
        } else {
            pushedCandidate.status = 'rejected';
        }
        await pushedCandidate.save();
    }
    
    // Notify the school of the decision
    const schoolUser = await User.findById(offer.school);
    if (schoolUser && req.user) {
        await sendEmail({
            to: schoolUser.email,
            templateKey: 'offer-response-school',
            payload: {
                schoolName: schoolUser.name,
                candidateName: req.user.name,
                jobTitle: offer.jobTitle,
                status: status,
            },
        });
    }

    res.json(offer);
});

export { sendOfferLetter, getMyOfferLetters, respondToOffer };