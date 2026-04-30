# Troubleshooting Guide

## Common Issues and Solutions

### 1. Image Not Displaying from Shortlinks

**Symptoms:**
- Metadata extraction works but `image` field is `null`
- Happens with shortlinks like Shopee (`id.shp.ee`), Tokopedia, etc.

**Cause:**
Website menggunakan relative URLs di meta tags.

**Solution:**
✅ Already fixed! The meta parser now handles relative URLs automatically.

**How to verify:**
```bash
# Check console logs for debug info
Meta Parser Debug: {
  ogImage: '//cdn.shopee.co.id/file/abc123',
  twitterImage: null,
  url: 'https://shopee.co.id/...'
}
Validated image URL: 'https://cdn.shopee.co.id/file/abc123'
```

---

### 2. "Failed to parse URL from /api/links/metadata"

**Symptoms:**
```
TypeError: Failed to parse URL from /api/links/metadata
code: 'ERR_INVALID_URL'
```

**Cause:**
Server Actions tidak bisa menggunakan relative URLs.

**Solution:**
✅ Already fixed! Link actions now use absolute URLs with `API_URL`.

**Verification:**
```typescript
// ✅ CORRECT
const response = await fetch(`${API_URL}/api/links/metadata`, { ... })

// ❌ WRONG (in Server Actions)
const response = await fetch('/api/links/metadata', { ... })
```

---

### 3. "this.getPlatformName is not a function"

**Symptoms:**
```
TypeError: this.getPlatformName is not a function
at OEmbedService.extractMetadata
```

**Cause:**
Calling static method dengan `this` instead of class name.

**Solution:**
✅ Already fixed! Now uses `OEmbedService.getPlatformName()`.

---

### 4. Type Error: "string | undefined not assignable to string"

**Symptoms:**
```
Type 'string | undefined' is not assignable to type 'string'
```

**Cause:**
Optional properties dari API response assigned ke required properties.

**Solution:**
Use nullish coalescing operator:
```typescript
// ✅ CORRECT
title: result?.title ?? 'Default Title'

// ❌ WRONG
title: result?.title
```

---

### 5. Missing `type` Field in Response

**Symptoms:**
API response tidak include `type` field (video/image/article/website).

**Cause:**
Service tidak return `type` field.

**Solution:**
✅ Already fixed! All services now return `type` field:
- OEmbedService
- SocialMediaScraper
- MicrolinkService
- MetaParser

---

## Debug Checklist

### When metadata extraction fails:

1. **Check console logs**
   ```
   Meta Parser Debug: { ogImage: '...', twitterImage: '...', url: '...' }
   Validated image URL: '...'
   ```

2. **Verify URL is accessible**
   ```bash
   curl -I https://example.com/your-url
   ```

3. **Check if URL requires JavaScript**
   - Some sites need JS to load meta tags
   - Consider using Microlink service for these cases

4. **Test with different URL types**
   - Direct product URLs
   - Shortlinks
   - Social media posts

5. **Check rate limiting**
   ```json
   {
     "success": false,
     "error": "Rate limit exceeded",
     "code": "RATE_LIMIT_EXCEEDED",
     "retryAfter": 60
   }
   ```

---

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TOKEN=your_token_here
IFRAMELY_API_KEY=your_iframely_key (optional)
```

---

## Testing URLs

Use these URLs for testing different scenarios:

### E-commerce
- Shopee shortlink: `https://id.shp.ee/AAF8YTZ`
- Tokopedia: `https://www.tokopedia.com/...`
- Bukalapak: `https://www.bukalapak.com/...`

### Social Media
- YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- TikTok: `https://www.tiktok.com/@user/video/123`
- Twitter: `https://twitter.com/user/status/123`

### Regular Websites
- News: `https://www.bbc.com/news/...`
- Blog: `https://medium.com/@user/article`

---

## Performance Tips

1. **Use rate limiting wisely**
   - Default: 10 requests per minute per IP
   - Adjust in `src/lib/utils/rate-limiter.ts`

2. **Cache results**
   - Consider caching metadata for frequently accessed URLs
   - Implement Redis or similar for production

3. **Timeout settings**
   - HTML Fetcher: 15 seconds
   - OEmbed: 10 seconds
   - Adjust based on your needs

---

## Getting Help

If you encounter issues not covered here:

1. Check the console logs for detailed error messages
2. Review the debug output from meta parser
3. Test the URL manually with curl/browser
4. Check if the website blocks bots (User-Agent)
5. Consider using Microlink/Iframely for problematic sites

---

## Related Documentation

- [Relative URL Fix](./RELATIVE_URL_FIX.md)
- [Metadata Extraction Architecture](./METADATA_EXTRACTION_ARCHITECTURE.md)
- [API Documentation](./API_LINKS_METADATA_FLOW.md)
- [Changelog](./CHANGELOG.md)
