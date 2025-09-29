// src/routes/emailTemplate.routes.ts

import express from 'express';
import { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate } from '../controllers/emailTemplate.controller';
import { protect } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/authorizeRoles.middleware';

const router = express.Router();

router.route('/')
  .get(protect, authorizeRoles('admin', 'super-admin'), getTemplates)
  .post(protect, authorizeRoles('admin', 'super-admin'), createTemplate);

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'super-admin'), getTemplateById)
  .put(protect, authorizeRoles('admin', 'super-admin'), updateTemplate)
  .delete(protect, authorizeRoles('admin', 'super-admin'), deleteTemplate);

export default router;