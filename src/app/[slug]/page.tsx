/**
 * @file page.tsx
 * @description Halaman publik shortlink — inti dari produk MetaKlik.
 * Route: /[slug] (e.g. metaklik.biz.id/xY7zP9)
 *
 * Fungsi:
 * 1. generateMetadata() → Menghasilkan custom OG meta tags untuk crawler sosmed
 * 2. Server Component → Render halaman interstitial + pass data ke RedirectHandler
 * 3. Guard: slug tidak ditemukan → 404, link inactive → halaman khusus
 */
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/server/db/prisma';
import InterstitialPage from './_components/InterstitialPage';
import RedirectHandler from './_components/RedirectHandler';

/**
 * Truncate teks ke panjang optimal untuk OG tags.
 * Memotong di batas kata terdekat dan menambahkan ellipsis.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength * 0.6 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

/**
 * Optimasi panjang title agar 50-60 karakter.
 * Jika terlalu pendek, tambahkan suffix " — via MetaKlik".
 */
function optimizeTitle(title: string): string {
  if (title.length >= 50) return truncateText(title, 60);
  const suffix = ' — via MetaKlik';
  if (title.length + suffix.length <= 60) return title + suffix;
  return title;
}

interface SlugPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Mengambil data Custom Link dari database berdasarkan slug.
 * Digunakan oleh generateMetadata() dan page component.
 */
async function getLinkBySlug(slug: string) {
  try {
    const link = await prisma.link.findUnique({
      where: { slug },
      include: { originalLink: true },
    });
    return link;
  } catch {
    return null;
  }
}

/**
 * Deteksi apakah User-Agent adalah mobile device.
 */
function detectMobile(userAgent: string): {
  isMobile: boolean;
  isAndroid: boolean;
} {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(
    userAgent
  );
  const isAndroid = /Android/i.test(userAgent);
  return { isMobile, isAndroid };
}

/**
 * generateMetadata — Next.js built-in untuk menghasilkan meta tags.
 * Crawler sosmed (Facebook, Twitter, WhatsApp) akan membaca meta tags ini
 * dan menampilkan preview card yang sudah di-custom oleh user.
 */
export async function generateMetadata({
  params,
  searchParams,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLinkBySlug(slug);

  if (!link) {
    return {
      title: 'Link Not Found - MetaKlik',
      description: 'The link you are looking for does not exist.',
    };
  }

  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'https://www.metaklik.biz.id';
  };
  const baseUrl = getBaseUrl();
  const shortUrl = `${baseUrl}/${link.slug}`;

  // Optimasi panjang title (50-60 chars) dan description (110-160 chars)
  const rawTitle = link.title || link.originalLink.title || 'MetaKlik';
  const rawDescription = link.description || link.originalLink.description || 'Shared via MetaKlik';
  const ogTitle = optimizeTitle(rawTitle);
  const ogDescription = truncateText(rawDescription, 155);

  // Prioritaskan gambar custom (hasil crop/upload) langsung tanpa overlay
  // Jika tidak ada gambar sama sekali, fall back ke gambar kosong
  let finalOgImage = '';
  
  if (link.image) {
    // Jika user mengupload gambar custom (Supabase URL), gunakan langsung
    finalOgImage = link.image;
  } else if (link.originalLink.image) {
    // Jika hanya ada gambar bawaan original, gunakan dynamic OG generator untuk merapikan
    finalOgImage = `${baseUrl}/api/og?slug=${link.slug}`;
  } else {
    // Fallback default image jika diinginkan
    finalOgImage = `${baseUrl}/api/og?slug=${link.slug}`;
  }

  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      type: 'website',
      url: shortUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: 'MetaKlik',
      images: [
        {
          url: finalOgImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: finalOgImage ? [finalOgImage] : [],
    },
  };
}

/**
 * Page Component — Halaman publik shortlink.
 */
export default async function SlugPage({ params, searchParams }: SlugPageProps) {
  const { slug } = await params;
  
  // Await searchParams and extract 'ref' or 'utm_source'
  const resolvedSearchParams = await searchParams;
  const rawRef = resolvedSearchParams.ref || resolvedSearchParams.utm_source;
  const sourceRef = Array.isArray(rawRef) ? rawRef[0] : rawRef || undefined;
  const link = await getLinkBySlug(slug);

  // Slug tidak ditemukan di database
  if (!link) {
    notFound();
  }

  // Link tidak aktif
  if (!link.isActive) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center'>
          <div className='mb-4'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto'>
              <svg
                className='w-8 h-8 text-red-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                />
              </svg>
            </div>
          </div>
          <h2 className='text-xl font-bold text-slate-900 mb-2'>
            Link Tidak Aktif
          </h2>
          <p className='text-sm text-slate-500'>
            Link ini telah dinonaktifkan oleh pemiliknya.
          </p>
        </div>
        <p className='mt-8 text-xs text-slate-500'>
          Powered by{' '}
          <a href='/' className='text-blue-400 hover:text-blue-300'>
            MetaKlik
          </a>
        </p>
      </div>
    );
  }

  // Deteksi device dari User-Agent
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const { isMobile, isAndroid } = detectMobile(userAgent);

  const domain = link.originalLink.domain;
  const originalUrl = link.originalLink.url;

  return (
    <InterstitialPage
      title={link.title || link.originalLink.title || 'Untitled'}
      description={
        link.description || link.originalLink.description || 'Shared via MetaKlik'
      }
      image={link.image || link.originalLink.image}
      domain={domain || 'unknown'}
      originalUrl={originalUrl}
    >
      <RedirectHandler
        originalUrl={originalUrl}
        domain={domain}
        linkId={link.id}
        isMobile={isMobile}
        isAndroid={isAndroid}
        sourceRef={sourceRef}
      />
    </InterstitialPage>
  );
}
