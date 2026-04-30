/**
 * HTML Fetcher
 * Fetches HTML content from URLs with timeout and redirect handling
 */

export interface FetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
}

export interface FetchError {
  error: string;
  statusCode?: number;
}

export class HtmlFetcher {
  private static readonly TIMEOUT_MS = 15000; // 15 seconds
  private static readonly MAX_REDIRECTS = 10;
  private static readonly MAX_CONTENT_SIZE = 1024 * 1024; // 1MB

  /**
   * Fetch HTML content from a URL
   */
  async fetch(url: string): Promise<FetchResult | FetchError> {
    try {
      const result = await this.handleRedirects(url, HtmlFetcher.MAX_REDIRECTS);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: error.message,
        };
      }
      return {
        error: 'Unknown error occurred while fetching URL',
      };
    }
  }

  private async handleRedirects(
    url: string,
    maxRedirects: number
  ): Promise<FetchResult | FetchError> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HtmlFetcher.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'WhatsApp/2.23.20.0 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (response.status >= 400 && response.status < 500) {
        return {
          error: 'Resource not accessible',
          statusCode: response.status,
        };
      }

      if (response.status >= 500) {
        return {
          error: 'Server unavailable',
          statusCode: response.status,
        };
      }

      // Read response body with size limit
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > HtmlFetcher.MAX_CONTENT_SIZE) {
        return {
          error: 'Content size exceeds maximum limit',
          statusCode: response.status,
        };
      }

      const html = await response.text();

      return {
        html,
        finalUrl: response.url || url,
        statusCode: response.status,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timeout',
          };
        }
        return {
          error: error.message,
        };
      }

      return {
        error: 'Unknown error occurred',
      };
    }
  }
}
