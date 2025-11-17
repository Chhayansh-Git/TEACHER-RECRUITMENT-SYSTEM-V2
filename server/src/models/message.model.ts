// server/src/models/message.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user.model';
import { IConversation } from './conversation.model';

export interface IMessage extends Document {
  conversation: IConversation['_id'];
  sender: IUser['_id'];
  content: string; // This will store the ENCRYPTED message content
  fileUrl?: string; // URL to the uploaded file in /uploads/chat
  fileType?: string; // e.g., 'image/png', 'application/pdf'
}

const MessageSchema: Schema<IMessage> = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String, // Storing encrypted content
    required: true,
  },
  fileUrl: {
    type: String,
  },
  fileType: {
    type: String,
  },
}, { timestamps: true });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;