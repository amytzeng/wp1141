import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { initializeRichMenu, listRichMenus, getDefaultRichMenuId, deleteRichMenu } from '@/lib/line/rich-menu';
import * as path from 'path';
import * as fs from 'fs';

/**
 * @swagger
 * /api/admin/rich-menu:
 *   post:
 *     summary: Initialize Rich Menu
 *     description: Creates, uploads image, and sets Rich Menu as default. Requires image file to be in public/rich-menu.png or public/rich-menu.jpg
 *     tags: [Admin]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imagePath:
 *                 type: string
 *                 description: Optional path to Rich Menu image file (relative to project root)
 *     responses:
 *       200:
 *         description: Rich Menu initialized successfully
 *       500:
 *         description: Failed to initialize Rich Menu
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Try to parse body, but handle empty body gracefully
    let body: { imagePath?: string } = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      // If body is empty or invalid JSON, use defaults
      console.warn('Could not parse request body, using defaults');
    }

    const imagePath = body.imagePath || 'public/rich-menu.png';

    // Try to find image file
    const possiblePaths = [
      imagePath,
      path.join(process.cwd(), imagePath),
      path.join(process.cwd(), 'public', 'rich-menu.png'),
      path.join(process.cwd(), 'public', 'rich-menu-full.png'),
      path.join(process.cwd(), 'public', 'rich-menu.jpg'),
    ];

    let foundImagePath: string | undefined;
    for (const imgPath of possiblePaths) {
      if (fs.existsSync(imgPath)) {
        foundImagePath = imgPath;
        break;
      }
    }

    if (!foundImagePath) {
      console.warn('Rich Menu image not found, creating Rich Menu without image');
    }

    const result = await initializeRichMenu(foundImagePath);

    if (result.success) {
      return NextResponse.json({
        success: true,
        richMenuId: result.richMenuId,
        message: 'Rich Menu initialized successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to initialize Rich Menu',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error initializing Rich Menu:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/rich-menu:
 *   get:
 *     summary: Get Rich Menu information
 *     description: Lists all Rich Menus and returns the default Rich Menu ID
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Rich Menu information retrieved successfully
 */
export async function GET() {
  try {
    await connectDB();

    // Auto-initialize Rich Menu if it doesn't exist
    const { autoInitializeRichMenu } = await import('@/lib/line/rich-menu-auto-init');
    await autoInitializeRichMenu();

    const richMenus = await listRichMenus();
    const defaultRichMenuId = await getDefaultRichMenuId();

    return NextResponse.json({
      success: true,
      richMenus: richMenus.map((rm) => ({
        richMenuId: rm.richMenuId,
        size: rm.size,
        selected: rm.selected,
        name: rm.name,
        chatBarText: rm.chatBarText,
        areas: rm.areas,
      })),
      defaultRichMenuId,
    });
  } catch (error) {
    console.error('Error getting Rich Menu info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/rich-menu:
 *   delete:
 *     summary: Delete Rich Menu
 *     description: Deletes the default Rich Menu
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Rich Menu deleted successfully
 */
export async function DELETE() {
  try {
    await connectDB();

    const defaultRichMenuId = await getDefaultRichMenuId();
    if (!defaultRichMenuId) {
      return NextResponse.json({
        success: false,
        error: 'No default Rich Menu found',
      });
    }

    await deleteRichMenu(defaultRichMenuId);

    return NextResponse.json({
      success: true,
      message: 'Rich Menu deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Rich Menu:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
