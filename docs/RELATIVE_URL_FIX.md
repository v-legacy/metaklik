# Relative URL Handling Fix

## Problem

Ketika melakukan metadata extraction dari URL shortlink (seperti Shopee `https://id.shp.ee/AAF8YTZ`), image URL tidak muncul meskipun meta tags tersedia di HTML.

## Root Cause

Banyak website (termasuk Shopee) menggunakan **relative URLs** di meta tags mereka, contoh:
- Protocol-relative: `//cf.shopee.co.id/file/abc123`
- Path-relative: `/images/product.jpg`
- Subdomain-relative: `cdn.example.com/image.jpg`

Function `validateImageUrl` dan `validateVideoUrl` sebelumnya hanya memvalidasi absolute URLs. Ketika menemukan relative URL, function langsung return `null` tanpa mencoba resolve ke absolute URL.

```typescript
// ❌ BEFORE (BROKEN)
private validateImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  
  try {
    new URL(url);  // Throws error for relative URLs
    return url;
  } catch {
    return null;  // Returns null, losing the relative URL
  }
}
```

## Solution

Update `validateImageUrl` dan `validateVideoUrl` untuk handle relative URLs dengan menggunakan base URL sebagai reference:

```typescript
// ✅ AFTER (FIXED)
private validateImageUrl(url: string | undefined | null, baseUrl: string): string | null {
  if (!url) return null;

  try {
    // Try to parse as absolute URL
    new URL(url);
    return url;
  } catch {
    // If it fails, it's a relative URL
    // Resolve relative URL against base URL
    try {
      const absoluteUrl = new URL(url, baseUrl);
      return absoluteUrl.href;
    } catch {
      return null;
    }
  }
}
```

## How It Works

JavaScript's `URL` constructor accepts two parameters:
```javascript
new URL(relativeUrl, baseUrl)
```

Contoh:
```javascript
// Protocol-relative URL
new URL('//cdn.shopee.co.id/file/abc123', 'https://shopee.co.id')
// Result: 'https://cdn.shopee.co.id/file/abc123'

// Path-relative URL
new URL('/images/product.jpg', 'https://example.com/products/123')
// Result: 'https://example.com/images/product.jpg'

// Already absolute URL
new URL('https://example.com/image.jpg', 'https://shopee.co.id')
// Result: 'https://example.com/image.jpg' (unchanged)
```

## Changes Made

### 1. Updated `validateImageUrl` method
- Added `baseUrl` parameter
- Added fallback to resolve relative URLs

### 2. Updated `validateVideoUrl` method
- Added `baseUrl` parameter
- Added fallback to resolve relative URLs

### 3. Updated `parse` method
- Pass `url` parameter to `validateImageUrl` and `validateVideoUrl`
- Added debug logging (optional, can be removed in production)

## Files Modified

- `src/lib/parsers/meta-parser.ts`

## Testing

Test dengan berbagai jenis URLs:

```bash
# Shopee shortlink (protocol-relative URLs)
https://id.shp.ee/AAF8YTZ

# Regular URLs
https://www.tokopedia.com/product/123

# YouTube (absolute URLs)
https://www.youtube.com/watch?v=abc123
```

## Benefits

✅ Support untuk protocol-relative URLs (`//cdn.example.com/image.jpg`)  
✅ Support untuk path-relative URLs (`/images/product.jpg`)  
✅ Backward compatible dengan absolute URLs  
✅ Graceful fallback jika URL tidak valid  

## Debug Logging

Untuk debugging, tambahkan logging di method `parse`:

```typescript
console.log('Meta Parser Debug:', {
  ogImage: og.image,
  twitterImage: twitter.image,
  url: url
});

const validatedImage = this.validateImageUrl(image, url);
console.log('Validated image URL:', validatedImage);
```

Logging ini bisa dihapus setelah production.

## Related Issues

- Shopee shortlinks tidak menampilkan image
- E-commerce platforms dengan CDN relative URLs
- Social media shortlinks yang redirect ke halaman dengan relative URLs

## References

- [MDN: URL Constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
