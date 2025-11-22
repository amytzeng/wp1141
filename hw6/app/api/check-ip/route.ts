import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint to check the current IP address
 * Useful for determining which IP to whitelist in MongoDB Atlas
 * 
 * @swagger
 * /api/check-ip:
 *   get:
 *     summary: Check current IP address
 *     description: |
 *       Returns the IP address of the current request.
 *       Useful for determining which IP address to whitelist in MongoDB Atlas Network Access.
 *       Note: In serverless environments (Vercel, Netlify), IP addresses may vary.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: IP address information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ip:
 *                   type: string
 *                   description: The IP address of the request
 *                 headers:
 *                   type: object
 *                   description: Relevant headers that may contain IP information
 *                 note:
 *                   type: string
 *                   description: Additional information about IP detection
 */
export async function GET(request: NextRequest) {
  // Try to get IP from various headers
  // These headers are set by proxies, load balancers, and CDNs
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  const vercelIp = request.headers.get('x-vercel-forwarded-for'); // Vercel

  // Extract IP from x-forwarded-for (may contain multiple IPs)
  let clientIp = 'unknown';
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, the first one is usually the original client
    clientIp = forwarded.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp;
  } else if (cfConnectingIp) {
    clientIp = cfConnectingIp;
  } else if (vercelIp) {
    clientIp = vercelIp;
  } else {
    // Fallback: try to get from request
    clientIp = request.ip || 'unknown';
  }

  // Collect all relevant headers for debugging
  const relevantHeaders: Record<string, string | null> = {
    'x-forwarded-for': request.headers.get('x-forwarded-for'),
    'x-real-ip': request.headers.get('x-real-ip'),
    'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
    'x-vercel-forwarded-for': request.headers.get('x-vercel-forwarded-for'),
    'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    'host': request.headers.get('host'),
  };

  // Determine deployment platform
  let platform = 'unknown';
  let note = '';

  if (process.env.VERCEL) {
    platform = 'Vercel';
    note =
      'You are on Vercel. Vercel uses dynamic IP addresses. For MongoDB Atlas, you should allow access from anywhere (0.0.0.0/0) or use MongoDB Atlas VPC peering.';
  } else if (process.env.NETLIFY) {
    platform = 'Netlify';
    note =
      'You are on Netlify. Netlify uses dynamic IP addresses. For MongoDB Atlas, you should allow access from anywhere (0.0.0.0/0) or use MongoDB Atlas VPC peering.';
  } else if (process.env.RAILWAY_ENVIRONMENT) {
    platform = 'Railway';
    note =
      'You are on Railway. Railway uses dynamic IP addresses. For MongoDB Atlas, you should allow access from anywhere (0.0.0.0/0).';
  } else if (process.env.RENDER) {
    platform = 'Render';
    note =
      'You are on Render. Render uses dynamic IP addresses. For MongoDB Atlas, you should allow access from anywhere (0.0.0.0/0).';
  } else {
    platform = 'Local/Other';
    note =
      'For local development or traditional hosting, you can whitelist this specific IP address in MongoDB Atlas Network Access.';
  }

  return NextResponse.json({
    ip: clientIp,
    platform,
    headers: relevantHeaders,
    note,
    recommendation:
      platform === 'Vercel' || platform === 'Netlify' || platform === 'Railway' || platform === 'Render'
        ? 'Allow access from anywhere (0.0.0.0/0) in MongoDB Atlas Network Access, or use MongoDB Atlas VPC peering for better security.'
        : `Add IP address ${clientIp} to MongoDB Atlas Network Access whitelist.`,
  });
}


