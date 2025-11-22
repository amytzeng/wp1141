import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import mongoose from 'mongoose';
import Message from '@/lib/db/models/Message';

/**
 * Checks database connection status
 * Performs actual ping to verify database is accessible
 */
async function checkDatabase(): Promise<{ status: string; error?: string }> {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      return { status: 'missing', error: 'MONGODB_URI environment variable is not set' };
    }

    // Try to connect or use existing connection
    await connectDB();

    // Check if connection is ready
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
      return { status: 'disconnected', error: 'Database connection is not ready' };
    }

    // Perform actual ping to verify database is accessible
    // This ensures the connection is not just established but actually working
    try {
      // Check if db is available before accessing it
      if (!mongoose.connection.db) {
        return {
          status: 'error',
          error: 'Database connection object is not available',
        };
      }
      await mongoose.connection.db.admin().ping();
      return { status: 'connected' };
    } catch (pingError) {
      return {
        status: 'error',
        error: `Database ping failed: ${pingError instanceof Error ? pingError.message : 'Unknown error'}`,
      };
    }
  } catch (error) {
    // Extract more detailed error information
    let errorMessage = 'Unknown database error';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common connection errors
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('getaddrinfo')) {
        errorMessage = `Cannot resolve MongoDB hostname. Check your MONGODB_URI. Original error: ${errorMessage}`;
      } else if (errorMessage.includes('authentication failed')) {
        errorMessage = `MongoDB authentication failed. Check your username and password in MONGODB_URI. Original error: ${errorMessage}`;
      } else if (errorMessage.includes('timeout')) {
        errorMessage = `MongoDB connection timeout. The database server may be unreachable. Original error: ${errorMessage}`;
      }
    }

    return {
      status: 'error',
      error: errorMessage,
    };
  }
}

/**
 * Checks LINE service configuration
 */
function checkLineService(): { status: string; error?: string } {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!accessToken && !channelSecret) {
    return { status: 'missing', error: 'LINE_CHANNEL_ACCESS_TOKEN and LINE_CHANNEL_SECRET are not set' };
  }
  if (!accessToken) {
    return { status: 'incomplete', error: 'LINE_CHANNEL_ACCESS_TOKEN is not set' };
  }
  if (!channelSecret) {
    return { status: 'incomplete', error: 'LINE_CHANNEL_SECRET is not set' };
  }

  return { status: 'configured' };
}

/**
 * Checks LLM service configuration
 */
function checkLLMService(): { status: string; error?: string } {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { status: 'missing', error: 'OPENAI_API_KEY environment variable is not set' };
  }

  return { status: 'configured' };
}

/**
 * Calculates performance metrics from message data
 */
async function calculatePerformanceMetrics(): Promise<{
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  failureRate: number;
  requestsPerMinute: number;
  totalRequests: number;
  errorCount: number;
}> {
  try {
    await connectDB();

    // Get bot messages from last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const botMessages = await Message.find({
      type: 'bot',
      timestamp: { $gte: twentyFourHoursAgo },
      'metadata.processingTime': { $exists: true },
    })
      .select('metadata.processingTime metadata.error timestamp')
      .lean()
      .exec();

    if (botMessages.length === 0) {
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        failureRate: 0,
        requestsPerMinute: 0,
        totalRequests: 0,
        errorCount: 0,
      };
    }

    // Calculate response times
    const responseTimes = botMessages
      .map((msg) => msg.metadata?.processingTime || 0)
      .filter((time) => time > 0)
      .sort((a, b) => a - b);

    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    // Calculate percentiles
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);
    const p95ResponseTime = responseTimes[p95Index] || 0;
    const p99ResponseTime = responseTimes[p99Index] || 0;

    // Calculate failure rate
    const errorCount = botMessages.filter(
      (msg) => msg.metadata?.error && msg.metadata.error !== null
    ).length;
    const failureRate =
      botMessages.length > 0 ? (errorCount / botMessages.length) * 100 : 0;

    // Calculate requests per minute (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMessages = botMessages.filter(
      (msg) => new Date(msg.timestamp) >= oneHourAgo
    );
    const requestsPerMinute = recentMessages.length / 60;

    return {
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime,
      p99ResponseTime,
      failureRate: Math.round(failureRate * 100) / 100,
      requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
      totalRequests: botMessages.length,
      errorCount,
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      failureRate: 0,
      requestsPerMinute: 0,
      totalRequests: 0,
      errorCount: 0,
    };
  }
}

/**
 * Determines overall health status based on service statuses
 */
function determineOverallStatus(services: {
  database: { status: string; error?: string };
  line: { status: string; error?: string };
  llm: { status: string; error?: string };
}): 'healthy' | 'degraded' | 'unhealthy' {
  // Database is critical - if it's not connected, system is unhealthy
  if (services.database.status !== 'connected') {
    return 'unhealthy';
  }

  // LINE and LLM are important but not critical for basic operation
  // If both are missing, system is degraded
  if (services.line.status === 'missing' && services.llm.status === 'missing') {
    return 'degraded';
  }

  // If database is connected and at least one other service is configured, system is healthy
  return 'healthy';
}

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check with performance metrics
 *     description: |
 *       Verifies database connection, checks service configuration status, and provides
 *       performance metrics including response times, failure rates, and request statistics.
 *       - **healthy**: All critical services are operational
 *       - **degraded**: Database is connected but some optional services are missing
 *       - **unhealthy**: Critical services (database) are not available
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy or degraded (but operational)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       503:
 *         description: System is unhealthy (critical services unavailable)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
export async function GET() {
  try {
    // Check all services independently and calculate performance metrics
    const [database, line, llm, performance] = await Promise.all([
      checkDatabase(),
      Promise.resolve(checkLineService()),
      Promise.resolve(checkLLMService()),
      calculatePerformanceMetrics(),
    ]);

    const services = {
      database,
      line,
      llm,
    };

    // Determine overall status
    const overallStatus = determineOverallStatus(services);

    // Prepare response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: database.status,
        line: line.status,
        llm: llm.status,
      },
      performance: {
        avgResponseTime: performance.avgResponseTime,
        p95ResponseTime: performance.p95ResponseTime,
        p99ResponseTime: performance.p99ResponseTime,
        failureRate: performance.failureRate,
        requestsPerMinute: performance.requestsPerMinute,
        totalRequests: performance.totalRequests,
        errorCount: performance.errorCount,
      },
      // Include errors if any service has issues
      ...(database.error || line.error || llm.error
        ? {
            errors: {
              ...(database.error && { database: database.error }),
              ...(line.error && { line: line.error }),
              ...(llm.error && { llm: llm.error }),
            },
          }
        : {}),
    };

    // Return 503 only if system is unhealthy (database not connected)
    // Return 200 for healthy or degraded states
    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(response, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'unknown',
          line: 'unknown',
          llm: 'unknown',
        },
      },
      { status: 503 }
    );
  }
}

