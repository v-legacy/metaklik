/**
 * Iframely Service
 * Professional metadata extraction service for all platforms including Instagram/TikTok
 * https://iframely.com
 */

export interface IframelyMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  author?: string;
  date?: string;
}

export class IframelyService {
  private static readonly API_URL = 'https://cdn.iframe.ly/api/iframely';
  private static readonly API_KEY = process.env.IFRAMELY_API_KEY;

  /**
   * Check if Iframely is configured
   */
  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  /**
   * Extract metadata using Iframely API
   */
  static async extractMetadata(url: string): Promise<IframelyMetadata | null> {
    if (!this.API_KEY) {
      console.warn('Iframely API key not configured. Set IFRAMELY_API_KEY environment variable.');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&api_key=${this.API_KEY}&iframe=1&omit_script=1`;

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Iframely API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Extract metadata from Iframely response
      const title = data.meta?.title || data.title || null;
      const description = data.meta?.description || data.description || null;
      
      // Get best quality image
      let image = null;
      if (data.links?.thumbnail && data.links.thumbnail.length > 0) {
        // Sort by size and get largest
        const thumbnails = data.links.thumbnail.sort((a: any, b: any) => {
          const aSize = (a.media?.width || 0) * (a.media?.height || 0);
          const bSize = (b.media?.width || 0) * (b.media?.height || 0);
          return bSize - aSize;
        });
        image = thumbnails[0].href;
      } else if (data.links?.icon && data.links.icon.length > 0) {
        image = data.links.icon[0].href;
      }

      const siteName = data.meta?.site || data.meta?.author || null;
      const author = data.meta?.author || data.rel?.find((r: string) => r === 'author') || null;
      const date = data.meta?.date || null;

      if (!title) {
        return null;
      }

      return {
        title,
        description: description || '',
        image,
        siteName,
        author,
        date,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Iframely request timeout');
      } else {
        console.error('Iframely extraction failed:', error);
      }
      return null;
    }
  }

  /**
   * Get Iframely embed HTML (bonus feature)
   */
  static async getEmbedHtml(url: string): Promise<string | null> {
    if (!this.API_KEY) {
      return null;
    }

    try {
      const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&api_key=${this.API_KEY}&iframe=1`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Get embed HTML if available
      if (data.html) {
        return data.html;
      }

      return null;
    } catch (error) {
      console.error('Iframely embed HTML fetch failed:', error);
      return null;
    }
  }
}
