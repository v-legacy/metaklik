# Setup Iframely for Professional Metadata Extraction

## Why Iframely?

Iframely adalah solusi profesional untuk metadata extraction yang:
- ✅ Support **semua social media** (Instagram, TikTok, YouTube, Twitter, dll)
- ✅ Handle **JavaScript rendering** otomatis
- ✅ **Fast & reliable** (< 1 second response time)
- ✅ **Free tier** 1000 requests/month
- ✅ **No maintenance** required

## Quick Setup (5 menit)

### Step 1: Get API Key

1. Kunjungi https://iframely.com
2. Click "Sign Up" atau "Get Started"
3. Pilih **Free Plan** (1000 requests/month)
4. Verify email Anda
5. Copy API key dari dashboard

### Step 2: Configure Environment Variable

```bash
# .env.local
IFRAMELY_API_KEY=your_api_key_here
```

### Step 3: Restart Development Server

```bash
npm run dev
```

That's it! 🎉

## Testing

### Test Instagram (akan menggunakan Iframely jika configured)

```bash
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'
```

**Expected Result** (with Iframely):
```json
{
  "success": true,
  "data": {
    "title": "Instagram post title",
    "description": "Post description...",
    "image": "https://instagram.com/image.jpg",
    "siteName": "Instagram",
    "url": "https://www.instagram.com/p/DDhWGGqSsHi/"
  }
}
```

### Test TikTok

```bash
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tiktok.com/@username/video/1234567890"}'
```

## How It Works

### Extraction Strategy (Priority Order)

```
1. Instagram/TikTok → Iframely (if configured) ✨
2. Instagram/TikTok → Social Media Scraper (fallback)
3. YouTube/Vimeo/Twitter → oEmbed API
4. Other websites → HTML Parsing
```

### Code Flow

```typescript
// src/lib/services/metadata-service.ts

async extractMetadata(url: string) {
  // 1. Validate URL
  const validation = this.validator.validate(url);
  
  // 2. For Instagram/TikTok, try Iframely first
  if (isInstagram || isTikTok) {
    if (IframelyService.isConfigured()) {
      const result = await IframelyService.extractMetadata(url);
      if (result) return result; // ✅ Success!
    }
  }
  
  // 3. Fallback to other methods...
}
```

## Pricing

### Free Tier (Perfect for MVP)
- **1,000 requests/month**
- All features included
- No credit card required
- Perfect untuk testing & development

### Paid Plans (For Production)
- **Starter**: $10/month - 10,000 requests
- **Pro**: $50/month - 100,000 requests
- **Business**: $200/month - 500,000 requests

### Cost Calculation

Contoh usage:
- 100 users/day × 5 links/user = 500 requests/day
- 500 × 30 days = **15,000 requests/month**
- Cost: **$10/month** (Starter plan)

**ROI**: Excellent UX untuk users vs $10/month = Worth it! 💰

## Without Iframely (Fallback Behavior)

Jika Iframely tidak di-configure:

### Instagram
- ❌ Limited metadata (hanya "Instagram" sebagai title)
- ⚠️ No description, no image
- 💡 Recommendation: Setup Iframely

### TikTok
- ❌ Limited metadata
- ⚠️ Inconsistent results
- 💡 Recommendation: Setup Iframely

### Other Platforms (Still Work Great!)
- ✅ YouTube - Full metadata via oEmbed
- ✅ GitHub - Full metadata via HTML
- ✅ Tokopedia - Full metadata via HTML
- ✅ Twitter - Good metadata via oEmbed

## Monitoring Usage

### Check Iframely Dashboard
1. Login ke https://iframely.com
2. Go to Dashboard
3. View usage statistics
4. Set up alerts untuk mendekati limit

### Log Iframely Calls (Optional)

```typescript
// src/lib/services/iframely-service.ts

static async extractMetadata(url: string) {
  console.log('[Iframely] Extracting:', url);
  
  const result = await fetch(apiUrl);
  
  console.log('[Iframely] Success:', result.status);
  // Track usage in your analytics
}
```

## Troubleshooting

### "Iframely API key not configured"

**Solution**: Set `IFRAMELY_API_KEY` in `.env.local`

```bash
IFRAMELY_API_KEY=your_actual_key_here
```

### "Iframely API error: 401"

**Solution**: API key invalid atau expired
- Check API key di dashboard
- Regenerate jika perlu

### "Iframely API error: 429"

**Solution**: Rate limit exceeded
- Upgrade plan
- Implement caching (Redis)
- Reduce requests

### Still Getting Limited Metadata

**Check**:
1. API key configured? `console.log(process.env.IFRAMELY_API_KEY)`
2. Server restarted after adding env var?
3. Check Iframely dashboard untuk errors

## Production Best Practices

### 1. Caching (Highly Recommended)

```typescript
// Implement Redis cache
const cacheKey = `metadata:${url}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const metadata = await IframelyService.extractMetadata(url);
await redis.set(cacheKey, JSON.stringify(metadata), 'EX', 86400); // 24h
```

### 2. Error Handling

```typescript
try {
  const metadata = await IframelyService.extractMetadata(url);
  return metadata;
} catch (error) {
  // Log to monitoring service (Sentry, etc)
  logger.error('Iframely failed', { url, error });
  
  // Fallback to other methods
  return fallbackExtraction(url);
}
```

### 3. Rate Limiting

```typescript
// Implement rate limiting per user
const userLimit = await redis.get(`ratelimit:${userId}`);
if (userLimit > 100) {
  throw new Error('Rate limit exceeded');
}
```

## Alternative Services

Jika Iframely tidak cocok:

### 1. Embedly
- Similar features
- Pricing: $9-99/month
- https://embed.ly

### 2. LinkPreview
- Simpler API
- Pricing: $5-50/month
- https://www.linkpreview.net

### 3. Microlink
- Open source option
- Self-hosted available
- https://microlink.io

## Summary

| Aspect | Without Iframely | With Iframely |
|--------|------------------|---------------|
| Instagram | ❌ Limited | ✅ Full metadata |
| TikTok | ❌ Limited | ✅ Full metadata |
| YouTube | ✅ Works | ✅ Works |
| Setup Time | 0 min | 5 min |
| Cost | Free | $0-10/month |
| UX Quality | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommendation**: Setup Iframely untuk production app. ROI sangat worth it! 🚀
