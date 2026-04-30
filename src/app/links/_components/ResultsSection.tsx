import { MetadataSummary } from './MetadataSummary';
import { MetadataEditor } from './MetadataEditor';
import { SocialMediaPreviews } from './SocialMediaPreviews';
import { cn } from '@/lib/utils';
import { Sparkles, Edit3 } from 'lucide-react';

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface ResultsSectionProps {
  metadata: MetadataResult;
  onMetadataUpdate: (metadata: MetadataResult) => void;
  className?: string;
}

export function ResultsSection({
  metadata,
  onMetadataUpdate,
  className,
}: ResultsSectionProps) {
  return (
    <section
      className={cn(
        'relative w-full px-6 py-16 md:px-12 md:py-20',
        'animate-in fade-in duration-500',
        className
      )}
      aria-label="Metadata extraction results"
    >
      {/* Background with gradient effect like home page */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-slate-900">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(99,102,241,0.5)] opacity-50 blur-[80px]"></div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles className="size-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Your Results
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-sm text-gray-300 md:text-base">
            Review the extracted metadata and see how your link will appear
            across different platforms
          </p>
        </div>

        {/* Extraction Summary - Full Width */}
        <div className="mb-8">
          <MetadataSummary metadata={metadata} />
        </div>

        {/* Two Column Layout - Editor & Preview */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left Column - Metadata Editor */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <Edit3 className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Customize Metadata
                </h3>
                <p className="text-sm text-gray-300">
                  Edit fields to see live preview updates
                </p>
              </div>
            </div>
            <MetadataEditor metadata={metadata} onUpdate={onMetadataUpdate} />
          </div>

          {/* Right Column - Social Media Previews */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Live Preview
                </h3>
                <p className="text-sm text-gray-300">
                  See how your link appears on different platforms
                </p>
              </div>
            </div>
            <SocialMediaPreviews metadata={metadata} />
          </div>
        </div>
      </div>
    </section>
  );
}
