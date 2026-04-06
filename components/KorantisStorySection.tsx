'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Cinematic horizontal scroll storytelling — space journey.
 * 5 panels: Chaos → Friction → Engine → Scale → Dominance.
 *
 * Core scroll engine: useLayoutEffect + gsap.context, scrub:1,
 * anticipatePin:1, invalidateOnRefresh:true, disabled on mobile.
 *
 * Visual layers added:
 *   - Space dot background (global)
 *   - Parallax depth layers (3 independent speeds)
 *   - Text cinematic reveal (opacity, y, scale)
 *   - Progress bar (top)
 *   - Panel scale + focus (0.85→1, 0.6→1)
 *   - Glow / light FX per panel
 */
export default function KorantisStorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const nearRef = useRef<HTMLDivElement | null>(null);
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
    const progressBar = progressRef.current;
    const totalWidth = container.scrollWidth;
    const scrollAmount = totalWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // ── MAIN HORIZONTAL SCROLL ───────────────────────────────
      const scrollTween = gsap.to(container, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          id: 'horizontalScroll',
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollAmount}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBar) {
              gsap.to(progressBar, {
                width: `${self.progress * 100}%`,
                duration: 0.1,
              });
            }
          },
        },
      });

      // ── SPACE STAR PARALLAX (far layer, slow) ──────────────
      if (starsRef.current) {
        gsap.to(starsRef.current, {
          x: 60,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            scrub: 1,
          },
        });
      }

      // ── MID PARALLAX LAYER ──────────────────────────────────
      if (midRef.current) {
        gsap.to(midRef.current, {
          x: 140,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            scrub: 1,
          },
        });
      }

      // ── NEAR PARALLAX LAYER ─────────────────────────────────
      if (nearRef.current) {
        gsap.to(nearRef.current, {
          x: 240,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            containerAnimation: scrollTween,
            scrub: 1,
          },
        });
      }

      // ── TEXT CINEMATIC REVEAL ──────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-panel').forEach((panel) => {
        const content = panel.querySelector('.story-content');
        if (!content) return;

        gsap.fromTo(
          content,
          { opacity: 0, y: 100, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left center',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      });

      // ── PANEL SCALE + FOCUS EFFECT ──────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-panel').forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.85, opacity: 0.55 },
          {
            scale: 1,
            opacity: 1,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: scrollTween,
              start: 'left 60%',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      });

      // ── GLOW PULSE PER PANEL ────────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-glow').forEach((glow) => {
        gsap.fromTo(
          glow,
          { opacity: 0.3, scale: 0.8 },
          {
            opacity: 0.7,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger: glow.closest('.story-panel'),
              containerAnimation: scrollTween,
              start: 'left center',
              end: 'right center',
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
      {/* ── PROGRESS BAR ──────────────────────────────────── */}
      <div className="fixed top-0 left-0 z-50 w-full h-[2px] bg-white/5">
        <div
          ref={progressRef}
          className="h-full bg-white/80"
          style={{ width: '0%' }}
        />
      </div>

      {/* ── SPACE BACKGROUND (3 depth layers) ─────────────── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Far: tiny dots, sparse */}
        <div
          ref={starsRef}
          className="absolute inset-0"
          style={{
            width: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.15,
          }}
        />
        {/* Mid: slightly larger, less sparse */}
        <div
          ref={midRef}
          className="absolute inset-0"
          style={{
            width: '200%',
            background: 'radial-gradient(circle, rgba(200,215,255,0.5) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            opacity: 0.08,
          }}
        />
        {/* Near: larger dots, rare */}
        <div
          ref={nearRef}
          className="absolute inset-0"
          style={{
            width: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 1.5px, transparent 1.5px)',
            backgroundSize: '180px 180px',
            opacity: 0.06,
          }}
        />
      </div>

      {/* ── PANELS ────────────────────────────────────────── */}
      <div ref={containerRef} className={`relative z-10 flex ${isMobile ? '!flex-col !h-auto !w-full' : 'w-max'}`}>

        {/* ── PANEL 1 — CHAOS ─────────────────────────────── */}
        <div className="story-panel relative flex h-screen min-w-[100vw] items-center justify-center overflow-hidden bg-black">
          <div
            className="story-glow absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(180,30,30,0.10) 0%, transparent 60%)',
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
            className="story-glow absolute inset-0"
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
            className="story-glow absolute inset-0"
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
            className="story-glow absolute inset-0"
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
            className="story-glow absolute inset-0"
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
