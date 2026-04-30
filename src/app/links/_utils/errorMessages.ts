type ErrorCode =
  | 'INVALID_URL'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN';

export function getErrorMessage(
  code: ErrorCode,
  apiError?: string,
  retryAfter?: number
): string {
  const errorMessages: Record<ErrorCode, string> = {
    INVALID_URL: 'The URL format is invalid. Please check and try again.',
    UNREACHABLE:
      'Unable to reach the URL. Please check if the website is accessible.',
    TIMEOUT:
      'The request timed out. The website may be slow or unavailable.',
    PARSE_ERROR:
      'Could not extract metadata from this URL. The page may not have proper meta tags.',
    RATE_LIMIT_EXCEEDED: retryAfter
      ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
      : 'Too many requests. Please wait a moment before trying again.',
    UNKNOWN: apiError || 'An unexpected error occurred. Please try again.',
  };

  return errorMessages[code];
}
