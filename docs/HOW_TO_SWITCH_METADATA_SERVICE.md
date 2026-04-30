# How to Switch Metadata Extraction Service

Dokumentasi lengkap untuk mengganti service metadata extraction (Microlink, Iframely, LinkPreview, dll).

## 📋 Table of Contents

1. [Current Architecture](#current-architecture)
2. [Available Services](#available-services)
3. [Switching to Microlink](#switching-to-microlink)
4. [Switching to Iframely](#switching-to-iframely)
5. [Switching to LinkPreview](#switching-to-linkpreview)
6. [Adding New Service](#adding-new-service)
7. [Testing](#testing)

---

## Current Architecture

### Flow Diagram

```
User Request
    ↓
API Route (/api/links/metadata/route.ts)
    ↓
MetadataService (src/lib/services/metadata-service.ts)
    ↓
    ├─→ Priority 1: Third-Party Service (Microlink/Iframely/LinkPreview)
    ├─→ Priority 2: Social Media Scraper (Instagram/TikTok)
    ├─→ Priority 3: oEmbed API (YouTube/Vimeo/Twitter)
    └─→ Priority 4: HTML Parser (General websites)
```

### Key Files

```
src/
├── app/api/links/metadata/
│   └── route.ts                    # API endpoint (NO CHANGES NEEDED)
├── lib/services/
│   ├── metadata-service.ts         # Main orchestrator (CHANGE HERE)
│   ├── microlink-service.ts        # Microlink implementation
│   ├── iframely-service.ts         # Iframely implementation
│   ├── linkpreview-service.ts      # LinkPreview implementation
│   ├── oembed-service.ts           # oEmbed (NO CHANGES NEEDED)
│   └── social-media-scraper.ts     # Scraper (NO CHANGES NEEDED)
└── ...
```

---

## Available Services

### 1. Microlink.io (Current Default)

**Status**: ✅ Implemented & Active

**Pros**:
- Free tier: 50 requests/day (no API key)
- Open source
- Fast response

**Cons**:
- Limited free tier
- Instagram/TikTok metadata still limited

**Files**:
- `src/lib/services/microlink-service.ts`

---

### 2. Iframely

**Status**: ⚠️ Implemented but not active

**Pros**:
- Best Instagram/TikTok support
- Rich embed support
- 1,000 free requests/month

**Cons**:
- Requires API key
- Paid after free tier

**Files**:
- `src/lib/services/iframely-service.ts`

---

### 3. LinkPreview.net

**Status**: ❌ Not implemented yet

**Pros**:
- Cheapest ($5/month)
- 60 requests/hour free
- Simple API

**Cons**:
- Requires API key

**Files**:
- Need to create: `src/lib/services/linkpreview-service.ts`

---

## Switching to Microlink

### Current Status: ✅ ACTIVE

Microlink is currently the default service. No changes needed!

### Configuration

**No API key needed for free tier!**

If you want to use paid tier:

1. Sign up at https://microlink.io
2. Get API key
3. Add to `.env`:
```bash
MICROLINK_API_KEY=your_key_here
```

4. Update `src/lib/services/microlink-service.ts`:
```typescript
static async extractMetadata(url: string): Promise<MicrolinkMetadata | null> {
  const apiKey = process.env.MICROLINK_API_KEY;
  const apiUrl = apiKey 
    ? `${this.API_URL}?url=${encodeURIComponent(url)}&apiKey=${apiKey}`
    : `${this.API_URL}?url=${encodeURIComponent(url)}`;
  
  // ... rest of code
}
```

### Code Location

**File**: `src/lib/services/metadata-service.ts`

**Lines**: ~50-65

```typescript
// Step 2: For Instagram/TikTok/Facebook/Twitter, try Microlink first
if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  try {
    const microlinkResult = await MicrolinkService.extractMetadata(normalizedUrl);
    if (microlinkResult && microlinkResult.title) {
      return {
        title: microlinkResult.title,
        description: microlinkResult.description,
        image: microlinkResult.image,
        siteName: microlinkResult.siteName,
        url: normalizedUrl,
      };
    }
  } catch (error) {
    console.log('Microlink failed, trying other methods');
  }
}
```

---

## Switching to Iframely

### Step 1: Get API Key

1. Sign up at https://iframely.com
2. Get your API key
3. Add to `.env`:
```bash
IFRAMELY_API_KEY=your_key_here
```

### Step 2: Create Iframely Service

**File**: `src/lib/services/iframely-service.ts`

```typescript
/**
 * Iframely Service
 * Paid service with best Instagram/TikTok support
 * https://iframely.com
 */

export interface IframelyMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

export class IframelyService {
  private static readonly API_KEY = process.env.IFRAMELY_API_KEY;
  private static readonly API_URL = 'https://iframe.ly/api/iframely';
  private static readonly TIMEOUT = 10000;

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  static async extractMetadata(url: string): Promise<IframelyMetadata | null> {
    if (!this.API_KEY) {
      console.error('IFRAMELY_API_KEY not configured');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&api_key=${this.API_KEY}`;

      const response = await fetch(apiUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        title: data.meta?.title || data.title || '',
        description: data.meta?.description || data.description || '',
        image: data.links?.thumbnail?.[0]?.href || data.links?.icon?.[0]?.href || null,
        siteName: data.meta?.site || null,
      };
    } catch (error) {
      console.error('Iframely API error:', error);
      return null;
    }
  }

  static shouldUseIframely(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      // Use Iframely for social media that needs JS rendering
      return (
        hostname.includes('instagram.com') ||
        hostname.includes('tiktok.com') ||
        hostname.includes('facebook.com')
      );
    } catch {
      return false;
    }
  }
}
```

### Step 3: Update MetadataService

**File**: `src/lib/services/metadata-service.ts`

**Change 1**: Import Iframely
```typescript
import { IframelyService } from './iframely-service';
```

**Change 2**: Replace Microlink with Iframely (around line 50)

**BEFORE** (Microlink):
```typescript
// Step 2: For Instagram/TikTok/Facebook/Twitter, try Microlink first
if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  try {
    const microlinkResult = await MicrolinkService.extractMetadata(normalizedUrl);
    if (microlinkResult && microlinkResult.title) {
      return {
        title: microlinkResult.title,
        description: microlinkResult.description,
        image: microlinkResult.image,
        siteName: microlinkResult.siteName,
        url: normalizedUrl,
      };
    }
  } catch (error) {
    console.log('Microlink failed, trying other methods');
  }
}
```

**AFTER** (Iframely):
```typescript
// Step 2: For Instagram/TikTok/Facebook, try Iframely first
if (IframelyService.shouldUseIframely(normalizedUrl) && IframelyService.isConfigured()) {
  try {
    const iframelyResult = await IframelyService.extractMetadata(normalizedUrl);
    if (iframelyResult && iframelyResult.title) {
      return {
        title: iframelyResult.title,
        description: iframelyResult.description,
        image: iframelyResult.image,
        siteName: iframelyResult.siteName,
        url: normalizedUrl,
      };
    }
  } catch (error) {
    console.log('Iframely failed, trying other methods');
  }
}
```

### Step 4: Test

```bash
# Test with Instagram
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'
```

---

## Switching to LinkPreview

### Step 1: Get API Key

1. Sign up at https://www.linkpreview.net
2. Get your API key
3. Add to `.env`:
```bash
LINKPREVIEW_API_KEY=your_key_here
```

### Step 2: Create LinkPreview Service

**File**: `src/lib/services/linkpreview-service.ts`

```typescript
/**
 * LinkPreview Service
 * Affordable service with good social media support
 * https://www.linkpreview.net
 */

export interface LinkPreviewMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

export class LinkPreviewService {
  private static readonly API_KEY = process.env.LINKPREVIEW_API_KEY;
  private static readonly API_URL = 'https://api.linkpreview.net';
  private static readonly TIMEOUT = 10000;

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  static async extractMetadata(url: string): Promise<LinkPreviewMetadata | null> {
    if (!this.API_KEY) {
      console.error('LINKPREVIEW_API_KEY not configured');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const apiUrl = `${this.API_URL}/?key=${this.API_KEY}&q=${encodeURIComponent(url)}`;

      const response = await fetch(apiUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        title: data.title || '',
        description: data.description || '',
        image: data.image || null,
        siteName: data.url ? new URL(data.url).hostname : null,
      };
    } catch (error) {
      console.error('LinkPreview API error:', error);
      return null;
    }
  }

  static shouldUseLinkPreview(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      return (
        hostname.includes('instagram.com') ||
        hostname.includes('tiktok.com') ||
        hostname.includes('facebook.com') ||
        hostname.includes('twitter.com')
      );
    } catch {
      return false;
    }
  }
}
```

### Step 3: Update MetadataService

Same as Iframely, but replace with LinkPreview:

```typescript
import { LinkPreviewService } from './linkpreview-service';

// In extractMetadata method:
if (LinkPreviewService.shouldUseLinkPreview(normalizedUrl) && LinkPreviewService.isConfigured()) {
  try {
    const linkPreviewResult = await LinkPreviewService.extractMetadata(normalizedUrl);
    if (linkPreviewResult && linkPreviewResult.title) {
      return {
        title: linkPreviewResult.title,
        description: linkPreviewResult.description,
        image: linkPreviewResult.image,
        siteName: linkPreviewResult.siteName,
        url: normalizedUrl,
      };
    }
  } catch (error) {
    console.log('LinkPreview failed, trying other methods');
  }
}
```

---

## Adding New Service

### Template for New Service

**File**: `src/lib/services/your-service-name.ts`

```typescript
/**
 * YourService Service
 * Description
 * https://your-service.com
 */

export interface YourServiceMetadata {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

export class YourService {
  private static readonly API_KEY = process.env.YOUR_SERVICE_API_KEY;
  private static readonly API_URL = 'https://api.your-service.com';
  private static readonly TIMEOUT = 10000;

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  static async extractMetadata(url: string): Promise<YourServiceMetadata | null> {
    if (!this.API_KEY) {
      console.error('YOUR_SERVICE_API_KEY not configured');
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      // Adjust API URL format based on service documentation
      const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&key=${this.API_KEY}`;

      const response = await fetch(apiUrl, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Adjust field mapping based on API response
      return {
        title: data.title || '',
        description: data.description || '',
        image: data.image || null,
        siteName: data.siteName || null,
      };
    } catch (error) {
      console.error('YourService API error:', error);
      return null;
    }
  }

  static shouldUseYourService(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      // Define which URLs should use this service
      return (
        hostname.includes('instagram.com') ||
        hostname.includes('tiktok.com')
      );
    } catch {
      return false;
    }
  }
}
```

### Integration Steps

1. Create service file
2. Add API key to `.env`
3. Import in `metadata-service.ts`
4. Add to priority chain in `extractMetadata` method
5. Test thoroughly

---

## Testing

### Test Script

Create `test-metadata-service.sh`:

```bash
#!/bin/bash

echo "Testing Metadata Extraction Service"
echo "===================================="

# Test Instagram
echo -e "\n1. Testing Instagram..."
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}' \
  -s | jq .

# Test TikTok
echo -e "\n2. Testing TikTok..."
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@username/video/1234567890"}' \
  -s | jq .

# Test YouTube
echo -e "\n3. Testing YouTube..."
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  -s | jq .

# Test Tokopedia
echo -e "\n4. Testing Tokopedia..."
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://tk.tokopedia.com/ZSPoJDbn6/"}' \
  -s | jq .

# Test GitHub
echo -e "\n5. Testing GitHub..."
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}' \
  -s | jq .

echo -e "\n===================================="
echo "Testing Complete!"
```

Run:
```bash
chmod +x test-metadata-service.sh
./test-metadata-service.sh
```

---

## Quick Reference

### Current Service: Microlink

**File to change**: `src/lib/services/metadata-service.ts` (line ~50)

**Environment variable**: None needed (free tier)

**Code location**:
```typescript
if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  // Microlink logic here
}
```

### Switch to Iframely

1. Add `IFRAMELY_API_KEY` to `.env`
2. Create `iframely-service.ts`
3. Replace `MicrolinkService` with `IframelyService` in `metadata-service.ts`

### Switch to LinkPreview

1. Add `LINKPREVIEW_API_KEY` to `.env`
2. Create `linkpreview-service.ts`
3. Replace `MicrolinkService` with `LinkPreviewService` in `metadata-service.ts`

---

## Troubleshooting

### Service not working?

1. Check API key in `.env`
2. Check service is imported in `metadata-service.ts`
3. Check `isConfigured()` returns true
4. Check API endpoint URL is correct
5. Check response format matches expected structure

### Still getting limited metadata?

1. Check service free tier limits
2. Verify API key is valid
3. Try different service
4. Use manual input as fallback

### Need help?

Check:
- `docs/THIRD_PARTY_SERVICES_COMPARISON.md` - Service comparison
- `docs/SOCIAL_MEDIA_LIMITATIONS.md` - Why Instagram/TikTok are hard
- `src/app/api/links/metadata/README.md` - API documentation

---

## Summary

**To switch services, you only need to change ONE file:**

`src/lib/services/metadata-service.ts` (around line 50-65)

Replace the service call in the priority chain. Everything else stays the same!

**Current priority**:
1. Microlink (Instagram/TikTok/Facebook/Twitter)
2. Social Media Scraper (fallback)
3. oEmbed (YouTube/Vimeo)
4. HTML Parser (general websites)

**To change**: Just swap step 1 with your preferred service! 🎉
