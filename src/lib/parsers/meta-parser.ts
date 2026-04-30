/**
 * Meta Parser
 * Extracts metadata from HTML content
 */

import * as cheerio from 'cheerio';

export interface ParsedMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

export class MetaParser {
  private static readonly MAX_TITLE_LENGTH = 255;
  private static readonly MAX_DESCRIPTION_LENGTH = 512;

  /**
   * Parse HTML and extract metadata
   */
  parse(html: string, url: string): ParsedMetadata {
    try {
      const $ = cheerio.load(html);

      // Extract metadata with priority: OG > Twitter > Standard
      const og = this.extractOpenGraph($);
      const twitter = this.extractTwitterCard($);
      const standard = this.extractStandardMeta($);
      const htmlTitle = this.extractTitle($);

      // Debug logging
      console.log('Meta Parser Debug:', {
        ogImage: og.image,
        twitterImage: twitter.image,
        url: url
      });

      // Detect content type
      const ogType = $('meta[property="og:type"]').attr('content');
      let contentType: 'image' | 'video' | 'article' | 'website' = 'website';
      
      if (ogType === 'video' || ogType === 'video.other' || ogType === 'video.movie') {
        contentType = 'video';
      } else if (ogType === 'article') {
        contentType = 'article';
      }

      // Extract video URL
      const videoUrl = og.video || twitter.video || null;

      // Apply fallback chain
      const title = og.title || twitter.title || standard.title || htmlTitle || this.getDomainFromUrl(url);
      const description = og.description || twitter.description || standard.description || '';
      
      // Try to get image from meta tags first, then fallback to finding images in HTML
      let image = og.image || twitter.image || null;
      if (!image) {
        image = this.findImageInHtml($, url);
      }
      
      const siteName = og.siteName || null;

      const validatedImage = this.validateImageUrl(image, url);
      console.log('Validated image URL:', validatedImage);

      return {
        title: this.sanitizeText(title, MetaParser.MAX_TITLE_LENGTH),
        description: this.sanitizeText(description, MetaParser.MAX_DESCRIPTION_LENGTH),
        image: validatedImage,
        siteName: siteName ? this.sanitizeText(siteName, MetaParser.MAX_TITLE_LENGTH) : null,
        video: this.validateVideoUrl(videoUrl, url),
        type: contentType,
      };
    } catch (error) {
      console.error('Meta parser error:', error);
      // Graceful fallback on parse error
      return {
        title: this.getDomainFromUrl(url),
        description: '',
        image: null,
        siteName: null,
      };
    }
  }

  private extractOpenGraph($: cheerio.CheerioAPI): Partial<ParsedMetadata> {
    return {
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      siteName: $('meta[property="og:site_name"]').attr('content'),
      video: $('meta[property="og:video"]').attr('content') || 
             $('meta[property="og:video:url"]').attr('content') ||
             $('meta[property="og:video:secure_url"]').attr('content'),
    };
  }

  private extractTwitterCard($: cheerio.CheerioAPI): Partial<ParsedMetadata> {
    return {
      title: $('meta[name="twitter:title"]').attr('content'),
      description: $('meta[name="twitter:description"]').attr('content'),
      image: $('meta[name="twitter:image"]').attr('content'),
      video: $('meta[name="twitter:player:stream"]').attr('content') ||
             $('meta[name="twitter:player"]').attr('content'),
    };
  }

  private extractStandardMeta($: cheerio.CheerioAPI): Partial<ParsedMetadata> {
    return {
      title: $('meta[name="title"]').attr('content'),
      description: $('meta[name="description"]').attr('content'),
    };
  }

  private extractTitle($: cheerio.CheerioAPI): string | null {
    const title = $('title').first().text();
    return title ? title.trim() : null;
  }

  /**
   * Find image in HTML body as fallback
   */
  private findImageInHtml($: cheerio.CheerioAPI, baseUrl: string): string | null {
    // Try to find images with common patterns
    const selectors = [
      'img[itemprop="image"]',
      'img.product-image',
      'img.main-image',
      'img[data-src]',
      'img[src]',
    ];

    for (const selector of selectors) {
      const img = $(selector).first();
      if (img.length) {
        const src = img.attr('data-src') || img.attr('src');
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          return src;
        }
      }
    }

    return null;
  }

  private sanitizeText(text: string, maxLength: number): string {
    if (!text) return '';

    // Remove HTML tags
    let sanitized = text.replace(/<[^>]*>/g, '');

    // Remove script content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Truncate to max length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + '...';
    }

    return sanitized;
  }

  /**
   * Validate and resolve image URL
   * Handles both absolute and relative URLs
   * 
   * @param url - Image URL from meta tags (can be absolute or relative)
   * @param baseUrl - Base URL of the page being parsed
   * @returns Absolute image URL or null if invalid
   * 
   * @example
   * // Absolute URL
   * validateImageUrl('https://example.com/image.jpg', 'https://example.com')
   * // Returns: 'https://example.com/image.jpg'
   * 
   * @example
   * // Protocol-relative URL
   * validateImageUrl('//cdn.example.com/image.jpg', 'https://example.com')
   * // Returns: 'https://cdn.example.com/image.jpg'
   * 
   * @example
   * // Path-relative URL
   * validateImageUrl('/images/product.jpg', 'https://example.com/products/123')
   * // Returns: 'https://example.com/images/product.jpg'
   */
  private validateImageUrl(url: string | undefined | null, baseUrl: string): string | null {
    if (!url) return null;

    try {
      // If it's already an absolute URL, validate and return
      new URL(url);
      return url;
    } catch {
      // If it's a relative URL, try to resolve it against the base URL
      try {
        const absoluteUrl = new URL(url, baseUrl);
        return absoluteUrl.href;
      } catch {
        return null;
      }
    }
  }

  /**
   * Validate and resolve video URL
   * Handles both absolute and relative URLs
   * 
   * @param url - Video URL from meta tags (can be absolute or relative)
   * @param baseUrl - Base URL of the page being parsed
   * @returns Absolute video URL or null if invalid
   * 
   * @example
   * // Absolute URL
   * validateVideoUrl('https://example.com/video.mp4', 'https://example.com')
   * // Returns: 'https://example.com/video.mp4'
   * 
   * @example
   * // Protocol-relative URL
   * validateVideoUrl('//cdn.example.com/video.mp4', 'https://example.com')
   * // Returns: 'https://cdn.example.com/video.mp4'
   */
  private validateVideoUrl(url: string | undefined | null, baseUrl: string): string | null {
    if (!url) return null;

    try {
      // If it's already an absolute URL, validate and return
      new URL(url);
      return url;
    } catch {
      // If it's a relative URL, try to resolve it against the base URL
      try {
        const absoluteUrl = new URL(url, baseUrl);
        return absoluteUrl.href;
      } catch {
        return null;
      }
    }
  }

  private getDomainFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return 'Unknown';
    }
  }
}
