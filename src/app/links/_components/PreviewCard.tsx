import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { ImageIcon, ExternalLink, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface PreviewCardProps {
  metadata: MetadataResult;
  className?: string;
}

export function PreviewCard({ metadata, className }: PreviewCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const getTypeIcon = () => {
    switch (metadata.type) {
      case 'video':
        return <Play className="size-5" />;
      case 'image':
        return <ImageIcon className="size-5" />;
      default:
        return null;
    }
  };

  const getTypeBadge = () => {
    if (!metadata.type) return null;

    const typeColors = {
      video: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      image: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      article: 'bg-green-500/10 text-green-700 dark:text-green-400',
      website: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
          typeColors[metadata.type]
        )}
      >
        {getTypeIcon()}
        {metadata.type.charAt(0).toUpperCase() + metadata.type.slice(1)}
      </span>
    );
  };

  return (
    <article
      className={cn('h-fit overflow-hidden', className)}
      aria-label="Link preview card"
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Image Section */}
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {metadata.image && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-muted-foreground/20 size-16 animate-pulse rounded-lg" />
                </div>
              )}
              <Image
                src={metadata.image}
                alt={metadata.title || 'Preview image'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
              />
              {/* Overlay gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </>
          ) : (
            <div
              className="flex size-full flex-col items-center justify-center gap-3"
              role="img"
              aria-label="No preview image available"
            >
              <ImageIcon
                className="text-muted-foreground size-16"
                aria-hidden="true"
              />
              <p className="text-muted-foreground text-sm">No image available</p>
            </div>
          )}

          {/* Type Badge Overlay */}
          {metadata.type && (
            <div className="absolute right-3 top-3">{getTypeBadge()}</div>
          )}
        </div>

        {/* Content Section */}
        <div className="space-y-3 p-5">
          {/* Site Name & External Link */}
          <div className="flex items-center justify-between gap-2">
            {metadata.siteName && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
                <span className="bg-primary/10 size-1.5 rounded-full" />
                {metadata.siteName}
              </p>
            )}
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
              aria-label="Open link in new tab"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          {/* Title */}
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {metadata.title}
          </h2>

          {/* Description */}
          {metadata.description && (
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {metadata.description}
            </p>
          )}

          {/* URL with domain highlight */}
          <div className="border-t pt-3">
            <p className="text-muted-foreground flex items-center gap-2 truncate text-xs">
              <span className="bg-muted rounded px-1.5 py-0.5 font-mono">
                {new URL(metadata.url).hostname}
              </span>
              <span className="truncate opacity-60">{metadata.url}</span>
            </p>
          </div>

          {/* Video indicator */}
          {metadata.video && (
            <div className="bg-muted flex items-center gap-2 rounded-lg p-2">
              <Play className="text-primary size-4 shrink-0" />
              <span className="text-muted-foreground truncate text-xs">
                Video content available
              </span>
            </div>
          )}
        </div>
      </Card>
    </article>
  );
}
