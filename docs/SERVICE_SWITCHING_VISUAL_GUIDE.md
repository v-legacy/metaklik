# Visual Guide: Switching Metadata Services

Panduan visual untuk mengganti service metadata extraction dengan mudah.

## 🎯 Quick Answer

**Hanya perlu ubah 1 file**: `src/lib/services/metadata-service.ts`

**Lokasi**: Line ~50-65

---

## 📊 Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Request                              │
│                  POST /api/links/metadata                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Route Handler                               │
│         src/app/api/links/metadata/route.ts                 │
│                                                              │
│         ⚠️  NO CHANGES NEEDED HERE                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              MetadataService                                 │
│         src/lib/services/metadata-service.ts                │
│                                                              │
│         ✅  CHANGE HERE TO SWITCH SERVICE                   │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┬──────────────┐
         │               │               │              │
         ▼               ▼               ▼              ▼
    ┌────────┐     ┌─────────┐    ┌─────────┐   ┌──────────┐
    │Microlink│     │ Social  │    │ oEmbed  │   │   HTML   │
    │ (Now)  │     │ Scraper │    │   API   │   │  Parser  │
    └────────┘     └─────────┘    └─────────┘   └──────────┘
```

---

## 🔄 Service Options

### Option 1: Microlink (Current) ✅

```typescript
// src/lib/services/metadata-service.ts (line ~50)

if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  try {
    const result = await MicrolinkService.extractMetadata(normalizedUrl);
    if (result && result.title) {
      return { /* metadata */ };
    }
  } catch (error) {
    console.log('Microlink failed');
  }
}
```

**Setup**:
- ✅ No API key needed
- ✅ Already implemented
- ✅ Free 50 requests/day

---

### Option 2: Iframely

```typescript
// src/lib/services/metadata-service.ts (line ~50)

if (IframelyService.shouldUseIframely(normalizedUrl) && 
    IframelyService.isConfigured()) {
  try {
    const result = await IframelyService.extractMetadata(normalizedUrl);
    if (result && result.title) {
      return { /* metadata */ };
    }
  } catch (error) {
    console.log('Iframely failed');
  }
}
```

**Setup**:
1. Get API key from https://iframely.com
2. Add to `.env`: `IFRAMELY_API_KEY=your_key`
3. Create `src/lib/services/iframely-service.ts`
4. Replace code above

---

### Option 3: LinkPreview

```typescript
// src/lib/services/metadata-service.ts (line ~50)

if (LinkPreviewService.shouldUseLinkPreview(normalizedUrl) && 
    LinkPreviewService.isConfigured()) {
  try {
    const result = await LinkPreviewService.extractMetadata(normalizedUrl);
    if (result && result.title) {
      return { /* metadata */ };
    }
  } catch (error) {
    console.log('LinkPreview failed');
  }
}
```

**Setup**:
1. Get API key from https://www.linkpreview.net
2. Add to `.env`: `LINKPREVIEW_API_KEY=your_key`
3. Create `src/lib/services/linkpreview-service.ts`
4. Replace code above

---

## 📝 Step-by-Step: Switch from Microlink to Iframely

### Step 1: Get API Key

```bash
# Visit https://iframely.com
# Sign up and get API key
```

### Step 2: Add to Environment

```bash
# .env
IFRAMELY_API_KEY=your_api_key_here
```

### Step 3: Create Service File

```bash
# Create new file
touch src/lib/services/iframely-service.ts
```

Copy template from `docs/HOW_TO_SWITCH_METADATA_SERVICE.md`

### Step 4: Update MetadataService

**File**: `src/lib/services/metadata-service.ts`

**Line 1**: Add import
```typescript
import { IframelyService } from './iframely-service';
```

**Line ~50**: Replace Microlink block

**BEFORE**:
```typescript
// Step 2: For Instagram/TikTok/Facebook/Twitter, try Microlink first
if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
  try {
    const microlinkResult = await MicrolinkService.extractMetadata(normalizedUrl);
    // ... rest of code
  }
}
```

**AFTER**:
```typescript
// Step 2: For Instagram/TikTok/Facebook, try Iframely first
if (IframelyService.shouldUseIframely(normalizedUrl) && 
    IframelyService.isConfigured()) {
  try {
    const iframelyResult = await IframelyService.extractMetadata(normalizedUrl);
    // ... rest of code
  }
}
```

### Step 5: Test

```bash
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'
```

---

## 🎨 Visual: File Changes

```
Project Structure:
├── .env                                    ← ADD API KEY HERE
├── src/
│   ├── app/api/links/metadata/
│   │   └── route.ts                       ← NO CHANGE
│   └── lib/services/
│       ├── metadata-service.ts            ← CHANGE HERE (1 block)
│       ├── microlink-service.ts           ← Keep (fallback)
│       ├── iframely-service.ts            ← CREATE THIS
│       ├── linkpreview-service.ts         ← OR CREATE THIS
│       ├── oembed-service.ts              ← NO CHANGE
│       └── social-media-scraper.ts        ← NO CHANGE
```

---

## 🔍 Code Comparison

### Current (Microlink)

```typescript
// metadata-service.ts

import { MicrolinkService } from './microlink-service';

async extractMetadata(url: string) {
  // ... validation code ...
  
  // Priority 1: Microlink
  if (MicrolinkService.shouldUseMicrolink(normalizedUrl)) {
    const result = await MicrolinkService.extractMetadata(normalizedUrl);
    if (result) return formatResult(result);
  }
  
  // Priority 2: Other services...
}
```

### Switch to Iframely

```typescript
// metadata-service.ts

import { IframelyService } from './iframely-service';  // ← CHANGE

async extractMetadata(url: string) {
  // ... validation code ...
  
  // Priority 1: Iframely                              // ← CHANGE
  if (IframelyService.shouldUseIframely(normalizedUrl) && 
      IframelyService.isConfigured()) {
    const result = await IframelyService.extractMetadata(normalizedUrl);
    if (result) return formatResult(result);
  }
  
  // Priority 2: Other services...
}
```

### Switch to LinkPreview

```typescript
// metadata-service.ts

import { LinkPreviewService } from './linkpreview-service';  // ← CHANGE

async extractMetadata(url: string) {
  // ... validation code ...
  
  // Priority 1: LinkPreview                                 // ← CHANGE
  if (LinkPreviewService.shouldUseLinkPreview(normalizedUrl) && 
      LinkPreviewService.isConfigured()) {
    const result = await LinkPreviewService.extractMetadata(normalizedUrl);
    if (result) return formatResult(result);
  }
  
  // Priority 2: Other services...
}
```

---

## 🎯 Quick Reference Table

| Service | File to Create | Import Statement | Method Call |
|---------|---------------|------------------|-------------|
| **Microlink** | ✅ Already exists | `import { MicrolinkService }` | `MicrolinkService.extractMetadata()` |
| **Iframely** | `iframely-service.ts` | `import { IframelyService }` | `IframelyService.extractMetadata()` |
| **LinkPreview** | `linkpreview-service.ts` | `import { LinkPreviewService }` | `LinkPreviewService.extractMetadata()` |

---

## 🧪 Testing Checklist

After switching service:

- [ ] Instagram URL works
- [ ] TikTok URL works
- [ ] YouTube URL works (should use oEmbed)
- [ ] Regular website works (should use HTML parser)
- [ ] Invalid URL returns error
- [ ] API key is loaded from `.env`
- [ ] Fallback works if service fails

---

## 💡 Pro Tips

### Tip 1: Use Multiple Services

You can use multiple services in priority order:

```typescript
// Try Iframely first
if (IframelyService.shouldUseIframely(url) && IframelyService.isConfigured()) {
  const result = await IframelyService.extractMetadata(url);
  if (result) return result;
}

// Fallback to Microlink
if (MicrolinkService.shouldUseMicrolink(url)) {
  const result = await MicrolinkService.extractMetadata(url);
  if (result) return result;
}
```

### Tip 2: Platform-Specific Services

Use different services for different platforms:

```typescript
// Instagram → Iframely (best quality)
if (url.includes('instagram.com') && IframelyService.isConfigured()) {
  return await IframelyService.extractMetadata(url);
}

// TikTok → LinkPreview (cheaper)
if (url.includes('tiktok.com') && LinkPreviewService.isConfigured()) {
  return await LinkPreviewService.extractMetadata(url);
}

// Others → Microlink (free)
return await MicrolinkService.extractMetadata(url);
```

### Tip 3: Monitor Usage

Add logging to track which service is used:

```typescript
console.log(`Using ${serviceName} for ${url}`);
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Forgetting API Key

```typescript
// This will fail silently
const result = await IframelyService.extractMetadata(url);
```

**Fix**: Always check `isConfigured()`:
```typescript
if (IframelyService.isConfigured()) {
  const result = await IframelyService.extractMetadata(url);
}
```

### ❌ Mistake 2: Wrong Import Path

```typescript
// Wrong
import { IframelyService } from '../iframely-service';

// Correct
import { IframelyService } from './iframely-service';
```

### ❌ Mistake 3: Not Handling Errors

```typescript
// Wrong - will crash if service fails
const result = await IframelyService.extractMetadata(url);
return result;

// Correct - graceful fallback
try {
  const result = await IframelyService.extractMetadata(url);
  if (result) return result;
} catch (error) {
  console.log('Service failed, trying fallback');
}
```

---

## 📚 Related Documentation

- **Full Guide**: `docs/HOW_TO_SWITCH_METADATA_SERVICE.md`
- **Service Comparison**: `docs/THIRD_PARTY_SERVICES_COMPARISON.md`
- **Limitations**: `docs/SOCIAL_MEDIA_LIMITATIONS.md`
- **API Docs**: `src/app/api/links/metadata/README.md`

---

## 🎉 Summary

**To switch metadata service:**

1. **Get API key** (if needed)
2. **Add to `.env`**
3. **Create service file** (copy template)
4. **Update 1 import** in `metadata-service.ts`
5. **Replace 1 code block** (~10 lines)
6. **Test**

**That's it!** 🚀

The rest of the system (API route, parsers, scrapers) stays exactly the same.
