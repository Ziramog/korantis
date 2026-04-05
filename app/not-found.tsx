import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center px-4">
        <p className="text-xs font-mono tracking-[0.2em] text-ink-subtle mb-8">0404</p>
        <h2 className="text-3xl font-medium mb-4 text-ink">Not Found</h2>
        <p className="text-ink-muted text-sm mb-10 max-w-xs mx-auto">
          The resource you requested does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 border border-border text-sm text-ink rounded-sm transition-all duration-500 hover:border-brand-violet/30 hover:shadow-glow active:scale-[0.98]"
        >
          Return to system
        </Link>
      </div>
    </div>
  );
}
