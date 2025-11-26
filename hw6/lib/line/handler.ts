import { LineEvent, RichMenuAction, PostbackData } from './types';
import { getLineClient, replyTextMessage } from './client';
import { getOrCreateConversation, loadContextMessages, incrementMessageCount } from '@/lib/context/manager';
import Message from '@/lib/db/models/Message';
import { getLLMClient } from '@/lib/llm/client';
import { buildPrompt } from '@/lib/llm/prompt';
import { getFallbackResponse } from '@/lib/llm/fallback';
import { classifyMessage } from '@/lib/classification/classifier';

/**
 * Checks if a message is a command (starts with /)
 */
function isCommand(text: string): boolean {
  return text.trim().startsWith('/');
}

/**
 * Handles command messages
 * Returns the response text that was sent to the user and the action type
 */
async function handleCommand(
  text: string,
  lineUserId: string,
  replyToken: string
): Promise<{ responseText: string; action?: string }> {
  const command = text.trim().toLowerCase();
  let responseText = '';
  let action: string | undefined;

  switch (command) {
    case '/help':
      responseText =
        '我可以幫助你：\n1. 回答學習相關的問題\n2. 解釋概念\n3. 整理筆記\n4. 重點整理\n5. 快速複習\n6. 例題示範\n\n你可以直接問我問題，或使用下方的功能按鈕！';
      await replyTextMessage(replyToken, responseText);
      action = 'help';
      break;
    case '/clear':
      responseText = '上下文已清除。接下來的對話將從新的上下文開始。';
      await replyTextMessage(replyToken, responseText);
      action = 'clear';
      break;
    default:
      responseText = '未知的指令。輸入 /help 查看可用指令。';
      await replyTextMessage(replyToken, responseText);
  }

  return { responseText, action };
}

/**
 * Processes a text message event from Line
 */
export async function handleTextMessage(event: LineEvent): Promise<void> {
  const { replyToken, source, message } = event;
  const lineUserId = source.userId;
  const text = message?.text || '';

  if (!replyToken || !text || !message) {
    console.error('Missing replyToken, message text, or message object');
    return;
  }

  const startTime = Date.now();

  try {
    // Get or create conversation
    const conversation = await getOrCreateConversation(lineUserId);

    // Classify the message by subject category
    const classification = await classifyMessage(text);

    // Save user message to database
    const userMessage = new Message({
      conversationId: conversation._id,
      lineUserId,
      type: 'user',
      content: text,
      timestamp: new Date(),
      metadata: {
        messageId: message.id,
        replyToken,
        category: {
          mainCategory: classification.mainCategory,
          subCategory: classification.subCategory,
          confidence: classification.confidence,
          method: classification.method,
        },
      },
    });
    await userMessage.save();

    // Increment conversation message count
    await incrementMessageCount(conversation._id.toString());

    let botResponse: string;
    let llmProvider = 'fallback';
    let llmModel = '';
    let tokensUsed: number | undefined;
    let error: string | undefined;

    // Check if it's a command
    if (isCommand(text)) {
      // Handle command and get the response text
      const commandResult = await handleCommand(text, lineUserId, replyToken);
      botResponse = commandResult.responseText;
      llmProvider = 'command';
      
      // Store action in metadata if it's a clear or help command
      if (commandResult.action) {
        userMessage.metadata = {
          ...userMessage.metadata,
          action: commandResult.action,
        };
        await userMessage.save();
      }
    } else {
      // Load context messages (default: 10 messages, from after last clear)
      const contextMessages = await loadContextMessages(
        conversation._id.toString(),
        10
      );

      // Try to get fallback response first (for when LLM is down)
      const fallbackResponse = getFallbackResponse(text);

      // Try to get LLM response
      try {
        const llmClient = await getLLMClient();
        const prompt = await buildPrompt(text, contextMessages);
        const llmResult = await llmClient.generateResponse(prompt, []);

        if (llmResult.error) {
          // LLM failed, use fallback
          botResponse = fallbackResponse || llmResult.content;
          error = llmResult.error;
        } else {
          botResponse = llmResult.content;
          llmProvider = llmResult.provider;
          llmModel = llmResult.model;
          tokensUsed = llmResult.tokensUsed;
        }
      } catch (llmError) {
        // LLM client error, use fallback
        console.error('LLM error:', llmError);
        botResponse = fallbackResponse || '抱歉，目前無法處理您的請求，請稍後再試。';
        error = llmError instanceof Error ? llmError.message : 'Unknown error';
      }

      // Send reply to user
      await replyTextMessage(replyToken, botResponse);
    }

    // Save bot response to database
    const processingTime = Date.now() - startTime;
    const botMessage = new Message({
      conversationId: conversation._id,
      lineUserId,
      type: 'bot',
      content: botResponse,
      timestamp: new Date(),
      metadata: {
        replyToken,
        llmProvider,
        llmModel,
        tokensUsed,
        error,
        processingTime,
      },
    });
    await botMessage.save();
  } catch (error) {
    console.error('Error handling text message:', error);
    // Try to send error message to user
    try {
      if (replyToken) {
        await replyTextMessage(
          replyToken,
          '抱歉，處理您的訊息時發生錯誤，請稍後再試。'
        );
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

/**
 * Handles postback events from Rich Menu buttons
 */
export async function handlePostbackEvent(event: LineEvent): Promise<void> {
  const { replyToken, source, postback } = event;
  const lineUserId = source.userId;

  if (!replyToken || !postback?.data) {
    console.error('Missing replyToken or postback data');
    return;
  }

  const startTime = Date.now();

  try {
    // Parse postback data
    let postbackData: PostbackData;
    try {
      postbackData = JSON.parse(postback.data);
    } catch (error) {
      console.error('Failed to parse postback data:', error);
      await replyTextMessage(
        replyToken,
        '抱歉，處理您的請求時發生錯誤，請稍後再試。'
      );
      return;
    }

    const action = postbackData.action;

    // Get or create conversation
    const conversation = await getOrCreateConversation(lineUserId);

    // Handle different actions
    let botResponse: string;
    let llmProvider = 'richmenu';
    let llmModel = '';
    let tokensUsed: number | undefined;
    let error: string | undefined;

    // Handle clear and help actions directly
    if (action === 'clear') {
      botResponse = '上下文已清除。接下來的對話將從新的上下文開始。';
      llmProvider = 'richmenu-clear';
    } else if (action === 'help') {
      botResponse =
        '我可以幫助你：\n1. 回答學習相關的問題\n2. 解釋概念\n3. 整理筆記\n4. 重點整理\n5. 快速複習\n6. 例題示範\n\n你可以直接問我問題，或使用下方的功能按鈕！';
      llmProvider = 'richmenu-help';
    } else {
      // Handle LLM-based actions (summarize, review, example, reexplain)
      // Load context messages (from after last clear)
      const contextMessages = await loadContextMessages(
        conversation._id.toString(),
        10
      );

      // Check if there's enough context
      if (contextMessages.length === 0) {
        botResponse =
          '目前還沒有對話內容可以處理。請先與我進行一些對話，然後再使用這個功能。';
        llmProvider = 'richmenu-no-context';
      } else {
        // Build prompt with action type
        try {
          const llmClient = await getLLMClient();
          const prompt = await buildPrompt('', contextMessages, action);
          const llmResult = await llmClient.generateResponse(prompt, []);

          if (llmResult.error) {
            botResponse =
              '抱歉，目前無法處理您的請求，請稍後再試。';
            error = llmResult.error;
          } else {
            botResponse = llmResult.content;
            llmProvider = llmResult.provider;
            llmModel = llmResult.model;
            tokensUsed = llmResult.tokensUsed;
          }
        } catch (llmError) {
          console.error('LLM error:', llmError);
          botResponse = '抱歉，目前無法處理您的請求，請稍後再試。';
          error = llmError instanceof Error ? llmError.message : 'Unknown error';
        }
      }
    }

    // Save user action as a message (for tracking clear commands)
    const userMessage = new Message({
      conversationId: conversation._id,
      lineUserId,
      type: 'user',
      content: `[${action}]`,
      timestamp: new Date(),
      metadata: {
        replyToken,
        action,
      },
    });
    await userMessage.save();

    // Send reply to user
    await replyTextMessage(replyToken, botResponse);

    // Save bot response to database
    const processingTime = Date.now() - startTime;
    const botMessage = new Message({
      conversationId: conversation._id,
      lineUserId,
      type: 'bot',
      content: botResponse,
      timestamp: new Date(),
      metadata: {
        replyToken,
        llmProvider,
        llmModel,
        tokensUsed,
        error,
        processingTime,
        action,
      },
    });
    await botMessage.save();

    // Increment conversation message count
    await incrementMessageCount(conversation._id.toString());
  } catch (error) {
    console.error('Error handling postback event:', error);
    try {
      if (replyToken) {
        await replyTextMessage(
          replyToken,
          '抱歉，處理您的請求時發生錯誤，請稍後再試。'
        );
      }
    } catch (replyError) {
      console.error('Error sending error message:', replyError);
    }
  }
}

/**
 * Handles follow event (when user adds the bot)
 */
export async function handleFollowEvent(event: LineEvent): Promise<void> {
  const { replyToken } = event;

  if (replyToken) {
    await replyTextMessage(
      replyToken,
      '你好！我是你的學習助手，可以幫助你理解概念、整理筆記、回答問題。有什麼我可以幫你的嗎？'
    );
  }
}

/**
 * Main handler for Line events
 */
export async function handleLineEvent(event: LineEvent): Promise<void> {
  switch (event.type) {
    case 'message':
      if (event.message?.type === 'text') {
        await handleTextMessage(event);
      } else {
        // Handle other message types (sticker, image, etc.)
        if (event.replyToken) {
          await replyTextMessage(
            event.replyToken,
            '目前我只支援文字訊息，請傳送文字訊息給我。'
          );
        }
      }
      break;
    case 'postback':
      await handlePostbackEvent(event);
      break;
    case 'follow':
      await handleFollowEvent(event);
      break;
    case 'unfollow':
      // User unfollowed, no reply needed
      console.log('User unfollowed:', event.source.userId);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
}

