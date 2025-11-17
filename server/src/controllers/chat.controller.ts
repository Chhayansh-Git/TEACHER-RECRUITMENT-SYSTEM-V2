// server/src/controllers/chat.controller.ts
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ProtectedRequest } from '../middleware/auth.middleware';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import User from '../models/user.model';

/**
 * @desc    Get all conversations for the logged-in user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
const getConversations = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const userId = req.user!._id;

    const conversations = await Conversation.find({ participants: userId })
        .populate({
            path: 'participants',
            select: 'name profilePictureUrl role'
        })
        .populate({
            path: 'lastMessage',
            select: 'content createdAt'
        })
        .sort({ updatedAt: -1 });

    res.json(conversations);
});

/**
 * @desc    Get all messages for a specific conversation
 * @route   GET /api/chat/messages/:conversationId
 * @access  Private
 */
const getMessages = asyncHandler(async (req: ProtectedRequest, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user!._id;

    // Verify the user is a participant of the conversation
    const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
    if (!conversation) {
        res.status(403);
        throw new Error('Not authorized to access this conversation.');
    }

    const messages = await Message.find({ conversation: conversationId })
        .populate('sender', 'name profilePictureUrl')
        .sort({ createdAt: 'asc' });

    res.json(messages);
});

export { getConversations, getMessages };