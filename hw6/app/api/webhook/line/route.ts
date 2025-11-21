import { NextRequest, NextResponse } from 'next/server';
import { validateSignature } from '@line/bot-sdk';
import { handleLineEvent } from '@/lib/line/handler';
import { LineWebhookBody } from '@/lib/line/types';
import connectDB from '@/lib/db/connect';

/**
 * @swagger
 * /api/webhook/line:
 *   post:
 *     summary: Line Webhook endpoint
 *     description: |
 *       Receives and processes events from Line Messaging API. This endpoint validates the Line signature and processes message events.
 *       
 *       **Note for Testing**: In development mode (when DISABLE_WEBHOOK_SIGNATURE_CHECK=true), 
 *       signature validation is bypassed to allow testing from Swagger UI. In production, 
 *       signature validation is always required for security.
 *     tags: [Webhook]
 *     parameters:
 *       - in: header
 *         name: x-line-signature
 *         required: false
 *         schema:
 *           type: string
 *         description: Line webhook signature (required in production, optional in dev mode)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - events
 *             properties:
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [message, follow, unfollow]
 *                     source:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                     message:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                         text:
 *                           type: string
 *                     replyToken:
 *                       type: string
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *       401:
 *         description: Invalid or missing signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server configuration error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Read request body as text (needed for signature validation)
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // Check if signature validation should be disabled (for development/testing)
    const disableSignatureCheck = process.env.DISABLE_WEBHOOK_SIGNATURE_CHECK === 'true';
    
    // Validate signature (skip in development mode if explicitly disabled)
    if (!disableSignatureCheck) {
      if (!signature) {
        console.error('Missing x-line-signature header');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      // Validate signature
      const channelSecret = process.env.LINE_CHANNEL_SECRET;
      if (!channelSecret) {
        console.error('LINE_CHANNEL_SECRET is not set');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const isValid = validateSignature(body, channelSecret, signature);
      if (!isValid) {
        console.error('Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else {
      // Log that signature check is disabled (for development only)
      console.warn('Webhook signature validation is DISABLED (development mode)');
    }

    // Parse webhook body
    const webhookBody: LineWebhookBody = JSON.parse(body);

    // Process each event
    // Use Promise.allSettled to handle multiple events independently
    const results = await Promise.allSettled(
      webhookBody.events.map((event) => handleLineEvent(event))
    );

    // Log any failures (but still return 200 to prevent Line from retrying)
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error processing event ${index}:`, result.reason);
      }
    });

    // Always return 200 OK to prevent Line from retrying
    // Even if processing fails, we don't want Line to keep retrying
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 to prevent Line from retrying
    // In production, you might want to log this to an error tracking service
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 200 }
    );
  }
}

/**
 * @swagger
 * /api/webhook/line:
 *   get:
 *     summary: Verify webhook endpoint
 *     description: Optional endpoint for Line to verify the webhook is active
 *     tags: [Webhook]
 *     responses:
 *       200:
 *         description: Webhook endpoint is active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Line Webhook endpoint is active
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
export async function GET() {
  return NextResponse.json({
    message: 'Line Webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}

