// src/routes/candidate.routes.ts

import express from 'express';
import { getCandidateProfile, updateCandidateProfile, getDashboardStats } from '../controllers/candidate.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.route('/profile')
  .get(protect, getCandidateProfile)
  .put(protect, updateCandidateProfile);
router.get('/stats', protect, getDashboardStats);

export default router;