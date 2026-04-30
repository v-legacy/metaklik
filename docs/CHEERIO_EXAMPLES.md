# 🎓 Cheerio Tutorial - Dari Dasar Sampai Mahir

## 📖 Apa itu Cheerio?

Cheerio adalah library untuk parsing dan manipulasi HTML di Node.js. Syntax-nya mirip jQuery, jadi kalau kamu pernah pakai jQuery, Cheerio akan terasa familiar.

**Analogi Sederhana**:
- HTML = Buku
- Cheerio = Alat untuk mencari kata/kalimat tertentu di buku tersebut
- Seperti Ctrl+F, tapi jauh lebih powerful!

---

## 🚀 Getting Started

### Install
```bash
npm install cheerio
```

### Basic Usage
```typescript
import * as cheerio from 'cheerio';

// Load HTML
const html = '<h1>Hello World</h1>';
const $ = cheerio.load(html);

// Query element
const text = $('h1').text();
console.log(text); // "Hello World"
```

---

## 📝 Contoh-Contoh Praktis

### 1. Extract Text dari Tag

```typescript
const html = `
  <html>
    <body>
      <h1>Judul Artikel</h1>
      <p>Ini adalah paragraf pertama.</p>
      <p>Ini adalah paragraf kedua.</p>
    </body>
  </html>
`;

const $ = cheerio.load(html);

// Ambil text dari h1
const title = $('h1').text();
console.log(title); // "Judul Artikel"

// Ambil text dari p pertama
const firstParagraph = $('p').first().text();
console.log(firstParagraph); // "Ini adalah paragraf pertama."

// Ambil text dari semua p
$('p').each((index, element) => {
  console.log($(element).text());
});
// Output:
// "Ini adalah paragraf pertama."
// "Ini adalah paragraf kedua."
```

### 2. Extract Attribute dari Tag

```typescript
const html = `
  <html>
    <head>
      <meta property="og:title" content="Product Name" />
      <meta property="og:image" content="https://example.com/image.jpg" />
      <link rel="canonical" href="https://example.com/page" />
    </head>
  </html>
`;

const $ = cheerio.load(html);

// Ambil attribute 'content' dari meta tag
const title = $('meta[property="og:title"]').attr('content');
console.log(title); // "Product Name"

const image = $('meta[property="og:image"]').attr('content');
console.log(image); // "https://example.com/image.jpg"

// Ambil attribute 'href' dari link tag
const canonical = $('link[rel="canonical"]').attr('href');
console.log(canonical); // "https://example.com/page"
```

### 3. CSS Selector - Berbagai Cara Mencari Element

```typescript
const html = `
  <html>
    <body>
      <div class="container">
        <h1 id="main-title">Title</h1>
        <p class="description">Description text</p>
        <a href="https://example.com">Link</a>
      </div>
    </body>
  </html>
`;

const $ = cheerio.load(html);

// Cari by tag name
const h1 = $('h1').text();

// Cari by class
const description = $('.description').text();

// Cari by id
const title = $('#main-title').text();

// Cari by attribute
const link = $('a[href]').attr('href');

// Cari nested element
const containerTitle = $('.container h1').text();

// Cari direct child
const directChild = $('.container > h1').text();
```

### 4. Meta Tags - Open Graph & Twitter Cards

```typescript
const html = `
  <html>
    <head>
      <!-- Open Graph -->
      <meta property="og:title" content="Amazing Product" />
      <meta property="og:description" content="This is an amazing product" />
      <meta property="og:image" content="https://example.com/og-image.jpg" />
      <meta property="og:url" content="https://example.com/product" />
      <meta property="og:site_name" content="My Store" />
      
      <!-- Twitter Cards -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Amazing Product" />
      <meta name="twitter:description" content="This is an amazing product" />
      <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
      
      <!-- Standard Meta -->
      <meta name="description" content="Standard description" />
      <meta name="keywords" content="product, amazing, store" />
      
      <title>Page Title</title>
    </head>
  </html>
`;

const $ = cheerio.load(html);

// Extract Open Graph
const ogTitle = $('meta[property="og:title"]').attr('content');
const ogDescription = $('meta[property="og:description"]').attr('content');
const ogImage = $('meta[property="og:image"]').attr('content');
const ogUrl = $('meta[property="og:url"]').attr('content');
const ogSiteName = $('meta[property="og:site_name"]').attr('content');

console.log('Open Graph:', {
  title: ogTitle,
  description: ogDescription,
  image: ogImage,
  url: ogUrl,
  siteName: ogSiteName
});

// Extract Twitter Cards
const twitterCard = $('meta[name="twitter:card"]').attr('content');
const twitterTitle = $('meta[name="twitter:title"]').attr('content');
const twitterDescription = $('meta[name="twitter:description"]').attr('content');
const twitterImage = $('meta[name="twitter:image"]').attr('content');

console.log('Twitter Cards:', {
  card: twitterCard,
  title: twitterTitle,
  description: twitterDescription,
  image: twitterImage
});

// Extract Standard Meta
const metaDescription = $('meta[name="description"]').attr('content');
const metaKeywords = $('meta[name="keywords"]').attr('content');

// Extract HTML Title
const htmlTitle = $('title').text();

console.log('Standard:', {
  description: metaDescription,
  keywords: metaKeywords,
  title: htmlTitle
});
```

### 5. Fallback Chain - Prioritas Metadata

```typescript
function extractMetadata(html: string) {
  const $ = cheerio.load(html);
  
  // Extract semua kemungkinan
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  const metaTitle = $('meta[name="title"]').attr('content');
  const htmlTitle = $('title').text();
  
  // Gunakan priority: OG > Twitter > Meta > HTML Title
  const title = ogTitle || twitterTitle || metaTitle || htmlTitle || 'Untitled';
  
  // Sama untuk description
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const twitterDesc = $('meta[name="twitter:description"]').attr('content');
  const metaDesc = $('meta[name="description"]').attr('content');
  
  const description = ogDesc || twitterDesc || metaDesc || '';
  
  // Sama untuk image
  const ogImage = $('meta[property="og:image"]').attr('content');
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  
  const image = ogImage || twitterImage || null;
  
  return { title, description, image };
}

// Test dengan HTML yang hanya punya Twitter Cards
const html1 = `
  <html>
    <head>
      <meta name="twitter:title" content="Twitter Title" />
      <meta name="twitter:description" content="Twitter Description" />
    </head>
  </html>
`;

const result1 = extractMetadata(html1);
console.log(result1);
// { title: "Twitter Title", description: "Twitter Description", image: null }

// Test dengan HTML yang hanya punya HTML title
const html2 = `
  <html>
    <head>
      <title>HTML Title Only</title>
    </head>
  </html>
`;

const result2 = extractMetadata(html2);
console.log(result2);
// { title: "HTML Title Only", description: "", image: null }
```

### 6. Handling Multiple Elements

```typescript
const html = `
  <html>
    <body>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      
      <div class="product">
        <h2>Product 1</h2>
        <p class="price">$10</p>
      </div>
      <div class="product">
        <h2>Product 2</h2>
        <p class="price">$20</p>
      </div>
    </body>
  </html>
`;

const $ = cheerio.load(html);

// Loop through all li elements
const items: string[] = [];
$('li').each((index, element) => {
  items.push($(element).text());
});
console.log(items); // ["Item 1", "Item 2", "Item 3"]

// Extract products
const products: Array<{name: string, price: string}> = [];
$('.product').each((index, element) => {
  const name = $(element).find('h2').text();
  const price = $(element).find('.price').text();
  products.push({ name, price });
});
console.log(products);
// [
//   { name: "Product 1", price: "$10" },
//   { name: "Product 2", price: "$20" }
// ]
```

### 7. Checking if Element Exists

```typescript
const html = `
  <html>
    <head>
      <meta property="og:title" content="Title" />
    </head>
  </html>
`;

const $ = cheerio.load(html);

// Check if element exists
const ogTitle = $('meta[property="og:title"]');
if (ogTitle.length > 0) {
  console.log('OG Title exists:', ogTitle.attr('content'));
} else {
  console.log('OG Title not found');
}

// Check for non-existent element
const ogImage = $('meta[property="og:image"]');
if (ogImage.length > 0) {
  console.log('OG Image exists');
} else {
  console.log('OG Image not found'); // This will be printed
}
```

### 8. Sanitization - Membersihkan Text

```typescript
function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  // 1. Remove HTML tags
  let clean = text.replace(/<[^>]*>/g, '');
  
  // 2. Remove script tags and content
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // 3. Decode HTML entities
  clean = clean
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // 4. Normalize whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // 5. Truncate if too long
  const maxLength = 255;
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength - 3) + '...';
  }
  
  return clean;
}

// Test
const dirtyText = '<b>Hello</b>   World  &amp;  <script>alert("xss")</script>  Test';
const cleanText = sanitizeText(dirtyText);
console.log(cleanText); // "Hello World & Test"
```

---

## 🎯 Real-World Example: Tokopedia

Mari kita lihat contoh nyata dari Tokopedia:

```typescript
// HTML dari Tokopedia (simplified)
const tokopediaHTML = `
  <html>
    <head>
      <title>Promo [HARGA SPECIAL] Pond's Age Miracle Night Cream 50g | Tokopedia</title>
      
      <meta property="og:title" content="Promo [HARGA SPECIAL] Pond's Age Miracle Night Cream 50g - Pond's, Standar di Pond's | Tokopedia" />
      <meta property="og:description" content="Promo [HARGA SPECIAL] Pond's Age Miracle Night Cream 50g - Pond's, Standar di Pond's Mall. Promo khusus pengguna baru di aplikasi Tokopedia!" />
      <meta property="og:image" content="https://images.tokopedia.net/img/cache/500-square/aphluv/1997/1/1/a4150152dfeb41cd8b071ec700e1acfa~.jpeg" />
      <meta property="og:url" content="https://www.tokopedia.com/ponds/harga-special-pond-s-age-miracle-night-cream-50g-1729656830474814806" />
      <meta property="og:site_name" content="Tokopedia" />
      <meta property="og:type" content="product" />
      
      <meta name="description" content="Promo khusus pengguna baru di aplikasi Tokopedia!" />
    </head>
  </html>
`;

const $ = cheerio.load(tokopediaHTML);

// Extract metadata
const metadata = {
  title: $('meta[property="og:title"]').attr('content'),
  description: $('meta[property="og:description"]').attr('content'),
  image: $('meta[property="og:image"]').attr('content'),
  url: $('meta[property="og:url"]').attr('content'),
  siteName: $('meta[property="og:site_name"]').attr('content'),
  type: $('meta[property="og:type"]').attr('content'),
};

console.log(metadata);
// {
//   title: "Promo [HARGA SPECIAL] Pond's Age Miracle Night Cream 50g - Pond's, Standar di Pond's | Tokopedia",
//   description: "Promo [HARGA SPECIAL] Pond's Age Miracle Night Cream 50g - Pond's, Standar di Pond's Mall. Promo khusus pengguna baru di aplikasi Tokopedia!",
//   image: "https://images.tokopedia.net/img/cache/500-square/aphluv/1997/1/1/a4150152dfeb41cd8b071ec700e1acfa~.jpeg",
//   url: "https://www.tokopedia.com/ponds/harga-special-pond-s-age-miracle-night-cream-50g-1729656830474814806",
//   siteName: "Tokopedia",
//   type: "product"
// }
```

---

## 🔍 CSS Selector Cheat Sheet

| Selector | Contoh | Artinya |
|----------|--------|---------|
| `tag` | `$('h1')` | Semua tag `<h1>` |
| `.class` | `$('.container')` | Semua element dengan class "container" |
| `#id` | `$('#main')` | Element dengan id "main" |
| `[attr]` | `$('[href]')` | Element yang punya attribute "href" |
| `[attr="value"]` | `$('[type="text"]')` | Element dengan attribute type="text" |
| `[attr^="value"]` | `$('[href^="https"]')` | Attribute yang dimulai dengan "https" |
| `[attr$="value"]` | `$('[src$=".jpg"]')` | Attribute yang diakhiri dengan ".jpg" |
| `[attr*="value"]` | `$('[class*="btn"]')` | Attribute yang mengandung "btn" |
| `parent child` | `$('div p')` | Semua `<p>` di dalam `<div>` |
| `parent > child` | `$('div > p')` | `<p>` yang direct child dari `<div>` |
| `elem1, elem2` | `$('h1, h2')` | Semua `<h1>` dan `<h2>` |

---

## 🛠️ Cheerio Methods Cheat Sheet

| Method | Contoh | Artinya |
|--------|--------|---------|
| `.text()` | `$('h1').text()` | Ambil text content |
| `.html()` | `$('div').html()` | Ambil HTML content |
| `.attr(name)` | `$('a').attr('href')` | Ambil attribute value |
| `.attr(name, value)` | `$('a').attr('href', 'url')` | Set attribute value |
| `.find(selector)` | `$('div').find('p')` | Cari element di dalam |
| `.first()` | `$('p').first()` | Element pertama |
| `.last()` | `$('p').last()` | Element terakhir |
| `.eq(index)` | `$('p').eq(2)` | Element ke-n (0-indexed) |
| `.each(fn)` | `$('li').each((i, el) => {})` | Loop semua element |
| `.length` | `$('p').length` | Jumlah element |
| `.parent()` | `$('span').parent()` | Parent element |
| `.children()` | `$('div').children()` | Child elements |
| `.siblings()` | `$('li').siblings()` | Sibling elements |

---

## 💡 Tips & Best Practices

### 1. Always Check if Element Exists

```typescript
const title = $('meta[property="og:title"]').attr('content');
// Bisa return undefined jika element tidak ada

// Better:
const titleElement = $('meta[property="og:title"]');
const title = titleElement.length > 0 ? titleElement.attr('content') : null;
```

### 2. Use Fallback Chain

```typescript
// Good: Ada fallback
const title = ogTitle || twitterTitle || htmlTitle || 'Untitled';

// Bad: Bisa return undefined
const title = ogTitle;
```

### 3. Sanitize User Input

```typescript
// Always sanitize text yang akan disimpan/ditampilkan
const rawTitle = $('title').text();
const cleanTitle = sanitizeText(rawTitle);
```

### 4. Handle Errors Gracefully

```typescript
try {
  const $ = cheerio.load(html);
  const title = $('title').text();
  return title;
} catch (error) {
  console.error('Parse error:', error);
  return 'Unknown';
}
```

---

## 🎓 Practice Exercises

### Exercise 1: Extract Product Info

```typescript
const html = `
  <div class="product">
    <h2 class="product-name">iPhone 15 Pro</h2>
    <p class="price">$999</p>
    <img src="https://example.com/iphone.jpg" alt="iPhone" />
    <div class="rating">
      <span class="stars">★★★★★</span>
      <span class="count">(1234 reviews)</span>
    </div>
  </div>
`;

// TODO: Extract name, price, image, rating
```

<details>
<summary>Solution</summary>

```typescript
const $ = cheerio.load(html);

const product = {
  name: $('.product-name').text(),
  price: $('.price').text(),
  image: $('img').attr('src'),
  rating: $('.stars').text(),
  reviewCount: $('.count').text()
};

console.log(product);
```
</details>

### Exercise 2: Extract All Links

```typescript
const html = `
  <nav>
    <a href="/home">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
`;

// TODO: Extract all links into array
```

<details>
<summary>Solution</summary>

```typescript
const $ = cheerio.load(html);

const links: Array<{text: string, href: string}> = [];
$('a').each((index, element) => {
  links.push({
    text: $(element).text(),
    href: $(element).attr('href') || ''
  });
});

console.log(links);
```
</details>

---

## 📚 Additional Resources

- [Cheerio Official Docs](https://cheerio.js.org/)
- [CSS Selectors Reference](https://www.w3schools.com/cssref/css_selectors.php)
- [jQuery API (similar to Cheerio)](https://api.jquery.com/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

## ❓ Common Questions

**Q: Apa bedanya Cheerio dengan Puppeteer?**
A: 
- Cheerio: Parse HTML string (cepat, ringan, tidak perlu browser)
- Puppeteer: Control real browser (lambat, berat, bisa execute JavaScript)

**Q: Apakah Cheerio bisa execute JavaScript?**
A: Tidak. Cheerio hanya parse HTML static. Untuk execute JS, pakai Puppeteer.

**Q: Bagaimana cara debug selector yang tidak work?**
A: 
1. Console.log HTML-nya: `console.log(html)`
2. Cek di browser dengan jQuery: `$('selector')`
3. Cek jumlah element: `console.log($('selector').length)`

**Q: Kenapa `.attr('content')` return undefined?**
A: Element tidak ditemukan. Cek dulu dengan `.length > 0`

**Q: Bagaimana cara handle HTML yang malformed?**
A: Cheerio sudah handle malformed HTML secara otomatis. Tapi tetap wrap dengan try-catch untuk safety.
