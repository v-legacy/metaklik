# Panduan Testing Social Media Crawlers (Bot) dengan Curl

Ketika kita membuat fitur seperti Open Graph (OG) tags atau *link preview*, sangat penting untuk mengetahui secara pasti **apa yang dilihat oleh bot/crawler sosial media** (seperti Facebook, WhatsApp, Twitter, dan Instagram). 

Sering kali halaman web berfungsi normal saat dibuka di browser biasa (seperti Chrome), namun gagal memunculkan *preview card* saat dibagikan ke media sosial. Hal ini bisa disebabkan oleh *Web Application Firewall* (seperti Cloudflare), tag `robots`, atau limitasi server yang memblokir spesifik IP bot.

Untuk mengeceknya tanpa harus mengandalkan [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/), kita bisa melakukan simulasi bot menggunakan aplikasi **Curl** di Terminal.

---

## 1. Konsep Dasar
Bot sosial media mengidentifikasi diri mereka menggunakan **User-Agent**. Server web bisa merespons secara berbeda tergantung `User-Agent` apa yang mengaksesnya.

Berikut adalah beberapa `User-Agent` paling populer dari bot media sosial:
- **Facebook / Instagram / Meta:** `facebookexternalhit/1.1`
- **Twitter / X:** `Twitterbot/1.0`
- **WhatsApp:** `WhatsApp/2.21.12.21` (berubah-ubah sesuai versi)
- **LinkedIn:** `LinkedInBot/1.0`
- **Telegram:** `TelegramBot (like TwitterBot)`

Dengan memalsukan (Spoofing) header `User-Agent` kita menggunakan Curl, kita akan melihat persis **kode HTTP** dan **HTML** yang dikirimkan server kepada bot tersebut.

---

## 2. Cara Melakukan Testing

### A. Cek HTTP Status Code (Response Headers)
Digunakan untuk mengecek apakah server mengizinkan bot untuk masuk, atau justru menolaknya (misal mengembalikan error `403 Forbidden` atau `500 Internal Server Error`).

Buka Terminal dan jalankan perintah berikut:
```bash
curl -I -H "User-Agent: facebookexternalhit/1.1" "https://www.metaklik.biz.id/URL_KAMU"
```

**Penjelasan Perintah:**
- `-I` (huruf i besar): Memerintahkan curl untuk hanya mengambil **HTTP Headers** saja (tidak perlu mendownload seluruh isi web/HTML). Sangat cepat untuk mencari tahu error.
- `-H`: Mengirim kustom *Header*.
- `"User-Agent: ..."`: Menyamar menjadi bot Facebook.

**Hasil yang Diharapkan (Sukses):**
Kamu harus melihat `HTTP/2 200` atau `HTTP/1.1 200 OK` di baris pertama.
```text
HTTP/2 200 
date: Sat, 02 May 2026 00:04:56 GMT
content-type: text/html; charset=utf-8
server: Vercel
...
```

**Hasil Error yang Sering Terjadi:**
- `HTTP/2 403`: Akses ditolak. Biasanya terjadi karena perlindungan Anti-Bot (seperti Cloudflare *Bot Fight Mode*, atau Vercel *Deployment Protection*).
- `HTTP/2 404`: URL tidak ditemukan.

---

### B. Cek Hasil HTML (Open Graph Tags)
Jika status code sudah `200 OK`, selanjutnya kita pastikan apakah HTML yang dirender memuat `<meta property="og:...">` yang benar, dan bukan halaman *loading* atau *captcha*.

Jalankan perintah ini:
```bash
curl -s -H "User-Agent: facebookexternalhit/1.1" "https://www.metaklik.biz.id/URL_KAMU" | grep -i "og:"
```

**Penjelasan Perintah:**
- `-s` (silent): Menyembunyikan *progress bar* bawaan Curl.
- `| grep -i "og:"`: Menyaring *output* HTML panjang dan hanya menampilkan baris yang mengandung kata "og:" (tidak membedakan huruf besar/kecil).

**Hasil yang Diharapkan (Contoh Sukses):**
```html
<meta property="og:title" content="Judul Custom Link Saya">
<meta property="og:description" content="Ini adalah deskripsi produk saya">
<meta property="og:image" content="https://alvolog...supabase.co/.../gambar.jpg">
<meta property="og:url" content="https://www.metaklik.biz.id/URL_KAMU">
```
Jika hasilnya kosong, berarti bot sosial media mendapati halaman tanpa metadata (contoh: karena SSR gagal, atau halaman me-render Javascript *Client-side* terlebih dahulu).

---

## 3. Checklist Troubleshooting Jika Terjadi Error

Jika *preview* gagal tampil di media sosial namun normal di browser:

1. **Cek Tag Robots:** Pastikan di HTML tidak ada tulisan `<meta name="robots" content="noindex">`. Jika ada, bot Meta/Google akan langsung membatalkan *scraping*.
2. **Cek Sistem Keamanan Server (WAF / Cloudflare):** Jalankan perintah `curl -I` (poin A). Perhatikan baris `server:`. Jika tulisannya `server: cloudflare` dan mendapat `403`, berarti perlindungan proxy Cloudflare terlalu ketat untuk bot. Solusinya adalah mengubah status proxy (Awan Oranye ke Awan Abu-abu).
3. **Cek Ukuran Gambar:** Ukuran file gambar yang terlalu besar (misal > 5MB) kadang ditolak oleh WhatsApp dan iMessage. Gunakan fitur pemangkas (*Cropper*) yang sudah kita pasang di sistem untuk menekan ukuran.
4. **Cek Canonical URL (`og:url`):** Bot Facebook menolak halaman yang URL rujukannya merujuk ke domain yang dianggap salah atau lokal (misal: `http://localhost:3000`).
5. **Gunakan alat resmi:** Selalu validasi hasil akhir di [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/). Jangan lupa klik **"Scrape Again"** berkali-kali untuk menghindari sistem *cache* mereka.
