// src/routes/offerLetter.routes.ts

import express from 'express';
import { sendOfferLetter, getMyOfferLetters, respondToOffer } from '../controllers/offerLetter.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

// School route to send an offer
router.post('/send', protect, authorizeRoles('school'), sendOfferLetter);

// Candidate route to get their offers
router.get('/my-offers', protect, authorizeRoles('candidate'), getMyOfferLetters);

// Candidate route to respond to an offer
router.put('/:id/respond', protect, authorizeRoles('candidate'), respondToOffer);

export default router;