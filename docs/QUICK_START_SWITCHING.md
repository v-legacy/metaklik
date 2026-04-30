# Quick Start: Switching Metadata Services

Panduan super cepat untuk mengganti service dalam 5 menit.

## 🚀 TL;DR

**File yang perlu diubah**: HANYA 1 file!
- `src/lib/services/metadata-service.ts` (line ~50)

**Yang perlu dilakukan**:
1. Ganti import
2. Ganti 1 blok kode (~10 lines)
3. Done!

---

## ⚡ Current: Microlink (Free, No API Key)

### Status
✅ **ACTIVE** - Tidak perlu ubah apa-apa!

### Code Location
```typescript
// src/lib/services/metadata-service.ts (line ~50)

if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  const result = await MicrolinkService.extractMetadata(normalizedUrl);
  if (result && result.title) {
    return { title, description, image, siteName, url };
  }
}
```

---

## 🔄 Switch to Iframely (Best Instagram/TikTok)

### 1. Get API Key
```bash
# Visit: https://iframely.com
# Sign up → Get API key
```

### 2. Add to .env
```bash
IFRAMELY_API_KEY=your_key_here
```

### 3. Create Service File
```bash
# Copy template dari docs/HOW_TO_SWITCH_METADATA_SERVICE.md
# Atau gunakan code di bawah
```

**File**: `src/lib/services/iframely-service.ts`
```typescript
export class IframelyService {
  private static readonly API_KEY = process.env.IFRAMELY_API_KEY;
  private static readonly API_URL = 'https://iframe.ly/api/iframely';

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  static async extractMetadata(url: string) {
    if (!this.API_KEY) return null;
    
    const apiUrl = `${this.API_URL}?url=${encodeURIComponent(url)}&api_key=${this.API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return {
      title: data.meta?.title || data.title || '',
      description: data.meta?.description || '',
      image: data.links?.thumbnail?.[0]?.href || null,
      siteName: data.meta?.site || null,
    };
  }

  static shouldUseIframely(url: string): boolean {
    return url.includes('instagram.com') || 
           url.includes('tiktok.com') || 
           url.includes('facebook.com');
  }
}
```

### 4. Update metadata-service.ts

**Change 1**: Import (line ~6)
```typescript
// BEFORE
import { MicrolinkService } from './microlink-service';

// AFTER
import { IframelyService } from './iframely-service';
```

**Change 2**: Code block (line ~50)
```typescript
// BEFORE
if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  const result = await MicrolinkService.extractMetadata(normalizedUrl);
  if (result && result.title) {
    return { /* ... */ };
  }
}

// AFTER
if (IframelyService.shouldUseIframely(normalizedUrl) && 
    IframelyService.isConfigured()) {
  const result = await IframelyService.extractMetadata(normalizedUrl);
  if (result && result.title) {
    return { /* ... */ };
  }
}
```

### 5. Test
```bash
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'
```

---

## 💰 Switch to LinkPreview (Cheapest: $5/month)

### 1. Get API Key
```bash
# Visit: https://www.linkpreview.net
# Sign up → Get API key
```

### 2. Add to .env
```bash
LINKPREVIEW_API_KEY=your_key_here
```

### 3. Create Service File

**File**: `src/lib/services/linkpreview-service.ts`
```typescript
export class LinkPreviewService {
  private static readonly API_KEY = process.env.LINKPREVIEW_API_KEY;
  private static readonly API_URL = 'https://api.linkpreview.net';

  static isConfigured(): boolean {
    return !!this.API_KEY;
  }

  static async extractMetadata(url: string) {
    if (!this.API_KEY) return null;
    
    const apiUrl = `${this.API_URL}/?key=${this.API_KEY}&q=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return {
      title: data.title || '',
      description: data.description || '',
      image: data.image || null,
      siteName: data.url ? new URL(data.url).hostname : null,
    };
  }

  static shouldUseLinkPreview(url: string): boolean {
    return url.includes('instagram.com') || 
           url.includes('tiktok.com') || 
           url.includes('facebook.com');
  }
}
```

### 4. Update metadata-service.ts

**Change 1**: Import
```typescript
import { LinkPreviewService } from './linkpreview-service';
```

**Change 2**: Code block
```typescript
if (LinkPreviewService.shouldUseLinkPreview(normalizedUrl) && 
    LinkPreviewService.isConfigured()) {
  const result = await LinkPreviewService.extractMetadata(normalizedUrl);
  if (result && result.title) {
    return { /* ... */ };
  }
}
```

---

## 🎯 Exact Line Numbers

**File**: `src/lib/services/metadata-service.ts`

```typescript
1   /**
2    * Metadata Service
3    * Orchestrates URL validation, HTML fetching, and metadata parsing
4    */
5   
6   import { UrlValidator } from '../validators/url-validator';
7   import { HtmlFetcher } from '../fetchers/html-fetcher';
8   import { MetaParser } from '../parsers/meta-parser';
9   import { OEmbedService } from './oembed-service';
10  import { SocialMediaScraper } from './social-media-scraper';
11  import { MicrolinkService } from './microlink-service';  ← CHANGE THIS LINE
12  
13  // ... interface definitions ...
14  
15  export class MetadataService {
16    // ... constructor ...
17    
18    async extractMetadata(url: string): Promise<MetadataResult | MetadataError> {
19      // Step 1: Validate URL
20      const validation = this.validator.validate(url);
21      if (!validation.valid) {
22        return { error: validation.error || 'Invalid URL', code: 'INVALID_URL' };
23      }
24  
25      const normalizedUrl = validation.normalizedUrl!;
26  
27      // Step 2: Try third-party service first
28      if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {  ← CHANGE FROM HERE
29        try {
30          const result = await MicrolinkService.extractMetadata(normalizedUrl);
31          if (result && result.title) {
32            return {
33              title: result.title,
34              description: result.description,
35              image: result.image,
36              siteName: result.siteName,
37              url: normalizedUrl,
38            };
39          }
40        } catch (error) {
41          console.log('Service failed, trying other methods');
42        }
43      }  ← TO HERE (15 lines total)
44  
45      // Step 3: Try social media scraper...
46      // ... rest of code stays the same ...
47    }
48  }
```

**To switch**: Replace lines 11 and 28-43

---

## 📋 Checklist

### Before Switching
- [ ] Backup `metadata-service.ts`
- [ ] Get API key from new service
- [ ] Add API key to `.env`
- [ ] Test current service still works

### During Switch
- [ ] Create new service file
- [ ] Update import in `metadata-service.ts`
- [ ] Replace code block in `extractMetadata` method
- [ ] Save files

### After Switch
- [ ] Restart dev server
- [ ] Test Instagram URL
- [ ] Test TikTok URL
- [ ] Test YouTube URL (should still work)
- [ ] Test regular website (should still work)
- [ ] Check logs for errors

---

## 🧪 Test Commands

```bash
# Test Instagram
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'

# Test TikTok
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@username/video/123"}'

# Test YouTube (should use oEmbed, not your service)
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Test regular website (should use HTML parser)
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'
```

---

## 🔥 Copy-Paste Ready

### Iframely Complete Code

**Step 1**: Create `src/lib/services/iframely-service.ts`
```typescript
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

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;

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
      return hostname.includes('instagram.com') || 
             hostname.includes('tiktok.com') || 
             hostname.includes('facebook.com');
    } catch {
      return false;
    }
  }
}
```

**Step 2**: Update `src/lib/services/metadata-service.ts`

Replace line 11:
```typescript
import { IframelyService } from './iframely-service';
```

Replace lines 28-43:
```typescript
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

**Step 3**: Add to `.env`
```bash
IFRAMELY_API_KEY=your_api_key_here
```

**Done!** 🎉

---

## 💡 Pro Tip: Use Both!

You can use multiple services for redundancy:

```typescript
// Try Iframely first (best quality)
if (IframelyService.shouldUseIframely(url) && IframelyService.isConfigured()) {
  const result = await IframelyService.extractMetadata(url);
  if (result) return result;
}

// Fallback to Microlink (free)
if (MicrolinkService.shouldUseMicrolink(url)) {
  const result = await MicrolinkService.extractMetadata(url);
  if (result) return result;
}
```

---

## 📚 Need More Details?

- **Full Guide**: `docs/HOW_TO_SWITCH_METADATA_SERVICE.md`
- **Visual Guide**: `docs/SERVICE_SWITCHING_VISUAL_GUIDE.md`
- **Service Comparison**: `docs/THIRD_PARTY_SERVICES_COMPARISON.md`

---

## ⏱️ Time Estimate

- **Read this guide**: 2 minutes
- **Get API key**: 2 minutes
- **Make changes**: 1 minute
- **Test**: 2 minutes

**Total**: ~7 minutes ⚡

---

## 🎉 That's It!

Switching services is as simple as:
1. Import different service
2. Call different method
3. Done!

The rest of the system handles everything automatically! 🚀
