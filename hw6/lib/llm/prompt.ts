import { IMessage } from '@/lib/db/models/Message';
import BotConfig from '@/lib/db/models/BotConfig';

/**
 * Gets the active system prompt from BotConfig, or returns default
 */
async function getSystemPrompt(): Promise<string> {
  try {
    const config = await BotConfig.findOne({ isActive: true }).lean().exec();
    if (config && config.systemPrompt) {
      return config.systemPrompt;
    }
  } catch (error) {
    console.error('Error fetching bot config:', error);
  }
  
  // Default system prompt
  return `You are a friendly and helpful learning assistant. Your role is to help users understand concepts, organize notes, and answer questions related to their studies.

Guidelines:
- Provide clear, well-structured answers
- Use examples or analogies when explaining complex concepts
- If the question is related to learning, offer additional helpful context
- Be concise but thorough
- If you don't know something, admit it honestly
- **Important language guidelines: You can respond in any language (English, Japanese, Korean, etc.), but when responding in Chinese, you MUST use Traditional Chinese (繁體中文) and absolutely MUST NOT use Simplified Chinese (簡體中文)**

Remember to maintain context from previous messages in the conversation.`;
}

/**
 * Action-specific prompt templates
 */
const ACTION_PROMPTS: Record<string, (contextString: string) => string> = {
  summarize: (contextString: string) => {
    return `Based on the following conversation context, please provide a structured summary of the key points, main concepts, and important information discussed. 

Format your response as a clear, organized summary with:
- Key concepts and definitions
- Main points discussed
- Important details or examples mentioned

${contextString}

Please provide the summary in Traditional Chinese (繁體中文).`;

  },
  
  review: (contextString: string) => {
    return `Based on the following conversation context, please create a quick review guide that includes:
- Key points for quick recall
- Important concepts that should be remembered
- Potential review questions or prompts
- Summary of the main topics covered

${contextString}

Please provide the review guide in Traditional Chinese (繁體中文).`;

  },
  
  example: (contextString: string) => {
    return `Based on the following conversation context, please provide practical examples, sample problems, or demonstrations related to the topics discussed. 

Your response should include:
- Concrete examples that illustrate the concepts
- Step-by-step demonstrations if applicable
- Sample problems or scenarios
- Real-world applications

${contextString}

Please provide the examples in Traditional Chinese (繁體中文).`;

  },
  
  reexplain: (contextString: string) => {
    return `Based on the following conversation context, please re-explain the concepts or topics discussed, but use a different approach, simpler language, or different examples than what was already mentioned.

Your response should:
- Explain the same concepts but from a different angle
- Use simpler or alternative explanations
- Provide different examples or analogies
- Make the explanation easier to understand

${contextString}

Please provide the re-explanation in Traditional Chinese (繁體中文).`;

  },
};

/**
 * Builds a complete prompt from system prompt, conversation context, and user question
 * Optionally supports action types for Rich Menu buttons
 */
export async function buildPrompt(
  userQuestion: string,
  contextMessages: IMessage[] = [],
  actionType?: string
): Promise<string> {
  // Get system prompt from config
  const systemPrompt = await getSystemPrompt();

  // Build conversation context string
  let contextString = '';
  if (contextMessages.length > 0) {
    contextString = '\n\nRecent conversation context:\n';
    contextMessages.forEach((msg) => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      contextString += `${role}: ${msg.content}\n`;
    });
  } else {
    contextString = '\n\nNo previous conversation context available.';
  }

  // If action type is specified, use action-specific prompt template
  if (actionType && ACTION_PROMPTS[actionType]) {
    const actionPrompt = ACTION_PROMPTS[actionType](contextString);
    return `${systemPrompt}\n\n${actionPrompt}`;
  }

  // Default prompt for regular questions
  const fullPrompt = `${systemPrompt}${contextString}\n\nUser's question: ${userQuestion}\n\nPlease provide a helpful response:`;

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

