'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Cinematic horizontal scroll storytelling.
 * 5 panels: Chaos → Friction → Engine → Scale → Dominance.
 *
 * Core scroll engine: useLayoutEffect + gsap.context, scrub:1,
 * anticipatePin:1, invalidateOnRefresh:true, disabled on mobile.
 */
export default function KorantisStorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useLayoutEffect(() => {
    if (isMobile || !sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const totalWidth = container.scrollWidth;
    const scrollAmount = totalWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // ── Horizontal movement ────────────────────────────────────
      gsap.to(container, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollAmount}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── Text reveal animations ─────────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-panel').forEach((panel) => {
        const content = panel.querySelector('.story-content');
        if (!content) return;

        gsap.fromTo(
          content,
          { opacity: 0, y: 80, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: gsap.getById('horizontalScroll')
                ? gsap.getById('horizontalScroll')
                : undefined,
              start: 'left 80%',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      });

      // ── Background parallax ────────────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-bg').forEach((bg) => {
        gsap.to(bg, {
          x: 80,
          ease: 'none',
          scrollTrigger: {
            trigger: bg.parentElement,
            scrub: 1.5,
          },
        });
      });

      // ── Number counter reveal ──────────────────────────────────
      gsap.utils.toArray<HTMLSpanElement>('.story-num').forEach((num) => {
        gsap.fromTo(
          num,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: num.closest('.story-panel'),
              start: 'left 70%',
              end: 'left 30%',
              scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black text-white"
      aria-label="Korantis story"
    >
      <div ref={containerRef} className={`flex ${isMobile ? '!flex-col !h-auto !w-full' : 'w-max'}`}>

        {/* ── PANEL 1 — CHAOS ─────────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-black">
          <div
            className="story-bg absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(180,30,30,0.12) 0%, transparent 60%)',
            }}
          />
          <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
            <span className="story-num font-mono text-sm uppercase tracking-[0.3em] text-red-400/40">
              01
            </span>
            <h2 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Chaos
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              Too many tasks. No leverage.
              <br />
              Your team is busy — but nothing compounds.
            </p>
          </div>
        </div>

        {/* ── PANEL 2 — FRICTION ────────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-neutral-950">
          <div
            className="story-bg absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 70% 40%, rgba(255,140,0,0.08) 0%, transparent 55%)',
            }}
          />
          <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
            <span className="story-num font-mono text-sm uppercase tracking-[0.3em] text-orange-400/40">
              02
            </span>
            <h2 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Friction
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              Time lost. Opportunities missed.
              <br />
              Every manual process is a tax on growth.
            </p>
          </div>
        </div>

        {/* ── PANEL 3 — ENGINE ──────────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-black">
          <div
            className="story-bg absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0,200,255,0.06) 0%, transparent 50%)',
            }}
          />
          <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
            <span className="story-num font-mono text-sm uppercase tracking-[0.3em] text-cyan-400/40">
              03
            </span>
            <h2 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Korantis Engine
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              Automation replaces effort.
              <br />
              Systems execute while you strategize.
            </p>
          </div>
        </div>

        {/* ── PANEL 4 — SCALE ───────────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-neutral-950">
          <div
            className="story-bg absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 40% 60%, rgba(0,255,136,0.06) 0%, transparent 50%)',
            }}
          />
          <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
            <span className="story-num font-mono text-sm uppercase tracking-[0.3em] text-emerald-400/40">
              04
            </span>
            <h2 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Scale
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              Systems grow while you focus.
              <br />
              Infrastructure that compounds, not degrades.
            </p>
          </div>
        </div>

        {/* ── PANEL 5 — DOMINANCE ───────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-black">
          <div
            className="story-bg absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)',
            }}
          />
          <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
            <span className="story-num font-mono text-sm uppercase tracking-[0.3em] text-neutral-300/40">
              05
            </span>
            <h2 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-none">
              Dominance
            </h2>
            <p className="mt-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              You operate. Systems execute.
              <br />
              This is what it looks like when everything works.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
