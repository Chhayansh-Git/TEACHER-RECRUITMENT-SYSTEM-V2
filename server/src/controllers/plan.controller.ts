// src/controllers/plan.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Plan from '../models/plan.model';

/**
 * @desc    Get all available subscription plans
 * @route   GET /api/plans
 * @access  Private/School
 */
const getPlans = asyncHandler(async (req: Request, res: Response) => {
  const plans = await Plan.find({});
  res.json(plans);
});

export { getPlans };