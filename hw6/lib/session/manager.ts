import Conversation, {
  IConversation,
  SessionStatus,
  FlowStage,
} from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * Determines flow stage based on conversation content and message count
 */
export function determineFlowStage(
  messageCount: number,
  lastMessages: Array<{ type: string; content: string }>
): FlowStage {
  if (messageCount === 0) {
    return 'unknown';
  }

  if (messageCount <= 2) {
    // First few messages are usually greetings
    const hasGreeting = lastMessages.some((msg) => {
      const content = msg.content.toLowerCase();
      return (
        content.includes('你好') ||
        content.includes('hello') ||
        content.includes('hi') ||
        content.includes('help')
      );
    });
    return hasGreeting ? 'greeting' : 'question';
  }

  // Check if conversation is closing
  const hasClosing = lastMessages.some((msg) => {
    const content = msg.content.toLowerCase();
    return (
      content.includes('謝謝') ||
      content.includes('thank') ||
      content.includes('再見') ||
      content.includes('bye')
    );
  });

  if (hasClosing) {
    return 'closing';
  }

  // If there are multiple exchanges, it's a discussion
  if (messageCount > 4) {
    return 'discussion';
  }

  return 'question';
}

/**
 * Updates conversation status based on activity
 */
export async function updateConversationStatus(
  conversationId: string,
  newStatus?: SessionStatus
): Promise<IConversation | null> {
  const conversation = await Conversation.findById(conversationId).exec();
  if (!conversation) {
    return null;
  }

  // If new status is provided, update it
  if (newStatus) {
    conversation.status = newStatus;
  } else {
    // Auto-update status based on activity
    const now = new Date();
    const lastActivity = conversation.lastActivityAt || conversation.updatedAt;
    const minutesSinceActivity =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    // If no activity for 30 minutes, mark as timeout
    if (minutesSinceActivity > 30 && conversation.status === 'active') {
      conversation.status = 'timeout';
    }
  }

  conversation.lastActivityAt = new Date();
  await conversation.save();

  return conversation;
}

/**
 * Updates flow stage for a conversation
 */
export async function updateFlowStage(
  conversationId: string
): Promise<IConversation | null> {
  const conversation = await Conversation.findById(conversationId).exec();
  if (!conversation) {
    return null;
  }

  // Get recent messages
  const messages = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .lean()
    .exec();

  // Determine flow stage
  const flowStage = determineFlowStage(conversation.messageCount, messages);

  conversation.flowStage = flowStage;
  conversation.lastActivityAt = new Date();
  await conversation.save();

  return conversation;
}

/**
 * Records a state transition in the state machine
 */
export async function recordStateTransition(
  conversationId: string,
  fromState: string,
  toState: string
): Promise<void> {
  await Conversation.findByIdAndUpdate(conversationId, {
    $set: {
      'metadata.stateMachine.currentState': toState,
    },
    $push: {
      'metadata.stateMachine.transitions': {
        from: fromState,
        to: toState,
        timestamp: new Date(),
      },
    },
  }).exec();
}

/**
 * Gets conversations by status
 */
export async function getConversationsByStatus(
  status: SessionStatus,
  limit: number = 20
): Promise<IConversation[]> {
  // Use double type assertion because .lean() returns FlattenMaps type,
  // but the runtime structure is identical to IConversation
  // TypeScript requires conversion through 'unknown' for types that don't overlap
  return (await Conversation.find({ status })
    .sort({ lastActivityAt: -1 })
    .limit(limit)
    .lean()
    .exec()) as unknown as IConversation[];
}

