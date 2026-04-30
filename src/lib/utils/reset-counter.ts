/**
 * Utility to reset the free request counter
 * Useful for testing and debugging
 */

export function resetRequestCounter(): void {
  localStorage.removeItem('linkPreviewRequestCount');
  localStorage.removeItem('linkPreviewRequestTime');
  console.log('✅ Request counter has been reset!');
  console.log('Please refresh the page to see the changes.');
}

// Make it available globally for easy testing in console
if (typeof window !== 'undefined') {
  (window as any).resetRequestCounter = resetRequestCounter;
}
