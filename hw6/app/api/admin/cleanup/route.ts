import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * Cutoff date: November 22, 2025
 * All data before this date will be deleted
 */
const CUTOFF_DATE = new Date('2025-11-22T00:00:00.000Z');

/**
 * @swagger
 * /api/admin/cleanup:
 *   get:
 *     summary: Preview data that will be deleted
 *     description: |
 *       Returns statistics about conversations and messages that will be deleted
 *       based on the cutoff date (November 22, 2025).
 *       This endpoint does not perform actual deletion.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Preview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preview:
 *                   type: boolean
 *                 cutoffDate:
 *                   type: string
 *                   format: date-time
 *                 conversationsToDelete:
 *                   type: number
 *                 messagesToDelete:
 *                   type: number
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Find conversations that should be deleted
    // Conversations with lastActivityAt or createdAt before cutoff date
    const conversationsToDelete = await Conversation.find({
      $or: [
        { lastActivityAt: { $lt: CUTOFF_DATE } },
        { createdAt: { $lt: CUTOFF_DATE } },
      ],
    }).select('_id');

    const conversationIds = conversationsToDelete.map((conv) => conv._id);

    // Count messages that will be deleted
    // Messages from conversations to be deleted OR messages with timestamp before cutoff
    const messagesToDeleteCount = await Message.countDocuments({
      $or: [
        { conversationId: { $in: conversationIds } },
        { timestamp: { $lt: CUTOFF_DATE } },
      ],
    });

    return NextResponse.json({
      preview: true,
      cutoffDate: CUTOFF_DATE.toISOString(),
      conversationsToDelete: conversationsToDelete.length,
      messagesToDelete: messagesToDeleteCount,
      message: `Preview: ${conversationsToDelete.length} conversations and ${messagesToDeleteCount} messages will be deleted`,
    });
  } catch (error) {
    console.error('Error previewing cleanup:', error);
    return NextResponse.json(
      {
        error: 'Failed to preview cleanup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/cleanup:
 *   delete:
 *     summary: Delete data before cutoff date
 *     description: |
 *       Permanently deletes all conversations and messages created or last active
 *       before November 22, 2025.
 *       This operation cannot be undone.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cutoffDate:
 *                   type: string
 *                   format: date-time
 *                 conversationsDeleted:
 *                   type: number
 *                 messagesDeleted:
 *                   type: number
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Find conversations that should be deleted
    const conversationsToDelete = await Conversation.find({
      $or: [
        { lastActivityAt: { $lt: CUTOFF_DATE } },
        { createdAt: { $lt: CUTOFF_DATE } },
      ],
    }).select('_id');

    const conversationIds = conversationsToDelete.map((conv) => conv._id);

    // Delete messages from conversations to be deleted
    // Also delete any messages with timestamp before cutoff (for completeness)
    const messageDeleteResult = await Message.deleteMany({
      $or: [
        { conversationId: { $in: conversationIds } },
        { timestamp: { $lt: CUTOFF_DATE } },
      ],
    });

    // Delete conversations
    const conversationDeleteResult = await Conversation.deleteMany({
      _id: { $in: conversationIds },
    });

    return NextResponse.json({
      success: true,
      cutoffDate: CUTOFF_DATE.toISOString(),
      conversationsDeleted: conversationDeleteResult.deletedCount,
      messagesDeleted: messageDeleteResult.deletedCount,
      message: `Deleted ${conversationDeleteResult.deletedCount} conversations and ${messageDeleteResult.deletedCount} messages`,
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

