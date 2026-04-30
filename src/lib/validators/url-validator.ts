/**
 * URL Validator
 * Validates URLs for format, protocol, length, and security
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

export class UrlValidator {
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];
  private static readonly MALICIOUS_PATTERNS = [
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /file:/i,
  ];

  /**
   * Validate a URL for format, protocol, length, and security
   */
  validate(url: string): ValidationResult {
    // Check length first (cheapest check)
    if (!this.checkLength(url)) {
      return {
        valid: false,
        error: 'URL exceeds maximum length of 2048 characters',
      };
    }

    // Check for malicious patterns (security check)
    if (!this.isSafeUrl(url)) {
      return {
        valid: false,
        error: 'URL contains potentially malicious patterns',
      };
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format',
      };
    }

    // Check protocol
    if (!this.checkProtocol(parsedUrl)) {
      return {
        valid: false,
        error: 'Only http and https protocols are supported',
      };
    }

    return {
      valid: true,
      normalizedUrl: parsedUrl.href,
    };
  }

  private checkProtocol(url: URL): boolean {
    return UrlValidator.ALLOWED_PROTOCOLS.includes(url.protocol);
  }

  private checkLength(url: string): boolean {
    return url.length <= UrlValidator.MAX_URL_LENGTH;
  }

  /**
   * Check if URL is safe (does not contain malicious patterns)
   * @returns true if URL is safe, false if malicious patterns detected
   */
  private isSafeUrl(url: string): boolean {
    // Check if any malicious pattern matches the URL
    const hasMaliciousPattern = UrlValidator.MALICIOUS_PATTERNS.some((pattern) =>
      pattern.test(url)
    );
    
    // Return true if safe (no malicious patterns found)
    // Return false if dangerous (malicious pattern found)
    return !hasMaliciousPattern;
  }
}
