import HorizontalScrollSection from '@/components/HorizontalScrollSection';

const PANELS = [
  {
    num: '01',
    title: 'Systems Architecture',
    desc: 'We design the structural foundation of your operations — how data flows, how teams connect, how decisions cascade.',
    gradient: 'from-neutral-950 via-neutral-900 to-neutral-950',
  },
  {
    num: '02',
    title: 'Operational Intelligence',
    desc: 'Real-time visibility into how your systems perform. Patterns surfaced. Bottlenecks identified. Decisions accelerated.',
    gradient: 'from-neutral-900 via-zinc-900 to-neutral-900',
  },
  {
    num: '03',
    title: 'Process Control',
    desc: 'Governance frameworks that keep systems running as intended. Compliance, quality, and consistency at scale.',
    gradient: 'from-zinc-900 via-neutral-800 to-zinc-900',
  },
  {
    num: '04',
    title: 'Scale Engineering',
    desc: 'Infrastructure that grows with demand. Systems that execute, not just track. Less manual work, faster execution.',
    gradient: 'from-neutral-800 via-zinc-800 to-neutral-800',
  },
  {
    num: '05',
    title: 'Deploy. Automate. Dominate.',
    desc: 'Your business is only as strong as your systems. We build the ones that make companies scale.',
    gradient: 'from-zinc-800 via-neutral-900 to-black',
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* ── Hero (vertical scroll) ──────────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-px bg-neutral-600" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
              Interactive Demo
            </p>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Horizontal Scroll
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-lg mx-auto">
            Scroll down to see GSAP ScrollTrigger in action.
            Vertical scroll converts to horizontal movement, then resumes normal flow.
          </p>
          <div className="mt-10 flex flex-col items-center gap-2 text-neutral-600 text-sm">
            <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-wider">Scroll</span>
          </div>
        </div>
      </section>

      {/* ── Horizontal section ──────────────────────────────────── */}
      <HorizontalScrollSection
        panels={PANELS.map((p, i) => (
          <div
            key={i}
            className={`h-full w-screen flex items-center justify-center bg-gradient-to-br ${p.gradient} px-8 md:px-16`}
          >
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-sm uppercase tracking-[0.25em] text-neutral-500">
                {p.num}
              </span>
              <h2 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                {p.title}
              </h2>
              <p className="mt-6 text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      />

      {/* ── Footer section (vertical resumes) ───────────────────── */}
      <section className="flex min-h-screen items-center justify-center px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Vertical scroll resumes
          </h2>
          <p className="mt-6 text-lg text-neutral-400 max-w-lg mx-auto">
            The horizontal section pinned, scrolled, and released.
            Everything after flows naturally.
          </p>
          <div className="mt-10 inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 rounded-sm text-sm font-mono text-neutral-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            GSAP + ScrollTrigger + React
          </div>
        </div>
      </section>
    </main>
  );
}
