'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('System error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center px-4 max-w-sm">
        <p className="text-xs font-mono tracking-[0.2em] text-ink-subtle mb-8">SYS_ERR</p>
        <h2 className="text-lg font-medium mb-2 text-ink">System Failure</h2>
        <p className="text-ink-muted mb-6 text-sm">
          An unexpected error occurred. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-error bg-error-bg border border-error-border p-4 mb-6 overflow-auto text-left font-mono rounded-sm">
            {error.message}
          </pre>
        )}
        <button
          className="px-5 py-2 border border-border text-sm text-ink rounded-sm transition-all duration-500 hover:border-brand-violet/30 hover:shadow-glow active:scale-[0.98]"
          onClick={() => reset()}
          type="button"
        >
          Reset System
        </button>
      </div>
    </div>
  );
}
