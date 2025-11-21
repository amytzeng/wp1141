import { swaggerSpec } from '@/lib/swagger/config';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/swagger:
 *   get:
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI/Swagger specification in JSON format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}

