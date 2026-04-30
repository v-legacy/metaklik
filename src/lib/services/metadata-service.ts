/**
 * Metadata Service
 * Orchestrates URL validation, HTML fetching, and metadata parsing
 */

import { UrlValidator } from '../validators/url-validator';
import { HtmlFetcher } from '../fetchers/html-fetcher';
import { MetaParser } from '../parsers/meta-parser';
import { OEmbedService } from './oembed-service';
import { SocialMediaScraper } from './social-media-scraper';
import { MicrolinkService } from './microlink-service';

export interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  displayUrl?: string | null;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

export interface MetadataError {
  error: string;
  code: 'INVALID_URL' | 'UNREACHABLE' | 'TIMEOUT' | 'PARSE_ERROR' | 'UNKNOWN';
}

export class MetadataService {
  private validator: UrlValidator;
  private fetcher: HtmlFetcher;
  private parser: MetaParser;
  private oembedService: OEmbedService;

  constructor() {
    this.validator = new UrlValidator();
    this.fetcher = new HtmlFetcher();
    this.parser = new MetaParser();
    this.oembedService = new OEmbedService();
  }

  /**
   * Extract metadata from a URL
   */
  async extractMetadata(url: string): Promise<MetadataResult | MetadataError> {
    // Step 1: Validate URL
    const validation = this.validator.validate(url);
    if (!validation.valid) {
      return {
        error: validation.error || 'Invalid URL',
        code: 'INVALID_URL',
      };
    }

    const normalizedUrl = validation.normalizedUrl!;

    // Step 2: For Instagram/TikTok/Facebook/Twitter, try Microlink first
    if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
      try {
        const microlinkResult = await MicrolinkService.extractMetadata(normalizedUrl);
        if (microlinkResult && microlinkResult.title) {
          console.log('ini microlink', microlinkResult);

          return {
            title: microlinkResult.title,
            description: microlinkResult.description,
            image: microlinkResult.image,
            siteName: microlinkResult.siteName,
            url: normalizedUrl,
            displayUrl: this.extractDomain(normalizedUrl),
            video: microlinkResult.video,
            type: microlinkResult.type,
          };
        }
      } catch (error) {
        console.log('Microlink failed, trying other methods');
      }
    }

    // Step 3: Try specialized social media scrapers (Instagram, TikTok) as fallback
    const isInstagram = SocialMediaScraper.isInstagram(normalizedUrl);
    const isTikTok = SocialMediaScraper.isTikTok(normalizedUrl);
    if (isInstagram) {
      try {
        const result = await SocialMediaScraper.extractInstagram(normalizedUrl);
        console.log('ini instagram,threads,tiktok', result);

        if (result) {
          return {
            title: result.title,
            description: result.description,
            image: result.image,
            siteName: result.siteName,
            url: normalizedUrl,
            displayUrl: this.extractDomain(normalizedUrl),
            type: result.type,
          };
        }
      } catch (error) {
        console.log('Instagram scraper failed, trying fallback');
      }
    }

    if (isTikTok) {
      try {
        const result = await SocialMediaScraper.extractTikTok(normalizedUrl);
        if (result) {
          console.log('ini tiktok', result);
          return {
            title: result.title,
            description: result.description,
            image: result.image,
            siteName: result.siteName,
            url: normalizedUrl,
            displayUrl: this.extractDomain(normalizedUrl),
            type: result.type,
          };
        }
      } catch (error) {
        console.log('TikTok scraper failed, trying fallback');
      }
    }

    // Step 4: Try oEmbed for other social media (YouTube, Vimeo, Twitter)
    if (OEmbedService.isSocialMedia(normalizedUrl)) {
      try {
        const oembedResult = await this.oembedService.extractMetadata(normalizedUrl);
        if (oembedResult) {
          console.log('ini oembed', oembedResult);

          return {
            title: oembedResult.title,
            description: oembedResult.description,
            image: oembedResult.image,
            siteName: oembedResult.siteName,
            url: normalizedUrl,
            displayUrl: this.extractDomain(normalizedUrl),
            type: oembedResult.type,
          };
        }
      } catch (error) {
        console.log('oEmbed failed, falling back to HTML parsing');
      }
    }

    // Step 5: Fetch HTML (fallback or for non-social media)
    const fetchResult = await this.fetcher.fetch(normalizedUrl);
    if ('error' in fetchResult) {
      return this.mapFetchError(fetchResult);
    }

    // Step 6: Parse metadata
    try {
      const metadata = this.parser.parse(fetchResult.html, fetchResult.finalUrl);
      console.log('ini non-socialmedia', metadata);

      return {
        title: metadata.title || this.getDomainFromUrl(fetchResult.finalUrl),
        description: metadata.description || '',
        image: metadata.image,
        siteName: metadata.siteName,
        url: fetchResult.finalUrl,
        displayUrl: this.extractDomain(fetchResult.finalUrl),
        video: metadata.video,
        type: metadata.type,
      };
    } catch (error) {
      return {
        error: 'Failed to parse metadata',
        code: 'PARSE_ERROR',
      };
    }
  }

  private mapFetchError(fetchError: { error: string; statusCode?: number }): MetadataError {
    const errorMessage = fetchError.error.toLowerCase();

    if (errorMessage.includes('timeout')) {
      return {
        error: fetchError.error,
        code: 'TIMEOUT',
      };
    }

    if (fetchError.statusCode && fetchError.statusCode >= 400) {
      return {
        error: fetchError.error,
        code: 'UNREACHABLE',
      };
    }

    return {
      error: fetchError.error,
      code: 'UNKNOWN',
    };
  }

  private getDomainFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Extract clean domain from URL (removes www.)
   */
  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
}
