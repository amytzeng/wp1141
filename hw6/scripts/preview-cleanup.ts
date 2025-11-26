/**
 * Preview script for data cleanup
 * Shows statistics about conversations and messages that will be deleted
 * before November 22, 2024
 * 
 * Usage:
 *   Set MONGODB_URI environment variable, then run:
 *   npx tsx scripts/preview-cleanup.ts
 * 
 *   Or in deployment environment:
 *   MONGODB_URI="your-connection-string" npx tsx scripts/preview-cleanup.ts
 */

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  console.error('');
  console.error('Please set it before running this script:');
  console.error('  export MONGODB_URI="your-mongodb-connection-string"');
  console.error('  npx tsx scripts/preview-cleanup.ts');
  console.error('');
  console.error('Or if you have a .env.local file, make sure it contains MONGODB_URI');
  process.exit(1);
}

import connectDB from '@/lib/db/connect';
import Conversation from '@/lib/db/models/Conversation';
import Message from '@/lib/db/models/Message';

/**
 * Cutoff date: November 22, 2024
 * All data before this date will be deleted
 */
const CUTOFF_DATE = new Date('2024-11-22T00:00:00.000Z');

async function previewCleanup() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!\n');

    console.log(`Cutoff Date: ${CUTOFF_DATE.toISOString()}\n`);

    // Find conversations that should be deleted
    console.log('Finding conversations to delete...');
    const conversationsToDelete = await Conversation.find({
      $or: [
        { lastActivityAt: { $lt: CUTOFF_DATE } },
        { createdAt: { $lt: CUTOFF_DATE } },
      ],
    }).select('_id lineUserId createdAt lastActivityAt');

    const conversationIds = conversationsToDelete.map((conv) => conv._id);

    console.log(`Found ${conversationsToDelete.length} conversations to delete\n`);

    // Count messages that will be deleted
    console.log('Counting messages to delete...');
    const messagesToDeleteCount = await Message.countDocuments({
      $or: [
        { conversationId: { $in: conversationIds } },
        { timestamp: { $lt: CUTOFF_DATE } },
      ],
    });

    console.log(`Found ${messagesToDeleteCount} messages to delete\n`);

    // Show some sample conversations
    if (conversationsToDelete.length > 0) {
      console.log('Sample conversations to be deleted:');
      console.log('-----------------------------------');
      conversationsToDelete.slice(0, 5).forEach((conv, index) => {
        console.log(`${index + 1}. LineUserId: ${conv.lineUserId}`);
        console.log(`   Created: ${conv.createdAt.toISOString()}`);
        console.log(`   Last Activity: ${conv.lastActivityAt.toISOString()}`);
        console.log('');
      });
      if (conversationsToDelete.length > 5) {
        console.log(`... and ${conversationsToDelete.length - 5} more conversations\n`);
      }
    }

    // Summary
    console.log('========================================');
    console.log('PREVIEW SUMMARY');
    console.log('========================================');
    console.log(`Cutoff Date: ${CUTOFF_DATE.toISOString()}`);
    console.log(`Conversations to delete: ${conversationsToDelete.length}`);
    console.log(`Messages to delete: ${messagesToDeleteCount}`);
    console.log('========================================\n');

    console.log('This is a preview. No data has been deleted.');
    console.log('To actually delete the data, run: npm run cleanup:execute');

    process.exit(0);
  } catch (error) {
    console.error('Error during preview:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    process.exit(1);
  }
}

// Run the preview
previewCleanup();

