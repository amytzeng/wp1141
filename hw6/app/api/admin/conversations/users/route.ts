import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/admin/conversations/users:
 *   get:
 *     summary: Get list of all users with statistics
 *     description: Retrieves all users who have conversations, along with their conversation count, message count, and last activity time
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of users with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lineUserId:
 *                         type: string
 *                       conversationCount:
 *                         type: number
 *                       messageCount:
 *                         type: number
 *                       lastActivityAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all unique users from conversations
    const users = await Conversation.aggregate([
      {
        $group: {
          _id: '$lineUserId',
          conversationCount: { $sum: 1 },
          lastActivityAt: { $max: '$lastActivityAt' },
        },
      },
      {
        $project: {
          lineUserId: '$_id',
          conversationCount: 1,
          lastActivityAt: 1,
          _id: 0,
        },
      },
      { $sort: { lastActivityAt: -1 } },
    ]).exec();

    // Get message count for each user
    const usersWithMessageCount = await Promise.all(
      users.map(async (user) => {
        const messageCount = await Message.countDocuments({
          lineUserId: user.lineUserId,
        }).exec();
        return {
          ...user,
          messageCount,
        };
      })
    );

    return NextResponse.json({
      users: usersWithMessageCount,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

