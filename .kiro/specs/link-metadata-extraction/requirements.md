# Requirements Document

## Introduction

This document specifies the requirements for a backend API endpoint that validates user-submitted URLs and extracts metadata properties (Open Graph tags, Twitter Cards, and standard HTML meta tags) from the target web pages. The system will provide enriched link information to enhance user experience when creating shortened links.

## Glossary

- **Link Metadata Extractor**: The backend system component that fetches and parses HTML content from URLs
- **Meta Properties**: HTML meta tags including Open Graph (og:*), Twitter Card (twitter:*), and standard meta tags (title, description, etc.)
- **User**: An authenticated customer who submits URLs to be shortened
- **Target URL**: The original long URL submitted by the user
- **API Endpoint**: The HTTP route that accepts URL validation and metadata extraction requests

## Requirements

### Requirement 1

**User Story:** As a user, I want to submit a URL and receive its metadata automatically, so that I can create enriched shortened links without manually entering title, description, and image information.

#### Acceptance Criteria

1. WHEN a user submits a valid URL to the API endpoint, THEN the Link Metadata Extractor SHALL fetch the HTML content from the Target URL
2. WHEN the HTML content is retrieved successfully, THEN the Link Metadata Extractor SHALL parse and extract all available Meta Properties
3. WHEN Meta Properties are extracted, THEN the Link Metadata Extractor SHALL return a structured response containing title, description, image URL, and site name
4. WHEN the Target URL returns HTML content, THEN the Link Metadata Extractor SHALL prioritize Open Graph tags over standard meta tags
5. WHEN Open Graph tags are not available, THEN the Link Metadata Extractor SHALL fall back to Twitter Card tags and then standard HTML meta tags

### Requirement 2

**User Story:** As a user, I want the system to validate my URL before processing, so that I receive immediate feedback on invalid or inaccessible URLs.

#### Acceptance Criteria

1. WHEN a user submits a URL, THEN the Link Metadata Extractor SHALL validate the URL format before making any HTTP requests
2. WHEN a URL format is invalid, THEN the Link Metadata Extractor SHALL return an error response with a descriptive message
3. WHEN a URL exceeds 2048 characters, THEN the Link Metadata Extractor SHALL reject the request with an error message
4. WHEN a URL uses an unsupported protocol (not http or https), THEN the Link Metadata Extractor SHALL reject the request with an error message
5. WHEN a URL contains malicious patterns, THEN the Link Metadata Extractor SHALL reject the request for security reasons

### Requirement 3

**User Story:** As a user, I want the system to handle unreachable or slow websites gracefully, so that I receive timely feedback even when the target website has issues.

#### Acceptance Criteria

1. WHEN the Target URL fails to respond within 10 seconds, THEN the Link Metadata Extractor SHALL timeout and return an error response
2. WHEN the Target URL returns a 4xx HTTP status code, THEN the Link Metadata Extractor SHALL return an error indicating the resource is not accessible
3. WHEN the Target URL returns a 5xx HTTP status code, THEN the Link Metadata Extractor SHALL return an error indicating the server is unavailable
4. WHEN the Target URL redirects, THEN the Link Metadata Extractor SHALL follow up to 5 redirects before extracting metadata
5. WHEN redirect limit is exceeded, THEN the Link Metadata Extractor SHALL return an error indicating too many redirects

### Requirement 4

**User Story:** As a user, I want the system to extract comprehensive metadata, so that my shortened links display rich previews on social media platforms.

#### Acceptance Criteria

1. WHEN Open Graph title tag exists, THEN the Link Metadata Extractor SHALL extract og:title as the primary title
2. WHEN Open Graph description tag exists, THEN the Link Metadata Extractor SHALL extract og:description as the primary description
3. WHEN Open Graph image tag exists, THEN the Link Metadata Extractor SHALL extract og:image as the primary image URL
4. WHEN Open Graph site_name tag exists, THEN the Link Metadata Extractor SHALL extract og:site_name
5. WHEN Twitter Card tags exist and Open Graph tags are absent, THEN the Link Metadata Extractor SHALL extract twitter:title, twitter:description, and twitter:image as fallbacks

### Requirement 5

**User Story:** As a user, I want the system to provide default values when metadata is missing, so that I always receive a complete response structure.

#### Acceptance Criteria

1. WHEN no title meta tags are found, THEN the Link Metadata Extractor SHALL extract the HTML title tag content
2. WHEN no description meta tags are found, THEN the Link Metadata Extractor SHALL return an empty string for description
3. WHEN no image meta tags are found, THEN the Link Metadata Extractor SHALL return null for image URL
4. WHEN the HTML title tag is empty, THEN the Link Metadata Extractor SHALL use the domain name as the title
5. WHEN all metadata extraction fails but the URL is valid, THEN the Link Metadata Extractor SHALL return a response with minimal metadata derived from the URL

### Requirement 6

**User Story:** As a developer, I want the API to return consistent response formats, so that I can reliably integrate the endpoint into the frontend application.

#### Acceptance Criteria

1. WHEN metadata extraction succeeds, THEN the API Endpoint SHALL return a JSON response with status 200 and metadata fields
2. WHEN validation fails, THEN the API Endpoint SHALL return a JSON response with status 400 and an error message
3. WHEN the Target URL is unreachable, THEN the API Endpoint SHALL return a JSON response with status 422 and an error message
4. WHEN an unexpected error occurs, THEN the API Endpoint SHALL return a JSON response with status 500 and a generic error message
5. WHEN the response is returned, THEN the API Endpoint SHALL include appropriate CORS headers for frontend access

### Requirement 7

**User Story:** As a system administrator, I want the system to handle malformed HTML gracefully, so that parsing errors do not crash the service.

#### Acceptance Criteria

1. WHEN the HTML content is malformed, THEN the Link Metadata Extractor SHALL parse it using a lenient HTML parser
2. WHEN meta tags contain invalid attribute values, THEN the Link Metadata Extractor SHALL skip those tags and continue processing
3. WHEN the HTML content contains non-UTF-8 encoding, THEN the Link Metadata Extractor SHALL attempt to detect and convert the encoding
4. WHEN parsing fails completely, THEN the Link Metadata Extractor SHALL return minimal metadata without throwing an error
5. WHEN the HTML content is empty, THEN the Link Metadata Extractor SHALL handle it gracefully and return minimal metadata

### Requirement 8

**User Story:** As a user, I want the system to sanitize extracted metadata, so that malicious content cannot be injected into my shortened links.

#### Acceptance Criteria

1. WHEN metadata is extracted, THEN the Link Metadata Extractor SHALL sanitize all text fields to remove HTML tags and scripts
2. WHEN an image URL is extracted, THEN the Link Metadata Extractor SHALL validate that it is a proper URL format
3. WHEN metadata contains excessive whitespace, THEN the Link Metadata Extractor SHALL trim and normalize the whitespace
4. WHEN metadata exceeds maximum length limits, THEN the Link Metadata Extractor SHALL truncate the content appropriately
5. WHEN metadata contains potentially dangerous characters, THEN the Link Metadata Extractor SHALL escape or remove them
