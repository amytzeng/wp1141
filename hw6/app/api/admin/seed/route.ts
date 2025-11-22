import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import { classifyMessage } from '@/lib/classification/classifier';
import mongoose from 'mongoose';

/**
 * Sample user messages for different categories
 */
const SAMPLE_MESSAGES = {
  humanities: [
    '什麼是唐詩？',
    '請解釋一下古文的特點',
    '莎士比亞的作品有哪些？',
    '歷史上的重要事件有哪些？',
    '哲學的基本問題是什麼？',
  ],
  business: [
    '什麼是供需法則？',
    '請解釋市場經濟',
    '會計的基本原則是什麼？',
    '如何進行投資理財？',
    '行銷策略有哪些？',
  ],
  stem: [
    '什麼是微積分？',
    '請解釋牛頓定律',
    '化學反應的基本原理',
    '如何寫 Python 程式？',
    '統計學的應用',
  ],
  life_sciences: [
    '細胞的結構是什麼？',
    '疾病的成因有哪些？',
    '農業技術的發展',
    '營養學的基本概念',
    '環境保護的重要性',
  ],
  others: [
    '藝術的定義是什麼？',
    '教育的重要性',
    '心理學的基本概念',
    '社會問題的解決方法',
    '法律的意義',
  ],
};

/**
 * Bot responses for different categories
 */
const BOT_RESPONSES = {
  humanities: [
    '唐詩是中國古代詩歌的巔峰，具有嚴格的格律和豐富的意境...',
    '古文具有簡潔、凝練、富有韻律感的特點...',
    '莎士比亞是英國文學史上最偉大的劇作家...',
    '歷史上的重要事件包括...',
    '哲學的基本問題包括存在、知識、價值等...',
  ],
  business: [
    '供需法則是經濟學的基本原理，當需求增加時價格上升...',
    '市場經濟是一種以市場機制配置資源的經濟體制...',
    '會計的基本原則包括客觀性、一致性、謹慎性等...',
    '投資理財需要考慮風險、報酬、流動性等因素...',
    '行銷策略包括產品、價格、通路、促銷四個面向...',
  ],
  stem: [
    '微積分是數學的一個分支，主要研究函數的導數和積分...',
    '牛頓三大定律是經典力學的基礎...',
    '化學反應是原子或分子重新組合的過程...',
    'Python 是一種高階程式語言，語法簡潔易讀...',
    '統計學是研究資料收集、分析、解釋的科學...',
  ],
  life_sciences: [
    '細胞是生物體的基本單位，包含細胞膜、細胞質、細胞核等結構...',
    '疾病的成因包括遺傳、環境、生活方式等多種因素...',
    '農業技術的發展提高了作物產量和品質...',
    '營養學研究食物對人體健康的影響...',
    '環境保護對於維持生態平衡和人類生存至關重要...',
  ],
  others: [
    '藝術是人類創造性的表達方式，包括視覺藝術、音樂、文學等...',
    '教育是培養人才、傳承文化的重要途徑...',
    '心理學研究人類行為和心智過程...',
    '社會問題需要透過政策、教育、社會參與等方式解決...',
    '法律是維護社會秩序、保障人民權益的規範...',
  ],
};

/**
 * Generate random date within a range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

/**
 * Get random item from array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * @swagger
 * /api/admin/seed:
 *   post:
 *     summary: Generate seed data for testing
 *     description: |
 *       Generates fake data including users, conversations, and messages for testing purposes.
 *       This endpoint should only be used in development environments.
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: number
 *                 default: 10
 *                 description: Number of users to generate
 *               conversationsPerUser:
 *                 type: number
 *                 default: 2
 *                 description: Number of conversations per user
 *               messagesPerConversation:
 *                 type: number
 *                 default: 5
 *                 description: Number of messages per conversation
 *               clearExisting:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to clear existing data before seeding
 *     responses:
 *       200:
 *         description: Seed data generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 usersCreated:
 *                   type: number
 *                 conversationsCreated:
 *                   type: number
 *                 messagesCreated:
 *                   type: number
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const users = body.users || 10;
    const conversationsPerUser = body.conversationsPerUser || 2;
    const messagesPerConversation = body.messagesPerConversation || 5;
    const clearExisting = body.clearExisting || false;

    // Clear existing data if requested
    if (clearExisting) {
      await Message.deleteMany({}).exec();
      await Conversation.deleteMany({}).exec();
    }

    const userIds: string[] = [];
    const conversationIds: mongoose.Types.ObjectId[] = [];
    let totalMessages = 0;

    // Generate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Generate users and conversations
    for (let i = 0; i < users; i++) {
      const lineUserId = `U${Math.random().toString(36).substring(2, 15)}${Date.now()}${i}`;
      userIds.push(lineUserId);

      // Generate conversations for this user
      for (let j = 0; j < conversationsPerUser; j++) {
        const sessionId = `${lineUserId}_${Date.now()}_${j}`;
        const createdAt = randomDate(startDate, endDate);

        const conversation = new Conversation({
          lineUserId,
          sessionId,
          status: randomItem(['active', 'completed', 'timeout']),
          flowStage: randomItem(['greeting', 'question', 'discussion', 'closing']),
          messageCount: 0,
          lastActivityAt: createdAt,
          metadata: {},
        });

        await conversation.save();
        conversationIds.push(conversation._id);

        // Generate messages for this conversation
        const categoryKeys = Object.keys(SAMPLE_MESSAGES);
        const selectedCategory = randomItem(categoryKeys);
        const userMessages = SAMPLE_MESSAGES[selectedCategory as keyof typeof SAMPLE_MESSAGES];
        const botResponses = BOT_RESPONSES[selectedCategory as keyof typeof BOT_RESPONSES];

        let lastMessageTime = createdAt;

        for (let k = 0; k < messagesPerConversation; k++) {
          // User message
          const userMessageText = randomItem(userMessages);
          const classification = classifyMessage(userMessageText);

          const userMessage = new Message({
            conversationId: conversation._id,
            lineUserId,
            type: 'user',
            content: userMessageText,
            timestamp: new Date(lastMessageTime.getTime() + Math.random() * 60000), // Within 1 minute
            metadata: {
              category: {
                mainCategory: classification.mainCategory,
                subCategory: classification.subCategory,
                confidence: classification.confidence,
                method: classification.method,
              },
            },
          });

          await userMessage.save();
          totalMessages++;
          lastMessageTime = userMessage.timestamp;

          // Bot response
          const botResponseText = randomItem(botResponses);
          const botMessage = new Message({
            conversationId: conversation._id,
            lineUserId,
            type: 'bot',
            content: botResponseText,
            timestamp: new Date(lastMessageTime.getTime() + Math.random() * 5000 + 1000), // 1-6 seconds later
            metadata: {
              llmProvider: 'openai',
              llmModel: 'gpt-3.5-turbo',
              tokensUsed: Math.floor(Math.random() * 200) + 50,
              processingTime: Math.floor(Math.random() * 2000) + 500,
            },
          });

          await botMessage.save();
          totalMessages++;
          lastMessageTime = botMessage.timestamp;

          // Update conversation
          conversation.messageCount += 2;
          conversation.lastActivityAt = lastMessageTime;
        }

        await conversation.save();
      }
    }

    return NextResponse.json({
      success: true,
      usersCreated: users,
      conversationsCreated: conversationIds.length,
      messagesCreated: totalMessages,
      message: `Created ${users} users, ${conversationIds.length} conversations, and ${totalMessages} messages`,
    });
  } catch (error) {
    console.error('Error generating seed data:', error);
    return NextResponse.json(
      { error: 'Failed to generate seed data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

