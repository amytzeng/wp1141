import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  lineUserId: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  metadata: {
    lastTopic?: string;
    context?: string[];
  };
}

const ConversationSchema: Schema = new Schema(
  {
    lineUserId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      lastTopic: {
        type: String,
      },
      context: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ConversationSchema.index({ lineUserId: 1, createdAt: -1 });
ConversationSchema.index({ sessionId: 1 });

// Virtual for getting messages count (if needed)
ConversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
});

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;

