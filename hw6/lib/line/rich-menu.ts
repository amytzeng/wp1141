import { Client, RichMenu, RichMenuResponse } from '@line/bot-sdk';
import { getLineClient } from './client';
import { RichMenuAction } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Rich Menu button configuration
 * Layout: 3 columns x 2 rows
 * Button sizes: 833x843 pixels (first two columns), 834x843 pixels (third column)
 */
export const RICH_MENU_BUTTONS: Array<{
  action: RichMenuAction;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
}> = [
  {
    action: 'summarize',
    label: '重點整理',
    bounds: { x: 0, y: 0, width: 833, height: 843 },
  },
  {
    action: 'review',
    label: '快速複習',
    bounds: { x: 833, y: 0, width: 833, height: 843 },
  },
  {
    action: 'example',
    label: '例題示範',
    bounds: { x: 1666, y: 0, width: 834, height: 843 },
  },
  {
    action: 'reexplain',
    label: '再解釋一次',
    bounds: { x: 0, y: 843, width: 833, height: 843 },
  },
  {
    action: 'clear',
    label: '清除',
    bounds: { x: 833, y: 843, width: 833, height: 843 },
  },
  {
    action: 'help',
    label: '幫助',
    bounds: { x: 1666, y: 843, width: 834, height: 843 },
  },
];

/**
 * Creates a Rich Menu definition
 */
export function createRichMenuDefinition(): RichMenu {
  return {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: true,
    name: 'Learning Assistant Menu',
    chatBarText: '學習功能',
    areas: RICH_MENU_BUTTONS.map((button) => ({
      bounds: button.bounds,
      action: {
        type: 'postback',
        label: button.label,
        data: JSON.stringify({ action: button.action }),
      },
    })),
  };
}

/**
 * Creates and uploads a Rich Menu to Line
 */
export async function createRichMenu(): Promise<string> {
  const client = getLineClient();
  const richMenu = createRichMenuDefinition();
  
  const richMenuId = await client.createRichMenu(richMenu);
  console.log(`Rich Menu created with ID: ${richMenuId}`);
  
  return richMenuId;
}

/**
 * Uploads Rich Menu image
 */
export async function uploadRichMenuImage(
  richMenuId: string,
  imagePath: string
): Promise<void> {
  const client = getLineClient();
  
  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Rich Menu image not found at: ${imagePath}`);
  }

  // Read image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Check image format (must be JPEG or PNG)
  const ext = path.extname(imagePath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
  
  // Upload image
  await client.setRichMenuImage(richMenuId, imageBuffer, contentType);
  console.log(`Rich Menu image uploaded for ID: ${richMenuId}`);
}

/**
 * Sets a Rich Menu as the default menu for all users
 */
export async function setDefaultRichMenu(richMenuId: string): Promise<void> {
  const client = getLineClient();
  await client.setDefaultRichMenu(richMenuId);
  console.log(`Rich Menu ${richMenuId} set as default`);
}

/**
 * Gets all Rich Menus for the channel
 */
export async function listRichMenus(): Promise<RichMenuResponse[]> {
  const client = getLineClient();
  return await client.getRichMenuList();
}

/**
 * Deletes a Rich Menu
 */
export async function deleteRichMenu(richMenuId: string): Promise<void> {
  const client = getLineClient();
  await client.deleteRichMenu(richMenuId);
  console.log(`Rich Menu ${richMenuId} deleted`);
}

/**
 * Gets the default Rich Menu ID
 */
export async function getDefaultRichMenuId(): Promise<string | null> {
  const client = getLineClient();
  try {
    const richMenuId = await client.getDefaultRichMenuId();
    return richMenuId || null;
  } catch (error) {
    // If no default rich menu is set, Line API throws an error
    return null;
  }
}

/**
 * Initializes Rich Menu: creates, uploads image, and sets as default
 * This function handles the complete initialization process
 */
export async function initializeRichMenu(imagePath?: string): Promise<{
  richMenuId: string;
  success: boolean;
  error?: string;
}> {
  try {
    // Delete existing default rich menu if exists
    const existingDefaultId = await getDefaultRichMenuId();
    if (existingDefaultId) {
      try {
        await deleteRichMenu(existingDefaultId);
        console.log(`Deleted existing default rich menu: ${existingDefaultId}`);
      } catch (error) {
        console.warn(`Failed to delete existing rich menu: ${error}`);
      }
    }

    // Create new rich menu
    const richMenuId = await createRichMenu();

    // Upload image if provided
    if (imagePath) {
      await uploadRichMenuImage(richMenuId, imagePath);
    } else {
      console.warn('No image path provided. Rich Menu created without image.');
    }

    // Set as default
    await setDefaultRichMenu(richMenuId);

    return {
      richMenuId,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to initialize Rich Menu:', errorMessage);
    return {
      richMenuId: '',
      success: false,
      error: errorMessage,
    };
  }
}
