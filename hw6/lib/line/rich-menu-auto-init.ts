/**
 * Auto-initialize Rich Menu on application startup
 * This module handles automatic Rich Menu initialization
 */

import { getDefaultRichMenuId, initializeRichMenu } from './rich-menu';
import * as path from 'path';
import * as fs from 'fs';

let initializationPromise: Promise<boolean> | null = null;
let isInitialized = false;

/**
 * Finds the Rich Menu image file
 */
function findRichMenuImage(): string | undefined {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'rich-menu.png'),
    path.join(process.cwd(), 'public', 'rich-menu-full.png'),
    path.join(process.cwd(), 'public', 'rich-menu.jpg'),
    'public/rich-menu.png',
    'public/rich-menu-full.png',
    'public/rich-menu.jpg',
  ];

  for (const imgPath of possiblePaths) {
    if (fs.existsSync(imgPath)) {
      return imgPath;
    }
  }

  return undefined;
}

/**
 * Checks if Rich Menu is already initialized
 */
async function checkRichMenuExists(): Promise<boolean> {
  try {
    const defaultRichMenuId = await getDefaultRichMenuId();
    return defaultRichMenuId !== null;
  } catch (error) {
    // If error, assume Rich Menu doesn't exist
    return false;
  }
}

/**
 * Auto-initializes Rich Menu if it doesn't exist
 * This function is safe to call multiple times - it will only initialize once
 */
export async function autoInitializeRichMenu(): Promise<{
  initialized: boolean;
  richMenuId?: string;
  error?: string;
}> {
  // Return cached result if already initialized
  if (isInitialized) {
    return { initialized: true };
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    const result = await initializationPromise;
    return { initialized: result };
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      // Check if Rich Menu already exists
      const exists = await checkRichMenuExists();
      if (exists) {
        console.log('Rich Menu already exists, skipping auto-initialization');
        isInitialized = true;
        return true;
      }

      console.log('Rich Menu not found, starting auto-initialization...');

      // Find image file
      const imagePath = findRichMenuImage();
      if (!imagePath) {
        console.warn('Rich Menu image not found. Creating Rich Menu without image.');
      } else {
        console.log(`Found Rich Menu image at: ${imagePath}`);
      }

      // Initialize Rich Menu
      const result = await initializeRichMenu(imagePath);

      if (result.success) {
        console.log(`✅ Rich Menu auto-initialized successfully! ID: ${result.richMenuId}`);
        isInitialized = true;
        return true;
      } else {
        console.error(`❌ Failed to auto-initialize Rich Menu: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error during Rich Menu auto-initialization:', error);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  const success = await initializationPromise;
  return {
    initialized: success,
    richMenuId: success ? 'initialized' : undefined,
    error: success ? undefined : 'Failed to initialize Rich Menu',
  };
}

