'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HeroSection } from './_components/HeroSection';
import { LinkInputSection } from './_components/LinkInputSection';
import { ResultsSection } from './_components/ResultsSection';
import { getErrorMessage } from './_utils/errorMessages';
import { throttle } from '@/lib/utils/throttle';
import '@/lib/utils/reset-counter'; // Make reset function available in console
import Link from 'next/link';

/**
 * Links Page - Public metadata extraction demo
 *
 * This page allows users to extract and preview link metadata without authentication.
 * It serves as a demo/trial feature to attract potential clients.
 */

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  displayUrl?: string | null;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface APISuccessResponse {
  success: true;
  data: MetadataResult;
}

interface APIErrorResponse {
  success: false;
  error: string;
  code:
    | 'INVALID_URL'
    | 'UNREACHABLE'
    | 'TIMEOUT'
    | 'PARSE_ERROR'
    | 'RATE_LIMIT_EXCEEDED'
    | 'UNKNOWN';
  retryAfter?: number;
}

type APIResponse = APISuccessResponse | APIErrorResponse;

export default function Page() {
  const [url, setUrl] = useState('');
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const MAX_FREE_REQUESTS = 3;

  // Load request count from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('linkPreviewRequestCount');
    const storedTime = localStorage.getItem('linkPreviewRequestTime');

    console.log('Loading from localStorage:', { stored, storedTime }); // Debug log

    if (stored && storedTime) {
      const count = parseInt(stored, 10);
      const time = parseInt(storedTime, 10);
      const hoursPassed = (Date.now() - time) / (1000 * 60 * 60);

      console.log('Hours passed:', hoursPassed); // Debug log

      // Reset after 24 hours
      if (hoursPassed < 24) {
        console.log('Setting count to:', count); // Debug log
        setRequestCount(count);
        if (count >= MAX_FREE_REQUESTS) {
          console.log('Limit already reached on load'); // Debug log
          setIsLimitReached(true);
        }
      } else {
        // Reset counter
        console.log('Resetting counter (24h passed)'); // Debug log
        localStorage.removeItem('linkPreviewRequestCount');
        localStorage.removeItem('linkPreviewRequestTime');
      }
    }
  }, []);

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (error) {
      setError(null);
    }
  };

  const handleMetadataUpdate = (updatedMetadata: MetadataResult) => {
    setMetadata(updatedMetadata);
  };

  // Actual submit function
  const performSubmit = async (urlToFetch: string) => {
    // Check if limit reached
    if (requestCount >= MAX_FREE_REQUESTS) {
      setIsLimitReached(true);
      setError(
        `You've reached the free limit of ${MAX_FREE_REQUESTS} requests. Sign in to continue with unlimited access.`,
      );
      return;
    }

    setError(null);
    setMetadata(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/links/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data: APIResponse = await response.json();

      if (data.success) {
        // Use functional update to get the latest count
        setRequestCount((prevCount) => {
          const newCount = prevCount + 1;
          console.log('Request successful! Prev:', prevCount, 'New:', newCount); // Debug log
          localStorage.setItem('linkPreviewRequestCount', newCount.toString());

          // Store timestamp on first request
          if (prevCount === 0) {
            localStorage.setItem(
              'linkPreviewRequestTime',
              Date.now().toString(),
            );
          }

          // Check if limit reached
          if (newCount >= MAX_FREE_REQUESTS) {
            console.log('Limit reached!'); // Debug log
            setIsLimitReached(true);
          }

          return newCount;
        });

        // Set metadata after updating count
        setMetadata(data.data);
      } else {
        const errorMessage = getErrorMessage(
          data.code,
          data.error,
          data.retryAfter,
        );
        setError(errorMessage);
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Failed to fetch metadata:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Throttled submit - max once per 2 seconds
  const throttledSubmit = useRef(
    throttle((urlToFetch: string) => {
      performSubmit(urlToFetch);
    }, 2000),
  ).current;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if already loading or limit reached
    if (isLoading || isLimitReached) {
      return;
    }

    throttledSubmit(url);
  };

  return (
    <main className='min-h-screen'>
      {/* Navbar */}
      <nav className='bg-slate-800 shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between pt-4'>
            <div className='flex h-full shrink-0 items-center overflow-hidden'>
              <Link
                href='/'
                className='flex h-full items-center font-bold text-gray-900'
              >
                <img
                  width={200}
                  height={220}
                  src='/assets/metaklik.png'
                  alt='MetaKlik Logo'
                  className='min-w-2/6 object-contain'
                />
              </Link>
            </div>

            <div className='hidden items-center space-x-8 md:flex'>
              <Link
                href='/#features'
                className='text-white hover:text-indigo-400'
              >
                Features
              </Link>
              <Link
                href='/#pricing'
                className='text-white hover:text-indigo-400'
              >
                Pricing
              </Link>
              <Link href='/#about' className='text-white hover:text-indigo-400'>
                About
              </Link>
              <Link
                href='/#testimonials'
                className='text-white hover:text-indigo-400'
              >
                Testimonials
              </Link>
            </div>
            <div>
              <a
                href='/auth/signin'
                className='rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700'
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <LinkInputSection
        url={url}
        onUrlChange={handleUrlChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        isDisabled={isLimitReached}
        requestCount={requestCount}
        maxRequests={MAX_FREE_REQUESTS}
      />
      {metadata && (
        <ResultsSection
          metadata={metadata}
          onMetadataUpdate={handleMetadataUpdate}
        />
      )}
    </main>
  );
}
