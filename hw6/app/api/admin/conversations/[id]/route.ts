import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/admin/conversations/{id}:
 *   get:
 *     summary: Get conversation details
 *     description: Retrieves a single conversation with all its messages
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation details with messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDetailResponse'
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
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await params in Next.js 14 App Router
    const { id } = await params;
    const conversationId = id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Fetch conversation
    const conversation = await Conversation.findById(conversationId).lean().exec();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Fetch all messages for this conversation
    const messages = await Message.find({
      conversationId: conversationId,
    })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    return NextResponse.json({
      conversation,
      messages,
      messageCount: messages.length,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

