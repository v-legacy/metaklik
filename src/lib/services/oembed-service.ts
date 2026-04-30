/**
 * oEmbed Service
 * Handles metadata extraction for social media platforms using oEmbed API
 * 
 * Note: Instagram oEmbed requires Facebook App credentials
 * For production, set INSTAGRAM_ACCESS_TOKEN environment variable
 */

export interface OEmbedResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

export class OEmbedService {
  private static readonly OEMBED_ENDPOINTS = {
    // Instagram requires access token: https://graph.facebook.com/v18.0/instagram_oembed?url={url}&access_token={token}
    instagram: null, // Disabled - requires Facebook App credentials
    tiktok: 'https://www.tiktok.com/oembed',
    youtube: 'https://www.youtube.com/oembed',
    twitter: 'https://publish.twitter.com/oembed',
    vimeo: 'https://vimeo.com/api/oembed.json',
  };

  /**
   * Check if URL is from a supported social media platform
   */
  static isSocialMedia(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      
      return (
        hostname.includes('instagram.com') ||
        hostname.includes('tiktok.com') ||
        hostname.includes('youtube.com') ||
        hostname.includes('youtu.be') ||
        hostname.includes('twitter.com') ||
        hostname.includes('x.com') ||
        hostname.includes('vimeo.com')
      );
    } catch {
      return false;
    }
  }

  /**
   * Get platform name from URL
   */
  private static getPlatform(url: string): keyof typeof OEmbedService.OEMBED_ENDPOINTS | null {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      // Skip Instagram for now (requires access token)
      // if (hostname.includes('instagram.com')) return 'instagram';
      if (hostname.includes('tiktok.com')) return 'tiktok';
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube';
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter';
      if (hostname.includes('vimeo.com')) return 'vimeo';

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Extract metadata using oEmbed API
   */
  async extractMetadata(url: string): Promise<OEmbedResult | null> {
    const platform = OEmbedService.getPlatform(url);
    if (!platform) return null;

    const endpoint = OEmbedService.OEMBED_ENDPOINTS[platform];
    if (!endpoint) return null; // Platform not supported or requires credentials

    const oembedUrl = `${endpoint}?url=${encodeURIComponent(url)}&format=json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetaklikBot/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Determine type based on oEmbed response type
      let contentType: 'image' | 'video' | 'article' | 'website' = 'website';
      if (data.type === 'video') {
        contentType = 'video';
      } else if (data.type === 'photo') {
        contentType = 'image';
      } else if (platform === 'youtube' || platform === 'vimeo') {
        contentType = 'video';
      }

      return {
        title: data.title || data.author_name || OEmbedService.getPlatformName(platform),
        description: data.description || `${platform} content`,
        image: data.thumbnail_url || null,
        siteName: OEmbedService.getPlatformName(platform),
        type: contentType,
      };
    } catch (error) {
      console.error(`oEmbed extraction failed for ${platform}:`, error);
      return null;
    }
  }

  private static getPlatformName(platform: string): string {
    const names: Record<string, string> = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      twitter: 'Twitter',
      vimeo: 'Vimeo',
    };
    return names[platform] || platform;
  }
}
