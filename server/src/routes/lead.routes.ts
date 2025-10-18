// server/src/routes/lead.routes.ts

import express from 'express';
import { trackSubscriptionInterest, createEnterpriseLead, getAllLeads } from '../controllers/lead.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

// School-facing route to track their clicks
router.post('/track', protect, authorizeRoles('school'), trackSubscriptionInterest);

// School-facing route for the detailed enterprise form
router.post('/enterprise-interest', protect, authorizeRoles('school'), createEnterpriseLead);


// Admin-facing route to view the leads
router.get('/', protect, authorizeRoles('admin', 'super-admin'), getAllLeads);

export default router;