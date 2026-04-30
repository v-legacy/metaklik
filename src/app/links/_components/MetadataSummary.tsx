'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Copy, Check, Code2 } from 'lucide-react';

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

interface MetadataSummaryProps {
  metadata: MetadataResult;
  className?: string;
}

export function MetadataSummary({
  metadata,
  className,
}: MetadataSummaryProps) {
  const [copied, setCopied] = useState(false);

  // Generate meta tags HTML
  const generateMetaTags = () => {
    const tags: string[] = [];

    // Basic meta tags
    tags.push(`<title>${metadata.title}</title>`);
    tags.push(
      `<meta name="description" content="${metadata.description}" />`
    );

    // Open Graph tags
    tags.push(`<meta property="og:title" content="${metadata.title}" />`);
    tags.push(
      `<meta property="og:description" content="${metadata.description}" />`
    );
    tags.push(`<meta property="og:url" content="${metadata.url}" />`);
    if (metadata.image) {
      tags.push(`<meta property="og:image" content="${metadata.image}" />`);
    }
    if (metadata.siteName) {
      tags.push(
        `<meta property="og:site_name" content="${metadata.siteName}" />`
      );
    }
    if (metadata.type) {
      tags.push(`<meta property="og:type" content="${metadata.type}" />`);
    }
    if (metadata.video) {
      tags.push(`<meta property="og:video" content="${metadata.video}" />`);
    }

    // Twitter Card tags
    tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
    tags.push(`<meta name="twitter:title" content="${metadata.title}" />`);
    tags.push(
      `<meta name="twitter:description" content="${metadata.description}" />`
    );
    if (metadata.image) {
      tags.push(`<meta name="twitter:image" content="${metadata.image}" />`);
    }

    return tags.join('\n');
  };

  const metaTagsHTML = generateMetaTags();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(metaTagsHTML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render meta tag with syntax highlighting
  const renderMetaTag = (tag: string, index: number) => {
    // Parse the tag to highlight different parts
    const tagMatch = tag.match(/^<(\w+)(.*)>(.+)?<\/\1>$|^<(\w+)(.*)\/?>$/);
    if (!tagMatch) return <div key={index}>{tag}</div>;

    const isClosingTag = tagMatch[1]; // Has closing tag
    const tagName = tagMatch[1] || tagMatch[4];
    const attributes = tagMatch[2] || tagMatch[5];
    const content = tagMatch[3];

    return (
      <div key={index} className="font-mono text-sm" style={{ lineHeight: '1.6rem' }}>
        <span style={{ color: '#808080' }}>&lt;</span>
        <span style={{ color: '#569cd6' }}>{tagName}</span>
        {attributes && (
          <span style={{ color: '#d4d4d4' }}>
            {attributes.split(/(\w+="[^"]*")/).map((part, i) => {
              if (part.includes('=')) {
                const [attr, value] = part.split('=');
                return (
                  <span key={i}>
                    <span style={{ color: '#9cdcfe' }}>
                      {' '}
                      {attr}
                    </span>
                    <span style={{ color: '#808080' }}>=</span>
                    <span style={{ color: '#4ec9b0' }}>
                      {value}
                    </span>
                  </span>
                );
              }
              return part;
            })}
          </span>
        )}
        {isClosingTag ? (
          <>
            <span style={{ color: '#808080' }}>&gt;</span>
            <span style={{ color: '#d4d4d4' }}>{content}</span>
            <span style={{ color: '#808080' }}>&lt;/</span>
            <span style={{ color: '#569cd6' }}>{tagName}</span>
            <span style={{ color: '#808080' }}>&gt;</span>
          </>
        ) : (
          <span style={{ color: '#808080' }}> /&gt;</span>
        )}
      </div>
    );
  };

  const metaTagsArray = metaTagsHTML.split('\n');

  return (
    <Card
      className={cn(
        'overflow-hidden shadow-lg',
        className
      )}
      style={{
        backgroundColor: '#1e1e1e',
        borderColor: '#333',
      }}
    >
      <CardHeader
        className="border-b"
        style={{
          backgroundColor: '#252526',
          borderColor: '#333',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-5" style={{ color: '#4ade80' }} />
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#fff' }}>
                Meta Tags
              </h3>
              <p className="text-xs" style={{ color: '#888' }}>
                HTML meta tags for your webpage
              </p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: '#333',
              color: '#ccc',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
            }}
          >
            {copied ? (
              <>
                <Check className="size-3.5" style={{ color: '#4ade80' }} />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          className="max-h-[500px] overflow-y-auto p-4"
          style={{ backgroundColor: '#1e1e1e' }}
        >
          <div className="space-y-1">
            {metaTagsArray.map((tag, index) => renderMetaTag(tag, index))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="border-t px-4 py-2"
          style={{
            backgroundColor: '#252526',
            borderColor: '#333',
          }}
        >
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: '#888' }}
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: '#4ade80' }}
                />
                Ready to use
              </span>
              <span>Size: {new Blob([metaTagsHTML]).size} B</span>
            </div>
            <span>{metaTagsArray.length} tags</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
