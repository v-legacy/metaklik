/**
 * @file deep-link-registry.ts
 * @description Registry mapping domain populer ke URI scheme native app-nya.
 * Digunakan oleh RedirectHandler untuk mencoba membuka native app di mobile.
 *
 * Cara menambahkan app baru:
 * 1. Tambahkan entry baru di DEEP_LINK_REGISTRY
 * 2. `scheme` = URI scheme app (bisa dicari di dokumentasi app atau testing manual)
 * 3. `androidPackage` = package name app di Play Store
 *
 * @example
 * const info = getDeepLinkInfo('shopee.co.id');
 * // { scheme: 'shopee://', androidPackage: 'com.shopee.id' }
 */

type DeepLinkEntry = {
  /** URI scheme untuk membuka native app (e.g. 'shopee://') */
  scheme: string;
  /** Android package name untuk Intent URL fallback */
  androidPackage: string;
};

/**
 * Registry mapping domain → deep link info.
 * Mencakup app-app populer di Indonesia.
 */
const DEEP_LINK_REGISTRY: Record<string, DeepLinkEntry> = {
  // E-Commerce
  'shopee.co.id': { scheme: 'shopee://', androidPackage: 'com.shopee.id' },
  'shopee.com': { scheme: 'shopee://', androidPackage: 'com.shopee.id' },
  'tokopedia.com': { scheme: 'tokopedia://', androidPackage: 'com.tokopedia.tkpd' },
  'lazada.co.id': { scheme: 'lazada://', androidPackage: 'com.lazada.android' },
  'bukalapak.com': { scheme: 'bukalapak://', androidPackage: 'com.bukalapak.android' },
  'blibli.com': { scheme: 'blibli://', androidPackage: 'com.gdp.android.gms' },

  // Social Media
  'instagram.com': { scheme: 'instagram://', androidPackage: 'com.instagram.android' },
  'tiktok.com': { scheme: 'snssdk1233://', androidPackage: 'com.zhiliaoapp.musically' },
  'twitter.com': { scheme: 'twitter://', androidPackage: 'com.twitter.android' },
  'x.com': { scheme: 'twitter://', androidPackage: 'com.twitter.android' },
  'facebook.com': { scheme: 'fb://', androidPackage: 'com.facebook.katana' },

  // Messaging
  'wa.me': { scheme: 'whatsapp://', androidPackage: 'com.whatsapp' },
  'whatsapp.com': { scheme: 'whatsapp://', androidPackage: 'com.whatsapp' },
  't.me': { scheme: 'tg://', androidPackage: 'org.telegram.messenger' },

  // Video & Streaming
  'youtube.com': { scheme: 'youtube://', androidPackage: 'com.google.android.youtube' },
  'youtu.be': { scheme: 'youtube://', androidPackage: 'com.google.android.youtube' },
};

/**
 * Mengambil deep link info berdasarkan domain.
 * Mencoba mencocokkan domain persis, lalu fallback ke root domain.
 *
 * @param domain - Domain dari original URL (e.g. 'shopee.co.id', 'www.tokopedia.com')
 * @returns DeepLinkEntry jika ditemukan, null jika tidak
 */
export function getDeepLinkInfo(domain: string | null): DeepLinkEntry | null {
  if (!domain) return null;

  // Hapus www. prefix
  const cleanDomain = domain.replace(/^www\./, '').toLowerCase();

  // Coba exact match dulu
  if (DEEP_LINK_REGISTRY[cleanDomain]) {
    return DEEP_LINK_REGISTRY[cleanDomain];
  }

  // Coba match root domain (e.g. 'm.shopee.co.id' → 'shopee.co.id')
  const parts = cleanDomain.split('.');
  if (parts.length > 2) {
    // Coba 2 level terakhir: 'co.id' → bukan, coba 3 level: 'shopee.co.id'
    const twoLevel = parts.slice(-2).join('.');
    const threeLevel = parts.slice(-3).join('.');

    if (DEEP_LINK_REGISTRY[threeLevel]) {
      return DEEP_LINK_REGISTRY[threeLevel];
    }
    if (DEEP_LINK_REGISTRY[twoLevel]) {
      return DEEP_LINK_REGISTRY[twoLevel];
    }
  }

  return null;
}

/**
 * Membangun Android Intent URL untuk deep linking.
 * Intent URL adalah format khusus Android yang memberikan fallback otomatis
 * ke browser jika app tidak terinstall.
 *
 * @param originalUrl - URL asli yang akan dibuka
 * @param androidPackage - Package name app Android
 * @returns Intent URL string
 */
export function buildAndroidIntentUrl(
  originalUrl: string,
  androidPackage: string
): string {
  const encodedUrl = encodeURIComponent(originalUrl);
  return `intent://${originalUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=${androidPackage};S.browser_fallback_url=${encodedUrl};end`;
}
