/**
 * Script to initialize Rich Menu for Line Bot
 * 
 * Usage:
 *   1. Set environment variables:
 *      export LINE_CHANNEL_ACCESS_TOKEN="your-token"
 *      export LINE_CHANNEL_SECRET="your-secret"
 *      export MONGODB_URI="your-connection-string"
 *      node -r ts-node/register scripts/init-rich-menu.ts [image-path]
 * 
 *   2. Or use with Next.js environment loading (via API endpoint):
 *      POST /api/admin/rich-menu
 * 
 * Example:
 *   node -r ts-node/register scripts/init-rich-menu.ts public/rich-menu.png
 * 
 * Note: Make sure your environment variables are properly configured
 */

import { initializeRichMenu, listRichMenus, getDefaultRichMenuId } from '../lib/line/rich-menu';
import connectDB from '../lib/db/connect';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected.');

    // Get image path from command line argument or use default
    const imagePathArg = process.argv[2];
    const defaultImagePath = path.join(process.cwd(), 'public', 'rich-menu.png');
    const imagePath = imagePathArg || defaultImagePath;

    // Check if image exists
    let foundImagePath: string | undefined;
    if (fs.existsSync(imagePath)) {
      foundImagePath = imagePath;
      console.log(`Found Rich Menu image at: ${imagePath}`);
    } else {
      console.warn(`Rich Menu image not found at: ${imagePath}`);
      console.warn('Rich Menu will be created without image.');
    }

    // Check existing Rich Menus
    console.log('\nChecking existing Rich Menus...');
    const existingMenus = await listRichMenus();
    const defaultMenuId = await getDefaultRichMenuId();
    
    if (existingMenus.length > 0) {
      console.log(`Found ${existingMenus.length} existing Rich Menu(s):`);
      existingMenus.forEach((rm) => {
        const isDefault = rm.richMenuId === defaultMenuId;
        console.log(`  - ${rm.richMenuId} (${rm.name})${isDefault ? ' [DEFAULT]' : ''}`);
      });
    } else {
      console.log('No existing Rich Menus found.');
    }

    // Initialize Rich Menu
    console.log('\nInitializing Rich Menu...');
    const result = await initializeRichMenu(foundImagePath);

    if (result.success) {
      console.log(`\n✅ Rich Menu initialized successfully!`);
      console.log(`   Rich Menu ID: ${result.richMenuId}`);
      console.log(`   Image: ${foundImagePath || 'Not provided'}`);
      
      // Verify
      const newDefaultMenuId = await getDefaultRichMenuId();
      console.log(`\n   Default Rich Menu ID: ${newDefaultMenuId}`);
    } else {
      console.error(`\n❌ Failed to initialize Rich Menu: ${result.error}`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
