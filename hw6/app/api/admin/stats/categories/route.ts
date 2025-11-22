import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Message from '@/lib/db/models/Message';
import { getAllCategoryDefinitions } from '@/lib/classification/keywords';

/**
 * @swagger
 * /api/admin/stats/categories:
 *   get:
 *     summary: Get category statistics
 *     description: |
 *       Retrieves statistics about message categories (subject classification).
 *       Returns statistics grouped by main categories and subcategories.
 *       Supports time range filtering via query parameters.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter messages from this date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter messages until this date (ISO 8601 format)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [main, sub]
 *           default: main
 *         description: Group statistics by main category or subcategory
 *     responses:
 *       200:
 *         description: Category statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryStatsResponse'
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
    const groupBy = searchParams.get('groupBy') || 'main';

    // Build date filter
    const dateFilter: any = {
      type: 'user', // Only count user messages
    };

    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get total user messages
    const totalMessages = await Message.countDocuments(dateFilter).exec();

    // Get categorized messages (messages with category metadata)
    const categorizedFilter = {
      ...dateFilter,
      'metadata.category': { $exists: true, $ne: null },
    };
    const categorizedCount = await Message.countDocuments(
      categorizedFilter
    ).exec();

    const uncategorizedCount = totalMessages - categorizedCount;

    // Get statistics by main category
    const mainCategoryStats = await Message.aggregate([
      { $match: categorizedFilter },
      {
        $group: {
          _id: '$metadata.category.mainCategory',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]).exec();

    // Get statistics by subcategory
    const subCategoryStats = await Message.aggregate([
      { $match: categorizedFilter },
      {
        $group: {
          _id: {
            mainCategory: '$metadata.category.mainCategory',
            subCategory: '$metadata.category.subCategory',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]).exec();

    // Format main category statistics
    const byMainCategory: Record<string, { count: number; percentage: number }> =
      {};
    mainCategoryStats.forEach((stat) => {
      byMainCategory[stat._id] = {
        count: stat.count,
        percentage:
          categorizedCount > 0
            ? Math.round((stat.count / categorizedCount) * 100 * 100) / 100
            : 0,
      };
    });

    // Format subcategory statistics
    const bySubCategory: Record<
      string,
      { count: number; percentage: number; mainCategory: string }
    > = {};
    subCategoryStats.forEach((stat) => {
      const key = `${stat._id.mainCategory}.${stat._id.subCategory}`;
      bySubCategory[key] = {
        count: stat.count,
        percentage:
          categorizedCount > 0
            ? Math.round((stat.count / categorizedCount) * 100 * 100) / 100
            : 0,
        mainCategory: stat._id.mainCategory,
      };
    });

    // Get daily trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendsFilter = {
      ...categorizedFilter,
      timestamp: {
        $gte: sevenDaysAgo,
        ...(dateFilter.timestamp || {}),
      },
    };

    const dailyTrends = await Message.aggregate([
      { $match: trendsFilter },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            mainCategory: '$metadata.category.mainCategory',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1, '_id.mainCategory': 1 } },
    ]).exec();

    // Format trends by date
    const trendsByDate: Record<string, Record<string, number>> = {};
    dailyTrends.forEach((trend) => {
      const date = trend._id.date;
      if (!trendsByDate[date]) {
        trendsByDate[date] = {};
      }
      trendsByDate[date][trend._id.mainCategory] = trend.count;
    });

    const trends = Object.entries(trendsByDate).map(([date, categories]) => ({
      date,
      categories,
    }));

    // Get category definitions for display names
    const categoryDefinitions = getAllCategoryDefinitions();
    const categoryMap = new Map(
      categoryDefinitions.map((cat) => [
        `${cat.mainCategory}.${cat.subCategory}`,
        cat,
      ])
    );

    return NextResponse.json({
      overview: {
        total: totalMessages,
        categorized: categorizedCount,
        uncategorized: uncategorizedCount,
        categorizationRate:
          totalMessages > 0
            ? Math.round((categorizedCount / totalMessages) * 100 * 100) / 100
            : 0,
      },
      byMainCategory,
      bySubCategory,
      trends,
      categoryDefinitions: categoryDefinitions.map((cat) => ({
        mainCategory: cat.mainCategory,
        subCategory: cat.subCategory,
        displayName: cat.displayName,
      })),
    });
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category statistics' },
      { status: 500 }
    );
  }
}

