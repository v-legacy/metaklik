/**
 * @file robots.ts
 * @description Konfigurasi robots.txt untuk MetaKlik.
 * Mengizinkan crawler sosial media (Facebook, Twitter, dll) mengakses shortlink
 * agar OG meta tags bisa dibaca dan preview card tampil di feed.
 */
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.metaklik.biz.id';

  return {
    rules: [
      {
        // Izinkan semua bot umum
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/auth/', '/api/v1/'],
      },
      {
        // Izinkan Facebook crawler secara eksplisit
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        // Izinkan Facebook catalog bot
        userAgent: 'Facebot',
        allow: '/',
      },
      {
        // Izinkan Twitter crawler
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        // Izinkan LinkedIn crawler
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      {
        // Izinkan Telegram crawler
        userAgent: 'TelegramBot',
        allow: '/',
      },
      {
        // Izinkan WhatsApp crawler
        userAgent: 'WhatsApp',
        allow: '/',
      },
      {
        // Izinkan Discord crawler
        userAgent: 'Discordbot',
        allow: '/',
      },
      {
        // Izinkan Slack crawler
        userAgent: 'Slackbot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
