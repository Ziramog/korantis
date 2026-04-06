'use client';

import HorizontalScrollSection from '@/components/HorizontalScrollSection';

const DEMO_PANELS = [
  { num: '01', title: 'Systems Architecture', desc: 'The structural foundation of your operations.' },
  { num: '02', title: 'Operational Intelligence', desc: 'Real-time visibility into system performance.' },
  { num: '03', title: 'Process Control', desc: 'Governance frameworks that keep systems running.' },
  { num: '04', title: 'Data Infrastructure', desc: 'How information flows through your company.' },
  { num: '05', title: 'Scale Engineering', desc: 'Infrastructure that grows with demand.' },
];

const bgColors = [
  'bg-neutral-950 text-white',
  'bg-neutral-900 text-white',
  'bg-neutral-800 text-white',
  'bg-neutral-700 text-white',
  'bg-neutral-600 text-white',
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* ── Before section ──────────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-500">
            Scroll down
          </p>
          <h1 className="mt-4 text-4xl font-bold">
            Horizontal Scroll Demo
          </h1>
          <p className="mt-4 text-neutral-400">
            GSAP ScrollTrigger converts vertical scroll into horizontal movement.
          </p>
        </div>
      </section>

      {/* ── Horizontal section ──────────────────────────── */}
      <HorizontalScrollSection
        panels={DEMO_PANELS.map((p, i) => (
          <div key={i} className={`flex h-full w-screen items-center justify-center ${bgColors[i]}`}>
            <div className="mx-auto max-w-2xl px-8 text-center">
              <span className="font-mono text-sm uppercase tracking-[0.2em] text-neutral-400">
                {p.num}
              </span>
              <h2 className="mt-4 text-5xl font-bold tracking-tight">
                {p.title}
              </h2>
              <p className="mt-4 text-lg text-neutral-300">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      />

      {/* ── After section ───────────────────────────────── */}
      <section className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Back to vertical</h2>
          <p className="mt-4 text-neutral-400">
            Normal scroll resumes after the horizontal section.
          </p>
        </div>
      </section>
    </main>
  );
}
