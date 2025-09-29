// src/controllers/emailTemplate.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import EmailTemplate from '../models/emailTemplate.model';

const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await EmailTemplate.find({});
  res.json(templates);
});

const getTemplateById = asyncHandler(async (req: Request, res: Response) => {
  const template = await EmailTemplate.findById(req.params.id);
  if (template) {
    res.json(template);
  } else {
    res.status(404);
    throw new Error('Template not found');
  }
});

// @desc Create a new template
const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { key, name, subject, body, placeholders } = req.body;
  const templateExists = await EmailTemplate.findOne({ key });
  if (templateExists) {
      res.status(400);
      throw new Error('Template with this key already exists');
  }
  const template = await EmailTemplate.create({ key, name, subject, body, placeholders });
  res.status(201).json(template);
});

const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { name, subject, body, placeholders } = req.body;
  const template = await EmailTemplate.findById(req.params.id);

  if (template) {
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.body = body || template.body;
    template.placeholders = placeholders || template.placeholders;

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } else {
    res.status(404);
    throw new Error('Template not found');
  }
});

// @desc Delete a template
const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await EmailTemplate.findById(req.params.id);
    if (template) {
        await template.deleteOne();
        res.json({ message: 'Template removed' });
    } else {
        res.status(404);
        throw new Error('Template not found');
    }
});

export { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate };