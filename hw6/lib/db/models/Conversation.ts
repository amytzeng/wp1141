import mongoose, { Schema, Document, Model } from 'mongoose';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'timeout';
export type FlowStage = 'greeting' | 'question' | 'discussion' | 'closing' | 'unknown';

export interface IConversation extends Document {
  lineUserId: string;
  sessionId: string;
  status: SessionStatus;
  flowStage?: FlowStage;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastActivityAt: Date;
  metadata: {
    lastTopic?: string;
    context?: string[];
    stateMachine?: {
      currentState: string;
      transitions: Array<{
        from: string;
        to: string;
        timestamp: Date;
      }>;
    };
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
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'timeout'],
      default: 'active',
      index: true,
    },
    flowStage: {
      type: String,
      enum: ['greeting', 'question', 'discussion', 'closing', 'unknown'],
      default: 'unknown',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      lastTopic: {
        type: String,
      },
      context: {
        type: [String],
        default: [],
      },
      stateMachine: {
        currentState: {
          type: String,
          default: 'initial',
        },
        transitions: [
          {
            from: String,
            to: String,
            timestamp: Date,
          },
        ],
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

