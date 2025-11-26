import Message, { IMessage } from '@/lib/db/models/Message';
import Conversation, { IConversation } from '@/lib/db/models/Conversation';
import { compressContext } from '@/lib/llm/prompt';
import { updateFlowStage, updateConversationStatus } from '@/lib/session/manager';

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
 * If there's a clear command in the conversation, only loads messages after the last clear
 */
export async function loadContextMessages(
  conversationId: string,
  maxMessages: number = 10
): Promise<IMessage[]> {
  // Find all messages in chronological order
  const allMessages = await Message.find({
    conversationId,
  })
    .sort({ timestamp: 1 }) // Sort ascending to find clear command
    .exec();

  // Find the last clear command or clear action
  let lastClearIndex = -1;
  for (let i = allMessages.length - 1; i >= 0; i--) {
    const msg = allMessages[i];
    // Check if it's a clear command (text message with /clear) or clear action (from postback or rich menu)
    const isClearCommand = msg.type === 'user' && 
      (msg.content.trim().toLowerCase() === '/clear' || 
       msg.content === '[clear]' ||
       msg.metadata?.action === 'clear');
    if (isClearCommand) {
      lastClearIndex = i;
      break;
    }
  }

  // Get messages after the last clear (or all messages if no clear found)
  const messagesAfterClear = lastClearIndex >= 0
    ? allMessages.slice(lastClearIndex + 1)
    : allMessages;

  // Get the most recent N messages
  const recentMessages = messagesAfterClear.slice(-maxMessages * 2);

  // Reverse to get chronological order for compression
  const chronologicalMessages = recentMessages;

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
    $set: { 
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    },
  }).exec();

  // Update flow stage and status
  await updateFlowStage(conversationId);
  await updateConversationStatus(conversationId);
}

