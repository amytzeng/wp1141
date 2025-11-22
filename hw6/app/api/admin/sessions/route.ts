import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation, { SessionStatus } from '@/lib/db/models/Conversation';
import { getConversationsByStatus, updateConversationStatus } from '@/lib/session/manager';

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/admin/sessions:
 *   get:
 *     summary: Get sessions by status
 *     description: |
 *       Retrieves conversations (sessions) filtered by status.
 *       Supports filtering by status (active, paused, completed, timeout) and pagination.
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed, timeout]
 *           default: active
 *         description: Filter sessions by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of sessions to return
 *       - in: query
 *         name: lineUserId
 *         schema:
 *           type: string
 *         description: Filter by Line user ID
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 total:
 *                   type: number
 *                 status:
 *                   type: string
 *                   enum: [active, paused, completed, timeout]
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
    const status = (searchParams.get('status') || 'active') as SessionStatus;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const lineUserId = searchParams.get('lineUserId');

    // Build query
    const query: any = { status };
    if (lineUserId) {
      query.lineUserId = lineUserId;
    }

    // Get sessions
    const [sessions, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastActivityAt: -1 })
        .limit(limit)
        .lean()
        .exec(),
      Conversation.countDocuments(query).exec(),
    ]);

    return NextResponse.json({
      sessions,
      total,
      status,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/sessions:
 *   put:
 *     summary: Update session status
 *     description: |
 *       Updates the status of one or more sessions.
 *       Can be used to manually change session status (e.g., pause, complete, reactivate).
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - status
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: Conversation ID to update
 *               status:
 *                 type: string
 *                 enum: [active, paused, completed, timeout]
 *                 description: New status for the session
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { conversationId, status } = body;

    if (!conversationId || !status) {
      return NextResponse.json(
        { error: 'conversationId and status are required' },
        { status: 400 }
      );
    }

    if (!['active', 'paused', 'completed', 'timeout'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, paused, completed, timeout' },
        { status: 400 }
      );
    }

    const conversation = await updateConversationStatus(
      conversationId,
      status as SessionStatus
    );

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

