// src/routes/school.routes.ts

import express from 'express';
import { getPushedCandidates, shortlistCandidate, scheduleInterview, getSchoolProfile, updateSchoolProfile } from '../controllers/school.controller'; 
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/pushed-candidates', protect, authorizeRoles('school'), getPushedCandidates);
router.put('/pushed-candidates/:pushId/shortlist', protect, authorizeRoles('school'), shortlistCandidate);
router.post('/interviews/schedule', protect, authorizeRoles('school'), scheduleInterview);
router.route('/profile')
  .get(protect, authorizeRoles('school'), getSchoolProfile)
  .put(protect, authorizeRoles('school'), updateSchoolProfile);

export default router;