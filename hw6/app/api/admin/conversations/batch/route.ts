import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';
import mongoose from 'mongoose';

/**
 * @swagger
 * /api/admin/conversations/batch:
 *   delete:
 *     summary: Batch soft delete conversations (move to trash)
 *     description: |
 *       Soft deletes multiple conversations by setting deletedAt timestamp.
 *       Conversations are moved to trash and can be restored.
 *       Data is preserved - nothing is permanently deleted.
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

    // Count messages in conversations that will be moved to trash
    const messagesCount = await Message.countDocuments({
      conversationId: { $in: validIds },
    }).exec();

    // Soft delete: Set deletedAt timestamp instead of actually deleting
    // This preserves all data for recovery
    const now = new Date();
    const conversationsUpdateResult = await Conversation.updateMany(
      {
        _id: { $in: validIds },
        deletedAt: null, // Only update conversations that are not already deleted
      },
      {
        $set: {
          deletedAt: now,
        },
      }
    ).exec();

    return NextResponse.json({
      success: true,
      deleted: conversationsUpdateResult.modifiedCount,
      messagesCount: messagesCount,
      requested: conversationIds.length,
      valid: validIds.length,
      message: 'Conversations moved to trash (soft delete - data preserved)',
    });
  } catch (error) {
    console.error('Error in batch delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversations' },
      { status: 500 }
    );
  }
}

