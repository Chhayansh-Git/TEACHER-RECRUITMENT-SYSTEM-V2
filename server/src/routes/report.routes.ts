// src/routes/report.routes.ts

import express from 'express';
import { generateReport } from '../controllers/report.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.get('/', protect, authorizeRoles('admin', 'super-admin'), generateReport);

export default router;