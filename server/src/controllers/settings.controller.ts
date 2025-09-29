// src/controllers/settings.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Settings from '../models/settings.model';

/**
 * @desc    Get system settings
 * @route   GET /api/settings
 * @access  Private/Admin
 */
const getSettings = asyncHandler(async (req: Request, res: Response) => {
  // Find the first (and only) settings document, or create it if it doesn't exist
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

/**
 * @desc    Update system settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await Settings.findOneAndUpdate({}, req.body, {
    new: true,
    upsert: true, // Creates the document if it doesn't exist
  });
  res.json(settings);
});

export { getSettings, updateSettings };