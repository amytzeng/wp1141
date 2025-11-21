import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get statistics
 *     description: Retrieves system statistics including message counts, user counts, LLM usage, and daily trends
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter statistics from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter statistics until this date
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatsResponse'
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate statistics
    const [
      totalMessages,
      totalUsers,
      totalConversations,
      todayMessages,
      llmStats,
    ] = await Promise.all([
      // Total messages
      Message.countDocuments(dateFilter).exec(),

      // Total unique users
      Message.distinct('lineUserId', dateFilter).then((users) => users.length),

      // Total conversations
      Conversation.countDocuments().exec(),

      // Today's messages
      Message.countDocuments({
        ...dateFilter,
        timestamp: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          ...dateFilter.timestamp,
        },
      }).exec(),

      // LLM usage statistics
      Message.aggregate([
        { $match: { type: 'bot', ...dateFilter } },
        {
          $group: {
            _id: '$metadata.llmProvider',
            count: { $sum: 1 },
            totalTokens: { $sum: '$metadata.tokensUsed' },
            errors: {
              $sum: {
                $cond: [{ $ifNull: ['$metadata.error', false] }, 1, 0],
              },
            },
          },
        },
      ]).exec(),
    ]);

    // Calculate success rate
    const botMessages = await Message.countDocuments({
      type: 'bot',
      ...dateFilter,
    }).exec();
    const errorMessages = await Message.countDocuments({
      type: 'bot',
      'metadata.error': { $exists: true, $ne: null },
      ...dateFilter,
    }).exec();
    const successRate =
      botMessages > 0
        ? ((botMessages - errorMessages) / botMessages) * 100
        : 100;

    // Daily message trend (last 7 days)
    const dailyTrend = await Message.aggregate([
      {
        $match: {
          ...dateFilter,
          timestamp: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ...dateFilter.timestamp,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).exec();

    return NextResponse.json({
      overview: {
        totalMessages,
        totalUsers,
        totalConversations,
        todayMessages,
        successRate: Math.round(successRate * 100) / 100,
      },
      llmUsage: llmStats,
      dailyTrend: dailyTrend.map((item) => ({
        date: item._id,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

