/**
 * API Route: POST /api/links/metadata
 * Extracts metadata from a given URL
 * Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MetadataService } from '@/lib/services/metadata-service';
import { rateLimiter, getClientIp } from '@/lib/utils/rate-limiter';

const requestSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimiter.check(clientIp);

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            ...Object.fromEntries(getCorsHeaders().entries()),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0].message,
          code: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Extract metadata
    const service = new MetadataService();
    const result = await service.extractMetadata(url);

    // Handle errors
    if ('code' in result) {
      const statusCode = getStatusCodeForError(result.code);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
        },
        {
          status: statusCode,
          headers: {
            ...Object.fromEntries(getCorsHeaders().entries()),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Return success
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          ...Object.fromEntries(getCorsHeaders().entries()),
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Unexpected error in metadata extraction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN',
      },
      {
        status: 500,
        headers: getCorsHeaders(),
      }
    );
  }
}

function getStatusCodeForError(code: string): number {
  switch (code) {
    case 'INVALID_URL':
      return 400;
    case 'UNREACHABLE':
    case 'TIMEOUT':
      return 422;
    case 'PARSE_ERROR':
    case 'UNKNOWN':
    default:
      return 500;
  }
}

function getCorsHeaders(): Headers {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}
