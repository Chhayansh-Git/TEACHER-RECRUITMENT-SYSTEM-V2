// src/routes/candidate.routes.ts

import express from 'express';
import { getCandidateProfile, updateCandidateProfile, getMyApplications, getDashboardStats } from '../controllers/candidate.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.route('/profile')
  .get(protect, authorizeRoles('candidate'), getCandidateProfile)
  .put(protect, authorizeRoles('candidate'), updateCandidateProfile);

router.get('/my-applications', protect, authorizeRoles('candidate'), getMyApplications);
router.get('/stats', protect, authorizeRoles('candidate'), getDashboardStats);

export default router;