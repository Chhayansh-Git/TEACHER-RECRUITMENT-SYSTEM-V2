// server/src/routes/chat.routes.ts
import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getConversations, getMessages } from '../controllers/chat.controller';
// FIX: Use a named import for uploadChatFile instead of a default import
import { uploadChatFile } from '../middleware/upload.middleware';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);

// The file upload route will be fully implemented when we build the controller logic for sending messages.
// This placeholder is now using the correct middleware import.
// router.post('/messages/file', uploadChatFile.single('chatFile'), sendMessage);

export default router;