/**
 * Microlink Service
 * Free tier: 50 requests/day (no API key needed)
 * Paid: $9/month for 10,000 requests
 * https://microlink.io
 */

export interface MicrolinkMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  author?: string;
  date?: string;
  logo?: string;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

export class MicrolinkService {
  private static readonly API_URL = 'https://api.microlink.io';
  private static readonly TIMEOUT = 10000; // 10 seconds

  /**
   * Extract metadata using Microlink API
   * No API key needed for free tier (50 requests/day)
   */
  static async extractMetadata(url: string): Promise<MicrolinkMetadata | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&meta=true`;

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetaklikBot/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Microlink API error:', response.status);
        return null;
      }

      const result = await response.json();

      if (result.status !== 'success' || !result.data) {
        console.error('Microlink API returned error:', result);
        return null;
      }

      const data = result.data;

      // Detect content type
      let contentType: 'image' | 'video' | 'article' | 'website' = 'website';
      let videoUrl: string | null = null;

      // Check for video
      if (data.video) {
        contentType = 'video';
        videoUrl = data.video.url || data.video;
      }
      // Check if it's a video platform
      else if (
        data.publisher?.toLowerCase().includes('youtube') ||
        data.publisher?.toLowerCase().includes('vimeo') ||
        data.publisher?.toLowerCase().includes('tiktok')
      ) {
        contentType = 'video';
      }
      // Check Open Graph type
      else if (data.type === 'video') {
        contentType = 'video';
      }
      // Check if it's an article
      else if (data.type === 'article') {
        contentType = 'article';
      }

      return {
        title: data.title || '',
        description: data.description || '',
        image: data.image?.url || data.screenshot?.url || null,
        siteName: data.publisher || this.extractDomain(url),
        author: data.author,
        date: data.date,
        logo: data.logo?.url,
        video: videoUrl,
        type: contentType,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Microlink API timeout');
      } else {
        console.error('Microlink API error:', error);
      }
      return null;
    }
  }

  /**
   * Check if Microlink should be used for this URL
   * Use for Instagram, TikTok, and other JS-heavy sites
   */
  static shouldUseMicrolink(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      return (
        hostname.includes('instagram.com') ||
        hostname.includes('tiktok.com') ||
        hostname.includes('facebook.com') ||
        hostname.includes('twitter.com') ||
        hostname.includes('x.com') ||
        hostname.includes('threads.net') ||
        hostname.includes('threads.com') ||
        hostname.includes('blibli.com') ||
        hostname.includes('olx.co.id') ||
        hostname.includes('pinterest.')
      );
    } catch {
      return false;
    }
  }

  private static extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }
}
