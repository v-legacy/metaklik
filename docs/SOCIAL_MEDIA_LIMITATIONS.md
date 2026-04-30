# Social Media Metadata Extraction - Limitations & Solutions

## Problem

Instagram dan TikTok menggunakan **client-side rendering (JavaScript)** untuk menampilkan konten. Ini berarti:
- Meta tags tidak ada di HTML awal
- Konten di-render setelah JavaScript dijalankan
- Server-side scraping tidak bisa mendapatkan metadata lengkap

## Current Status

### ✅ Working Platforms
- **YouTube** - Full metadata via oEmbed API
- **GitHub** - Full metadata via HTML meta tags
- **Tokopedia** - Full metadata via HTML meta tags
- **General websites** - Full metadata via HTML parsing

### ⚠️ Limited Platforms
- **Instagram** - Hanya mendapatkan "Instagram" sebagai title
- **TikTok** - Metadata terbatas atau tidak ada

## Solutions

### Option 1: Third-Party API (Recommended for Production)

Gunakan service yang sudah handle JavaScript rendering:

#### A. Iframely (https://iframely.com)
```typescript
// Free tier: 1000 requests/month
const response = await fetch(
  `https://iframe.ly/api/iframely?url=${encodeURIComponent(url)}&api_key=YOUR_KEY`
);
```

**Pros**:
- Support semua social media
- Reliable dan fast
- No maintenance

**Cons**:
- Paid service (after free tier)
- External dependency

#### B. Embedly (https://embed.ly)
```typescript
const response = await fetch(
  `https://api.embedly.com/1/oembed?url=${encodeURIComponent(url)}&key=YOUR_KEY`
);
```

**Pros**:
- Mature service
- Good documentation

**Cons**:
- Paid service
- Rate limits

#### C. LinkPreview (https://www.linkpreview.net)
```typescript
const response = await fetch(
  `https://api.linkpreview.net/?key=YOUR_KEY&q=${encodeURIComponent(url)}`
);
```

**Pros**:
- Simple API
- Affordable

**Cons**:
- Limited free tier

### Option 2: Headless Browser (Heavy but Complete)

Gunakan Puppeteer atau Playwright untuk render JavaScript:

```typescript
import puppeteer from 'puppeteer';

async function extractWithBrowser(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  const metadata = await page.evaluate(() => {
    return {
      title: document.querySelector('meta[property="og:title"]')?.content,
      description: document.querySelector('meta[property="og:description"]')?.content,
      image: document.querySelector('meta[property="og:image"]')?.content,
    };
  });
  
  await browser.close();
  return metadata;
}
```

**Pros**:
- Full control
- Works for all websites
- No external dependencies

**Cons**:
- Heavy resource usage (RAM, CPU)
- Slow (2-5 seconds per request)
- Requires browser installation
- Complex deployment

### Option 3: Instagram/TikTok Official APIs

#### Instagram Graph API
Requires Facebook App:
```typescript
const response = await fetch(
  `https://graph.facebook.com/v18.0/instagram_oembed?url=${url}&access_token=${token}`
);
```

**Pros**:
- Official API
- Reliable

**Cons**:
- Requires Facebook App setup
- Need access token
- Rate limits

#### TikTok oEmbed
```typescript
const response = await fetch(
  `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
);
```

**Status**: Sometimes works, sometimes blocked

### Option 4: Hybrid Approach (Current Implementation)

Strategi fallback bertingkat:
1. Try specialized scraper (Instagram/TikTok)
2. Try oEmbed API (YouTube, Vimeo, Twitter)
3. Fallback to HTML parsing

**Pros**:
- No external dependencies
- Works for most platforms

**Cons**:
- Instagram/TikTok tetap limited

## Recommended Implementation

### For MVP/Development
Gunakan current implementation dengan dokumentasi yang jelas tentang limitasi.

### For Production
Pilih salah satu:

1. **Best User Experience**: Iframely/Embedly
   - Reliable untuk semua platform
   - Fast response time
   - Cost: ~$10-50/month

2. **Budget Conscious**: Hybrid + Manual fallback
   - Current implementation
   - Allow users to manually input metadata untuk Instagram/TikTok
   - Free

3. **Full Control**: Puppeteer + Queue System
   - Background job processing
   - Cache results
   - Cost: Server resources

## Implementation Example: Iframely Integration

```typescript
// src/lib/services/iframely-service.ts
export class IframelyService {
  private static readonly API_KEY = process.env.IFRAMELY_API_KEY;
  private static readonly API_URL = 'https://iframe.ly/api/iframely';

  static async extractMetadata(url: string) {
    if (!this.API_KEY) {
      throw new Error('IFRAMELY_API_KEY not configured');
    }

    const response = await fetch(
      `${this.API_URL}?url=${encodeURIComponent(url)}&api_key=${this.API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Iframely API failed');
    }

    const data = await response.json();
    
    return {
      title: data.meta?.title || data.title,
      description: data.meta?.description || data.description,
      image: data.links?.thumbnail?.[0]?.href || data.links?.icon?.[0]?.href,
      siteName: data.meta?.site,
    };
  }
}
```

## Testing

### Test URLs

**Instagram**:
- https://www.instagram.com/p/DDhWGGqSsHi/
- Expected: Post title, image, description
- Current: "Instagram" only

**TikTok**:
- https://www.tiktok.com/@username/video/1234567890
- Expected: Video title, thumbnail
- Current: Limited or none

**YouTube** (Working):
- https://www.youtube.com/watch?v=dQw4w9WgXcQ
- Expected: Full metadata ✅
- Current: Full metadata ✅

## Conclusion

Untuk production app yang serius, **gunakan third-party API** seperti Iframely atau Embedly. Ini adalah trade-off antara cost dan user experience yang worth it untuk social media links.

Alternatif: Berikan opsi untuk user **manually input** metadata untuk Instagram/TikTok posts.
