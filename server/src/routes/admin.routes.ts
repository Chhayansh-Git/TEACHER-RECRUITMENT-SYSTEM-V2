// src/routes/admin.routes.ts

import express from 'express';
import { getAllCandidates, getAllRequirements, pushCandidateToSchool, getRequirementById, getPipeline, getRankedCandidates } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/candidates', protect, authorizeRoles('admin', 'super-admin'), getAllCandidates);
router.get('/requirements', protect, authorizeRoles('admin', 'super-admin'), getAllRequirements);
router.get('/requirements/:id', protect, authorizeRoles('admin', 'super-admin'), getRequirementById); // Add this line
router.post('/push', protect, authorizeRoles('admin', 'super-admin'), pushCandidateToSchool);
router.get('/pipeline', protect, authorizeRoles('admin', 'super-admin'), getPipeline);
router.get('/requirements/:id/ranked-candidates', protect, authorizeRoles('admin', 'super-admin'), getRankedCandidates);

export default router;