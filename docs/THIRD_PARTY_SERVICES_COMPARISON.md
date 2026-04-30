# Third-Party Metadata Extraction Services - Comparison

## 1. LinkPreview.net ⭐ (Recommended - Affordable)

### Pricing
- **Free**: 60 requests/hour
- **Hobby**: $5/month - 10,000 requests
- **Startup**: $15/month - 50,000 requests
- **Business**: $50/month - 250,000 requests

### Features
- ✅ Instagram support
- ✅ TikTok support
- ✅ All major social media
- ✅ Fast response (~500ms)
- ✅ Simple API
- ✅ No credit card for free tier

### API Example
```bash
curl "https://api.linkpreview.net/?key=YOUR_KEY&q=https://www.instagram.com/p/ABC123/"
```

### Response
```json
{
  "title": "Post title",
  "description": "Post description",
  "image": "https://...",
  "url": "https://..."
}
```

---

## 2. Microlink.io ⭐⭐ (Best Free Tier)

### Pricing
- **Free**: 50 requests/day (no credit card)
- **Pro**: $9/month - 10,000 requests
- **Premium**: $29/month - 100,000 requests

### Features
- ✅ Instagram support
- ✅ TikTok support
- ✅ Screenshot capability
- ✅ PDF generation
- ✅ Video/audio metadata
- ✅ Open source

### API Example
```bash
curl "https://api.microlink.io?url=https://www.instagram.com/p/ABC123/"
```

### Response
```json
{
  "status": "success",
  "data": {
    "title": "...",
    "description": "...",
    "image": {
      "url": "..."
    },
    "logo": {
      "url": "..."
    }
  }
}
```

---

## 3. Embedly (by Medium)

### Pricing
- **Free**: 5,000 requests/month
- **Starter**: $9/month - 25,000 requests
- **Pro**: $49/month - 250,000 requests

### Features
- ✅ Mature service (10+ years)
- ✅ All social media
- ✅ Rich embed support
- ✅ Good documentation
- ⚠️ Requires credit card for free tier

### API Example
```bash
curl "https://api.embedly.com/1/oembed?url=https://www.instagram.com/p/ABC123/&key=YOUR_KEY"
```

---

## 4. OpenGraph.io

### Pricing
- **Free**: 1,500 requests/month
- **Basic**: $19/month - 10,000 requests
- **Pro**: $49/month - 50,000 requests

### Features
- ✅ Instagram support
- ✅ TikTok support
- ✅ Caching included
- ✅ Screenshot API
- ✅ No credit card for free tier

### API Example
```bash
curl "https://opengraph.io/api/1.1/site/https%3A%2F%2Fwww.instagram.com%2Fp%2FABC123%2F?app_id=YOUR_APP_ID"
```

---

## 5. Urlbox.io (Screenshot + Metadata)

### Pricing
- **Free**: 50 renders/month
- **Starter**: $9/month - 1,000 renders
- **Pro**: $29/month - 5,000 renders

### Features
- ✅ Screenshot capability
- ✅ Full page rendering
- ✅ Social media support
- ⚠️ More expensive
- ⚠️ Slower (rendering takes time)

---

## 6. ScrapingBee (Headless Browser as Service)

### Pricing
- **Free**: 1,000 API credits
- **Freelance**: $49/month - 150,000 credits
- **Startup**: $99/month - 350,000 credits

### Features
- ✅ Full JavaScript rendering
- ✅ Proxy rotation
- ✅ CAPTCHA solving
- ✅ Works for everything
- ⚠️ More expensive
- ⚠️ Overkill for simple metadata

---

## 7. Apify (Web Scraping Platform)

### Pricing
- **Free**: $5 platform credits
- **Starter**: $49/month
- **Scale**: $499/month

### Features
- ✅ Instagram scraper actor
- ✅ TikTok scraper actor
- ✅ Powerful platform
- ✅ Can scrape anything
- ⚠️ Complex setup
- ⚠️ Expensive

---

## 8. RapidAPI - Link Preview Services

### Multiple providers on one platform:
- **Link Preview** - Free tier available
- **Web Scraping API** - Various options
- **Social Media APIs** - Platform-specific

### Pricing
Varies by provider, typically:
- Free: 100-1000 requests/month
- Paid: $5-50/month

---

## Comparison Table

| Service | Free Tier | Best For | Instagram | TikTok | Price/10k |
|---------|-----------|----------|-----------|--------|-----------|
| **LinkPreview.net** | 60/hour | Budget-friendly | ✅ | ✅ | $5 |
| **Microlink.io** | 50/day | Open source fans | ✅ | ✅ | $9 |
| **Embedly** | 5k/month | Enterprise | ✅ | ✅ | $9 |
| **OpenGraph.io** | 1.5k/month | Simple needs | ✅ | ✅ | $19 |
| **Iframely** | 1k/month | Rich embeds | ✅ | ✅ | $10 |
| **ScrapingBee** | 1k credits | Complex scraping | ✅ | ✅ | $49 |
| **Urlbox** | 50/month | Screenshots | ✅ | ✅ | $9 |

---

## Recommendations by Use Case

### 🏆 Best Overall: **Microlink.io**
- Generous free tier (50/day)
- Open source
- Great documentation
- Fast and reliable

### 💰 Best Budget: **LinkPreview.net**
- Cheapest paid tier ($5/month)
- 60 requests/hour free
- Simple API
- No credit card needed

### 🚀 Best for Startups: **Embedly**
- Mature and stable
- 5,000 free requests/month
- Trusted by Medium, Trello
- Good support

### 🛠️ Best for Developers: **Microlink.io**
- Open source
- Self-hostable
- CLI tools
- Great DX

### 📸 Best for Screenshots: **Urlbox.io**
- High-quality screenshots
- Full page rendering
- Good for previews

---

## Implementation Examples

### 1. LinkPreview.net

```typescript
// src/lib/services/linkpreview-service.ts
export class LinkPreviewService {
  private static readonly API_KEY = process.env.LINKPREVIEW_API_KEY;
  private static readonly API_URL = 'https://api.linkpreview.net';

  static async extractMetadata(url: string) {
    const response = await fetch(
      `${this.API_URL}/?key=${this.API_KEY}&q=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error('LinkPreview API failed');
    }

    const data = await response.json();
    
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      siteName: data.url ? new URL(data.url).hostname : null,
    };
  }
}
```

### 2. Microlink.io

```typescript
// src/lib/services/microlink-service.ts
export class MicrolinkService {
  private static readonly API_URL = 'https://api.microlink.io';

  static async extractMetadata(url: string) {
    const response = await fetch(
      `${this.API_URL}?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error('Microlink API failed');
    }

    const { data } = await response.json();
    
    return {
      title: data.title,
      description: data.description,
      image: data.image?.url || data.logo?.url,
      siteName: data.publisher,
    };
  }
}
```

### 3. OpenGraph.io

```typescript
// src/lib/services/opengraph-service.ts
export class OpenGraphService {
  private static readonly APP_ID = process.env.OPENGRAPH_APP_ID;
  private static readonly API_URL = 'https://opengraph.io/api/1.1/site';

  static async extractMetadata(url: string) {
    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(
      `${this.API_URL}/${encodedUrl}?app_id=${this.APP_ID}`
    );

    if (!response.ok) {
      throw new Error('OpenGraph.io API failed');
    }

    const data = await response.json();
    const og = data.hybridGraph;
    
    return {
      title: og.title,
      description: og.description,
      image: og.image,
      siteName: og.site_name,
    };
  }
}
```

---

## Quick Start Guide

### Option 1: Microlink.io (No API Key Needed for Free Tier!)

```bash
# No signup needed for basic usage
curl "https://api.microlink.io?url=https://www.instagram.com/p/ABC123/"
```

### Option 2: LinkPreview.net

1. Sign up at https://www.linkpreview.net/
2. Get API key (free tier: 60 req/hour)
3. Add to `.env`:
```bash
LINKPREVIEW_API_KEY=your_key_here
```

### Option 3: OpenGraph.io

1. Sign up at https://www.opengraph.io/
2. Get App ID (free tier: 1,500 req/month)
3. Add to `.env`:
```bash
OPENGRAPH_APP_ID=your_app_id_here
```

---

## Testing

```bash
# Test Microlink (no key needed)
curl "https://api.microlink.io?url=https://www.instagram.com/p/DDhWGGqSsHi/"

# Test LinkPreview
curl "https://api.linkpreview.net/?key=YOUR_KEY&q=https://www.instagram.com/p/DDhWGGqSsHi/"

# Test OpenGraph.io
curl "https://opengraph.io/api/1.1/site/https%3A%2F%2Fwww.instagram.com%2Fp%2FDDhWGGqSsHi%2F?app_id=YOUR_APP_ID"
```

---

## Final Recommendation

**For your use case (Metaklik - URL shortener with metadata):**

### 🥇 First Choice: **Microlink.io**
- Start with free tier (50/day)
- No credit card needed
- Upgrade to $9/month when needed
- Open source = can self-host later

### 🥈 Second Choice: **LinkPreview.net**
- If you need more than 50/day immediately
- Very affordable ($5/month for 10k)
- Simple API

### 🥉 Third Choice: **Embedly**
- If you want enterprise-grade reliability
- 5,000 free requests/month
- Trusted by big companies

**Start with Microlink.io free tier, monitor usage, upgrade or switch as needed!**
