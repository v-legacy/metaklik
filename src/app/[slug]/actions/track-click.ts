/**
 * @file track-click.ts
 * @description Server Action untuk mencatat klik pada shortlink.
 * Melakukan upsert ke LinkAnalytics (daily bucket) dan increment totalClicks pada Link.
 * Route ini PUBLIK — tidak memerlukan autentikasi.
 *
 * @example
 * await trackClick({
 *   linkId: 'cm2t6x...',
 *   referrer: 'facebook.com',
 *   userAgent: 'Mozilla/5.0...',
 * });
 */
'use server';

import prisma from '@/lib/server/db/prisma';

type TrackClickInput = {
  linkId: string;
  referrer?: string;
  userAgent?: string;
  sourceRef?: string;
};

/**
 * Mendeteksi apakah User-Agent adalah bot/crawler sosial media.
 * Jika ya, kita tidak akan mencatatnya sebagai klik pengunjung.
 */
function isBotUserAgent(ua: string): boolean {
  const botKeywords = [
    'bot', 'crawler', 'spider', 'facebookexternalhit', 'WhatsApp',
    'Twitterbot', 'LinkedInBot', 'TelegramBot', 'Facebot', 'Discordbot',
    'Slackbot', 'googlebot', 'bingbot', 'yandex', 'baiduspider', 'Mediapartners-Google'
  ];
  const lowerUA = ua.toLowerCase();
  return botKeywords.some(keyword => lowerUA.includes(keyword.toLowerCase()));
}

/**
 * Mapping parameter manual ?ref=wa menjadi nama platform yang mudah dibaca.
 */
function mapSourceRefToPlatform(ref: string): string {
  const map: Record<string, string> = {
    wa: 'WhatsApp',
    ig: 'Instagram',
    fb: 'Facebook',
    tw: 'Twitter',
    x: 'X',
    tt: 'TikTok',
    li: 'LinkedIn',
    tg: 'Telegram',
    line: 'LINE'
  };
  return map[ref.toLowerCase()] || ref;
}

/**
 * Parsing User-Agent string untuk mendapatkan info browser, OS, dan device type.
 * Menggunakan regex sederhana (tanpa library external) agar ringan.
 */
function parseUserAgent(ua: string): {
  browser: string;
  os: string;
  device: string;
} {
  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';

  // OS detection
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  // Device type detection
  let device = 'Desktop';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device = 'Mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}

/**
 * Mengekstrak domain dari referrer URL.
 * @example extractReferrerDomain('https://www.facebook.com/page') → 'facebook.com'
 */
function extractReferrerDomain(referrer: string): string {
  if (!referrer || referrer === '') return 'Direct';
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
}

/**
 * Mencatat klik pada shortlink.
 * - Memfilter trafik bot/sosmed.
 * - Upsert ke LinkAnalytics berdasarkan composite key (daily bucket per dimensi)
 * - Increment totalClicks pada Link
 *
 * @param input - Data klik yang akan dicatat
 */
export async function trackClick(input: TrackClickInput): Promise<void> {
  try {
    const { linkId, referrer = '', userAgent = '', sourceRef } = input;

    // Jangan catat klik jika yang mengakses adalah bot (contoh: WhatsApp Preview Crawler)
    if (isBotUserAgent(userAgent)) {
      return;
    }

    // Parse User-Agent
    const { browser, os, device } = parseUserAgent(userAgent);

    // Extract referrer domain
    let finalReferrer = 'Direct';
    if (sourceRef) {
      finalReferrer = mapSourceRefToPlatform(sourceRef);
    } else {
      finalReferrer = extractReferrerDomain(referrer);
    }

    // Tanggal hari ini (tanpa jam, menit, detik) untuk daily bucket
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert analytics (daily bucket per dimension)
    await prisma.linkAnalytics.upsert({
      where: {
        unique_analytics_dimension: {
          linkId,
          date: today,
          referrer: finalReferrer,
          browser,
          os,
          device,
          country: 'Unknown', // TODO: Implement GeoIP lookup
        },
      },
      update: {
        clicks: { increment: 1 },
      },
      create: {
        linkId,
        date: today,
        referrer: finalReferrer,
        browser,
        os,
        device,
        country: 'Unknown',
        clicks: 1,
      },
    });

    // Increment total clicks on the Link
    await prisma.link.update({
      where: { id: linkId },
      data: { totalClicks: { increment: 1 } },
    });
  } catch (error: unknown) {
    // Log tapi jangan throw — analytics failure tidak boleh mengganggu redirect
    console.error('Error tracking click:', error);
  }
}
