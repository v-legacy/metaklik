# Video vs Image Detection

API sekarang bisa **detect dan membedakan** antara video dan image content!

## 📊 Response Format

### Response dengan Video:
```json
{
  "success": true,
  "data": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "description": "The official video...",
    "image": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "siteName": "YouTube",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "video": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "type": "video"
  }
}
```

### Response dengan Image Only:
```json
{
  "success": true,
  "data": {
    "title": "Product Name",
    "description": "Product description...",
    "image": "https://example.com/product.jpg",
    "siteName": "Tokopedia",
    "url": "https://www.tokopedia.com/product/123",
    "type": "website"
  }
}
```

## 🎯 Content Types

API mengembalikan `type` field dengan nilai:

| Type | Description | Example |
|------|-------------|---------|
| `video` | Content adalah video | YouTube, Vimeo, TikTok |
| `article` | Content adalah artikel | Blog posts, news |
| `image` | Content adalah gambar | Photo galleries |
| `website` | Content umum/default | E-commerce, landing pages |

## 🔍 Detection Logic

### 1. Video Detection

Video terdeteksi jika:
- Ada `og:video` meta tag
- Ada `og:type="video"` meta tag
- Platform adalah YouTube/Vimeo/TikTok
- Ada `twitter:player:stream` meta tag

### 2. Article Detection

Article terdeteksi jika:
- Ada `og:type="article"` meta tag
- Content dari blog/news platform

### 3. Default

Jika tidak ada indicator khusus, type = `website`

## 📝 Meta Tags yang Di-extract

### Open Graph Video Tags:
```html
<meta property="og:video" content="https://..." />
<meta property="og:video:url" content="https://..." />
<meta property="og:video:secure_url" content="https://..." />
<meta property="og:type" content="video" />
```

### Twitter Card Video Tags:
```html
<meta name="twitter:player:stream" content="https://..." />
<meta name="twitter:player" content="https://..." />
```

## 🎬 Platform-Specific Behavior

### YouTube
```json
{
  "image": "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg",
  "video": "https://www.youtube.com/embed/VIDEO_ID",
  "type": "video"
}
```

### Vimeo
```json
{
  "image": "https://i.vimeocdn.com/video/...",
  "video": "https://player.vimeo.com/video/VIDEO_ID",
  "type": "video"
}
```

### TikTok
```json
{
  "image": "https://...",
  "video": "https://www.tiktok.com/...",
  "type": "video"
}
```

### Instagram (Video Post)
```json
{
  "image": "https://...",
  "video": "https://...",
  "type": "video"
}
```

### Instagram (Image Post)
```json
{
  "image": "https://...",
  "type": "image"
}
```

## 💻 Frontend Usage

### React Example:

```typescript
interface LinkPreview {
  title: string;
  description: string;
  image: string | null;
  video?: string | null;
  type?: 'video' | 'image' | 'article' | 'website';
}

function LinkPreviewCard({ data }: { data: LinkPreview }) {
  return (
    <div className="preview-card">
      <h3>{data.title}</h3>
      <p>{data.description}</p>
      
      {/* Render video or image based on type */}
      {data.type === 'video' && data.video ? (
        <iframe 
          src={data.video}
          width="100%"
          height="315"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : data.image ? (
        <img src={data.image} alt={data.title} />
      ) : null}
      
      {/* Show type badge */}
      <span className="badge">{data.type}</span>
    </div>
  );
}
```

### Vue Example:

```vue
<template>
  <div class="preview-card">
    <h3>{{ data.title }}</h3>
    <p>{{ data.description }}</p>
    
    <!-- Video -->
    <iframe 
      v-if="data.type === 'video' && data.video"
      :src="data.video"
      width="100%"
      height="315"
      frameborder="0"
      allowfullscreen
    />
    
    <!-- Image -->
    <img 
      v-else-if="data.image"
      :src="data.image"
      :alt="data.title"
    />
    
    <!-- Type badge -->
    <span class="badge">{{ data.type }}</span>
  </div>
</template>
```

### Conditional Rendering Logic:

```typescript
function renderPreview(data: LinkPreview) {
  // Priority 1: Video
  if (data.type === 'video' && data.video) {
    return renderVideoPlayer(data.video);
  }
  
  // Priority 2: Image
  if (data.image) {
    return renderImage(data.image);
  }
  
  // Priority 3: Fallback
  return renderTextOnly(data);
}
```

## 🎨 UI/UX Recommendations

### Video Content:
- Show play button overlay on thumbnail
- Use iframe for embedded video
- Show video duration if available
- Add "Watch on [Platform]" link

### Image Content:
- Show image with lightbox
- Add zoom functionality
- Show image dimensions if available

### Article Content:
- Show reading time estimate
- Add "Read more" button
- Show author and date if available

## 🔧 Advanced Usage

### Check if content has video:

```typescript
const hasVideo = (data: LinkPreview): boolean => {
  return data.type === 'video' && !!data.video;
};
```

### Get embed URL:

```typescript
const getEmbedUrl = (data: LinkPreview): string | null => {
  if (data.type === 'video' && data.video) {
    return data.video;
  }
  return null;
};
```

### Get preview media:

```typescript
const getPreviewMedia = (data: LinkPreview): {
  type: 'video' | 'image' | 'none';
  url: string | null;
} => {
  if (data.type === 'video' && data.video) {
    return { type: 'video', url: data.video };
  }
  if (data.image) {
    return { type: 'image', url: data.image };
  }
  return { type: 'none', url: null };
};
```

## 📊 Testing

```bash
# Test YouTube video
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Expected: type="video", video URL present

# Test image-only content
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.tokopedia.com/product/123"}'

# Expected: type="website", only image present

# Test article
curl -X POST http://localhost:3000/api/links/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://medium.com/@user/article"}'

# Expected: type="article"
```

## 🎯 Summary

Sekarang API bisa:
- ✅ Detect video vs image content
- ✅ Return video embed URL
- ✅ Return content type
- ✅ Support YouTube, Vimeo, TikTok, Instagram
- ✅ Fallback ke image jika video tidak ada

Frontend bisa render video player atau image sesuai dengan `type` dan ketersediaan `video` URL!
