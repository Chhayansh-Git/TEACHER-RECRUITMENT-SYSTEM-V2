// server/src/routes/groupAdmin.routes.ts
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';
import { getDashboardStats, getManagedSchools, createInvitation, removeSchoolFromGroup, getGroupAnalytics } from '../controllers/groupAdmin.controller';

const router = express.Router();

router.use(protect, authorizeRoles('group-admin'));

router.get('/stats', getDashboardStats);
router.get('/schools', getManagedSchools);
router.post('/invitations', createInvitation);
router.delete('/schools/:schoolId', removeSchoolFromGroup);
router.get('/analytics', getGroupAnalytics);

export default router;