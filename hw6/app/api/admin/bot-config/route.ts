import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import BotConfig from '@/lib/db/models/BotConfig';

/**
 * @swagger
 * /api/admin/bot-config:
 *   get:
 *     summary: Get bot configuration
 *     description: |
 *       Retrieves the current active bot configuration including system prompt,
 *       personality, and response rules.
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Bot configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BotConfigResponse'
 *       404:
 *         description: No active configuration found
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
export async function GET() {
  try {
    await connectDB();

    // Get active configuration
    let config = await BotConfig.findOne({ isActive: true }).lean().exec();

    // If no active config exists, create a default one
    if (!config) {
      const defaultConfig = new BotConfig({
        systemPrompt:
          'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
        personality: 'Friendly, helpful, and encouraging learning assistant.',
        responseRules: {
          enableFallback: true,
          maxResponseLength: 500,
          temperature: 0.7,
          customInstructions: '',
        },
        isActive: true,
        version: 1,
      });
      await defaultConfig.save();
      // Re-query with lean() to get the correct type
      const savedDefaultConfig = await BotConfig.findOne({ _id: defaultConfig._id }).lean().exec();
      if (!savedDefaultConfig) {
        throw new Error('Failed to retrieve saved default configuration');
      }
      config = savedDefaultConfig;
    }

    return NextResponse.json({
      config,
    });
  } catch (error) {
    console.error('Error fetching bot config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot configuration' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/bot-config:
 *   put:
 *     summary: Update bot configuration
 *     description: |
 *       Updates the bot configuration. Creates a new version if an active config exists.
 *       The old config will be deactivated and a new one will be created.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               systemPrompt:
 *                 type: string
 *                 description: System prompt for the LLM
 *               personality:
 *                 type: string
 *                 description: Personality description
 *               responseRules:
 *                 type: object
 *                 properties:
 *                   enableFallback:
 *                     type: boolean
 *                   maxResponseLength:
 *                     type: number
 *                   temperature:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 2
 *                   customInstructions:
 *                     type: string
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 config:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     systemPrompt:
 *                       type: string
 *                     personality:
 *                       type: string
 *                     responseRules:
 *                       type: object
 *                     isActive:
 *                       type: boolean
 *                     version:
 *                       type: number
 *       400:
 *         description: Invalid request
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
    const { systemPrompt, personality, responseRules } = body;

    // Deactivate current active config
    await BotConfig.updateMany({ isActive: true }, { isActive: false }).exec();

    // Get the highest version number
    const latestConfig = await BotConfig.findOne()
      .sort({ version: -1 })
      .lean()
      .exec();
    const nextVersion = latestConfig ? latestConfig.version + 1 : 1;

    // Create new active config
    const newConfig = new BotConfig({
      systemPrompt:
        systemPrompt ||
        'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
      personality:
        personality || 'Friendly, helpful, and encouraging learning assistant.',
      responseRules: {
        enableFallback: responseRules?.enableFallback ?? true,
        maxResponseLength: responseRules?.maxResponseLength ?? 500,
        temperature: responseRules?.temperature ?? 0.7,
        customInstructions: responseRules?.customInstructions || '',
      },
      isActive: true,
      version: nextVersion,
    });

    await newConfig.save();

    // Re-query with lean() to get the correct type
    const savedConfig = await BotConfig.findOne({ _id: newConfig._id }).lean().exec();

    if (!savedConfig) {
      return NextResponse.json(
        { error: 'Failed to retrieve saved configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      config: savedConfig,
    });
  } catch (error) {
    console.error('Error updating bot config:', error);
    return NextResponse.json(
      { error: 'Failed to update bot configuration' },
      { status: 500 }
    );
  }
}

