# Share Link & Preview — Dokumentasi Teknis

> **Fitur inti MetaKlik**: Saat shortlink di-share ke sosial media, platform menampilkan preview card yang sudah di-custom. Saat user klik, halaman melakukan redirect ke URL asli dengan dukungan deep linking ke native app.

---

## Daftar Isi

- [Arsitektur](#arsitektur)
- [Alur Lengkap (Flow)](#alur-lengkap-flow)
- [Struktur File](#struktur-file)
- [1. Route Publik — `[slug]/page.tsx`](#1-route-publik--slugpagetsx)
- [2. OG Meta Tags — `generateMetadata()`](#2-og-meta-tags--generatemetadata)
- [3. Dynamic OG Image — `api/og/route.tsx`](#3-dynamic-og-image--apiograoutetsx)
- [4. Halaman Interstitial — `InterstitialPage.tsx`](#4-halaman-interstitial--interstitialpagetsx)
- [5. Redirect Handler — `RedirectHandler.tsx`](#5-redirect-handler--redirecthandlertsx)
- [6. Deep Link Registry — `deep-link-registry.ts`](#6-deep-link-registry--deep-link-registryts)
- [7. Analytics Tracking — `track-click.ts`](#7-analytics-tracking--track-clickts)
- [Guard & Edge Cases](#guard--edge-cases)
- [Testing OG Tags](#testing-og-tags)
- [Cara Menambah App Baru ke Deep Link Registry](#cara-menambah-app-baru-ke-deep-link-registry)

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                    metaklik.biz.id/xY7zP9                       │
│                     (Public Route: /[slug])                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │ generateMeta │    │ InterstitialPage│  │  RedirectHandler  │  │
│  │   data()     │    │  (Server)       │  │   (Client)        │  │
│  │              │    │                 │  │                   │  │
│  │ • og:title   │    │ • Logo          │  │ • Deep Link       │  │
│  │ • og:desc    │    │ • Preview Card  │  │ • Countdown       │  │
│  │ • og:image → │────│ • Noscript      │  │ • trackClick()    │  │
│  │   /api/og    │    │   fallback      │  │ • Manual Skip     │  │
│  └──────────────┘    └──────────────┘    └───────────────────┘  │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  /api/og?slug=   │    │   deep-link-registry.ts          │   │
│  │  (OG Image Gen)  │    │   • 16 domain Indonesia          │   │
│  │  1200x630px      │    │   • URI scheme + Android package │   │
│  └──────────────────┘    └──────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  track-click.ts (Server Action)                          │   │
│  │  • Parse User-Agent → browser, OS, device                │   │
│  │  • Upsert LinkAnalytics (daily bucket)                   │   │
│  │  • Increment Link.totalClicks                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Alur Lengkap (Flow)

### A. Crawler Sosial Media (Facebook, WhatsApp, Twitter)

```
1. Crawler mengakses metaklik.biz.id/xY7zP9
2. Next.js menjalankan generateMetadata()
   → Query DB: prisma.link.findUnique({ where: { slug } })
   → Menghasilkan <meta> tags di <head>:
     • og:title       → Custom title (dioptimasi 50-60 chars)
     • og:description → Custom description (truncate 155 chars)
     • og:image       → /api/og?slug=xY7zP9 (dynamic 1200x630)
     • og:url         → metaklik.biz.id/xY7zP9
     • twitter:card   → summary_large_image
3. Crawler membaca <meta> tags → menampilkan preview card di feed
4. Crawler TIDAK menjalankan JavaScript → tidak ada redirect/analytics
```

### B. User Klik di Desktop

```
1. Browser mengakses metaklik.biz.id/xY7zP9
2. Server: getLinkBySlug() → cek isActive → detectMobile(User-Agent)
3. Server merender InterstitialPage + RedirectHandler(isMobile=false)
4. Client: RedirectHandler mount →
   a. trackClick() dipanggil (analytics tercatat)
   b. handleDesktopRedirect(): countdown 3 → 2 → 1 → 0
   c. window.location.href = originalUrl (redirect!)
5. User bisa klik "Buka Sekarang" untuk skip countdown
```

### C. User Klik di Mobile (iOS)

```
1. Browser mengakses metaklik.biz.id/xY7zP9
2. Server: detectMobile(User-Agent) → isMobile=true, isAndroid=false
3. Client: RedirectHandler mount →
   a. trackClick() dipanggil
   b. handleMobileRedirect():
      - getDeepLinkInfo('shopee.co.id') → { scheme: 'shopee://' }
      - tryDeepLink('shopee://'):
        → window.location.href = 'shopee://www.shopee.co.id/product'
        → setTimeout 1500ms
        → Jika app terbuka: halaman di-blur, tidak ada fallback
        → Jika app TIDAK ada: document masih visible → redirect ke originalUrl
```

### D. User Klik di Mobile (Android)

```
1. Sama seperti iOS sampai langkah b
2. handleMobileRedirect():
   - getDeepLinkInfo('shopee.co.id') → { androidPackage: 'com.shopee.id' }
   - buildAndroidIntentUrl():
     → intent://www.shopee.co.id/product#Intent;
       scheme=https;
       package=com.shopee.id;
       S.browser_fallback_url=https%3A%2F%2Fwww.shopee.co.id%2Fproduct;
       end
   - Jika app ada → OS buka Shopee app
   - Jika app TIDAK ada → browser otomatis fallback ke URL (tanpa error)
```

---

## Struktur File

```
src/
├── app/
│   ├── [slug]/                          ← Route publik shortlink
│   │   ├── layout.tsx                   ← Minimal layout (tanpa sidebar)
│   │   ├── page.tsx                     ← generateMetadata() + Server Component
│   │   ├── actions/
│   │   │   └── track-click.ts           ← Server Action: analytics
│   │   └── _components/
│   │       ├── InterstitialPage.tsx      ← UI branded interstitial
│   │       └── RedirectHandler.tsx       ← Client: deep link + redirect
│   └── api/
│       └── og/
│           └── route.tsx                ← Dynamic OG image 1200x630
└── lib/
    └── utils/
        └── deep-link-registry.ts        ← Domain → App scheme mapping
```

---

## 1. Route Publik — `[slug]/page.tsx`

**Lokasi**: `src/app/[slug]/page.tsx`
**Tipe**: Server Component (async)

### Tanggung Jawab
- Menjalankan `generateMetadata()` untuk OG tags
- Query database via `getLinkBySlug(slug)`
- Guard: slug tidak ditemukan → `notFound()`
- Guard: `isActive === false` → halaman "Link Tidak Aktif"
- Deteksi device via `headers().get('user-agent')`
- Merender `<InterstitialPage>` + `<RedirectHandler>`

### Helper Functions

```typescript
// Truncate text ke panjang optimal, potong di batas kata
function truncateText(text: string, maxLength: number): string

// Optimasi title ke 50-60 chars, tambah " — via MetaKlik" jika pendek
function optimizeTitle(title: string): string

// Deteksi mobile & Android dari User-Agent string
function detectMobile(ua: string): { isMobile: boolean; isAndroid: boolean }
```

---

## 2. OG Meta Tags — `generateMetadata()`

**Platform yang didukung**: Facebook, Twitter/X, WhatsApp, Telegram, LinkedIn, Discord, Slack

### Tags yang Dihasilkan

| Tag | Sumber Data | Optimasi |
|-----|------------|----------|
| `og:title` | `link.title \|\| originalLink.title` | `optimizeTitle()` → 50-60 chars |
| `og:description` | `link.description \|\| originalLink.description` | `truncateText()` → max 155 chars |
| `og:image` | `/api/og?slug=xxx` (dynamic) | Selalu 1200x630px |
| `og:url` | `${baseUrl}/${slug}` | URL absolut |
| `og:type` | `website` | Static |
| `og:site_name` | `MetaKlik` | Static |
| `twitter:card` | `summary_large_image` | Static |
| `robots` | `noindex, nofollow` | Shortlink tidak di-index Google |

### Catatan Penting
- `NEXT_PUBLIC_APP_URL` di `.env` **wajib** dikonfigurasi untuk URL absolut yang benar
- Jika link tidak memiliki image → OG image tidak di-generate
- Title/Description fallback ke data `OriginalLink` jika Custom Link tidak mengisinya

---

## 3. Dynamic OG Image — `api/og/route.tsx`

**Lokasi**: `src/app/api/og/route.tsx`
**Runtime**: Node.js
**Teknologi**: Next.js `ImageResponse` (Satori + Resvg)

### Spesifikasi Output
- **Ukuran**: 1200 x 630 px (standar Facebook/Twitter)
- **Format**: PNG

### Struktur Visual

```
┌──────────────────────────────────────────────────────┐
│  MetaKlik                                (Logo)      │
│                                                      │
│                                                      │
│  ┌─────────────────────┐                             │
│  │ shopee.co.id        │ (Domain Badge)              │
│  └─────────────────────┘                             │
│                                                      │
│  JUDUL CUSTOM LINK YANG                              │
│  BESAR DAN JELAS                    (Headline)       │
│                                                      │
│  ┌───────────────────────┐                           │
│  │ Klik untuk membuka →  │    Powered by MetaKlik    │
│  └───────────────────────┘       (CTA Button)        │
└──────────────────────────────────────────────────────┘
  Background: gambar preview + gradient overlay gelap
```

### Query Parameter
| Param | Required | Contoh |
|-------|:--------:|--------|
| `slug` | Ya | `/api/og?slug=DVDFr3` |

---

## 4. Halaman Interstitial — `InterstitialPage.tsx`

**Lokasi**: `src/app/[slug]/_components/InterstitialPage.tsx`
**Tipe**: Server Component

### Props

```typescript
interface InterstitialPageProps {
  title: string;        // Judul link
  description: string;  // Deskripsi link
  image: string | null; // URL gambar preview
  domain: string;       // Domain original (e.g. 'shopee.co.id')
  originalUrl: string;  // URL tujuan asli
  children: ReactNode;  // RedirectHandler ditempatkan di sini
}
```

### Elemen UI
- Background gradient gelap (`slate-900 → blue-950`)
- Logo MetaKlik di atas
- Card putih berisi: gambar, domain badge, judul, deskripsi
- Children slot (untuk RedirectHandler: countdown + tombol)
- Teks "Menuju: [original URL]"
- Footer "Powered by MetaKlik"
- `<noscript>` fallback: `<meta http-equiv="refresh">` (5 detik)

---

## 5. Redirect Handler — `RedirectHandler.tsx`

**Lokasi**: `src/app/[slug]/_components/RedirectHandler.tsx`
**Tipe**: Client Component (`'use client'`)

### Props

```typescript
interface RedirectHandlerProps {
  originalUrl: string;    // URL tujuan
  domain: string | null;  // Domain untuk deep link lookup
  linkId: string;         // ID untuk analytics
  isMobile: boolean;      // Dari server-side UA detection
  isAndroid: boolean;     // Khusus Android intent
}
```

### Konstanta

| Nama | Nilai | Fungsi |
|------|-------|--------|
| `DESKTOP_COUNTDOWN_SECONDS` | `3` | Durasi countdown desktop |
| `DEEP_LINK_TIMEOUT_MS` | `1500` | Timeout deep link attempt |

### Strategi Redirect

```
┌─────────────┬─────────────────────────────────────────────────────┐
│  Platform   │  Strategi                                           │
├─────────────┼─────────────────────────────────────────────────────┤
│  Desktop    │  Countdown 3s → window.location.href = originalUrl  │
│  iOS        │  Deep link scheme → timeout 1.5s → fallback URL     │
│  Android    │  Intent URL (auto-fallback built-in)                │
│  Unknown    │  Langsung redirect ke originalUrl                   │
└─────────────┴─────────────────────────────────────────────────────┘
```

### Proteksi Double-Fire
- `hasTracked` (useRef): Analytics hanya tercatat 1x
- `hasRedirected` (useRef): Redirect hanya terjadi 1x

---

## 6. Deep Link Registry — `deep-link-registry.ts`

**Lokasi**: `src/lib/utils/deep-link-registry.ts`

### App yang Didukung (16 domain)

| Kategori | Domain | URI Scheme | Android Package |
|----------|--------|-----------|-----------------|
| E-Commerce | `shopee.co.id` | `shopee://` | `com.shopee.id` |
| | `tokopedia.com` | `tokopedia://` | `com.tokopedia.tkpd` |
| | `lazada.co.id` | `lazada://` | `com.lazada.android` |
| | `bukalapak.com` | `bukalapak://` | `com.bukalapak.android` |
| | `blibli.com` | `blibli://` | `com.gdp.android.gms` |
| Social Media | `instagram.com` | `instagram://` | `com.instagram.android` |
| | `tiktok.com` | `snssdk1233://` | `com.zhiliaoapp.musically` |
| | `twitter.com` / `x.com` | `twitter://` | `com.twitter.android` |
| | `facebook.com` | `fb://` | `com.facebook.katana` |
| Messaging | `wa.me` | `whatsapp://` | `com.whatsapp` |
| | `t.me` | `tg://` | `org.telegram.messenger` |
| Video | `youtube.com` / `youtu.be` | `youtube://` | `com.google.android.youtube` |

### Fungsi Ekspor

```typescript
// Lookup domain → deep link info (smart matching: www, subdomain)
getDeepLinkInfo(domain: string | null): DeepLinkEntry | null

// Build Android Intent URL dengan browser fallback
buildAndroidIntentUrl(originalUrl: string, androidPackage: string): string
```

### Domain Matching Strategy

```
Input: 'm.shopee.co.id'
  1. Hapus www. → 'm.shopee.co.id'
  2. Exact match? → Tidak
  3. 3-level: 'shopee.co.id' → Match! ✅
```

---

## 7. Analytics Tracking — `track-click.ts`

**Lokasi**: `src/app/[slug]/actions/track-click.ts`
**Tipe**: Server Action (`'use server'`)
**Auth**: Tidak diperlukan (route publik)

### Input

```typescript
type TrackClickInput = {
  linkId: string;       // ID Custom Link
  referrer?: string;    // document.referrer (e.g. 'https://facebook.com/post')
  userAgent?: string;   // navigator.userAgent
};
```

### Proses

1. **Parse User-Agent** → `{ browser, os, device }`
   - Browser: Chrome, Safari, Firefox, Edge, Opera, Samsung Browser
   - OS: Windows, macOS, iOS, Android, Linux
   - Device: Desktop, Mobile, Tablet

2. **Extract Referrer** → domain saja (e.g. `facebook.com`), atau `Direct`

3. **Upsert `LinkAnalytics`** (daily bucket per dimensi)
   ```sql
   -- Composite key: linkId + date + referrer + browser + os + device + country
   -- Jika sudah ada → clicks += 1
   -- Jika belum → buat baris baru, clicks = 1
   ```

4. **Increment `Link.totalClicks`** → `+1`

### Error Handling
- Semua error di-catch dan di-log ke console
- Analytics failure **TIDAK** mengganggu redirect user

---

## Guard & Edge Cases

| Kondisi | Hasil |
|---------|-------|
| Slug tidak ada di DB | `notFound()` → 404 page |
| `isActive === false` | Halaman "Link Tidak Aktif" (branded, tanpa redirect) |
| Domain tidak ada di registry | Skip deep link → langsung redirect ke URL |
| App tidak terinstall (iOS) | Timeout 1.5s → fallback ke browser |
| App tidak terinstall (Android) | Intent URL auto-fallback ke browser |
| JavaScript disabled | `<meta http-equiv="refresh">` setelah 5 detik |
| Route conflict (`/signin`, `/api`) | Next.js memprioritaskan static routes → tidak tertangkap `[slug]` |

---

## Testing OG Tags

### Lokal
```bash
# View source (cari <meta property="og:...)
curl -s http://localhost:3000/<slug> | grep -i 'og:'

# Test OG Image
# Buka di browser: http://localhost:3000/api/og?slug=<slug>
```

### Produksi
| Tool | URL | Fungsi |
|------|-----|--------|
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Preview Facebook card |
| Twitter Validator | https://cards-dev.twitter.com/validator | Preview Twitter card |
| OpenGraph.xyz | https://www.opengraph.xyz/ | Preview umum + issue checker |

### Catatan
- **Ngrok free tier** memblokir crawler sosmed (halaman interstitial ngrok)
- Gunakan **Vercel** atau **ngrok berbayar** untuk testing OG tags yang akurat

---

## Cara Menambah App Baru ke Deep Link Registry

1. Buka `src/lib/utils/deep-link-registry.ts`
2. Tambahkan entry baru:

```typescript
const DEEP_LINK_REGISTRY = {
  // ... existing entries
  'newapp.com': {
    scheme: 'newapp://',           // URI scheme app
    androidPackage: 'com.newapp',  // Package name dari Play Store URL
  },
};
```

3. **Cara menemukan URI scheme**:
   - Android: Cek Play Store URL → package name terlihat di URL
   - iOS: Cari di dokumentasi developer app, atau test manual
   - Alternatif: Google "appname url scheme" atau "appname deep link"

4. **Testing**: Buka shortlink yang mengarah ke domain baru dari HP yang sudah terinstall app-nya

---

## Environment Variables

| Variable | Required | Contoh | Fungsi |
|----------|:--------:|--------|--------|
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://metaklik.biz.id` | Base URL untuk shortlink & OG image |
| `DATABASE_URL` | ✅ | `postgresql://...` | Koneksi database |
