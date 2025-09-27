// src/routes/candidate.routes.ts

import express from 'express';
import { getCandidateProfile, updateCandidateProfile } from '../controllers/candidate.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/profile')
  .get(protect, getCandidateProfile)
  .put(protect, updateCandidateProfile);

export default router;