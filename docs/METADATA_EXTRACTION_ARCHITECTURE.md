# Metadata Extraction System Architecture

> **Dokumentasi lengkap untuk membangun sistem metadata extraction seperti MetaKlik**

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Request Flow](#request-flow)
4. [Component Details](#component-details)
5. [Implementation Guide](#implementation-guide)
6. [File References](#file-references)

---

## Overview

Sistem ini mengekstrak metadata (title, description, image, dll) dari URL dengan strategi multi-layer:
- **Layer 1**: Microlink API (untuk social media)
- **Layer 2**: Social Media Scrapers (Instagram, TikTok)
- **Layer 3**: oEmbed API (YouTube, Vimeo, Twitter)
- **Layer 4**: HTML Parsing (fallback untuk semua website)

**Key Features:**
- ✅ Rate limiting (10 req/min per IP)
- ✅ Multi-strategy extraction dengan fallback
- ✅ Support social media (Instagram, TikTok, YouTube, Twitter, dll)
- ✅ Custom display URL
- ✅ Video detection
- ✅ Error handling yang robust

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Request                          │
│                  POST /api/links/metadata                    │
│                   { "url": "..." }                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Route Handler                         │
│              src/app/api/links/metadata/route.ts            │
│                                                              │
│  1. Rate Limiting Check (10 req/min)                       │
│  2. Request Validation (Zod schema)                        │
│  3. Call MetadataService                                    │
│  4. Return Response with Headers                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Metadata Service                           │
│              src/lib/services/metadata-service.ts           │
│                                                              │
│  Orchestrates extraction dengan strategi berlapis:          │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Step 1:    │  │   Step 2:    │  │   Step 3:    │
│ URL Validate │  │  Microlink   │  │Social Scraper│
│              │  │   Service    │  │              │
│ url-validator│  │ (Instagram,  │  │ (Instagram,  │
│     .ts      │  │  TikTok,     │  │  TikTok)     │
└──────────────┘  │  Facebook,   │  └──────────────┘
                  │  Twitter)    │
                  └──────────────┘

        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Step 4:    │  │   Step 5:    │  │   Step 6:    │
│   oEmbed     │  │ HTML Fetcher │  │ Meta Parser  │
│   Service    │  │              │  │              │
│ (YouTube,    │  │ Fetch HTML   │  │ Parse OG,    │
│  Vimeo,      │  │ with timeout │  │ Twitter,     │
│  Twitter)    │  │ & redirects  │  │ Standard     │
└──────────────┘  └──────────────┘  └──────────────┘

                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Response Format                           │
│                                                              │
│  Success: { success: true, data: MetadataResult }          │
│  Error:   { success: false, error: string, code: string }  │
└─────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### 1. **Client Request**
```typescript
POST /api/links/metadata
Content-Type: application/json

{
  "url": "https://medium.com/@user/article"
}
```

**File Reference:** `src/app/links/page.tsx` (line 100-130)

---

### 2. **API Route Handler**

**File:** `src/app/api/links/metadata/route.ts`

**Flow:**

```typescript
// 1. Rate Limiting Check
const clientIp = getClientIp(request);
const rateLimitResult = rateLimiter.check(clientIp);

if (!rateLimitResult.allowed) {
  return 429 with retry headers
}

// 2. Request Validation
const validation = requestSchema.safeParse(body);
if (!validation.success) {
  return 400 Bad Request
}

// 3. Extract Metadata
const service = new MetadataService();
const result = await service.extractMetadata(url);

// 4. Return Response
if ('code' in result) {
  return error response with appropriate status code
}
return success response with metadata
```

**Key Components:**
- **Rate Limiter:** `src/lib/utils/rate-limiter.ts`
- **Validation:** Zod schema untuk validasi input
- **CORS Headers:** Support cross-origin requests

---

### 3. **Metadata Service (Orchestrator)**

**File:** `src/lib/services/metadata-service.ts`

**Extraction Strategy (Sequential with Fallback):**

```typescript
async extractMetadata(url: string) {
  // Step 1: Validate URL
  const validation = this.validator.validate(url);
  if (!validation.valid) return error;
  
  // Step 2: Try Microlink (for social media)
  if (MicrolinkService.shouldUseMicrolink(url)) {
    const result = await MicrolinkService.extractMetadata(url);
    if (result) return result;
  }

  // Step 3: Try Social Media Scrapers
  if (SocialMediaScraper.isInstagram(url)) {
    const result = await SocialMediaScraper.extractInstagram(url);
    if (result) return result;
  }
  
  if (SocialMediaScraper.isTikTok(url)) {
    const result = await SocialMediaScraper.extractTikTok(url);
    if (result) return result;
  }
  
  // Step 4: Try oEmbed
  if (OEmbedService.isSocialMedia(url)) {
    const result = await this.oembedService.extractMetadata(url);
    if (result) return result;
  }
  
  // Step 5: Fetch HTML (fallback)
  const fetchResult = await this.fetcher.fetch(url);
  if ('error' in fetchResult) return error;
  
  // Step 6: Parse HTML
  const metadata = this.parser.parse(fetchResult.html, fetchResult.finalUrl);
  return metadata;
}
```

**Why This Order?**
1. **Microlink** - Best for JS-heavy sites (Instagram, TikTok, Facebook)
2. **Social Scrapers** - Fallback untuk Instagram/TikTok
3. **oEmbed** - Standard API untuk YouTube, Vimeo, Twitter
4. **HTML Parsing** - Universal fallback untuk semua website

---

## Component Details

### 🔒 **1. Rate Limiter**

**File:** `src/lib/utils/rate-limiter.ts`

**Purpose:** Membatasi request per IP (10 req/min)

**Key Features:**
- In-memory storage (Map)
- Sliding window (60 seconds)
- Auto cleanup expired entries
- IP detection dari headers (x-forwarded-for, x-real-ip)

**Usage:**
```typescript
const rateLimitResult = rateLimiter.check(clientIp);

if (!rateLimitResult.allowed) {
  // Return 429 with Retry-After header
}
```

**Response Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
Retry-After: 60
```

---

### ✅ **2. URL Validator**

**File:** `src/lib/validators/url-validator.ts`

**Purpose:** Validasi URL sebelum processing

**Validations:**
- ✅ Format URL valid
- ✅ Protocol (hanya http/https)
- ✅ Max length (2048 chars)
- ✅ Security check (block javascript:, data:, file:, vbscript:)

**Usage:**
```typescript
const validation = this.validator.validate(url);

if (!validation.valid) {
  return { error: validation.error, code: 'INVALID_URL' };
}

const normalizedUrl = validation.normalizedUrl;
```

---

### 🌐 **3. HTML Fetcher**

**File:** `src/lib/fetchers/html-fetcher.ts`

**Purpose:** Fetch HTML dari URL dengan timeout & redirect handling

**Features:**
- ⏱️ Timeout: 15 seconds
- 🔄 Auto follow redirects (max 10)
- 📏 Max content size: 1MB
- 🤖 Custom User-Agent (browser-like)
- 🔐 Proper headers (Accept, Accept-Language, etc)

**Usage:**
```typescript
const fetchResult = await this.fetcher.fetch(url);

if ('error' in fetchResult) {
  // Handle error (timeout, unreachable, etc)
  return this.mapFetchError(fetchResult);
}

const { html, finalUrl, statusCode } = fetchResult;
```

**Error Handling:**
- 4xx errors → `UNREACHABLE`
- 5xx errors → `UNREACHABLE`
- Timeout → `TIMEOUT`
- Network errors → `UNKNOWN`

---

### 🔍 **4. Meta Parser**

**File:** `src/lib/parsers/meta-parser.ts`

**Purpose:** Extract metadata dari HTML menggunakan Cheerio

**Extraction Priority:**
1. **Open Graph** (`og:title`, `og:description`, `og:image`)
2. **Twitter Cards** (`twitter:title`, `twitter:description`, `twitter:image`)
3. **Standard Meta** (`<meta name="title">`, `<meta name="description">`)
4. **HTML Title** (`<title>` tag)

**Features:**
- 🧹 Text sanitization (remove HTML tags, normalize whitespace)
- ✂️ Truncation (title: 255 chars, description: 512 chars)
- 🎥 Video detection (`og:video`, `twitter:player:stream`)
- 📝 Content type detection (article, video, image, website)

**Usage:**
```typescript
const metadata = this.parser.parse(html, finalUrl);

// Returns:
{
  title: string | null,
  description: string | null,
  image: string | null,
  siteName: string | null,
  video: string | null,
  type: 'image' | 'video' | 'article' | 'website'
}
```

---

### 🎬 **5. Microlink Service**

**File:** `src/lib/services/microlink-service.ts`

**Purpose:** Extract metadata dari JS-heavy sites menggunakan Microlink API

**API Details:**
- **Free Tier:** 50 requests/day (no API key)
- **Paid:** $9/month for 10,000 requests
- **Endpoint:** `https://api.microlink.io`

**When to Use:**
- Instagram
- TikTok
- Facebook
- Twitter/X

**Usage:**
```typescript
if (MicrolinkService.shouldUseMicrolink(url)) {
  const result = await MicrolinkService.extractMetadata(url);
  if (result) return result;
}
```

**Features:**
- ✅ No API key needed (free tier)
- ✅ Handles JavaScript rendering
- ✅ Video detection
- ✅ Screenshot fallback
- ⏱️ 10 second timeout

---

### 📱 **6. Social Media Scraper**

**File:** `src/lib/services/social-media-scraper.ts`

**Purpose:** Specialized scraper untuk Instagram & TikTok (fallback dari Microlink)

**Strategies:**
1. **Instagram:**
   - Extract post ID dari URL
   - Fetch dengan mobile User-Agent
   - Parse meta tags dari initial HTML
   - Extract JSON-LD structured data

2. **TikTok:**
   - Fetch dengan mobile User-Agent
   - Parse Open Graph tags
   - Extract JSON-LD for video data

**Usage:**
```typescript
if (SocialMediaScraper.isInstagram(url)) {
  const result = await SocialMediaScraper.extractInstagram(url);
  if (result) return result;
}

if (SocialMediaScraper.isTikTok(url)) {
  const result = await SocialMediaScraper.extractTikTok(url);
  if (result) return result;
}
```

**Features:**
- 📱 Mobile User-Agent (better success rate)
- 🔍 JSON-LD extraction
- 🎥 Video URL extraction
- 👤 Author detection

---

### 🎥 **7. oEmbed Service**

**File:** `src/lib/services/oembed-service.ts`

**Purpose:** Extract metadata menggunakan oEmbed API (standard protocol)

**Supported Platforms:**
- ✅ YouTube (`https://www.youtube.com/oembed`)
- ✅ Vimeo (`https://vimeo.com/api/oembed.json`)
- ✅ Twitter (`https://publish.twitter.com/oembed`)
- ✅ TikTok (`https://www.tiktok.com/oembed`)
- ❌ Instagram (requires Facebook App credentials)

**Usage:**
```typescript
if (OEmbedService.isSocialMedia(url)) {
  const result = await this.oembedService.extractMetadata(url);
  if (result) return result;
}
```

**Features:**
- ✅ Standard protocol (no API key)
- ✅ Thumbnail extraction
- ✅ Author information
- ⏱️ 10 second timeout

---

## Implementation Guide

### **Step 1: Setup Dependencies**

```bash
npm install cheerio zod
```

**Required Packages:**
- `cheerio` - HTML parsing
- `zod` - Request validation
- `next` - API routes

---

### **Step 2: Create Core Components**

#### 2.1 URL Validator
**File:** `src/lib/validators/url-validator.ts`

```typescript
export class UrlValidator {
  validate(url: string): ValidationResult {
    // 1. Check length
    // 2. Check malicious patterns
    // 3. Parse URL
    // 4. Check protocol
    return { valid: true, normalizedUrl: url };
  }
}
```

**Reference:** Full implementation di `src/lib/validators/url-validator.ts`

---

#### 2.2 HTML Fetcher
**File:** `src/lib/fetchers/html-fetcher.ts`

```typescript
export class HtmlFetcher {
  async fetch(url: string): Promise<FetchResult | FetchError> {
    // 1. Setup timeout (15s)
    // 2. Fetch with proper headers
    // 3. Check status code
    // 4. Check content size
    // 5. Return HTML + finalUrl
  }
}
```

**Reference:** Full implementation di `src/lib/fetchers/html-fetcher.ts`

---

#### 2.3 Meta Parser
**File:** `src/lib/parsers/meta-parser.ts`

```typescript
export class MetaParser {
  parse(html: string, url: string): ParsedMetadata {
    const $ = cheerio.load(html);
    
    // 1. Extract Open Graph
    const og = this.extractOpenGraph($);
    
    // 2. Extract Twitter Cards
    const twitter = this.extractTwitterCard($);
    
    // 3. Extract Standard Meta
    const standard = this.extractStandardMeta($);
    
    // 4. Apply fallback chain
    return {
      title: og.title || twitter.title || standard.title,
      description: og.description || twitter.description,
      image: og.image || twitter.image,
      siteName: og.siteName,
      video: og.video || twitter.video,
      type: this.detectType($)
    };
  }
}
```

**Reference:** Full implementation di `src/lib/parsers/meta-parser.ts`

---

### **Step 3: Create Service Layer**

#### 3.1 Microlink Service
**File:** `src/lib/services/microlink-service.ts`

```typescript
export class MicrolinkService {
  static async extractMetadata(url: string) {
    const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();
    
    return {
      title: result.data.title,
      description: result.data.description,
      image: result.data.image?.url,
      // ...
    };
  }
}
```

**Reference:** Full implementation di `src/lib/services/microlink-service.ts`

---

#### 3.2 Social Media Scraper
**File:** `src/lib/services/social-media-scraper.ts`

```typescript
export class SocialMediaScraper {
  static async extractInstagram(url: string) {
    // 1. Extract post ID
    // 2. Fetch with mobile User-Agent
    // 3. Parse meta tags
    // 4. Extract JSON-LD
  }
  
  static async extractTikTok(url: string) {
    // Similar strategy
  }
}
```

**Reference:** Full implementation di `src/lib/services/social-media-scraper.ts`

---

#### 3.3 oEmbed Service
**File:** `src/lib/services/oembed-service.ts`

```typescript
export class OEmbedService {
  async extractMetadata(url: string) {
    const platform = this.getPlatform(url);
    const endpoint = OEMBED_ENDPOINTS[platform];
    const oembedUrl = `${endpoint}?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(oembedUrl);
    const data = await response.json();
    
    return {
      title: data.title,
      description: data.description,
      image: data.thumbnail_url,
      // ...
    };
  }
}
```

**Reference:** Full implementation di `src/lib/services/oembed-service.ts`

---

#### 3.4 Metadata Service (Orchestrator)
**File:** `src/lib/services/metadata-service.ts`

```typescript
export class MetadataService {
  async extractMetadata(url: string) {
    // 1. Validate URL
    const validation = this.validator.validate(url);
    
    // 2. Try Microlink (social media)
    if (MicrolinkService.shouldUseMicrolink(url)) {
      const result = await MicrolinkService.extractMetadata(url);
      if (result) return result;
    }

    // 3. Try Social Scrapers
    if (SocialMediaScraper.isInstagram(url)) {
      const result = await SocialMediaScraper.extractInstagram(url);
      if (result) return result;
    }
    
    // 4. Try oEmbed
    if (OEmbedService.isSocialMedia(url)) {
      const result = await this.oembedService.extractMetadata(url);
      if (result) return result;
    }
    
    // 5. Fetch HTML (fallback)
    const fetchResult = await this.fetcher.fetch(url);
    
    // 6. Parse HTML
    const metadata = this.parser.parse(fetchResult.html, fetchResult.finalUrl);
    
    // 7. Add displayUrl
    metadata.displayUrl = this.extractDomain(fetchResult.finalUrl);
    
    return metadata;
  }
}
```

**Reference:** Full implementation di `src/lib/services/metadata-service.ts`

---

### **Step 4: Create Rate Limiter**

**File:** `src/lib/utils/rate-limiter.ts`

```typescript
class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  
  check(identifier: string) {
    const now = Date.now();
    const entry = this.requests.get(identifier);
    
    // Check if within limit
    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return { allowed: true, remaining: this.maxRequests - 1 };
    }
    
    // Increment count
    if (entry.count < this.maxRequests) {
      entry.count++;
      return { allowed: true, remaining: this.maxRequests - entry.count };
    }
    
    // Rate limit exceeded
    return { allowed: false, remaining: 0 };
  }
}

export const rateLimiter = new RateLimiter(10, 60000);
```

**Reference:** Full implementation di `src/lib/utils/rate-limiter.ts`

---

### **Step 5: Create API Route**

**File:** `src/app/api/links/metadata/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimiter.check(clientIp);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    // 2. Validate request
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }
    
    // 3. Extract metadata
    const service = new MetadataService();
    const result = await service.extractMetadata(validation.data.url);
    
    // 4. Handle errors
    if ('code' in result) {
      return NextResponse.json(
        { success: false, error: result.error, code: result.code },
        { status: getStatusCodeForError(result.code) }
      );
    }
    
    // 5. Return success
    return NextResponse.json(
      { success: true, data: result },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unexpected error', code: 'UNKNOWN' },
      { status: 500 }
    );
  }
}
```

**Reference:** Full implementation di `src/app/api/links/metadata/route.ts`

---

## File References

### 📁 **Core Files**

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **API Route** | `src/app/api/links/metadata/route.ts` | Entry point, rate limiting, validation |
| **Metadata Service** | `src/lib/services/metadata-service.ts` | Orchestrator, extraction strategy |
| **URL Validator** | `src/lib/validators/url-validator.ts` | URL validation & security |
| **HTML Fetcher** | `src/lib/fetchers/html-fetcher.ts` | Fetch HTML with timeout |
| **Meta Parser** | `src/lib/parsers/meta-parser.ts` | Parse HTML metadata |
| **Rate Limiter** | `src/lib/utils/rate-limiter.ts` | Rate limiting logic |

### 🎬 **Service Layer**

| Service | File Path | Purpose |
|---------|-----------|---------|
| **Microlink** | `src/lib/services/microlink-service.ts` | JS-heavy sites (Instagram, TikTok) |
| **Social Scraper** | `src/lib/services/social-media-scraper.ts` | Instagram & TikTok fallback |
| **oEmbed** | `src/lib/services/oembed-service.ts` | YouTube, Vimeo, Twitter |

### 🎨 **Frontend Components**

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Main Page** | `src/app/links/page.tsx` | Client-side logic, API calls |
| **Metadata Editor** | `src/app/links/_components/MetadataEditor.tsx` | Edit metadata fields |
| **Social Previews** | `src/app/links/_components/SocialMediaPreviews.tsx` | Preview cards (FB, Twitter, etc) |
| **Meta Summary** | `src/app/links/_components/MetadataSummary.tsx` | Display meta tags (Postman style) |

### 📚 **Documentation**

| Document | File Path | Purpose |
|----------|-----------|---------|
| **Architecture** | `docs/METADATA_EXTRACTION_ARCHITECTURE.md` | This document |
| **API Flow** | `docs/API_LINKS_METADATA_FLOW.md` | API flow diagram |
| **Rate Limiting** | `docs/RATE_LIMITING.md` | Rate limiting guide |
| **Service Switching** | `docs/HOW_TO_SWITCH_METADATA_SERVICE.md` | Switch between services |

---

## Response Format

### **Success Response**

```json
{
  "success": true,
  "data": {
    "title": "Article Title",
    "description": "Article description text",
    "image": "https://example.com/image.jpg",
    "siteName": "Site Name",
    "url": "https://example.com/article",
    "displayUrl": "example.com",
    "video": "https://example.com/video.mp4",
    "type": "article"
  }
}
```

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1234567890
```

---

### **Error Response**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "retryAfter": 60
}
```

**Error Codes:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | URL format tidak valid |
| `INVALID_REQUEST` | 400 | Request body tidak valid |
| `UNREACHABLE` | 422 | URL tidak bisa diakses |
| `TIMEOUT` | 422 | Request timeout (>15s) |
| `RATE_LIMIT_EXCEEDED` | 429 | Melebihi rate limit |
| `PARSE_ERROR` | 500 | Gagal parsing metadata |
| `UNKNOWN` | 500 | Error tidak diketahui |

**Reference:** Error handling di `src/app/api/links/metadata/route.ts` (line 70-85)

---

## Testing Strategy

### **1. Unit Tests**

Test setiap component secara terpisah:

```typescript
// URL Validator
describe('UrlValidator', () => {
  it('should validate valid URLs', () => {
    const validator = new UrlValidator();
    const result = validator.validate('https://example.com');
    expect(result.valid).toBe(true);
  });
  
  it('should reject malicious URLs', () => {
    const validator = new UrlValidator();
    const result = validator.validate('javascript:alert(1)');
    expect(result.valid).toBe(false);
  });
});
```

### **2. Integration Tests**

Test end-to-end flow:

```typescript
describe('Metadata Extraction API', () => {
  it('should extract metadata from regular website', async () => {
    const response = await fetch('/api/links/metadata', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBeDefined();
  });
  
  it('should handle rate limiting', async () => {
    // Make 11 requests
    for (let i = 0; i < 11; i++) {
      await fetch('/api/links/metadata', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' })
      });
    }
    
    const response = await fetch('/api/links/metadata', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com' })
    });
    
    expect(response.status).toBe(429);
  });
});
```

**Reference:** Test examples di `src/middleware.test.ts`

---

## Performance Optimization

### **1. Caching Strategy**

Tambahkan caching untuk mengurangi API calls:

```typescript
// Simple in-memory cache
const cache = new Map<string, { data: MetadataResult, timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

async extractMetadata(url: string) {
  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Extract metadata
  const result = await this.doExtraction(url);
  
  // Store in cache
  cache.set(url, { data: result, timestamp: Date.now() });
  
  return result;
}
```

---

### **2. Parallel Extraction**

Untuk multiple URLs, gunakan Promise.all:

```typescript
const urls = ['url1', 'url2', 'url3'];
const results = await Promise.all(
  urls.map(url => service.extractMetadata(url))
);
```

---

### **3. Database Storage**

Untuk production, simpan metadata di database:

```typescript
// Check database first
const cached = await db.metadata.findUnique({ where: { url } });
if (cached && Date.now() - cached.updatedAt < CACHE_TTL) {
  return cached;
}

// Extract and save
const result = await service.extractMetadata(url);
await db.metadata.upsert({
  where: { url },
  create: { url, ...result },
  update: { ...result, updatedAt: new Date() }
});
```

---

## Security Considerations

### **1. URL Validation**

✅ **Implemented:**
- Protocol whitelist (http/https only)
- Malicious pattern detection
- Length limits

❌ **Additional Recommendations:**
- Domain blacklist (known malicious domains)
- SSRF protection (block internal IPs)
- Content-Type validation

---

### **2. Rate Limiting**

✅ **Implemented:**
- IP-based rate limiting (10 req/min)
- In-memory storage

❌ **Production Recommendations:**
- Redis-based rate limiting (distributed)
- User-based rate limiting (authenticated users)
- Tiered limits (free vs paid)

---

### **3. Input Sanitization**

✅ **Implemented:**
- HTML tag removal
- Script content removal
- Whitespace normalization

❌ **Additional Recommendations:**
- XSS protection in frontend
- SQL injection prevention (if using database)
- Image URL validation (check file type)

---

## Deployment Checklist

### **Environment Variables**

```env
# Optional: Microlink API Key (for higher limits)
MICROLINK_API_KEY=your_api_key

# Optional: Instagram Access Token (for Instagram oEmbed)
INSTAGRAM_ACCESS_TOKEN=your_token

# Optional: Redis URL (for distributed rate limiting)
REDIS_URL=redis://localhost:6379
```

---

### **Production Setup**

1. ✅ Setup rate limiting dengan Redis
2. ✅ Add database caching (PostgreSQL/MongoDB)
3. ✅ Configure CDN untuk images
4. ✅ Setup monitoring (Sentry, DataDog)
5. ✅ Add logging (Winston, Pino)
6. ✅ Setup CORS properly
7. ✅ Add API authentication (optional)
8. ✅ Configure timeout values
9. ✅ Setup error tracking
10. ✅ Add health check endpoint

---

## Troubleshooting

### **Problem: Microlink API Limit Exceeded**

**Solution:**
1. Upgrade to paid plan ($9/month)
2. Add API key to environment variables
3. Fallback to HTML parsing lebih cepat

```typescript
// Add API key
const apiUrl = `${this.API_URL}?url=${url}&apiKey=${process.env.MICROLINK_API_KEY}`;
```

---

### **Problem: Instagram/TikTok Extraction Fails**

**Solution:**
1. Check if Microlink is working (primary method)
2. Verify User-Agent headers
3. Check if URL format is correct
4. Try oEmbed as fallback

**Debug:**
```typescript
console.log('Trying Microlink...');
const microlinkResult = await MicrolinkService.extractMetadata(url);
console.log('Microlink result:', microlinkResult);

if (!microlinkResult) {
  console.log('Trying Social Scraper...');
  const scraperResult = await SocialMediaScraper.extractInstagram(url);
  console.log('Scraper result:', scraperResult);
}
```

---

### **Problem: Rate Limiting Not Working**

**Solution:**
1. Check if IP detection is working
2. Verify headers (x-forwarded-for, x-real-ip)
3. Test with different IPs

**Debug:**
```typescript
const clientIp = getClientIp(request);
console.log('Client IP:', clientIp);

const status = rateLimiter.getStatus(clientIp);
console.log('Rate limit status:', status);
```

---

### **Problem: Timeout Errors**

**Solution:**
1. Increase timeout value (default: 15s)
2. Check network connectivity
3. Verify target website is accessible

```typescript
// Increase timeout
private static readonly TIMEOUT_MS = 30000; // 30 seconds
```

---

## Future Enhancements

### **1. Advanced Features**

- [ ] PDF metadata extraction
- [ ] Audio file metadata (MP3, etc)
- [ ] Favicon extraction
- [ ] Language detection
- [ ] Reading time estimation
- [ ] Author extraction
- [ ] Publication date extraction
- [ ] Tags/keywords extraction

---

### **2. Performance**

- [ ] Redis caching
- [ ] Database storage
- [ ] CDN integration
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Batch processing
- [ ] Queue system (Bull, BullMQ)

---

### **3. Analytics**

- [ ] Track extraction success rate
- [ ] Monitor API usage
- [ ] Track popular domains
- [ ] Error rate monitoring
- [ ] Performance metrics
- [ ] User behavior analytics

---

## Quick Start Guide

### **Minimal Implementation (5 Steps)**

Jika ingin membuat sistem serupa dengan cepat:

#### **1. Install Dependencies**
```bash
npm install cheerio zod
```

#### **2. Copy Core Files**
```bash
# Copy these files to your project:
src/lib/validators/url-validator.ts
src/lib/fetchers/html-fetcher.ts
src/lib/parsers/meta-parser.ts
src/lib/services/metadata-service.ts
src/lib/utils/rate-limiter.ts
```

#### **3. Create API Route**
```typescript
// src/app/api/metadata/route.ts
import { MetadataService } from '@/lib/services/metadata-service';

export async function POST(request: Request) {
  const { url } = await request.json();
  const service = new MetadataService();
  const result = await service.extractMetadata(url);
  
  return Response.json(result);
}
```

#### **4. Test API**
```bash
curl -X POST http://localhost:3000/api/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

#### **5. Add Frontend (Optional)**
```typescript
// Simple React component
const [metadata, setMetadata] = useState(null);

const handleSubmit = async (url) => {
  const response = await fetch('/api/metadata', {
    method: 'POST',
    body: JSON.stringify({ url })
  });
  const data = await response.json();
  setMetadata(data);
};
```

---

## Summary

### **Key Takeaways**

1. **Multi-Layer Strategy** - Gunakan multiple extraction methods dengan fallback
2. **Rate Limiting** - Protect API dengan rate limiting per IP
3. **Error Handling** - Handle semua error cases dengan proper status codes
4. **Security** - Validate URLs, sanitize input, prevent malicious patterns
5. **Performance** - Use timeout, limit content size, cache results

### **Architecture Benefits**

✅ **Robust** - Multiple fallback strategies
✅ **Scalable** - Easy to add new extraction methods
✅ **Maintainable** - Clear separation of concerns
✅ **Secure** - Input validation & rate limiting
✅ **Fast** - Parallel processing & caching ready

---

## Additional Resources

### **External Documentation**

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [oEmbed Specification](https://oembed.com/)
- [Microlink API](https://microlink.io/docs/api/getting-started/overview)
- [Cheerio Documentation](https://cheerio.js.org/)

### **Related Docs**

- `docs/API_LINKS_METADATA_FLOW.md` - Detailed API flow
- `docs/RATE_LIMITING.md` - Rate limiting implementation
- `docs/HOW_TO_SWITCH_METADATA_SERVICE.md` - Service switching guide
- `docs/METADATA_EXTRACTION_SUMMARY.md` - Summary overview

---

**Last Updated:** 2026-02-04
**Version:** 1.0.0
**Author:** MetaKlik Team
