# Implementation Plan

- [x] 1. Install dependencies and setup project structure
  - Install cheerio package for HTML parsing
  - Create directory structure for validators, fetchers, parsers, and services
  - _Requirements: All_

- [ ] 2. Implement URL Validator
  - [ ] 2.1 Create UrlValidator class with validation logic
    - Implement URL format validation using URL API
    - Add protocol checking (http/https only)
    - Add length validation (max 2048 characters)
    - Add malicious pattern detection (javascript:, data:, encoded attacks)
    - Implement URL normalization
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.2 Write property test for URL validation
    - **Property 7: Invalid URL rejection**
    - **Validates: Requirements 2.2**

  - [ ]* 2.3 Write property test for protocol restriction
    - **Property 8: Protocol restriction**
    - **Validates: Requirements 2.4**

  - [ ]* 2.4 Write property test for malicious pattern detection
    - **Property 9: Malicious pattern detection**
    - **Validates: Requirements 2.5**

- [ ] 3. Implement HTML Fetcher
  - [ ] 3.1 Create HtmlFetcher class with fetch logic
    - Implement HTTP GET with native fetch and AbortController
    - Add 10-second timeout handling
    - Implement redirect following (max 5 redirects)
    - Add HTTP status code error handling (4xx, 5xx)
    - Limit content size to 1MB
    - _Requirements: 1.1, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write property test for HTML fetching
    - **Property 1: HTML fetching for valid URLs**
    - **Validates: Requirements 1.1**

  - [ ]* 3.3 Write property test for HTTP error handling
    - **Property 10: HTTP error handling**
    - **Validates: Requirements 3.2, 3.3**

  - [ ]* 3.4 Write property test for redirect following
    - **Property 11: Redirect following**
    - **Validates: Requirements 3.4**

  - [ ]* 3.5 Write unit test for timeout behavior
    - Test 10-second timeout with mock slow server
    - _Requirements: 3.1_

- [ ] 4. Implement Meta Parser
  - [ ] 4.1 Create MetaParser class with parsing logic
    - Initialize cheerio for HTML parsing
    - Implement Open Graph tag extraction (og:title, og:description, og:image, og:site_name)
    - Implement Twitter Card tag extraction (twitter:title, twitter:description, twitter:image)
    - Implement standard meta tag extraction (name="description", etc.)
    - Implement HTML title tag extraction
    - Implement fallback chain logic (OG → Twitter → Standard → HTML title)
    - Add text sanitization (remove HTML tags, trim whitespace, truncate)
    - Add image URL validation
    - Handle malformed HTML gracefully
    - _Requirements: 1.2, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 4.2 Write property test for complete metadata extraction
    - **Property 2: Complete metadata extraction**
    - **Validates: Requirements 1.2**

  - [ ]* 4.3 Write property test for Open Graph priority
    - **Property 4: Open Graph priority**
    - **Validates: Requirements 1.4**

  - [ ]* 4.4 Write property test for metadata fallback chain
    - **Property 5: Metadata fallback chain**
    - **Validates: Requirements 1.5**

  - [ ]* 4.5 Write property test for Open Graph extraction completeness
    - **Property 12: Open Graph extraction completeness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ]* 4.6 Write property test for Twitter Card fallback
    - **Property 13: Twitter Card fallback**
    - **Validates: Requirements 4.5**

  - [ ]* 4.7 Write property test for HTML title fallback
    - **Property 14: HTML title fallback**
    - **Validates: Requirements 5.1**

  - [ ]* 4.8 Write property test for malformed HTML resilience
    - **Property 18: Malformed HTML resilience**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 4.9 Write property test for invalid meta tag handling
    - **Property 19: Invalid meta tag handling**
    - **Validates: Requirements 7.2**

  - [ ]* 4.10 Write property test for comprehensive sanitization
    - **Property 20: Comprehensive sanitization**
    - **Validates: Requirements 8.1, 8.3, 8.4, 8.5**

  - [ ]* 4.11 Write property test for image URL validation
    - **Property 21: Image URL validation**
    - **Validates: Requirements 8.2**

- [ ] 5. Implement Metadata Service
  - [ ] 5.1 Create MetadataService class that orchestrates validation, fetching, and parsing
    - Integrate UrlValidator for URL validation
    - Integrate HtmlFetcher for HTML retrieval
    - Integrate MetaParser for metadata extraction
    - Implement error handling and error code mapping
    - Implement default value application for missing metadata
    - Add validation before fetching logic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.2 Write property test for validation before fetching
    - **Property 6: Validation before fetching**
    - **Validates: Requirements 2.1**

  - [ ]* 5.3 Write property test for response structure consistency
    - **Property 3: Response structure consistency**
    - **Validates: Requirements 1.3**

  - [ ]* 5.4 Write property test for default values
    - **Property 15: Default values for missing metadata**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement API Route Handler
  - [ ] 7.1 Create POST /api/links/metadata route
    - Parse and validate request body using zod
    - Call MetadataService to extract metadata
    - Format success responses with status 200
    - Format error responses with appropriate status codes (400, 422, 500)
    - Add CORS headers to all responses
    - Implement consistent JSON response structure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 7.2 Write property test for HTTP status code mapping
    - **Property 16: HTTP status code mapping**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [ ]* 7.3 Write property test for CORS headers presence
    - **Property 17: CORS headers presence**
    - **Validates: Requirements 6.5**

  - [ ]* 7.4 Write integration tests for API endpoint
    - Test end-to-end flow with real URLs
    - Test error scenarios
    - Test response format consistency
    - _Requirements: All_

- [ ] 8. Add security enhancements
  - [ ] 8.1 Implement SSRF prevention
    - Block private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    - Block localhost and 127.0.0.1
    - Block link-local addresses (169.254.0.0/16)
    - _Requirements: 2.5_

  - [ ]* 8.2 Write unit tests for SSRF prevention
    - Test blocking of private IPs
    - Test blocking of localhost
    - _Requirements: 2.5_

- [ ] 9. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
