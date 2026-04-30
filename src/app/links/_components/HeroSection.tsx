import { Sparkles, Eye, Code2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative flex flex-col items-center justify-center text-center',
        'px-6 py-16 md:px-12 md:py-24 lg:py-28',
        'overflow-hidden',
        className
      )}
      aria-labelledby="hero-heading"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-background dark:to-background" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
        <Sparkles className="size-4" />
        Free Link Metadata Extractor
      </div>

      {/* Main Headline - SEO Optimized */}
      <h1
        id="hero-heading"
        className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
      >
        Preview Your Links Before{' '}
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          You Share Them
        </span>
      </h1>

      {/* Subheadline - Value Proposition */}
      <p className="mt-6 max-w-2xl text-base text-gray-600 dark:text-gray-400 md:text-lg lg:text-xl">
        Extract metadata, preview social media cards, and generate SEO-ready
        meta tags instantly. See how your links appear on Facebook, Twitter,
        LinkedIn, and WhatsApp.
      </p>

      {/* CTA Hint */}
      <div className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <ArrowRight className="size-4 animate-bounce" />
        Paste any URL below to get started
      </div>

      {/* Feature Pills - Compact & Modern */}
      <div
        className="mt-12 flex flex-wrap items-center justify-center gap-3"
        role="list"
      >
        <div
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-gray-800 dark:bg-gray-900"
          role="listitem"
        >
          <Eye className="size-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-700 dark:text-gray-300">
            Live Preview
          </span>
        </div>
        <div
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-gray-800 dark:bg-gray-900"
          role="listitem"
        >
          <Code2 className="size-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-700 dark:text-gray-300">
            Meta Tags Generator
          </span>
        </div>
        <div
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm dark:border-gray-800 dark:bg-gray-900"
          role="listitem"
        >
          <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-gray-700 dark:text-gray-300">
            No Sign-up Required
          </span>
        </div>
      </div>
    </section>
  );
}
