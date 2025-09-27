// src/routes/plan.routes.ts

import express from 'express';
import { getPlans } from '../controllers/plan.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/', protect, authorizeRoles('school'), getPlans);

export default router;