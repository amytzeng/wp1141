import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Message from '@/lib/db/models/Message';

/**
 * @swagger
 * /api/webhook/health:
 *   get:
 *     summary: Webhook health check
 *     description: |
 *       Provides detailed health status for the Line webhook endpoint.
 *       Returns statistics about recent webhook requests, error rates, and last activity.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Webhook health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 lastRequestTime:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 last24Hours:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                     successfulRequests:
 *                       type: number
 *                     failedRequests:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                 lastHour:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: number
 *                     successfulRequests:
 *                       type: number
 *                     failedRequests:
 *                       type: number
 *                 signatureValidation:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     status:
 *                       type: string
 *             example:
 *               status: healthy
 *               lastRequestTime: "2024-01-15T10:30:00.000Z"
 *               last24Hours:
 *                 totalRequests: 150
 *                 successfulRequests: 145
 *                 failedRequests: 5
 *                 errorRate: 3.33
 *               lastHour:
 *                 totalRequests: 10
 *                 successfulRequests: 10
 *                 failedRequests: 0
 *               signatureValidation:
 *                 enabled: true
 *                 status: enabled
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get all messages (user messages represent webhook requests)
    const allMessages = await Message.find({
      type: 'user',
      timestamp: { $gte: twentyFourHoursAgo },
    })
      .select('timestamp metadata')
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    // Get last request time
    const lastRequestTime =
      allMessages.length > 0 ? allMessages[0].timestamp : null;

    // Calculate 24-hour statistics
    const last24HoursMessages = allMessages.filter(
      (msg) => new Date(msg.timestamp) >= twentyFourHoursAgo
    );

    // Check for errors (messages that might indicate webhook processing issues)
    // We can check if there's a corresponding bot response
    const last24HoursUserMessages = last24HoursMessages.map((msg) => msg._id.toString());
    const botResponses = await Message.find({
      type: 'bot',
      timestamp: { $gte: twentyFourHoursAgo },
      'metadata.replyToken': { $exists: true },
    }).lean().exec();

    // Estimate success rate (simplified: if there's a bot response, it's successful)
    // This is a simplified check - in reality, we'd need to track webhook processing separately
    const successfulRequests = botResponses.length;
    const totalRequests = last24HoursMessages.length;
    const failedRequests = Math.max(0, totalRequests - successfulRequests);
    const errorRate =
      totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    // Last hour statistics
    const lastHourMessages = allMessages.filter(
      (msg) => new Date(msg.timestamp) >= oneHourAgo
    );
    const lastHourBotResponses = botResponses.filter(
      (msg) => new Date(msg.timestamp) >= oneHourAgo
    );

    // Determine status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 20) {
      status = 'unhealthy';
    } else if (errorRate > 10 || !lastRequestTime) {
      status = 'degraded';
    }

    // Check signature validation status
    const signatureValidationEnabled =
      process.env.DISABLE_WEBHOOK_SIGNATURE_CHECK !== 'true';
    const signatureValidationStatus = signatureValidationEnabled
      ? 'enabled'
      : 'disabled (development mode)';

    return NextResponse.json({
      status,
      lastRequestTime: lastRequestTime ? new Date(lastRequestTime).toISOString() : null,
      last24Hours: {
        totalRequests,
        successfulRequests,
        failedRequests,
        errorRate: Math.round(errorRate * 100) / 100,
      },
      lastHour: {
        totalRequests: lastHourMessages.length,
        successfulRequests: lastHourBotResponses.length,
        failedRequests: Math.max(0, lastHourMessages.length - lastHourBotResponses.length),
      },
      signatureValidation: {
        enabled: signatureValidationEnabled,
        status: signatureValidationStatus,
      },
    });
  } catch (error) {
    console.error('Error checking webhook health:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

