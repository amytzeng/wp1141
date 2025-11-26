import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import mongoose from 'mongoose';

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/admin/conversations/trash:
 *   get:
 *     summary: Get list of soft-deleted conversations (trash)
 *     description: |
 *       Retrieves a paginated list of conversations that have been soft-deleted (moved to trash).
 *       Supports filtering by user ID and date range.
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
 *     responses:
 *       200:
 *         description: List of deleted conversations
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

    // Build query for soft-deleted conversations only
    const query: any = {
      deletedAt: { $ne: null, $exists: true }, // Only conversations with deletedAt set
    };

    if (lineUserId) {
      query.lineUserId = lineUserId;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch deleted conversations with pagination
    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ deletedAt: -1 }) // Sort by deletion time, newest first
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
    console.error('Error fetching trash conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trash conversations' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/conversations/trash:
 *   post:
 *     summary: Restore conversations from trash
 *     description: |
 *       Restores soft-deleted conversations by clearing the deletedAt field.
 *       This moves conversations back to the main list.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationIds
 *             properties:
 *               conversationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of conversation IDs to restore
 *                 maxItems: 100
 *                 minItems: 1
 *     responses:
 *       200:
 *         description: Conversations restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 restored:
 *                   type: integer
 *                   description: Number of conversations restored
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { conversationIds } = body;

    // Validation
    if (!conversationIds || !Array.isArray(conversationIds)) {
      return NextResponse.json(
        { error: 'conversationIds must be an array' },
        { status: 400 }
      );
    }

    if (conversationIds.length === 0) {
      return NextResponse.json(
        { error: 'conversationIds array cannot be empty' },
        { status: 400 }
      );
    }

    if (conversationIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot restore more than 100 conversations at once' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const validIds: mongoose.Types.ObjectId[] = [];
    for (const id of conversationIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validIds.push(new mongoose.Types.ObjectId(id));
      } else {
        console.warn(`Invalid ObjectId: ${id}`);
      }
    }

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid conversation IDs provided' },
        { status: 400 }
      );
    }

    // Restore conversations by clearing deletedAt
    const restoreResult = await Conversation.updateMany(
      {
        _id: { $in: validIds },
        deletedAt: { $ne: null, $exists: true }, // Only restore conversations that are actually deleted
      },
      {
        $unset: { deletedAt: '' }, // Remove deletedAt field
      }
    ).exec();

    return NextResponse.json({
      success: true,
      restored: restoreResult.modifiedCount,
      requested: conversationIds.length,
      valid: validIds.length,
      message: 'Conversations restored from trash',
    });
  } catch (error) {
    console.error('Error restoring conversations:', error);
    return NextResponse.json(
      { error: 'Failed to restore conversations' },
      { status: 500 }
    );
  }
}

