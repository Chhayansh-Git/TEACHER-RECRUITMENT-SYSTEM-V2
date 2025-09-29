// src/middleware/upload.middleware.ts

import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Set up storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/avatars',
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const userId = (req as any).user?._id || 'user';
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'));
  }
};

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

export default upload;