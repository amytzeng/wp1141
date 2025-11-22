import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/admin/conversations/batch:
 *   delete:
 *     summary: Batch delete conversations
 *     description: |
 *       Deletes multiple conversations and their associated messages.
 *       This operation is irreversible. Use with caution.
 *       
 *       **Security Note**: In production, you should add authentication/authorization
 *       to prevent unauthorized deletion.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationIds
 *             properties:
 *               conversationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of conversation IDs to delete
 *                 maxItems: 100
 *                 minItems: 1
 *     responses:
 *       200:
 *         description: Conversations deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchDeleteResponse'
 *       400:
 *         description: Invalid request (e.g., too many IDs, empty array)
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
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { conversationIds } = body;

    // Validation
    if (!conversationIds || !Array.isArray(conversationIds)) {
      return NextResponse.json(
        { error: 'conversationIds must be an array' },
        { status: 400 }
      );
    }

    if (conversationIds.length === 0) {
      return NextResponse.json(
        { error: 'conversationIds array cannot be empty' },
        { status: 400 }
      );
    }

    if (conversationIds.length > 100) {
      return NextResponse.json(
        { error: 'Cannot delete more than 100 conversations at once' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    const validIds: mongoose.Types.ObjectId[] = [];
    for (const id of conversationIds) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        validIds.push(new mongoose.Types.ObjectId(id));
      } else {
        console.warn(`Invalid ObjectId: ${id}`);
      }
    }

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid conversation IDs provided' },
        { status: 400 }
      );
    }

    // Count messages that will be deleted
    const messagesToDelete = await Message.countDocuments({
      conversationId: { $in: validIds },
    }).exec();

    // Delete messages first (to maintain referential integrity)
    const messagesDeleteResult = await Message.deleteMany({
      conversationId: { $in: validIds },
    }).exec();

    // Delete conversations
    const conversationsDeleteResult = await Conversation.deleteMany({
      _id: { $in: validIds },
    }).exec();

    return NextResponse.json({
      success: true,
      deleted: conversationsDeleteResult.deletedCount,
      messagesDeleted: messagesDeleteResult.deletedCount,
      requested: conversationIds.length,
      valid: validIds.length,
    });
  } catch (error) {
    console.error('Error in batch delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversations' },
      { status: 500 }
    );
  }
}

