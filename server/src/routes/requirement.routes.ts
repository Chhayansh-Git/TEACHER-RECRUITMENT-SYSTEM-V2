// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/routes/requirement.routes.ts
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
// --- IMPORT NEW MIDDLEWARE ---
import { attachSubscriptionPlan, checkFeatureLimit } from '../middleware/subscription.middleware';

const router = express.Router();

router.get('/public', protect, authorizeRoles('candidate'), getPublicRequirements);

router.route('/')
  // --- APPLY MIDDLEWARE TO THE CREATE ROUTE ---
  .post(
    protect, 
    authorizeRoles('school'), 
    attachSubscriptionPlan, // First, get the user's plan
    checkFeatureLimit('JOBS'), // Then, check if they can post more jobs
    createRequirement
  )
  .get(protect, authorizeRoles('school'), getSchoolRequirements);

router.route('/:id')
    .get(protect, authorizeRoles('school'), getRequirementById)
    .put(protect, authorizeRoles('school'), updateRequirement)
    .delete(protect, authorizeRoles('school'), deleteRequirement);

export default router;