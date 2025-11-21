import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/admin/conversations:
 *   get:
 *     summary: Get list of conversations
 *     description: Retrieves a paginated list of conversations with optional filtering
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: lineUserId
 *         schema:
 *           type: string
 *         description: Filter by Line user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter conversations created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter conversations created before this date
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationListResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const lineUserId = searchParams.get('lineUserId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};
    if (lineUserId) {
      query.lineUserId = lineUserId;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch conversations with pagination
    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Conversation.countDocuments(query).exec(),
    ]);

    // Get message counts for each conversation
    const conversationsWithCounts = await Promise.all(
      conversations.map(async (conv) => {
        const messageCount = await Message.countDocuments({
          conversationId: conv._id,
        }).exec();
        return {
          ...conv,
          actualMessageCount: messageCount,
        };
      })
    );

    return NextResponse.json({
      conversations: conversationsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

