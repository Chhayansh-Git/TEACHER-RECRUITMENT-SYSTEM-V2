// src/routes/requirement.routes.ts

import express from 'express';
import { 
    createRequirement, 
    getSchoolRequirements, 
    getPublicRequirements,
    getRequirementById,
    updateRequirement,
    deleteRequirement
} from '../controllers/requirement.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/public', protect, authorizeRoles('candidate'), getPublicRequirements);

router.route('/')
  .post(protect, authorizeRoles('school'), createRequirement)
  .get(protect, authorizeRoles('school'), getSchoolRequirements);

// --- ADD NEW ROUTES FOR SPECIFIC ID ---
router.route('/:id')
    .get(protect, authorizeRoles('school'), getRequirementById)
    .put(protect, authorizeRoles('school'), updateRequirement)
    .delete(protect, authorizeRoles('school'), deleteRequirement);


export default router;