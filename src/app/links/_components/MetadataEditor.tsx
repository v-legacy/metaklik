'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefreshCw, Save } from 'lucide-react';

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  displayUrl?: string | null; // Custom display URL
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface MetadataEditorProps {
  metadata: MetadataResult;
  onUpdate: (metadata: MetadataResult) => void;
  className?: string;
}

export function MetadataEditor({
  metadata,
  onUpdate,
  className,
}: MetadataEditorProps) {
  const [editedMetadata, setEditedMetadata] =
    useState<MetadataResult>(metadata);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof MetadataResult, value: string | null) => {
    setEditedMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(editedMetadata);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditedMetadata(metadata);
    setHasChanges(false);
  };

  return (
    <Card
      className={cn(
        'h-fit border-slate-800/50 bg-slate-800/30 backdrop-blur-md shadow-xl',
        className
      )}
    >
      <CardHeader className="space-y-1 border-b border-slate-800/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Edit Metadata</h3>
            <p className="text-sm text-gray-400">
              Customize how your link appears
            </p>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 border-slate-700 bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white"
              >
                <RefreshCw className="size-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Save className="size-4" />
                Apply
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            value={editedMetadata.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter title"
            className="border-slate-700/50 bg-slate-900/50 font-medium text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400">
            {editedMetadata.title.length} characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-300"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={editedMetadata.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter description"
            rows={4}
            className="flex w-full rounded-md border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-gray-400">
            {editedMetadata.description.length} characters
          </p>
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="image">
            Image URL
          </label>
          <Input
            id="image"
            value={editedMetadata.image || ''}
            onChange={(e) => handleChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
            className="border-slate-700/50 bg-slate-900/50 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Site Name */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-300"
            htmlFor="siteName"
          >
            Site Name
          </label>
          <Input
            id="siteName"
            value={editedMetadata.siteName || ''}
            onChange={(e) => handleChange('siteName', e.target.value)}
            placeholder="Enter site name"
            className="border-slate-700/50 bg-slate-900/50 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* URL (Read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">
            Source URL (Read-only)
          </label>
          <Input
            value={editedMetadata.url}
            disabled
            className="border-slate-800/50 bg-slate-900/80 text-gray-400"
          />
          <p className="text-xs text-gray-500">
            This is the actual destination URL
          </p>
        </div>

        {/* Display URL (Editable) */}
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-300"
            htmlFor="displayUrl"
          >
            Display URL (Optional)
          </label>
          <Input
            id="displayUrl"
            value={editedMetadata.displayUrl || ''}
            onChange={(e) => handleChange('displayUrl', e.target.value || null)}
            placeholder="yourbrand.com/promo"
            className="border-slate-700/50 bg-slate-900/50 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500">
            Custom URL text shown in preview (e.g., youtube.com, yourbrand.com)
          </p>
        </div>

        {/* Video URL (if exists) */}
        {editedMetadata.video && (
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-300"
              htmlFor="video"
            >
              Video URL
            </label>
            <Input
              id="video"
              value={editedMetadata.video}
              onChange={(e) => handleChange('video', e.target.value)}
              placeholder="https://example.com/video.mp4"
              type="url"
              className="border-slate-700/50 bg-slate-900/50 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="type">
            Content Type
          </label>
          <select
            id="type"
            value={editedMetadata.type || 'website'}
            onChange={(e) => {
              const value = e.target.value as MetadataResult['type'];
              handleChange('type', value || null);
            }}
            className="flex h-9 w-full rounded-md border border-slate-700/50 bg-slate-900/50 px-3 py-1 text-sm text-white shadow-sm transition-colors placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
