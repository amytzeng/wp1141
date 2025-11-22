import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import mongoose from 'mongoose';

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/admin/conversations:
 *   get:
 *     summary: Get list of conversations with advanced filtering
 *     description: |
 *       Retrieves a paginated list of conversations with optional filtering.
 *       Supports filtering by user ID, date range, platform, and message content search.
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
 *         description: Filter by Line user ID (exact match)
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search message content (searches in all messages within conversations)
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [line]
 *           default: line
 *         description: Filter by platform (currently only 'line' is supported)
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
    const search = searchParams.get('search'); // Message content search
    const platform = searchParams.get('platform') || 'line'; // Platform filter

    // Build base query
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

    // If message content search is provided, find conversations that contain matching messages
    let conversationIds: string[] | null = null;
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
      const matchingMessages = await Message.find({
        content: { $regex: searchRegex },
        type: 'user', // Only search in user messages
      })
        .select('conversationId')
        .lean()
        .exec();

      conversationIds = [
        ...new Set(matchingMessages.map((msg) => msg.conversationId.toString())),
      ];

      // If no matching messages found, return empty result
      if (conversationIds.length === 0) {
        return NextResponse.json({
          conversations: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      // Filter conversations by matching IDs (convert to ObjectId)
      query._id = {
        $in: conversationIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    // Platform filter (currently only 'line' is supported, but structure allows for future expansion)
    // For now, all conversations are from Line, so this is a placeholder for future platforms

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

