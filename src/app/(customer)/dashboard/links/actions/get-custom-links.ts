/**
 * @file get-custom-links.ts
 * @description Server function untuk mengambil daftar Custom Links milik satu Original Link.
 * Digunakan oleh halaman detail `/dashboard/links/[id]`.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/server/db/prisma';
import { OriginalLinkItem, CustomLinkDetail } from '../types/link-types';

/** Return type dari getCustomLinks */
export type GetCustomLinksResult = {
  originalLink: OriginalLinkItem;
  customLinks: CustomLinkDetail[];
};

/**
 * Mengambil detail Original Link beserta semua Custom Link-nya.
 * Memvalidasi bahwa Original Link memiliki Custom Link milik user yang login.
 * @param originalLinkId - ID dari Original Link
 * @returns Object berisi data originalLink dan array customLinks, atau null jika tidak ditemukan/tidak diizinkan.
 */
export async function getCustomLinks(
  originalLinkId: string
): Promise<GetCustomLinksResult | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return null;
    }

    const userId = (session.user as any).id;

    // Ambil Original Link beserta Custom Links milik user
    const dbOriginalLink = await prisma.originalLink.findUnique({
      where: { id: originalLinkId },
      include: {
        links: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { links: { where: { userId } } },
        },
      },
    });

    if (!dbOriginalLink) {
      return null;
    }

    // Pastikan user memiliki setidaknya 1 custom link di original link ini
    if (dbOriginalLink._count.links === 0) {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Format tanggal ke YYYY/MM/DD
    const formatDate = (date: Date): string => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };

    const originalLink: OriginalLinkItem = {
      id: dbOriginalLink.id,
      url: dbOriginalLink.url,
      domain: dbOriginalLink.domain,
      title: dbOriginalLink.title,
      image: dbOriginalLink.image,
      totalCustomLinks: dbOriginalLink._count.links,
      createdAt: formatDate(dbOriginalLink.createdAt),
    };

    const customLinks: CustomLinkDetail[] = dbOriginalLink.links.map((link: typeof dbOriginalLink.links[number]) => ({
      id: link.id,
      slug: link.slug,
      title: link.title,
      description: link.description,
      image: link.image,
      totalClicks: link.totalClicks,
      isActive: link.isActive,
      createdAt: formatDate(link.createdAt),
      generateUrl: `${baseUrl}/${link.slug}`,
      originalUrl: dbOriginalLink.url,
      originalDomain: dbOriginalLink.domain,
      updatedAt: formatDate(link.updatedAt),
    }));

    return { originalLink, customLinks };
  } catch (error: unknown) {
    console.error('Error fetching custom links:', error);
    return null;
  }
}
