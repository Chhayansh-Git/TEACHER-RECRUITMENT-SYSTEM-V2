// src/routes/requirement.routes.ts

import express from 'express';
import { createRequirement, getSchoolRequirements, getPublicRequirements } from '../controllers/requirement.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/public', protect, authorizeRoles('candidate'), getPublicRequirements);

router.route('/')
  .post(protect, authorizeRoles('school'), createRequirement)
  .get(protect, authorizeRoles('school'), getSchoolRequirements);

export default router;