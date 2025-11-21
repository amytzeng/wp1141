import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { MessageMetadata } from '@/types';

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  lineUserId: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata: MessageMetadata;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    lineUserId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      messageId: String,
      replyToken: String,
      llmProvider: String,
      llmModel: String,
      tokensUsed: Number,
      error: String,
      processingTime: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
MessageSchema.index({ conversationId: 1, timestamp: 1 });
MessageSchema.index({ lineUserId: 1, timestamp: -1 });
MessageSchema.index({ timestamp: -1 });

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>('Message', MessageSchema);

export default Message;

