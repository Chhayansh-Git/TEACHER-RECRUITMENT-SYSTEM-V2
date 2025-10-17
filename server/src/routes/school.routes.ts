// chhayansh-git/teacher-recruitment-system-v2/TEACHER-RECRUITMENT-SYSTEM-V2-f3d22d9e27ee0839a3c93ab1d4f580b31df39678/server/src/routes/school.routes.ts
import express from 'express';
import { 
    getPushedCandidates, 
    shortlistCandidate, 
    scheduleInterview, 
    getSchoolProfile, 
    updateSchoolProfile, 
    getDashboardStats, 
    getPublicCandidateProfile,
    getRequirementDetailsWithCandidates,
    getDashboardAnalytics,
    getMyActivePlan
} from '../controllers/school.controller'; 
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';
import { attachSubscriptionPlan, checkFeatureLimit } from '../middleware/subscription.middleware';

const router = express.Router();

// --- DASHBOARD ---
router.get('/my-plan', protect, authorizeRoles('school'), attachSubscriptionPlan, getMyActivePlan);

router.get(
    '/dashboard-analytics', 
    protect, 
    authorizeRoles('school'), 
    attachSubscriptionPlan,
    getDashboardAnalytics
);

// --- CANDIDATES ---
router.get('/pushed-candidates', protect, authorizeRoles('school'), attachSubscriptionPlan, getPushedCandidates);
router.put('/pushed-candidates/:pushId/shortlist', protect, authorizeRoles('school'), shortlistCandidate);
router.get(
    '/candidate-profile/:candidateId', 
    protect, 
    authorizeRoles('school'), 
    attachSubscriptionPlan, 
    // --- THIS IS THE FIX ---
    // Corrected the feature name to match the middleware definition.
    checkFeatureLimit('VIEW_CANDIDATE_PROFILE'),
    getPublicCandidateProfile
);

// --- REQUIREMENTS ---
router.get('/requirements/:id/details', protect, authorizeRoles('school'), attachSubscriptionPlan, getRequirementDetailsWithCandidates);

// --- INTERVIEWS ---
router.post('/interviews/schedule', protect, authorizeRoles('school'), scheduleInterview);

// --- PROFILE ---
router.route('/profile')
  .get(protect, authorizeRoles('school'), getSchoolProfile)
  .put(protect, authorizeRoles('school'), updateSchoolProfile);

// This old stats route can be kept for now or removed later
router.get('/stats', protect, authorizeRoles('school'), getDashboardStats);


export default router;