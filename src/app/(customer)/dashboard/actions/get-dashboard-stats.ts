'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/server/db/prisma';

export type DashboardStats = {
  activeLinksCount: number;
  totalLinksCount: number;
  totalClicksCount: number;
  topLinks: { title: string; clicks: number }[];
  topReferrers: { referrer: string; clicks: number }[];
  topCountries: { country: string; clicks: number }[];
  activityData: { date: string; desktop: number; mobile: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    activeLinksCount: 0,
    totalLinksCount: 0,
    totalClicksCount: 0,
    topLinks: [],
    topReferrers: [],
    topCountries: [],
    activityData: [],
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return defaultStats;
    }

    const userId = (session.user as any).id;

    // 1. KPI Counts
    const activeLinksCount = await prisma.link.count({
      where: { userId, isActive: true },
    });
    
    const totalLinksCount = await prisma.link.count({
      where: { userId },
    });

    const totalClicksResult = await prisma.link.aggregate({
      where: { userId },
      _sum: { totalClicks: true }
    });
    const totalClicksCount = totalClicksResult._sum.totalClicks || 0;

    // Tarik semua Link milik user untuk referensi ID dan Judul
    const userLinks = await prisma.link.findMany({
      where: { userId },
      select: { id: true, title: true, slug: true, originalLink: { select: { title: true } } },
    });
    const linkIds = userLinks.map((l) => l.id);

    let topLinks: { title: string; clicks: number }[] = [];
    let topReferrers: { referrer: string; clicks: number }[] = [];
    let topCountries: { country: string; clicks: number }[] = [];
    let activityData: { date: string; desktop: number; mobile: number }[] = [];

    if (linkIds.length > 0) {
      // 2. Top Performing Links (Hanya dari platform Sosial Media / Non-Direct)
      const smLinksData = await prisma.linkAnalytics.groupBy({
        by: ['linkId'],
        where: { 
          linkId: { in: linkIds },
          referrer: { notIn: ['Direct'] } 
        },
        _sum: { clicks: true },
        orderBy: { _sum: { clicks: 'desc' } },
        take: 5,
      });

      topLinks = smLinksData.map(item => {
        const linkDetail = userLinks.find(l => l.id === item.linkId);
        return {
          title: linkDetail?.title || linkDetail?.originalLink?.title || linkDetail?.slug || 'Untitled',
          clicks: item._sum.clicks || 0
        };
      });

      // 3. Top Referrers
      const referrersData = await prisma.linkAnalytics.groupBy({
        by: ['referrer'],
        where: { linkId: { in: linkIds } },
        _sum: { clicks: true },
        orderBy: { _sum: { clicks: 'desc' } },
        take: 5,
      });

      topReferrers = referrersData.map((item) => ({
        referrer: item.referrer,
        clicks: item._sum.clicks || 0,
      }));

      // 4. Top Countries
      const countriesData = await prisma.linkAnalytics.groupBy({
        by: ['country'],
        where: { 
          linkId: { in: linkIds },
          country: { notIn: ['Unknown', ''] }
        },
        _sum: { clicks: true },
        orderBy: { _sum: { clicks: 'desc' } },
        take: 5,
      });

      topCountries = countriesData.map((item) => ({
        country: item.country,
        clicks: item._sum.clicks || 0,
      }));

      // 5. Activity Data (90 Hari Terakhir)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      ninetyDaysAgo.setHours(0, 0, 0, 0);

      const rawActivity = await prisma.linkAnalytics.groupBy({
        by: ['date', 'device'],
        where: {
          linkId: { in: linkIds },
          date: { gte: ninetyDaysAgo }
        },
        _sum: { clicks: true }
      });

      const activityMap: Record<string, { date: string; desktop: number; mobile: number }> = {};
      
      // Inisialisasi 90 hari kosong
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        activityMap[dateStr] = { date: dateStr, desktop: 0, mobile: 0 };
      }

      // Isi dengan data dari DB
      rawActivity.forEach(row => {
        const dateStr = row.date.toISOString().split('T')[0];
        if (activityMap[dateStr]) {
          const dev = row.device.toLowerCase();
          if (dev === 'desktop') {
            activityMap[dateStr].desktop += row._sum.clicks || 0;
          } else {
            activityMap[dateStr].mobile += row._sum.clicks || 0;
          }
        }
      });

      activityData = Object.values(activityMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    return {
      activeLinksCount,
      totalLinksCount,
      totalClicksCount,
      topLinks,
      topReferrers,
      topCountries,
      activityData,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return defaultStats;
  }
}
