# Design Document: Link Metadata Extraction

## Overview

The Link Metadata Extraction system is a Next.js API route that validates user-submitted URLs and extracts rich metadata from target web pages. The system fetches HTML content, parses meta tags (Open Graph, Twitter Cards, standard HTML), and returns structured metadata to enhance the link creation experience.

The implementation follows a layered architecture with clear separation between HTTP handling, business logic, HTML fetching, and parsing. This design ensures testability, maintainability, and extensibility.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│  (Link Form)    │
└────────┬────────┘
         │ POST /api/links/metadata
         ▼
┌─────────────────┐
│  API Route      │
│  Handler        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Metadata       │
│  Service        │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  URL   │ │  HTML    │
│Validator│ │ Fetcher  │
└────────┘ └─────┬────┘
                 │
                 ▼
           ┌──────────┐
           │  Meta    │
           │  Parser  │
           └──────────┘
```

### Layer Responsibilities

1. **API Route Handler**: Receives HTTP requests, delegates to service, formats responses
2. **Metadata Service**: Orchestrates validation, fetching, and parsing
3. **URL Validator**: Validates URL format, protocol, and security
4. **HTML Fetcher**: Makes HTTP requests with timeout and redirect handling
5. **Meta Parser**: Extracts and prioritizes metadata from HTML

## Components and Interfaces

### 1. API Route Handler

**File**: `src/app/api/links/metadata/route.ts`

```typescript
export async function POST(request: Request): Promise<Response>
```

**Responsibilities**:
- Parse request body
- Call metadata service
- Format success/error responses
- Set appropriate HTTP status codes and headers

### 2. Metadata Service

**File**: `src/lib/services/metadata-service.ts`

```typescript
interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
}

interface MetadataError {
  error: string;
  code: 'INVALID_URL' | 'UNREACHABLE' | 'TIMEOUT' | 'PARSE_ERROR' | 'UNKNOWN';
}

class MetadataService {
  async extractMetadata(url: string): Promise<MetadataResult | MetadataError>
}
```

**Responsibilities**:
- Coordinate validation, fetching, and parsing
- Handle errors and provide fallback values
- Sanitize extracted metadata

### 3. URL Validator

**File**: `src/lib/validators/url-validator.ts`

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedUrl?: string;
}

class UrlValidator {
  validate(url: string): ValidationResult
  private checkProtocol(url: string): boolean
  private checkLength(url: string): boolean
  private checkMaliciousPatterns(url: string): boolean
}
```

**Responsibilities**:
- Validate URL format using URL API
- Check protocol (http/https only)
- Enforce length limits (max 2048 chars)
- Detect malicious patterns
- Normalize URLs

### 4. HTML Fetcher

**File**: `src/lib/fetchers/html-fetcher.ts`

```typescript
interface FetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
}

interface FetchError {
  error: string;
  statusCode?: number;
}

class HtmlFetcher {
  async fetch(url: string): Promise<FetchResult | FetchError>
  private handleRedirects(url: string, maxRedirects: number): Promise<Response>
}
```

**Responsibilities**:
- Make HTTP GET requests with 10-second timeout
- Follow up to 5 redirects
- Handle HTTP errors (4xx, 5xx)
- Return HTML content and final URL

### 5. Meta Parser

**File**: `src/lib/parsers/meta-parser.ts`

```typescript
interface ParsedMetadata {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
}

class MetaParser {
  parse(html: string, url: string): ParsedMetadata
  private extractOpenGraph(document: Document): Partial<ParsedMetadata>
  private extractTwitterCard(document: Document): Partial<ParsedMetadata>
  private extractStandardMeta(document: Document): Partial<ParsedMetadata>
  private extractTitle(document: Document): string | null
  private sanitizeText(text: string): string
  private validateImageUrl(url: string): string | null
}
```

**Responsibilities**:
- Parse HTML using a lenient parser (jsdom or cheerio)
- Extract Open Graph tags (priority 1)
- Extract Twitter Card tags (priority 2)
- Extract standard meta tags (priority 3)
- Extract HTML title as fallback
- Sanitize all extracted content
- Handle malformed HTML gracefully

## Data Models

### Request Model

```typescript
interface MetadataRequest {
  url: string;
}
```

### Response Models

**Success Response**:
```typescript
interface MetadataResponse {
  success: true;
  data: {
    title: string;
    description: string;
    image: string | null;
    siteName: string | null;
    url: string;
  };
}
```

**Error Response**:
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code: string;
}
```

### Internal Models

```typescript
interface MetaTags {
  og: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  };
  twitter: {
    title?: string;
    description?: string;
    image?: string;
  };
  standard: {
    title?: string;
    description?: string;
  };
  htmlTitle?: string;
}
```

## Data Flow

1. **Request Reception**: API route receives POST request with `{ url: string }`
2. **URL Validation**: UrlValidator checks format, protocol, length, and security
3. **HTML Fetching**: HtmlFetcher makes HTTP request with timeout and redirect handling
4. **HTML Parsing**: MetaParser extracts metadata with priority: OG > Twitter > Standard
5. **Sanitization**: MetadataService sanitizes and validates all extracted data
6. **Fallback Application**: Service applies defaults for missing fields
7. **Response Formation**: API route formats and returns JSON response

## Error Handling

### Error Categories

1. **Validation Errors (400)**:
   - Invalid URL format
   - Unsupported protocol
   - URL too long
   - Malicious patterns detected

2. **Client Errors (422)**:
   - URL not reachable (4xx from target)
   - Too many redirects
   - Timeout

3. **Server Errors (500)**:
   - Unexpected parsing errors
   - Network failures
   - Unknown errors

### Error Response Format

All errors follow consistent structure:
```typescript
{
  success: false,
  error: "Human-readable error message",
  code: "ERROR_CODE"
}
```

### Graceful Degradation

- Malformed HTML: Use lenient parser, return partial metadata
- Missing metadata: Return empty strings or null values
- Encoding issues: Attempt detection and conversion
- Parsing failures: Return minimal metadata (URL-derived)

## Testing Strategy


### Testing Approach

The system will use a dual testing approach combining unit tests and property-based tests:

**Unit Tests**: Verify specific examples, integration points, and edge cases
- Specific URL validation examples
- Timeout behavior with mock servers
- Specific HTML parsing examples
- Error response formatting

**Property-Based Tests**: Verify universal properties across all inputs using **fast-check** library
- Each property test will run a minimum of 100 iterations
- Tests will use smart generators that constrain to valid input spaces
- Each test will be tagged with the format: `**Feature: link-metadata-extraction, Property {number}: {property_text}**`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties were consolidated to eliminate redundancy:
- Open Graph extraction properties (4.1-4.4) combined into comprehensive OG extraction property
- Missing metadata defaults (5.2-5.3) merged with general fallback property
- Response status code properties (6.1-6.4) consolidated into status code mapping property
- Sanitization properties (8.1-8.5) combined into comprehensive sanitization property

### Core Properties

**Property 1: HTML fetching for valid URLs**
*For any* valid URL submitted to the system, an HTTP request should be made to fetch the HTML content from that URL.
**Validates: Requirements 1.1**

**Property 2: Complete metadata extraction**
*For any* HTML document containing meta properties, all available meta tags (Open Graph, Twitter Card, standard) should be extracted and included in the parsing result.
**Validates: Requirements 1.2**

**Property 3: Response structure consistency**
*For any* metadata extraction result (success or failure), the response should always contain the required fields: title, description, image, siteName, and url (with appropriate null/empty values when data is missing).
**Validates: Requirements 1.3**

**Property 4: Open Graph priority**
*For any* HTML document containing both Open Graph tags and standard meta tags, the extracted metadata should use Open Graph values over standard meta tag values.
**Validates: Requirements 1.4**

**Property 5: Metadata fallback chain**
*For any* HTML document, when Open Graph tags are absent, the system should fall back to Twitter Card tags, and when those are absent, fall back to standard HTML meta tags, and finally to HTML title tag.
**Validates: Requirements 1.5**

**Property 6: Validation before fetching**
*For any* URL submission, validation should complete before any HTTP request is made, ensuring invalid URLs never trigger network calls.
**Validates: Requirements 2.1**

**Property 7: Invalid URL rejection**
*For any* URL with invalid format, the system should return an error response without attempting to fetch HTML content.
**Validates: Requirements 2.2**

**Property 8: Protocol restriction**
*For any* URL using a protocol other than http or https (such as ftp, file, data), the system should reject the request with an appropriate error.
**Validates: Requirements 2.4**

**Property 9: Malicious pattern detection**
*For any* URL containing malicious patterns (such as javascript:, data:text/html, or suspicious encoded characters), the system should reject the request for security reasons.
**Validates: Requirements 2.5**

**Property 10: HTTP error handling**
*For any* HTTP response with 4xx or 5xx status codes, the system should return an appropriate error response indicating the nature of the failure (client error vs server error).
**Validates: Requirements 3.2, 3.3**

**Property 11: Redirect following**
*For any* URL that redirects, the system should follow the redirect chain (up to 5 redirects) and extract metadata from the final destination URL.
**Validates: Requirements 3.4**

**Property 12: Open Graph extraction completeness**
*For any* HTML document containing Open Graph tags (og:title, og:description, og:image, og:site_name), all present OG tags should be extracted and included in the metadata result.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

**Property 13: Twitter Card fallback**
*For any* HTML document containing Twitter Card tags but no Open Graph tags, the Twitter Card values (twitter:title, twitter:description, twitter:image) should be used as the metadata.
**Validates: Requirements 4.5**

**Property 14: HTML title fallback**
*For any* HTML document without meta title tags, the content of the HTML `<title>` tag should be extracted and used as the title.
**Validates: Requirements 5.1**

**Property 15: Default values for missing metadata**
*For any* HTML document where specific metadata fields are missing, the system should return appropriate default values (empty string for description, null for image, domain name for empty title).
**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

**Property 16: HTTP status code mapping**
*For any* request outcome (success, validation error, unreachable URL, unexpected error), the API should return the appropriate HTTP status code (200, 400, 422, 500 respectively) with consistent JSON structure.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Property 17: CORS headers presence**
*For any* API response, appropriate CORS headers should be included to allow frontend access.
**Validates: Requirements 6.5**

**Property 18: Malformed HTML resilience**
*For any* malformed or invalid HTML content, the parser should not crash and should return whatever metadata can be extracted, using lenient parsing.
**Validates: Requirements 7.1, 7.4**

**Property 19: Invalid meta tag handling**
*For any* HTML document containing meta tags with invalid attribute values, the system should skip those specific tags and continue processing other valid tags.
**Validates: Requirements 7.2**

**Property 20: Comprehensive sanitization**
*For any* extracted metadata text, the system should sanitize it by removing HTML tags and scripts, trimming whitespace, truncating to length limits, and escaping dangerous characters.
**Validates: Requirements 8.1, 8.3, 8.4, 8.5**

**Property 21: Image URL validation**
*For any* extracted image URL, the system should validate that it is a properly formatted URL before including it in the response.
**Validates: Requirements 8.2**

## Implementation Details

### Technology Choices

1. **HTML Parser**: Use `cheerio` for fast, lenient HTML parsing
   - Lightweight and fast
   - jQuery-like API for easy DOM traversal
   - Handles malformed HTML gracefully

2. **HTTP Client**: Use native `fetch` with `AbortController` for timeout
   - Built into Next.js runtime
   - Modern async/await API
   - Easy timeout implementation

3. **Validation**: Use `zod` for request validation (already in project)
   - Type-safe validation
   - Consistent with existing codebase
   - Good error messages

4. **Sanitization**: Use built-in string methods and regex
   - No additional dependencies
   - Sufficient for text sanitization
   - Fast performance

### Performance Considerations

1. **Timeout**: 10-second timeout prevents hanging requests
2. **Redirect Limit**: Maximum 5 redirects prevents infinite loops
3. **Content Size**: Limit HTML download to first 1MB to prevent memory issues
4. **Caching**: Consider adding cache layer for frequently requested URLs (future enhancement)

### Security Considerations

1. **URL Validation**: Strict protocol checking (http/https only)
2. **SSRF Prevention**: Block private IP ranges and localhost
3. **Content Sanitization**: Remove all HTML tags and scripts from extracted text
4. **Length Limits**: Enforce maximum lengths to prevent DoS
5. **Timeout**: Prevent resource exhaustion from slow responses

## Dependencies

### New Dependencies Required

```json
{
  "cheerio": "^1.0.0-rc.12"
}
```

### Existing Dependencies Used

- `zod`: Request validation
- `next`: API routes
- Native `fetch`: HTTP requests

## API Specification

### Endpoint

```
POST /api/links/metadata
```

### Request

```typescript
{
  "url": "https://example.com"
}
```

### Success Response (200)

```typescript
{
  "success": true,
  "data": {
    "title": "Example Domain",
    "description": "This domain is for use in illustrative examples",
    "image": "https://example.com/og-image.jpg",
    "siteName": "Example",
    "url": "https://example.com"
  }
}
```

### Error Response (400/422/500)

```typescript
{
  "success": false,
  "error": "Invalid URL format",
  "code": "INVALID_URL"
}
```

### Error Codes

- `INVALID_URL`: URL format is invalid
- `UNSUPPORTED_PROTOCOL`: Protocol is not http/https
- `URL_TOO_LONG`: URL exceeds 2048 characters
- `MALICIOUS_PATTERN`: URL contains suspicious patterns
- `UNREACHABLE`: Target URL returned 4xx error
- `SERVER_ERROR`: Target URL returned 5xx error
- `TIMEOUT`: Request exceeded 10 second timeout
- `TOO_MANY_REDIRECTS`: Exceeded 5 redirect limit
- `PARSE_ERROR`: Failed to parse HTML
- `UNKNOWN`: Unexpected error occurred

## Future Enhancements

1. **Caching**: Add Redis cache for frequently requested URLs
2. **Rate Limiting**: Implement per-user rate limits
3. **Favicon Extraction**: Extract and return favicon URLs
4. **Language Detection**: Detect and return content language
5. **Video Metadata**: Extract og:video tags for video content
6. **Batch Processing**: Support multiple URLs in single request
7. **Webhook Support**: Async processing with webhook callback
8. **Custom User-Agent**: Allow custom user-agent strings
