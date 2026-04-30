# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed
- **Relative URL Handling in Meta Parser** - Fixed issue where images from shortlinks (like Shopee `id.shp.ee`) were not displaying
  - Updated `validateImageUrl` and `validateVideoUrl` to handle relative URLs
  - Now supports protocol-relative URLs (`//cdn.example.com/image.jpg`)
  - Now supports path-relative URLs (`/images/product.jpg`)
  - Automatically resolves relative URLs to absolute URLs using base URL
  - Files changed: `src/lib/parsers/meta-parser.ts`

### Changed
- **OEmbed Service** - Fixed `getPlatformName` method call from instance to static
  - Changed `this.getPlatformName()` to `OEmbedService.getPlatformName()`
  - Added `type` field to `OEmbedResult` interface
  - Now detects content type (video/image/article/website) from oEmbed response
  - Files changed: `src/lib/services/oembed-service.ts`

- **Social Media Scraper** - Added content type detection
  - Added `type` field to `SocialMediaMetadata` interface
  - Instagram posts now return `type: 'image'`
  - TikTok videos now return `type: 'video'`
  - Fixed regex flag compatibility issue (`gis` → `gi` + `Array.from()`)
  - Files changed: `src/lib/services/social-media-scraper.ts`

- **Metadata Service** - Improved type propagation
  - All metadata extraction methods now return `type` field
  - Consistent type detection across all services (Microlink, oEmbed, Social Media Scraper, HTML Parser)
  - Files changed: `src/lib/services/metadata-service.ts`

- **Link Actions** - Fixed server action fetch URL
  - Changed from relative URL (`/api/links/metadata`) to absolute URL using `API_URL`
  - Fixed "Failed to parse URL" error in server actions
  - Added proper return values for `getLink` function
  - Files changed: `src/app/(customer)/dashboard/links/create/actions/link-actions.ts`

- **Form Component** - Updated state management
  - Added `urlInput` state for controlled input
  - Updated `ogData` type to match API response structure
  - Added nullish coalescing operators for safe property access
  - Files changed: `src/app/(customer)/dashboard/links/_components/FormLink.tsx`

### Added
- **Documentation** - Added comprehensive documentation for relative URL fix
  - Created `docs/RELATIVE_URL_FIX.md` with problem analysis and solution
  - Added JSDoc comments with examples for `validateImageUrl` and `validateVideoUrl`
  - Added debug logging for troubleshooting metadata extraction

## Notes

### Breaking Changes
None

### Migration Guide
No migration needed. All changes are backward compatible.

### Known Issues
- Debug logging in `meta-parser.ts` should be removed before production deployment
- Some social media platforms (Instagram, Facebook) may require additional authentication for full metadata access

### Testing Recommendations
Test with various URL types:
- Shopee shortlinks: `https://id.shp.ee/AAF8YTZ`
- YouTube videos: `https://www.youtube.com/watch?v=...`
- Regular e-commerce: `https://www.tokopedia.com/...`
- Social media: Instagram, TikTok, Twitter posts
