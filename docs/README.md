# Metaklik - Link Metadata Extraction Documentation

Dokumentasi lengkap untuk sistem ekstraksi metadata dari URL.

## 📚 Documentation Index

### 🚀 Quick Start

1. **[API_LINKS_METADATA_FLOW.md](./API_LINKS_METADATA_FLOW.md)** ⭐ **START HERE**
   - Complete flow overview
   - How automatic fallback works
   - Testing examples
   - Current status

2. **[QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md)** ⭐ **SWITCHING GUIDE**
   - Panduan super cepat (5 menit)
   - Copy-paste ready code
   - Step-by-step dengan line numbers

### 🎨 Visual Guides

3. **[SERVICE_SWITCHING_VISUAL_GUIDE.md](./SERVICE_SWITCHING_VISUAL_GUIDE.md)**
   - Diagram visual
   - Code comparison
   - Common mistakes

### 📖 Complete Guides

4. **[HOW_TO_SWITCH_METADATA_SERVICE.md](./HOW_TO_SWITCH_METADATA_SERVICE.md)**
   - Panduan lengkap dan detail
   - Template untuk service baru
   - Testing guide
   - Troubleshooting

### 📊 Comparisons & Analysis

5. **[THIRD_PARTY_SERVICES_COMPARISON.md](./THIRD_PARTY_SERVICES_COMPARISON.md)**
   - Perbandingan 8+ services
   - Pricing comparison
   - Implementation examples
   - Recommendations

6. **[SOCIAL_MEDIA_LIMITATIONS.md](./SOCIAL_MEDIA_LIMITATIONS.md)**
   - Kenapa Instagram/TikTok sulit
   - Solusi yang tersedia
   - Trade-offs

### 🔧 Technical Docs

7. **[API Documentation](../src/app/api/links/metadata/README.md)**
   - API endpoint usage
   - Request/response format
   - Error codes
   - Integration examples

### 🐛 Bug Fixes & Troubleshooting

8. **[RELATIVE_URL_FIX.md](./RELATIVE_URL_FIX.md)** 🆕
   - Fix untuk Shopee shortlinks
   - Relative URL handling
   - Protocol-relative URLs
   - Implementation details

9. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** 🆕
   - Common issues & solutions
   - Debug checklist
   - Testing URLs
   - Performance tips

10. **[CHANGELOG.md](./CHANGELOG.md)** 🆕
    - Recent fixes and improvements
    - Breaking changes
    - Migration guide

---

## 🎯 Quick Navigation

### I want to...

#### Understand how the system works
→ Go to: [API_LINKS_METADATA_FLOW.md](./API_LINKS_METADATA_FLOW.md)

#### Switch from Microlink to Iframely
→ Go to: [QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md#-switch-to-iframely-best-instagramtiktok)

#### Switch from Microlink to LinkPreview
→ Go to: [QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md#-switch-to-linkpreview-cheapest-5month)

#### Compare all available services
→ Go to: [THIRD_PARTY_SERVICES_COMPARISON.md](./THIRD_PARTY_SERVICES_COMPARISON.md#comparison-table)

#### Understand why Instagram is hard
→ Go to: [SOCIAL_MEDIA_LIMITATIONS.md](./SOCIAL_MEDIA_LIMITATIONS.md#problem)

#### See visual diagrams
→ Go to: [SERVICE_SWITCHING_VISUAL_GUIDE.md](./SERVICE_SWITCHING_VISUAL_GUIDE.md#-current-architecture)

#### Add a completely new service
→ Go to: [HOW_TO_SWITCH_METADATA_SERVICE.md](./HOW_TO_SWITCH_METADATA_SERVICE.md#adding-new-service)

#### Test the API
→ Go to: [API Documentation](../src/app/api/links/metadata/README.md#contoh-penggunaan)

---

## 🏗️ Architecture Overview

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
    │ Third  │     │ Social  │    │ oEmbed  │   │   HTML   │
    │ Party  │     │ Scraper │    │   API   │   │  Parser  │
    │Service │     │         │    │         │   │          │
    └────────┘     └─────────┘    └─────────┘   └──────────┘
```

---

## 🔄 Current Implementation

### Active Service: Microlink.io

**Status**: ✅ Working

**Features**:
- Free tier: 50 requests/day
- No API key needed
- Supports Instagram, TikTok, Facebook, Twitter

**Limitations**:
- Instagram/TikTok metadata still limited (JS rendering issue)
- Free tier has daily limit

### Fallback Chain

1. **Microlink** (Instagram, TikTok, Facebook, Twitter)
2. **Social Media Scraper** (Fallback for Instagram/TikTok)
3. **oEmbed API** (YouTube, Vimeo, Twitter)
4. **HTML Parser** (General websites)
5. **Manual Input** (Last resort)

---

## 📊 Service Comparison

| Service | Free Tier | Best For | Instagram | TikTok | Price/10k |
|---------|-----------|----------|-----------|--------|-----------|
| **Microlink** | 50/day | Open source | ⚠️ Limited | ⚠️ Limited | $9 |
| **Iframely** | 1k/month | Best quality | ✅ Full | ✅ Full | $10 |
| **LinkPreview** | 60/hour | Budget | ✅ Good | ✅ Good | $5 |
| **Embedly** | 5k/month | Enterprise | ✅ Full | ✅ Full | $9 |

**Recommendation**: 
- **MVP**: Use Microlink (current, free)
- **Production**: Switch to Iframely or LinkPreview
- **Budget**: LinkPreview ($5/month)
- **Quality**: Iframely ($10/month)

---

## 🎯 Common Tasks

### Task 1: Switch to Iframely

**Time**: 5 minutes

**Steps**:
1. Get API key from https://iframely.com
2. Add to `.env`: `IFRAMELY_API_KEY=your_key`
3. Create `src/lib/services/iframely-service.ts`
4. Update `src/lib/services/metadata-service.ts` (1 import, 1 code block)
5. Test

**Guide**: [QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md#-switch-to-iframely-best-instagramtiktok)

---

### Task 2: Test Current Implementation

**Time**: 2 minutes

```bash
# Test Instagram
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}'

# Test YouTube
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

**Guide**: [API Documentation](../src/app/api/links/metadata/README.md#testing)

---

### Task 3: Add New Service

**Time**: 15 minutes

**Steps**:
1. Create service file using template
2. Implement interface methods
3. Add to metadata-service.ts
4. Test thoroughly

**Guide**: [HOW_TO_SWITCH_METADATA_SERVICE.md](./HOW_TO_SWITCH_METADATA_SERVICE.md#adding-new-service)

---

## 🧪 Testing

### Quick Test Script

```bash
#!/bin/bash

echo "Testing Metadata Extraction..."

# Instagram
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.instagram.com/p/DDhWGGqSsHi/"}' -s | jq .

# YouTube
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' -s | jq .

# Tokopedia
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://tk.tokopedia.com/ZSPoJDbn6/"}' -s | jq .
```

---

## 🐛 Troubleshooting

### Problem: Image not displaying from shortlinks (Shopee, Tokopedia, etc.)

**Solution**: ✅ Fixed! Relative URLs are now handled automatically.

**Details**: [RELATIVE_URL_FIX.md](./RELATIVE_URL_FIX.md)

---

### Problem: Instagram returns limited metadata

**Solution**: Switch to Iframely or use manual input

**Guide**: [SOCIAL_MEDIA_LIMITATIONS.md](./SOCIAL_MEDIA_LIMITATIONS.md#solutions)

---

### Problem: "Failed to parse URL from /api/links/metadata"

**Solution**: ✅ Fixed! Server actions now use absolute URLs.

**Details**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#2-failed-to-parse-url-from-apilinksmetadata)

---

### Problem: API key not working

**Checklist**:
- [ ] API key added to `.env`
- [ ] `.env` file in project root
- [ ] Dev server restarted
- [ ] `isConfigured()` returns true

**Guide**: [SERVICE_SWITCHING_VISUAL_GUIDE.md](./SERVICE_SWITCHING_VISUAL_GUIDE.md#-common-mistakes)

---

### Problem: Service not being called

**Check**:
1. Import statement correct?
2. Method name correct?
3. `shouldUse*()` method returns true?
4. Code in right priority order?

**Guide**: [HOW_TO_SWITCH_METADATA_SERVICE.md](./HOW_TO_SWITCH_METADATA_SERVICE.md#troubleshooting)

---

### More Issues?

Check the complete troubleshooting guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 File Structure

```
metaklik/
├── docs/
│   ├── README.md                              ← You are here
│   ├── QUICK_START_SWITCHING.md              ← Start here
│   ├── SERVICE_SWITCHING_VISUAL_GUIDE.md     ← Visual guide
│   ├── HOW_TO_SWITCH_METADATA_SERVICE.md     ← Complete guide
│   ├── THIRD_PARTY_SERVICES_COMPARISON.md    ← Service comparison
│   └── SOCIAL_MEDIA_LIMITATIONS.md           ← Why Instagram is hard
├── src/
│   ├── app/api/links/metadata/
│   │   ├── route.ts                          ← API endpoint
│   │   ├── manual/route.ts                   ← Manual input
│   │   └── README.md                         ← API docs
│   └── lib/
│       ├── services/
│       │   ├── metadata-service.ts           ← Main orchestrator
│       │   ├── microlink-service.ts          ← Microlink (current)
│       │   ├── iframely-service.ts           ← Iframely (optional)
│       │   ├── oembed-service.ts             ← oEmbed
│       │   └── social-media-scraper.ts       ← Scraper
│       ├── validators/
│       │   └── url-validator.ts              ← URL validation
│       ├── fetchers/
│       │   └── html-fetcher.ts               ← HTML fetching
│       └── parsers/
│           └── meta-parser.ts                ← HTML parsing
└── .env                                       ← API keys here
```

---

## 🎓 Learning Path

### Beginner

1. Read [QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md)
2. Test current implementation
3. Try switching to Iframely

### Intermediate

1. Read [HOW_TO_SWITCH_METADATA_SERVICE.md](./HOW_TO_SWITCH_METADATA_SERVICE.md)
2. Compare services in [THIRD_PARTY_SERVICES_COMPARISON.md](./THIRD_PARTY_SERVICES_COMPARISON.md)
3. Implement multiple services

### Advanced

1. Read [SOCIAL_MEDIA_LIMITATIONS.md](./SOCIAL_MEDIA_LIMITATIONS.md)
2. Create custom service
3. Optimize fallback chain

---

## 🤝 Contributing

### Adding New Service Documentation

1. Add to [THIRD_PARTY_SERVICES_COMPARISON.md](./THIRD_PARTY_SERVICES_COMPARISON.md)
2. Create implementation example
3. Update this README

### Improving Guides

1. Test the guides
2. Report issues
3. Suggest improvements

---

## 📞 Support

### Questions?

1. Check [Troubleshooting](#-troubleshooting)
2. Read relevant guide
3. Check API documentation

### Found a Bug?

1. Check if service is configured
2. Test with curl
3. Check logs

---

## 🎉 Summary

**To switch metadata services:**

1. **Read**: [QUICK_START_SWITCHING.md](./QUICK_START_SWITCHING.md) (2 min)
2. **Get API key**: From service website (2 min)
3. **Change code**: 1 file, 2 changes (1 min)
4. **Test**: Run curl commands (2 min)

**Total time**: ~7 minutes ⚡

**Files to change**: 1 file (`metadata-service.ts`)

**Lines to change**: ~15 lines

**That's it!** 🚀

---

## 📅 Last Updated

December 31, 2025

---

## 📄 License

See project LICENSE file.
