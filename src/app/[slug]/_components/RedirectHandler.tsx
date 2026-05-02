/**
 * @file RedirectHandler.tsx
 * @description Client Component yang menangani logika redirect shortlink.
 *
 * Strategi:
 * - MOBILE: Coba deep link → timeout → fallback ke original URL
 * - ANDROID: Gunakan Intent URL untuk fallback yang lebih reliable
 * - DESKTOP: Countdown 3 detik → redirect ke original URL
 *
 * Juga bertanggung jawab memanggil trackClick() untuk analytics.
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { trackClick } from '../actions/track-click';
import {
  getDeepLinkInfo,
  buildAndroidIntentUrl,
} from '@/lib/utils/deep-link-registry';

interface RedirectHandlerProps {
  /** URL asli yang akan dituju (e.g. https://shopee.co.id/product-xyz) */
  originalUrl: string;
  /** Domain dari original URL (e.g. 'shopee.co.id') */
  domain: string | null;
  /** ID Custom Link untuk tracking analytics */
  linkId: string;
  /** Apakah user mengakses dari perangkat mobile */
  isMobile: boolean;
  /** Apakah user mengakses dari Android */
  isAndroid: boolean;
  /** Parameter manual (opsional, dari ?ref=xxx) */
  sourceRef?: string;
}

/** Durasi countdown untuk desktop (dalam detik) */
const DESKTOP_COUNTDOWN_SECONDS = 3;

/** Timeout untuk deep link attempt di mobile (dalam ms) */
const DEEP_LINK_TIMEOUT_MS = 1500;

export default function RedirectHandler({
  originalUrl,
  domain,
  linkId,
  isMobile,
  isAndroid,
  sourceRef,
}: RedirectHandlerProps) {
  const [countdown, setCountdown] = useState(DESKTOP_COUNTDOWN_SECONDS);
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'failed'>(
    'loading'
  );
  const hasTracked = useRef(false);
  const hasRedirected = useRef(false);

  // Track analytics on mount (sekali saja)
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    trackClick({
      linkId,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sourceRef,
    });
  }, [linkId]);

  // Redirect logic
  useEffect(() => {
    if (hasRedirected.current) return;

    if (isMobile) {
      handleMobileRedirect();
    } else {
      handleDesktopRedirect();
    }

    return () => {
      hasRedirected.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mobile redirect strategy:
   * 1. Cek apakah domain punya deep link info
   * 2. Jika ya: coba buka deep link, fallback setelah timeout
   * 3. Jika tidak: langsung redirect ke original URL
   */
  const handleMobileRedirect = () => {
    setStatus('redirecting');

    const deepLinkInfo = getDeepLinkInfo(domain);

    if (deepLinkInfo) {
      // Android: gunakan Intent URL (lebih reliable)
      if (isAndroid) {
        const intentUrl = buildAndroidIntentUrl(
          originalUrl,
          deepLinkInfo.androidPackage
        );
        window.location.href = intentUrl;
        return;
      }

      // iOS & lainnya: coba deep link scheme via hidden iframe
      tryDeepLink(deepLinkInfo.scheme);
    } else {
      // Domain tidak dikenali, langsung redirect
      redirectToOriginal();
    }
  };

  /**
   * Mencoba membuka deep link scheme via hidden iframe.
   * Jika app tidak terinstall, iframe akan gagal tanpa error visible.
   * Setelah timeout, fallback ke original URL.
   */
  const tryDeepLink = (scheme: string) => {
    // Buat deep link URL dari original URL
    const deepLinkUrl = scheme + originalUrl.replace(/^https?:\/\//, '');

    // Coba buka via window.location
    window.location.href = deepLinkUrl;

    // Jika masih di halaman setelah timeout → app tidak ada → fallback
    setTimeout(() => {
      // Cek apakah halaman masih visible (jika app terbuka, halaman akan di-blur)
      if (!document.hidden) {
        redirectToOriginal();
      }
    }, DEEP_LINK_TIMEOUT_MS);
  };

  /**
   * Desktop redirect strategy:
   * Countdown dari 3 → 0, lalu redirect.
   */
  const handleDesktopRedirect = () => {
    setStatus('redirecting');

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          redirectToOriginal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /** Redirect ke original URL */
  const redirectToOriginal = () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    window.location.href = originalUrl;
  };

  /** Manual skip — user klik "Buka Sekarang" */
  const handleSkip = () => {
    redirectToOriginal();
  };

  return (
    <div className='space-y-3'>
      {/* Status Text */}
      <div className='flex items-center gap-2'>
        {status === 'redirecting' && (
          <>
            <div className='h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin' />
            <p className='text-sm text-slate-600'>
              {isMobile
                ? 'Membuka aplikasi...'
                : `Mengalihkan dalam ${countdown} detik...`}
            </p>
          </>
        )}
        {status === 'loading' && (
          <p className='text-sm text-slate-500'>Mempersiapkan...</p>
        )}
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className='w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors'
      >
        Buka Sekarang
      </button>
    </div>
  );
}
