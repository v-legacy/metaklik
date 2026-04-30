/**
 * @file route.tsx
 * @description Dynamic OG Image generator menggunakan Next.js ImageResponse.
 * Menghasilkan gambar 1200x630px dengan:
 * - Background gambar preview (dari Custom Link)
 * - Overlay gradient gelap
 * - Headline (title) besar dan jelas
 * - Domain badge
 * - Branding "MetaKlik" di pojok
 *
 * Route: /api/og?slug=xY7zP9
 */
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import prisma from '@/lib/server/db/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');

    if (!slug) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: 48,
              fontWeight: 'bold',
            }}
          >
            MetaKlik
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Fetch link data
    const link = await prisma.link.findUnique({
      where: { slug },
      include: { originalLink: true },
    });

    if (!link) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: 36,
            }}
          >
            Link Not Found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const title = link.title || link.originalLink.title || 'Untitled';
    const domain = link.originalLink.domain || 'metaklik.biz.id';
    const image = link.image || link.originalLink.image;

    // Truncate title jika terlalu panjang
    const displayTitle =
      title.length > 80 ? title.substring(0, 77) + '...' : title;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            backgroundColor: '#0f172a',
          }}
        >
          {/* Background Image (jika ada) */}
          {image && (
            <img
              src={image}
              alt=''
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
              }}
            />
          )}

          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,58,138,0.85) 50%, rgba(15,23,42,0.95) 100%)',
              display: 'flex',
            }}
          />

          {/* Content */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '60px',
            }}
          >
            {/* Top: Logo */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Meta
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#60a5fa',
                }}
              >
                Klik
              </span>
            </div>

            {/* Center: Title + Domain */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Domain Badge */}
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(96,165,250,0.2)',
                    border: '1px solid rgba(96,165,250,0.4)',
                    borderRadius: '9999px',
                    padding: '6px 20px',
                    color: '#93c5fd',
                    fontSize: 18,
                  }}
                >
                  {domain}
                </span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: displayTitle.length > 50 ? 40 : 52,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.2,
                  margin: 0,
                  maxWidth: '900px',
                }}
              >
                {displayTitle}
              </h1>
            </div>

            {/* Bottom: CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#2563eb',
                  borderRadius: '12px',
                  padding: '12px 28px',
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}
                >
                  Klik untuk membuka →
                </span>
              </div>
              <span style={{ color: '#64748b', fontSize: 16 }}>
                Powered by MetaKlik
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: unknown) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
