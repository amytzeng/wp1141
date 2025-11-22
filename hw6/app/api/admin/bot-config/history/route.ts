import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import BotConfig from '@/lib/db/models/BotConfig';

/**
 * @swagger
 * /api/admin/bot-config/history:
 *   get:
 *     summary: Get bot configuration history
 *     description: Retrieves all bot configuration versions, ordered by version number (newest first)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Bot configuration history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       systemPrompt:
 *                         type: string
 *                       personality:
 *                         type: string
 *                       responseRules:
 *                         type: object
 *                       isActive:
 *                         type: boolean
 *                       version:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    await connectDB();

    const configs = await BotConfig.find()
      .sort({ version: -1 })
      .lean()
      .exec();

    return NextResponse.json({
      configs,
    });
  } catch (error) {
    console.error('Error fetching bot config history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot config history' },
      { status: 500 }
    );
  }
}

