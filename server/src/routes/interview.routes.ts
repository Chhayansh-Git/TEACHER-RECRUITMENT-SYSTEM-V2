// src/routes/interview.routes.ts

import express from 'express';
import { getMyInterviews, respondToInterview } from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/my-interviews', protect, authorizeRoles('candidate'), getMyInterviews);
router.put('/:id/respond', protect, authorizeRoles('candidate'), respondToInterview);

export default router;