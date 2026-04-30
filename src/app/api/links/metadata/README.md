# Link Metadata Extraction API

API endpoint untuk mengekstrak metadata dari URL (Open Graph, Twitter Cards, dan standard HTML meta tags).

## Endpoint

```
POST /api/links/metadata
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "url": "https://example.com"
}
```

## Response

### Success Response (200)
```json
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
```json
{
  "success": false,
  "error": "Invalid URL format",
  "code": "INVALID_URL"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_URL` | 400 | URL format tidak valid |
| `INVALID_REQUEST` | 400 | Request body tidak valid |
| `UNREACHABLE` | 422 | URL tidak dapat diakses (4xx/5xx) |
| `TIMEOUT` | 422 | Request timeout (>10 detik) |
| `PARSE_ERROR` | 500 | Gagal parsing HTML |
| `UNKNOWN` | 500 | Error tidak terduga |

## Fitur

✅ **Validasi URL**
- Format URL yang valid
- Protocol http/https only
- Max length 2048 karakter
- Deteksi malicious patterns

✅ **Ekstraksi Metadata**
- Open Graph tags (priority 1)
- Twitter Card tags (priority 2)
- Standard meta tags (priority 3)
- HTML title tag (fallback)

✅ **Error Handling**
- Timeout 10 detik
- Max 5 redirects
- HTTP error handling (4xx, 5xx)
- Graceful parsing untuk malformed HTML

✅ **Security**
- Sanitasi HTML tags dan scripts
- Validasi image URLs
- Content size limit (1MB)
- CORS support

## Contoh Penggunaan

### JavaScript/TypeScript
```typescript
const response = await fetch('/api/links/metadata', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://github.com'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Title:', result.data.title);
  console.log('Description:', result.data.description);
  console.log('Image:', result.data.image);
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'
```

## Testing

Contoh test dengan berbagai URL:

```bash
# Valid URL dengan metadata lengkap
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com"}'

# Invalid URL format
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-url"}'

# Unsupported protocol
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"ftp://example.com"}'
```

## Integrasi dengan Form

Endpoint ini bisa diintegrasikan dengan form create link untuk auto-fill metadata:

```typescript
// src/app/(customer)/dashboard/links/create/page.tsx
async function handleUrlBlur(url: string) {
  const response = await fetch('/api/links/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const result = await response.json();
  if (result.success) {
    // Auto-fill form fields
    form.setValue('title', result.data.title);
    form.setValue('description', result.data.description);
    form.setValue('image_url', result.data.image);
  }
}
```


## Social Media Support

API ini mendukung ekstraksi metadata dari berbagai platform social media dengan strategi multi-tier:

### ✅ Fully Supported (Production Ready)

**With Iframely** (Recommended):
- **Instagram** - Full metadata (title, description, image, author)
- **TikTok** - Full metadata (video title, thumbnail, author)
- **YouTube** - Full metadata via oEmbed
- **Twitter/X** - Full metadata via oEmbed
- **Vimeo** - Full metadata via oEmbed
- **Facebook** - Full metadata
- **LinkedIn** - Full metadata

**Without Iframely** (Free):
- **YouTube** - Full metadata via oEmbed ✅
- **Twitter/X** - Good metadata via oEmbed ✅
- **Vimeo** - Full metadata via oEmbed ✅
- **Instagram** - Limited (title only) ⚠️
- **TikTok** - Limited ⚠️

### 🚀 Setup Iframely (5 minutes)

Untuk mendapatkan full metadata dari Instagram/TikTok:

1. **Get Free API Key**: https://iframely.com (1000 requests/month free)
2. **Add to .env.local**:
   ```bash
   IFRAMELY_API_KEY=your_api_key_here
   ```
3. **Restart server**: `npm run dev`

**That's it!** Instagram & TikTok akan otomatis menggunakan Iframely.

📖 **Detailed Guide**: [docs/SETUP_IFRAMELY.md](../../../docs/SETUP_IFRAMELY.md)

### Extraction Strategy

```
Priority 1: Iframely (Instagram/TikTok) - if configured ✨
Priority 2: oEmbed API (YouTube, Vimeo, Twitter)
Priority 3: Social Media Scraper (fallback)
Priority 4: HTML Parsing (general websites)
```

### Contoh

```bash
# YouTube - menggunakan oEmbed
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Response:
{
  "success": true,
  "data": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "description": "...",
    "image": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    "siteName": "YouTube"
  }
}
```

## Troubleshooting

### Instagram Returns Limited Metadata

Instagram menggunakan client-side rendering dan memerlukan Facebook App credentials untuk oEmbed API.

**Solusi**:
1. Buat Facebook App di https://developers.facebook.com
2. Dapatkan access token
3. Set environment variable: `INSTAGRAM_ACCESS_TOKEN=your_token`
4. Update `oembed-service.ts` untuk menggunakan token

### TikTok/Twitter Timeout

Beberapa platform memiliki rate limiting atau bot detection. Jika terjadi timeout:
- Coba lagi setelah beberapa saat
- Pastikan User-Agent header sudah di-set dengan benar
- Consider menggunakan proxy atau third-party API untuk production

## Performance

- **oEmbed API**: ~500ms - 2s (tergantung platform)
- **HTML Parsing**: ~1s - 15s (tergantung website speed)
- **Timeout**: 15 detik untuk semua requests
- **Caching**: Belum diimplementasi (future enhancement)

## Future Enhancements

1. **Instagram Support**: Implement Facebook App integration
2. **Caching Layer**: Redis cache untuk frequently requested URLs
3. **Batch Processing**: Support multiple URLs dalam satu request
4. **Webhook Support**: Async processing dengan callback
5. **More Platforms**: LinkedIn, Pinterest, Reddit, dll


## Instagram & TikTok - Manual Metadata Input

Karena Instagram dan TikTok menggunakan JavaScript rendering, auto-extraction terbatas. Untuk kasus ini, gunakan endpoint manual:

### Endpoint Manual

```
POST /api/links/metadata/manual
```

### Request Body

```json
{
  "url": "https://www.instagram.com/p/ABC123/",
  "title": "Beautiful sunset photo",
  "description": "Amazing sunset at the beach",
  "image": "https://example.com/image.jpg",
  "siteName": "Instagram"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "title": "Beautiful sunset photo",
    "description": "Amazing sunset at the beach",
    "image": "https://example.com/image.jpg",
    "siteName": "Instagram",
    "url": "https://www.instagram.com/p/ABC123/",
    "manual": true
  }
}
```

### Frontend Integration Example

```typescript
async function handleLinkSubmit(url: string) {
  // Try auto-extraction first
  const autoResult = await fetch('/api/links/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  
  const data = await autoResult.json();
  
  // Check if it's Instagram/TikTok with limited metadata
  const isLimitedMetadata = 
    data.success && 
    (data.data.title === 'Instagram' || data.data.title === 'TikTok') &&
    !data.data.description;
  
  if (isLimitedMetadata) {
    // Show manual input form
    showManualMetadataForm(url);
  } else {
    // Use auto-extracted metadata
    useMetadata(data.data);
  }
}

function showManualMetadataForm(url: string) {
  // Show form with fields:
  // - Title (required)
  // - Description (optional)
  // - Image URL (optional)
  
  // On submit:
  const manualResult = await fetch('/api/links/metadata/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      title: formData.title,
      description: formData.description,
      image: formData.image,
      siteName: 'Instagram' // or 'TikTok'
    })
  });
}
```

## Production Recommendations

### For Serious Production Apps

Jika aplikasi Anda heavily relies on social media links, pertimbangkan:

1. **Third-Party API** (Recommended)
   - **Iframely**: https://iframely.com (~$10-50/month)
   - **Embedly**: https://embed.ly
   - **LinkPreview**: https://www.linkpreview.net
   
   Pros: Reliable, fast, supports all platforms
   Cons: Monthly cost

2. **Hybrid Approach** (Current + Manual)
   - Auto-extract untuk platforms yang supported
   - Manual input untuk Instagram/TikTok
   - Cache results untuk performance
   
   Pros: Free, good UX
   Cons: Extra user step for some platforms

3. **Headless Browser** (Advanced)
   - Puppeteer/Playwright untuk render JavaScript
   - Background job processing
   - Redis queue system
   
   Pros: Full control, works everywhere
   Cons: Heavy resources, complex setup

### Quick Win: Browser Extension

Buat browser extension yang bisa extract metadata dari tab yang sedang dibuka user:

```javascript
// Chrome Extension - content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getMetadata') {
    const metadata = {
      title: document.querySelector('meta[property="og:title"]')?.content || document.title,
      description: document.querySelector('meta[property="og:description"]')?.content,
      image: document.querySelector('meta[property="og:image"]')?.content,
    };
    sendResponse(metadata);
  }
});
```

## Summary

| Platform | Auto-Extract | Manual Input | Third-Party API |
|----------|--------------|--------------|-----------------|
| YouTube | ✅ Full | ❌ Not needed | ✅ Full |
| GitHub | ✅ Full | ❌ Not needed | ✅ Full |
| Tokopedia | ✅ Full | ❌ Not needed | ✅ Full |
| Instagram | ⚠️ Limited | ✅ Recommended | ✅ Full |
| TikTok | ⚠️ Limited | ✅ Recommended | ✅ Full |
| Twitter/X | ✅ Good | ❌ Not needed | ✅ Full |

**Recommendation**: Gunakan auto-extract + manual fallback untuk MVP, upgrade ke third-party API untuk production scale.
