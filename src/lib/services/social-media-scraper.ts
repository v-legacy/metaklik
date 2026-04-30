/**
 * Social Media Scraper
 * Specialized scraper for Instagram, TikTok, and other JS-heavy platforms
 */

export interface SocialMediaMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string;
  author?: string;
  videoUrl?: string;
  type?: 'image' | 'video' | 'article' | 'website';
}

export class SocialMediaScraper {
  /**
   * Extract metadata from Instagram
   */
  static async extractInstagram(url: string): Promise<SocialMediaMetadata | null> {
    try {
      // Strategy 1: Try to get post ID and use Instagram's public API
      const postId = this.extractInstagramPostId(url);
      if (!postId) return null;

      // Fetch the page with proper headers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const html = await response.text();

      // Try to extract from meta tags (sometimes available in initial HTML)
      const ogTitle = this.extractMetaTag(html, 'og:title');
      const ogDescription = this.extractMetaTag(html, 'og:description');
      const ogImage = this.extractMetaTag(html, 'og:image');

      // Try to extract from JSON-LD
      const jsonLd = this.extractJsonLd(html);
      
      if (ogTitle || jsonLd) {
        return {
          title: ogTitle || jsonLd?.headline || 'Instagram Post',
          description: ogDescription || jsonLd?.description || '',
          image: ogImage || jsonLd?.image || null,
          siteName: 'Instagram',
          author: jsonLd?.author?.name,
          type: 'image', // Instagram posts are typically images
        };
      }

      return null;
    } catch (error) {
      console.error('Instagram extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract metadata from TikTok
   */
  static async extractTikTok(url: string): Promise<SocialMediaMetadata | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // TikTok sometimes provides meta tags in initial HTML
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const html = await response.text();

      // Extract from meta tags
      const ogTitle = this.extractMetaTag(html, 'og:title');
      const ogDescription = this.extractMetaTag(html, 'og:description');
      const ogImage = this.extractMetaTag(html, 'og:image');
      const ogVideo = this.extractMetaTag(html, 'og:video');

      // Try to extract from JSON-LD
      const jsonLd = this.extractJsonLd(html);

      if (ogTitle || jsonLd) {
        return {
          title: ogTitle || jsonLd?.headline || 'TikTok Video',
          description: ogDescription || jsonLd?.description || '',
          image: ogImage || jsonLd?.thumbnailUrl || null,
          siteName: 'TikTok',
          author: jsonLd?.author?.name,
          videoUrl: ogVideo || jsonLd?.contentUrl,
          type: 'video', // TikTok is always video
        };
      }

      return null;
    } catch (error) {
      console.error('TikTok extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract Instagram/Threads post ID from URL
   */
  private static extractInstagramPostId(url: string): string | null {
    const match = url.match(/\/(?:p|post)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract meta tag content from HTML
   */
  private static extractMetaTag(html: string, property: string): string | null {
    // Try property attribute (Open Graph)
    const propertyRegex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    let match = html.match(propertyRegex);
    if (match) return match[1];

    // Try name attribute (Twitter Cards)
    const nameRegex = new RegExp(
      `<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i'
    );
    match = html.match(nameRegex);
    if (match) return match[1];

    // Try reversed order
    const reversedRegex = new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
      'i'
    );
    match = html.match(reversedRegex);
    return match ? match[1] : null;
  }

  /**
   * Extract JSON-LD structured data from HTML
   */
  private static extractJsonLd(html: string): any {
    try {
      const jsonLdRegex =
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
      const matches = Array.from(html.matchAll(jsonLdRegex));

      for (const match of matches) {
        try {
          const data = JSON.parse(match[1]);
          if (data['@type'] === 'VideoObject' || data['@type'] === 'SocialMediaPosting') {
            return data;
          }
        } catch {
          continue;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if URL is Instagram or Threads
   */
  static isInstagram(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname;
      return host.includes('instagram.com') || host.includes('threads.net') || host.includes('threads.com');
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is TikTok
   */
  static isTikTok(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  }
}
