import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/admin/conversations/users/{userId}:
 *   get:
 *     summary: Get conversations for a specific user
 *     description: Retrieves all conversations for a specific user, including the first user message as preview
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Line user ID
 *     responses:
 *       200:
 *         description: User conversations
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;
    const decodedUserId = decodeURIComponent(userId);

    // Get all conversations for this user
    const conversations = await Conversation.find({
      lineUserId: decodedUserId,
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (conversations.length === 0) {
      return NextResponse.json(
        { error: 'User not found or has no conversations' },
        { status: 404 }
      );
    }

    // Get first user message for each conversation as preview
    const conversationsWithPreview = await Promise.all(
      conversations.map(async (conv) => {
        const firstUserMessage = await Message.findOne({
          conversationId: conv._id,
          type: 'user',
        })
          .sort({ timestamp: 1 })
          .lean()
          .exec();

        return {
          _id: conv._id.toString(),
          sessionId: conv.sessionId,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messageCount,
          firstUserMessage: firstUserMessage?.content || '（無訊息內容）',
        };
      })
    );

    return NextResponse.json({
      userId: decodedUserId,
      conversations: conversationsWithPreview,
    });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user conversations' },
      { status: 500 }
    );
  }
}

