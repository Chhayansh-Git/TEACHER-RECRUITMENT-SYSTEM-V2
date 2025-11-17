// server/src/middleware/upload.middleware.ts

import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// --- Storage for Profile Pictures ---
const avatarStorage = multer.diskStorage({
  destination: './public/uploads/avatars',
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const userId = (req as any).user?._id || 'user';
    cb(null, `avatar-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// --- Storage for Chat Files ---
const chatFileStorage = multer.diskStorage({
  destination: './public/uploads/chat',
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const userId = (req as any).user?._id || 'user';
    // Use a more generic prefix for chat files
    cb(null, `chatfile-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type specifically for IMAGES
const checkImageType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

// Middleware for uploading AVATARS
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for avatars
  fileFilter: (req, file, cb) => {
    checkImageType(file, cb);
  },
});

// Middleware for uploading any CHAT file
export const uploadChatFile = multer({
  storage: chatFileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for chat files
  // No fileFilter is applied, allowing any file type for chat attachments
});