'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ImageIcon,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  MoreHorizontal,
} from 'lucide-react';

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

interface SocialMediaPreviewsProps {
  metadata: MetadataResult;
  className?: string;
}

type Platform = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp';

export function SocialMediaPreviews({
  metadata,
  className,
}: SocialMediaPreviewsProps) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform>('facebook');

  const platforms = [
    { id: 'facebook' as Platform, name: 'Facebook', color: 'bg-[#1877F2]' },
    { id: 'twitter' as Platform, name: 'Twitter/X', color: 'bg-black' },
    { id: 'linkedin' as Platform, name: 'LinkedIn', color: 'bg-[#0A66C2]' },
    { id: 'whatsapp' as Platform, name: 'WhatsApp', color: 'bg-[#25D366]' },
  ];

  const renderPreview = () => {
    switch (selectedPlatform) {
      case 'facebook':
        return <FacebookPreview metadata={metadata} />;
      case 'twitter':
        return <TwitterPreview metadata={metadata} />;
      case 'linkedin':
        return <LinkedInPreview metadata={metadata} />;
      case 'whatsapp':
        return <WhatsAppPreview metadata={metadata} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Platform Selector */}
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              selectedPlatform === platform.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800 border border-slate-700/50'
            )}
          >
            <span
              className={cn('size-2 rounded-full', platform.color)}
              aria-hidden="true"
            />
            {platform.name}
          </button>
        ))}
      </div>

      {/* Preview Container */}
      <div className="animate-in fade-in duration-300">{renderPreview()}</div>

      {/* Info Text */}
      <p className="text-center text-xs text-gray-400">
        Preview may vary slightly from actual platform appearance
      </p>
    </div>
  );
}

// Facebook Preview Component
function FacebookPreview({ metadata }: { metadata: MetadataResult }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use displayUrl if available, otherwise extract from url
  const displayDomain = metadata.displayUrl || 
    (metadata.url ? new URL(metadata.url).hostname.replace('www.', '') : '');

  return (
    <Card className="overflow-hidden border-slate-800/50 bg-slate-800/30 backdrop-blur-md shadow-xl">
      {/* Facebook Post Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="size-10 rounded-full bg-slate-700/50" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Your Page Name</p>
          <p className="text-xs text-gray-400">Just now · 🌐</p>
        </div>
        <button className="rounded-full p-2 text-gray-400 hover:bg-slate-700/50">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Post Text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-300">Check out this link!</p>
      </div>

      {/* Link Preview Card */}
      <div className="border-y border-slate-700/50">
        {/* Image */}
        {metadata.image && !imageError ? (
          <div className="relative aspect-[1.91/1] w-full bg-slate-900/50">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 animate-pulse rounded-lg bg-slate-700/50" />
              </div>
            )}
            <Image
              src={metadata.image}
              alt={metadata.title}
              fill
              className="object-fill"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </div>
        ) : (
          <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-900/50">
            <ImageIcon className="size-16 text-gray-600" />
          </div>
        )}

        {/* Link Info */}
        <div className="space-y-1 bg-slate-900/30 p-3">
          <p className="text-xs uppercase text-gray-500">
            {displayDomain}
          </p>
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {metadata.title}
          </p>
          {metadata.description && (
            <p className="line-clamp-2 text-xs text-gray-400">
              {metadata.description}
            </p>
          )}
        </div>
      </div>

      {/* Facebook Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex gap-1">
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
            <Heart className="size-5" />
            Like
          </button>
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
            <MessageCircle className="size-5" />
            Comment
          </button>
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
            <Share2 className="size-5" />
            Share
          </button>
        </div>
      </div>
    </Card>
  );
}

// Twitter Preview Component
function TwitterPreview({ metadata }: { metadata: MetadataResult }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use displayUrl if available, otherwise extract from url
  const displayDomain = metadata.displayUrl || 
    (metadata.url ? new URL(metadata.url).hostname.replace('www.', '') : '');

  return (
    <Card className="overflow-hidden border-slate-800/50 bg-slate-800/30 backdrop-blur-md shadow-xl">
      {/* Twitter Post Header */}
      <div className="flex gap-3 p-4">
        <div className="size-12 shrink-0 rounded-full bg-slate-700/50" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">Your Name</p>
            <p className="text-sm text-gray-400">@yourhandle</p>
            <span className="text-sm text-gray-400">· 1m</span>
          </div>

          {/* Tweet Text */}
          <p className="mt-2 text-sm text-gray-300">Check out this link!</p>

          {/* Link Preview Card */}
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700/50">
            {/* Image */}
            {metadata.image && !imageError ? (
              <div className="relative aspect-[2/1] w-full bg-slate-900/50">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 animate-pulse rounded-lg bg-slate-700/50" />
                  </div>
                )}
                <Image
                  src={metadata.image}
                  alt={metadata.title}
                  fill
                  className="object-fill"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="flex aspect-[2/1] items-center justify-center bg-slate-900/50">
                <ImageIcon className="size-16 text-gray-600" />
              </div>
            )}

            {/* Link Info */}
            <div className="space-y-0.5 bg-slate-900/30 p-3">
              <p className="line-clamp-1 text-xs text-gray-500">
                {displayDomain}
              </p>
              <p className="line-clamp-1 text-sm font-semibold text-white">
                {metadata.title}
              </p>
              {metadata.description && (
                <p className="line-clamp-1 text-xs text-gray-400">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>

          {/* Twitter Actions */}
          <div className="mt-3 flex items-center justify-between">
            <button className="flex items-center gap-2 text-gray-400 transition-colors hover:text-indigo-400">
              <MessageCircle className="size-5" />
              <span className="text-xs">24</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 transition-colors hover:text-indigo-400">
              <Share2 className="size-5" />
              <span className="text-xs">12</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 transition-colors hover:text-indigo-400">
              <Heart className="size-5" />
              <span className="text-xs">156</span>
            </button>
            <button className="text-gray-400 transition-colors hover:text-indigo-400">
              <ExternalLink className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// LinkedIn Preview Component
function LinkedInPreview({ metadata }: { metadata: MetadataResult }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use displayUrl if available, otherwise extract from url
  const displayDomain = metadata.displayUrl || 
    (metadata.url ? new URL(metadata.url).hostname.replace('www.', '') : '');

  return (
    <Card className="overflow-hidden border-slate-800/50 bg-slate-800/30 backdrop-blur-md shadow-xl">
      {/* LinkedIn Post Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="size-12 shrink-0 rounded-full bg-slate-700/50" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Your Name</p>
          <p className="text-xs text-gray-400">Your Job Title · 1st</p>
          <p className="text-xs text-gray-400">1m · 🌐</p>
        </div>
        <button className="rounded p-2 text-gray-400 hover:bg-slate-700/50">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      {/* Post Text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-300">Sharing this interesting link!</p>
      </div>

      {/* Link Preview Card */}
      <div className="border-y border-slate-700/50">
        {/* Image */}
        {metadata.image && !imageError ? (
          <div className="relative aspect-[2.4/1] w-full bg-slate-900/50">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-12 animate-pulse rounded-lg bg-slate-700/50" />
              </div>
            )}
            <Image
              src={metadata.image}
              alt={metadata.title}
              fill
              className="object-fill"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          </div>
        ) : (
          <div className="flex aspect-[2.4/1] items-center justify-center bg-slate-900/50">
            <ImageIcon className="size-16 text-gray-600" />
          </div>
        )}

        {/* Link Info */}
        <div className="space-y-1 bg-slate-900/30 p-3">
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {metadata.title}
          </p>
          <p className="text-xs text-gray-500">
            {displayDomain}
          </p>
        </div>
      </div>

      {/* LinkedIn Actions */}
      <div className="flex items-center gap-1 p-2">
        <button className="flex flex-1 items-center justify-center gap-2 rounded py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
          <Heart className="size-5" />
          Like
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
          <MessageCircle className="size-5" />
          Comment
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
          <Share2 className="size-5" />
          Repost
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700/50">
          <ExternalLink className="size-5" />
          Send
        </button>
      </div>
    </Card>
  );
}

// WhatsApp Preview Component
function WhatsAppPreview({ metadata }: { metadata: MetadataResult }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use displayUrl if available, otherwise extract from url
  const displayDomain = metadata.displayUrl || 
    (metadata.url ? new URL(metadata.url).hostname.replace('www.', '') : '');

  return (
    <div className="rounded-lg bg-[#0d1418] p-4 shadow-xl">
      {/* Chat Bubble */}
      <div className="mx-auto max-w-md">
        {/* Sender Message */}
        <div className="mb-2 flex justify-end">
          <div className="max-w-[85%] rounded-lg rounded-tr-none bg-[#005C4B] p-2">
            <p className="text-sm text-white">Check this out!</p>
            <p className="mt-1 text-right text-xs text-gray-400">12:34</p>
          </div>
        </div>

        {/* Link Preview Bubble */}
        <div className="flex justify-end">
          <div className="max-w-[85%] overflow-hidden rounded-lg rounded-tr-none bg-[#005C4B]">
            {/* Image */}
            {metadata.image && !imageError ? (
              <div className="relative aspect-video w-full bg-slate-900/50">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-12 animate-pulse rounded-lg bg-slate-700/50" />
                  </div>
                )}
                <Image
                  src={metadata.image}
                  alt={metadata.title}
                  fill
                  className="object-fill"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-900/50">
                <ImageIcon className="size-12 text-gray-600" />
              </div>
            )}

            {/* Link Info */}
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-semibold text-white">
                {metadata.title}
              </p>
              {metadata.description && (
                <p className="line-clamp-2 text-xs text-gray-300">
                  {metadata.description}
                </p>
              )}
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <ExternalLink className="size-3" />
                {displayDomain}
              </p>
            </div>

            {/* Timestamp */}
            <div className="px-3 pb-2">
              <p className="text-right text-xs text-gray-400">12:34</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
