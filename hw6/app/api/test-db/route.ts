import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/connect';

/**
 * Test endpoint to check MongoDB connection
 * This endpoint performs a comprehensive database connection test
 * 
 * @swagger
 * /api/test-db:
 *   get:
 *     summary: Test MongoDB connection
 *     description: |
 *       Comprehensive test endpoint to verify MongoDB connection status.
 *       Performs connection, ping, and basic query tests.
 *       Useful for debugging database connectivity issues.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Database connection test results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 details:
 *                   type: object
 *       500:
 *         description: Database connection failed
 */
export async function GET() {
  const results: {
    success: boolean;
    message: string;
    details: {
      connectionState?: string;
      pingTime?: number;
      databaseName?: string;
      collections?: string[];
      error?: string;
    };
  } = {
    success: false,
    message: '',
    details: {},
  };

  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          success: false,
          message: 'MONGODB_URI environment variable is not set',
          details: {},
        },
        { status: 500 }
      );
    }

    // Mask sensitive information for logging
    const maskedUri = process.env.MONGODB_URI.replace(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
      'mongodb+srv://$1:***@'
    );

    // Step 1: Attempt connection
    const connectStartTime = Date.now();
    await connectDB();
    const connectTime = Date.now() - connectStartTime;

    // Step 2: Check connection state
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    results.details.connectionState = `${states[readyState]} (${readyState})`;

    if (readyState !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: `Connection state is not 'connected'. Current state: ${states[readyState]}`,
          details: results.details,
        },
        { status: 500 }
      );
    }

    // Step 3: Perform ping test
    const pingStartTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - pingStartTime;
    results.details.pingTime = pingTime;

    // Step 4: Get database information
    results.details.databaseName = mongoose.connection.db.databaseName;

    // Step 5: List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    results.details.collections = collections.map((c) => c.name);

    // Step 6: Get server status
    const serverStatus = await mongoose.connection.db.admin().serverStatus();

    results.success = true;
    results.message = `Database connection successful! Connected in ${connectTime}ms, ping: ${pingTime}ms`;
    results.details = {
      ...results.details,
      // Add server info to details
      serverVersion: serverStatus.version,
      uptime: `${Math.floor(serverStatus.uptime / 3600)} hours`,
    } as any;

    return NextResponse.json(results);
  } catch (error) {
    let errorMessage = 'Unknown error';
    let errorName = 'UnknownError';
    let helpfulTip = '';
    let errorCode: string | undefined;
    let fullErrorDetails: any = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorName = error.name;
      fullErrorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };

      // Extract error code if available (MongoDB errors often have codes)
      if ('code' in error) {
        errorCode = String(error.code);
        fullErrorDetails.code = errorCode;
      }

      // Provide helpful error messages based on error type
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        helpfulTip =
          'Cannot resolve hostname. Check if your MONGODB_URI hostname is correct. Verify the cluster URL in MongoDB Atlas.';
      } else if (
        errorMessage.includes('authentication failed') ||
        errorMessage.includes('bad auth') ||
        errorCode === '8000'
      ) {
        helpfulTip =
          'Authentication failed. Check your username and password in MONGODB_URI. Make sure the database user exists in MongoDB Atlas and has the correct permissions.';
      } else if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorCode === 'ETIMEDOUT'
      ) {
        helpfulTip =
          'Connection timeout. Possible causes: 1) Your IP address is not whitelisted in MongoDB Atlas Network Access, 2) Network firewall is blocking the connection, 3) MongoDB cluster is paused or unavailable.';
      } else if (errorMessage.includes('IP') || errorCode === '8000') {
        helpfulTip =
          'IP address not whitelisted. Go to MongoDB Atlas > Network Access > Add IP Address. You can temporarily allow all IPs (0.0.0.0/0) for testing, but restrict it in production.';
      } else if (errorMessage.includes('MongoServerError') || errorName === 'MongoServerError') {
        helpfulTip =
          'MongoDB server error. Check MongoDB Atlas dashboard to ensure your cluster is running and accessible.';
      } else if (errorMessage.includes('MongoNetworkError') || errorName === 'MongoNetworkError') {
        helpfulTip =
          'Network error. Check your internet connection and MongoDB Atlas Network Access settings. Your IP may need to be whitelisted.';
      } else if (errorMessage.includes('MongoParseError') || errorName === 'MongoParseError') {
        helpfulTip =
          'Invalid connection string format. Check your MONGODB_URI format. It should be: mongodb+srv://username:password@cluster.mongodb.net/database?options';
      }
    } else {
      fullErrorDetails = { rawError: String(error) };
    }

    // Check if MONGODB_URI is set but connection failed
    const hasUri = !!process.env.MONGODB_URI;
    const uriFormat = hasUri
      ? process.env.MONGODB_URI.startsWith('mongodb+srv://') ||
        process.env.MONGODB_URI.startsWith('mongodb://')
        ? 'valid'
        : 'invalid'
      : 'not_set';

    results.success = false;
    results.message = `Database connection failed: ${errorMessage}`;
    results.details = {
      ...results.details,
      error: errorMessage,
      errorName,
      ...(errorCode && { errorCode }),
      ...(helpfulTip && { tip: helpfulTip }),
      hasMongoDbUri: hasUri,
      uriFormat,
      ...(process.env.NODE_ENV === 'development' && { fullError: fullErrorDetails }),
    };

    return NextResponse.json(results, { status: 500 });
  }
}

