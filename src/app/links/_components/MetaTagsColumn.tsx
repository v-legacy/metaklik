'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Copy, Check, Code2 } from 'lucide-react';
import { useState } from 'react';

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface MetaTagsColumnProps {
  metadata: MetadataResult;
  className?: string;
}

export function MetaTagsColumn({ metadata, className }: MetaTagsColumnProps) {
  const [copied, setCopied] = useState(false);

  // Convert metadata to JSON string with proper formatting
  const jsonString = JSON.stringify(metadata, null, 2);

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting for JSON
  const renderJsonLine = (line: string, index: number) => {
    // Property names (keys)
    const keyRegex = /"([^"]+)":/g;
    // String values
    const stringRegex = /: "([^"]*)"/g;
    // Boolean/null values
    const boolNullRegex = /: (true|false|null)/g;

    let highlightedLine = line;

    // Highlight keys in blue
    highlightedLine = highlightedLine.replace(
      keyRegex,
      '<span style="color: #60a5fa">"$1"</span>:'
    );

    // Highlight string values in green
    highlightedLine = highlightedLine.replace(
      stringRegex,
      ': <span style="color: #4ade80">"$1"</span>'
    );

    // Highlight boolean/null in purple
    highlightedLine = highlightedLine.replace(
      boolNullRegex,
      ': <span style="color: #c084fc">$1</span>'
    );

    return (
      <div
        key={index}
        className="flex"
        dangerouslySetInnerHTML={{ __html: highlightedLine }}
      />
    );
  };

  const lines = jsonString.split('\n');

  return (
    <Card
      className={cn(
        'overflow-hidden shadow-xl',
        className
      )}
      style={{
        backgroundColor: '#09090b',
        borderColor: '#27272a',
      }}
    >
      <CardHeader
        className="border-b"
        style={{
          backgroundColor: '#18181b',
          borderColor: '#27272a',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-5" style={{ color: '#a1a1aa' }} />
            <h2
              className="font-mono text-sm font-semibold"
              style={{ color: '#fafafa' }}
            >
              metadata.json
            </h2>
          </div>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: '#27272a',
              color: '#d4d4d8',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3f3f46';
              e.currentTarget.style.color = '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#d4d4d8';
            }}
            aria-label="Copy all metadata"
          >
            {copied ? (
              <>
                <Check className="size-3.5" style={{ color: '#4ade80' }} />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy JSON
              </>
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* JSON Viewer */}
        <div className="relative">
          {/* Line Numbers */}
          <div
            className="absolute left-0 top-0 flex h-full select-none flex-col border-r px-3 py-4 font-mono text-xs"
            style={{
              backgroundColor: 'rgba(24, 24, 27, 0.3)',
              borderColor: '#27272a',
              color: '#71717a',
            }}
          >
            {lines.map((_, index) => (
              <div key={index} className="leading-6">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <div className="overflow-x-auto pl-12">
            <pre
              className="p-4 font-mono text-sm leading-6"
              style={{ color: '#d4d4d8' }}
            >
              {lines.map((line, index) => renderJsonLine(line, index))}
            </pre>
          </div>
        </div>

        {/* Footer Info */}
        <div
          className="border-t px-4 py-2"
          style={{
            backgroundColor: 'rgba(24, 24, 27, 0.3)',
            borderColor: '#27272a',
          }}
        >
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: '#71717a' }}
          >
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: '#22c55e' }}
              />
              Valid JSON
            </span>
            <span>{lines.length} lines</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
