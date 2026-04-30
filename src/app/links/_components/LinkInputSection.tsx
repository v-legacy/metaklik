import { FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LinkInputSectionProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  isDisabled?: boolean;
  requestCount?: number;
  maxRequests?: number;
  className?: string;
}

export function LinkInputSection({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
  error,
  isDisabled = false,
  requestCount = 0,
  maxRequests = 3,
  className,
}: LinkInputSectionProps) {
  // Debug log
  console.log('LinkInputSection render:', { requestCount, isDisabled, maxRequests });
  
  // Validate URL format
  const validateUrl = (value: string): string | null => {
    if (!value.trim()) {
      return 'Please enter a URL';
    }

    try {
      const urlObj = new URL(value);
      if (!urlObj.protocol.startsWith('http')) {
        return 'Please enter a valid URL starting with http:// or https://';
      }
      return null;
    } catch {
      return 'Please enter a valid URL starting with http:// or https://';
    }
  };

  const validationError = url.trim() ? validateUrl(url) : null;
  const canSubmit =
    !validationError && !isLoading && url.trim().length > 0 && !isDisabled;

  return (
    <section
      className={cn('mx-auto w-full max-w-2xl px-6 py-8 md:px-12', className)}
    >
      {/* Request Counter */}
      {requestCount > 0 && !isDisabled && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {requestCount} of {maxRequests} free requests used
          </p>
        </div>
      )}

      {/* Limit Reached Notice */}
      {isDisabled && (
        <div className="mb-6 overflow-hidden rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 shadow-sm dark:border-indigo-900 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
              <Lock className="size-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Free Limit Reached
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                You've used all {maxRequests} free requests. Sign in to unlock
                unlimited metadata extraction and access premium features.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/signin">
                  <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 sm:w-auto">
                    <Lock className="size-4" />
                    Sign In to Continue
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950 sm:w-auto"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) {
            onSubmit(e);
          }
        }}
        aria-busy={isLoading}
        className="space-y-4"
      >
        <div className="flex flex-col gap-2 md:flex-row md:gap-3">
          <Input
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={
              isDisabled
                ? 'Sign in to continue...'
                : 'https://example.com'
            }
            aria-label="Enter URL to extract metadata"
            aria-invalid={!!validationError || !!error}
            disabled={isLoading || isDisabled}
            className="min-h-[44px] flex-1"
          />
          
          {isDisabled ? (
            <Link href="/auth/signin" className="md:w-auto">
              <Button
                type="button"
                className="min-h-[44px] w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Lock className="size-4" />
                Sign In
              </Button>
            </Link>
          ) : (
            <Button
              type="submit"
              disabled={!canSubmit}
              aria-label="Extract metadata"
              className="min-h-[44px] md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Metadata'
              )}
            </Button>
          )}
        </div>

        {/* Validation Error */}
        {validationError && url.trim() && !isDisabled && (
          <p className="text-destructive text-sm" role="alert">
            {validationError}
          </p>
        )}

        {/* API Error */}
        {error && !isDisabled && (
          <div
            className="bg-destructive/10 border-destructive text-destructive rounded-md border p-3"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </form>
    </section>
  );
}
