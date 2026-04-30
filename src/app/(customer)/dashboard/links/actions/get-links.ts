/**
 * @file get-links.ts
 * @description Server function untuk mengambil daftar Original Links milik user.
 * Digunakan oleh LinkTableData.tsx sebagai data source tabel utama.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/server/db/prisma';
import { OriginalLinkItem } from '../types/link-types';

/**
 * Mengambil semua Original Link yang dimiliki oleh user yang sedang login.
 * Original Link diambil berdasarkan relasi: OriginalLink → Link → User.
 * @returns Array of OriginalLinkItem, atau array kosong jika gagal/tidak terautentikasi.
 */
export async function getOriginalLinks(): Promise<OriginalLinkItem[]> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return [];
    }

    const userId = (session.user as any).id;

    // Ambil semua Original Link yang memiliki setidaknya 1 Custom Link milik user
    const dbOriginalLinks = await prisma.originalLink.findMany({
      where: {
        links: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { links: { where: { userId } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format tanggal ke YYYY/MM/DD
    const formatDate = (date: Date): string => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    };

    const linksData: OriginalLinkItem[] = dbOriginalLinks.map((ol: typeof dbOriginalLinks[number]) => ({
      id: ol.id,
      url: ol.url,
      domain: ol.domain,
      title: ol.title,
      image: ol.image,
      totalCustomLinks: ol._count.links,
      createdAt: formatDate(ol.createdAt),
    }));

    return linksData;
  } catch (error: unknown) {
    console.error('Error fetching original links:', error);
    return [];
  }
}
