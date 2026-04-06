import KorantisStorySection from '@/components/KorantisStorySection';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex h-screen items-center justify-center px-8">
        <div className="text-center">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-500">
            Korantis
          </p>
          <h1 className="mt-4 text-5xl md:text-7xl font-bold tracking-tight">
            Systems That Run Companies
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-lg mx-auto">
            Scroll to experience the journey from chaos to dominance.
          </p>
          <div className="mt-10 flex flex-col items-center gap-2 text-neutral-600">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      </section>

      {/* ── Story section (horizontal scroll) ─────────────────── */}
      <KorantisStorySection />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Start Now
          </h2>
          <p className="mt-6 text-lg text-neutral-400 max-w-lg mx-auto">
            Your systems are waiting to be built.
            Let&apos;s design the infrastructure that makes you scale.
          </p>
          <a
            href="#contact"
            className="mt-10 inline-flex items-center gap-2 px-8 py-4 border border-neutral-600 rounded-sm text-sm font-mono uppercase tracking-wider text-neutral-300 hover:text-white hover:border-neutral-400 transition-colors"
          >
            Begin Architecture
          </a>
        </div>
      </section>
    </main>
  );
}
