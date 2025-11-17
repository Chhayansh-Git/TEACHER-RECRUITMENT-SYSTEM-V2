// server/src/models/conversation.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './user.model';
import { IMessage } from './message.model';

export interface IConversation extends Document {
  participants: IUser['_id'][];
  lastMessage: IMessage['_id'];
}

const ConversationSchema: Schema<IConversation> = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
}, { timestamps: true });

// Ensure a conversation between the same two people isn't duplicated
ConversationSchema.index({ participants: 1 }, { unique: true });

const Conversation: Model<IConversation> = mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;