import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Message from '@/lib/db/models/Message';
import { classifyMessage } from '@/lib/classification/classifier';

/**
 * @swagger
 * /api/admin/classify/batch:
 *   post:
 *     summary: Batch classify messages
 *     description: |
 *       Classifies uncategorized user messages in batch.
 *       This endpoint finds all user messages without category metadata
 *       and classifies them using keyword matching.
 *       
 *       **Note**: This operation may take some time depending on the number
 *       of uncategorized messages. It's recommended to use this endpoint
 *       for processing historical messages.
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: number
 *                 default: 100
 *                 description: Maximum number of messages to classify in one batch
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Only classify messages from this date onwards
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Only classify messages until this date
 *     responses:
 *       200:
 *         description: Batch classification completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 processed:
 *                   type: number
 *                   description: Number of messages processed
 *                 classified:
 *                   type: number
 *                   description: Number of messages successfully classified
 *                 failed:
 *                   type: number
 *                   description: Number of messages that failed to classify
 *                 message:
 *                   type: string
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
    const limit = body.limit || 100;
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    // Build filter for uncategorized messages
    const filter: any = {
      type: 'user',
      $or: [
        { 'metadata.category': { $exists: false } },
        { 'metadata.category': null },
      ],
    };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = startDate;
      }
      if (endDate) {
        filter.timestamp.$lte = endDate;
      }
    }

    // Find uncategorized messages
    const messages = await Message.find(filter)
      .limit(limit)
      .sort({ timestamp: -1 })
      .exec();

    let classified = 0;
    let failed = 0;

    // Classify each message
    for (const message of messages) {
      try {
        const classification = classifyMessage(message.content);

        // Update message with classification
        await Message.findByIdAndUpdate(message._id, {
          $set: {
            'metadata.category': {
              mainCategory: classification.mainCategory,
              subCategory: classification.subCategory,
              confidence: classification.confidence,
              method: classification.method,
            },
          },
        }).exec();

        classified++;
      } catch (error) {
        console.error(`Error classifying message ${message._id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: messages.length,
      classified,
      failed,
      message: `Processed ${messages.length} messages, classified ${classified}, failed ${failed}`,
    });
  } catch (error) {
    console.error('Error in batch classification:', error);
    return NextResponse.json(
      { error: 'Failed to perform batch classification' },
      { status: 500 }
    );
  }
}

