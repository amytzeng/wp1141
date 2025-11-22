import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBotConfig extends Document {
  systemPrompt: string;
  personality: string;
  responseRules: {
    enableFallback: boolean;
    maxResponseLength?: number;
    temperature?: number;
    customInstructions?: string;
  };
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const BotConfigSchema: Schema = new Schema(
  {
    systemPrompt: {
      type: String,
      required: true,
      default:
        'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
    },
    personality: {
      type: String,
      required: true,
      default: 'Friendly, helpful, and encouraging learning assistant.',
    },
    responseRules: {
      enableFallback: {
        type: Boolean,
        default: true,
      },
      maxResponseLength: {
        type: Number,
        default: 500,
      },
      temperature: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 2,
      },
      customInstructions: {
        type: String,
        default: '',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one active config exists
BotConfigSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

const BotConfig: Model<IBotConfig> =
  mongoose.models.BotConfig ||
  mongoose.model<IBotConfig>('BotConfig', BotConfigSchema);

export default BotConfig;

