// src/routes/settings.routes.ts

import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'super-admin'), getSettings)
  .put(protect, authorizeRoles('admin', 'super-admin'), updateSettings);

export default router;