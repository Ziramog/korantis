'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Pins the section on ALL screen sizes (mobile + desktop) and converts
 * vertical scroll into horizontal movement across 5 cinematic panels.
 *
 * ScrollTrigger.normalizeScroll(true) prevents iOS rubber-band scroll
 * from fighting the pin, giving clean touch-driven horizontal movement.
 */

// ── Visual config per panel (language-independent) ────────────────────

const PANEL_STYLE = [
  { num: '01', numColor: 'text-red-400/40',     glow: 'radial-gradient(circle at 30% 50%, rgba(180,30,30,0.10) 0%, transparent 60%)' },
  { num: '02', numColor: 'text-orange-400/40',  glow: 'radial-gradient(circle at 70% 40%, rgba(255,140,0,0.08) 0%, transparent 55%)' },
  { num: '03', numColor: 'text-cyan-400/40',    glow: 'radial-gradient(circle at 50% 50%, rgba(0,200,255,0.06) 0%, transparent 50%)' },
  { num: '04', numColor: 'text-emerald-400/40', glow: 'radial-gradient(circle at 40% 60%, rgba(0,255,136,0.06) 0%, transparent 50%)' },
  { num: '05', numColor: 'text-neutral-300/40', glow: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)' },
] as const;

// ── Component ──────────────────────────────────────────────────────────

export default function KorantisStorySection() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    // Normalize scroll for iOS — prevents rubber-band fighting the pin
    ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      const scrollAmount = container.scrollWidth - window.innerWidth;

      // ── MAIN HORIZONTAL SCROLL ────────────────────────────────
      const scrollTween = gsap.to(container, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          id: 'horizontalScroll',
          trigger: section,
          start: 'top top',
          end: () => `+=${container.scrollWidth - window.innerWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const bar = progressRef.current;
            if (bar) bar.style.width = `${self.progress * 100}%`;
          },
        },
      });

      // ── PARALLAX DEPTH LAYERS ─────────────────────────────────
      // These live OUTSIDE the panels container, so they use section-level
      // scroll triggers (NOT containerAnimation). Both move rightward at a
      // fraction of the panels speed, creating a true depth parallax.
      const pinDuration = { trigger: section, start: 'top top', end: () => `+=${scrollAmount}`, scrub: 1 };

      if (starsRef.current) {
        gsap.to(starsRef.current, {
          x: scrollAmount * 0.12,   // back1 drifts at 12% of panel speed
          ease: 'none',
          scrollTrigger: pinDuration,
        });
      }
      if (midRef.current) {
        gsap.to(midRef.current, {
          x: scrollAmount * 0.25,   // back2 drifts at 25% of panel speed
          ease: 'none',
          scrollTrigger: pinDuration,
        });
      }

      // ── TEXT CINEMATIC REVEAL ─────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.story-panel').forEach((panel) => {
        const content = panel.querySelector('.story-content');
        if (!content) return;
        gsap.fromTo(
          content,
          { opacity: 0, y: 60, scale: 0.92 },
          {
            opacity: 1, y: 0, scale: 1, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel, containerAnimation: scrollTween,
              start: 'left center', end: 'center center', scrub: 1,
            },
          }
        );
      });

      // ── PANEL SCALE + FOCUS ───────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.story-panel').forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.88, opacity: 0.5 },
          {
            scale: 1, opacity: 1, ease: 'power1.out',
            scrollTrigger: {
              trigger: panel, containerAnimation: scrollTween,
              start: 'left 65%', end: 'center center', scrub: 1,
            },
          }
        );
      });

      // ── GLOW PULSE ────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.story-glow').forEach((glow) => {
        gsap.fromTo(
          glow,
          { opacity: 0.25, scale: 0.8 },
          {
            opacity: 0.7, scale: 1.1, ease: 'none',
            scrollTrigger: {
              trigger: glow.closest('.story-panel'), containerAnimation: scrollTween,
              start: 'left center', end: 'right center', scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black text-white"
      aria-label="Korantis story"
    >
      {/* ── PROGRESS BAR ─────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 z-50 w-full h-[2px] bg-white/5">
        <div ref={progressRef} className="h-full bg-white/80" style={{ width: '0%' }} />
      </div>

      {/* ── BACKGROUND IMAGES (parallax depth layers) ───────────── */}
      {/*
          Both divs start offset left by their extra width / 2 so the
          visible centre is centred at load time, and GSAP drifts them
          rightward as panels slide left — genuine depth parallax.
          back1 extra: 30% → left: -15% | back2 extra: 50% → left: -25%
      */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Far layer — back1.webp (flowing lines), slowest drift */}
        <div
          ref={starsRef}
          className="absolute top-0 bottom-0"
          style={{
            backgroundImage: 'url(/back1.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '130%',
            left: '-15%',
            opacity: 0.65,
          }}
        />
        {/* Mid layer — back2.webp (grid cubes), faster drift + screen blend */}
        <div
          ref={midRef}
          className="absolute top-0 bottom-0"
          style={{
            backgroundImage: 'url(/back2.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '150%',
            left: '-25%',
            opacity: 0.22,
            mixBlendMode: 'screen',
          }}
        />
        {/* Dark tint — keeps text readable without burying the images */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* ── PANELS ───────────────────────────────────────────────── */}
      <div ref={containerRef} className="relative z-10 flex w-max">
        {PANEL_STYLE.map((style, i) => {
          const text = t.story.panels[i];
          return (
            <div
              key={style.num}
              className="story-panel relative flex h-[100svh] min-w-[100vw] items-center justify-center overflow-hidden"
            >
              {/* Per-panel dark vignette — keeps text readable over images */}
              <div
                className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.55) 100%)' }}
              />
              <div className="story-glow absolute inset-0" style={{ background: style.glow }} />

              <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
                <span className={`font-mono text-xs sm:text-sm uppercase tracking-[0.3em] ${style.numColor}`}>
                  {style.num}
                </span>
                <h2 className="mt-5 text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none">
                  {text.title}
                </h2>
                <p className="mt-5 text-sm sm:text-lg md:text-xl text-neutral-400 leading-relaxed">
                  {text.body[0]}<br />{text.body[1]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
