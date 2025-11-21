import { IMessage } from '@/lib/db/models/Message';

/**
 * System prompt template for the AI learning assistant
 */
const SYSTEM_PROMPT = `You are a friendly and helpful learning assistant. Your role is to help users understand concepts, organize notes, and answer questions related to their studies.

Guidelines:
- Provide clear, well-structured answers
- Use examples or analogies when explaining complex concepts
- If the question is related to learning, offer additional helpful context
- Be concise but thorough
- If you don't know something, admit it honestly

Remember to maintain context from previous messages in the conversation.`;

/**
 * Builds a complete prompt from system prompt, conversation context, and user question
 */
export function buildPrompt(
  userQuestion: string,
  contextMessages: IMessage[] = []
): string {
  // Build conversation context string
  let contextString = '';
  if (contextMessages.length > 0) {
    contextString = '\n\nRecent conversation context:\n';
    contextMessages.forEach((msg) => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      contextString += `${role}: ${msg.content}\n`;
    });
  }

  // Combine system prompt, context, and user question
  const fullPrompt = `${SYSTEM_PROMPT}${contextString}\n\nUser's question: ${userQuestion}\n\nPlease provide a helpful response:`;

  return fullPrompt;
}

/**
 * Compresses context messages if they exceed token limit
 * Keeps the most recent messages and removes older ones
 */
export function compressContext(
  messages: IMessage[],
  maxMessages: number = 5
): IMessage[] {
  if (messages.length <= maxMessages) {
    return messages;
  }

  // Keep the most recent messages
  return messages.slice(-maxMessages);
}

/**
 * Estimates token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

