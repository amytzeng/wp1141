import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get comprehensive statistics
 *     description: |
 *       Retrieves system statistics including message counts, user counts, LLM usage, daily trends,
 *       and detailed user analytics (active users, new users, user engagement).
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
 *         description: Statistics data including user analytics
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

    // User Analytics
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Active users (users who sent messages in the last 7 days)
    const activeUsers = await Message.distinct('lineUserId', {
      ...dateFilter,
      timestamp: {
        $gte: sevenDaysAgo,
        ...dateFilter.timestamp,
      },
    }).then((users) => users.length);

    // New users (users who sent their first message in the last 7 days)
    const allUserFirstMessages = await Message.aggregate([
      {
        $match: {
          ...dateFilter,
          type: 'user',
        },
      },
      {
        $group: {
          _id: '$lineUserId',
          firstMessageDate: { $min: '$timestamp' },
        },
      },
    ]).exec();

    const newUsers = allUserFirstMessages.filter(
      (user) => new Date(user.firstMessageDate) >= sevenDaysAgo
    ).length;

    // User engagement: average messages per user
    const userEngagement = await Message.aggregate([
      {
        $match: {
          ...dateFilter,
          type: 'user',
        },
      },
      {
        $group: {
          _id: '$lineUserId',
          messageCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          avgMessagesPerUser: { $avg: '$messageCount' },
          maxMessagesPerUser: { $max: '$messageCount' },
          minMessagesPerUser: { $min: '$messageCount' },
        },
      },
    ]).exec();

    const engagement = userEngagement[0] || {
      avgMessagesPerUser: 0,
      maxMessagesPerUser: 0,
      minMessagesPerUser: 0,
    };

    // Top active users (users with most messages)
    const topUsers = await Message.aggregate([
      {
        $match: {
          ...dateFilter,
          type: 'user',
        },
      },
      {
        $group: {
          _id: '$lineUserId',
          messageCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
        },
      },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
    ]).exec();

    // User growth trend (last 30 days)
    const userGrowthTrend = await Message.aggregate([
      {
        $match: {
          ...dateFilter,
          type: 'user',
          timestamp: {
            $gte: thirtyDaysAgo,
            ...dateFilter.timestamp,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          uniqueUsers: { $addToSet: '$lineUserId' },
        },
      },
      {
        $project: {
          date: '$_id',
          newUsers: { $size: '$uniqueUsers' },
        },
      },
      { $sort: { date: 1 } },
    ]).exec();

    return NextResponse.json({
      overview: {
        totalMessages,
        totalUsers,
        totalConversations,
        todayMessages,
        successRate: Math.round(successRate * 100) / 100,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        engagement: {
          avgMessagesPerUser: Math.round(engagement.avgMessagesPerUser * 100) / 100,
          maxMessagesPerUser: engagement.maxMessagesPerUser,
          minMessagesPerUser: engagement.minMessagesPerUser,
        },
        topUsers: topUsers.map((user) => ({
          lineUserId: user._id,
          messageCount: user.messageCount,
          lastActivity: user.lastActivity,
        })),
        growthTrend: userGrowthTrend.map((item) => ({
          date: item.date,
          newUsers: item.newUsers,
        })),
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

