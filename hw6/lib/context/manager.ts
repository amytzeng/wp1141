import Message, { IMessage } from '@/lib/db/models/Message';
import Conversation, { IConversation } from '@/lib/db/models/Conversation';
import { compressContext } from '@/lib/llm/prompt';

/**
 * Generates a unique session ID based on timestamp and user ID
 */
export function generateSessionId(lineUserId: string): string {
  const timestamp = Date.now();
  return `${lineUserId}_${timestamp}`;
}

/**
 * Gets or creates a conversation for a user
 * Creates a new session if the last message was more than 30 minutes ago
 */
export async function getOrCreateConversation(
  lineUserId: string,
  sessionTimeoutMinutes: number = 30
): Promise<IConversation> {
  // Find the most recent conversation for this user
  const recentConversation = await Conversation.findOne({
    lineUserId,
  })
    .sort({ updatedAt: -1 })
    .exec();

  // If no conversation exists, create a new one
  if (!recentConversation) {
    const newConversation = new Conversation({
      lineUserId,
      sessionId: generateSessionId(lineUserId),
      messageCount: 0,
      metadata: {},
    });
    return await newConversation.save();
  }

  // Check if the conversation has timed out
  const lastUpdate = recentConversation.updatedAt;
  const now = new Date();
  const minutesSinceLastUpdate =
    (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

  // If timeout exceeded, create a new session
  if (minutesSinceLastUpdate > sessionTimeoutMinutes) {
    const newConversation = new Conversation({
      lineUserId,
      sessionId: generateSessionId(lineUserId),
      messageCount: 0,
      metadata: {},
    });
    return await newConversation.save();
  }

  // Return existing conversation
  return recentConversation;
}

/**
 * Loads recent messages for context (last N messages)
 */
export async function loadContextMessages(
  conversationId: string,
  maxMessages: number = 5
): Promise<IMessage[]> {
  const messages = await Message.find({
    conversationId,
  })
    .sort({ timestamp: -1 })
    .limit(maxMessages * 2) // Load more to account for compression
    .exec();

  // Reverse to get chronological order
  const chronologicalMessages = messages.reverse();

  // Compress if needed
  return compressContext(chronologicalMessages, maxMessages);
}

/**
 * Updates conversation metadata with last topic and context summary
 */
export async function updateConversationMetadata(
  conversationId: string,
  lastTopic?: string,
  context?: string[]
): Promise<void> {
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      'metadata.lastTopic': lastTopic,
      'metadata.context': context || [],
    },
  }).exec();
}

/**
 * Increments the message count for a conversation
 */
export async function incrementMessageCount(
  conversationId: string
): Promise<void> {
  await Conversation.findByIdAndUpdate(conversationId, {
    $inc: { messageCount: 1 },
    $set: { updatedAt: new Date() },
  }).exec();
}

