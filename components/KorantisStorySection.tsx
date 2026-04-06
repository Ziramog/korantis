'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Desktop: pins section, converts vertical scroll into horizontal movement.
 * Mobile:  vertical stack of full-screen panels with IntersectionObserver
 *          fade-in reveal — no GSAP, no horizontal scroll.
 *
 * 5 panels: Chaos → Friction → Engine → Scale → Dominance.
 */

// ── Mobile panel fade-in via IntersectionObserver ──────────────────────

function useMobilePanelReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const panels = document.querySelectorAll<HTMLElement>('.story-panel');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const content = entry.target.querySelector<HTMLElement>('.story-content');
          if (!content) return;

          if (entry.isIntersecting) {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0) scale(1)';
          }
        });
      },
      { threshold: 0.25 }
    );

    panels.forEach((panel) => {
      const content = panel.querySelector<HTMLElement>('.story-content');
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'translateY(40px) scale(0.97)';
        content.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      }
      observer.observe(panel);
    });

    return () => observer.disconnect();
  }, [enabled]);
}

// ── Panel data ─────────────────────────────────────────────────────────

const PANELS = [
  {
    bg: 'bg-black',
    glow: 'radial-gradient(circle at 30% 50%, rgba(180,30,30,0.10) 0%, transparent 60%)',
    num: '01',
    numColor: 'text-red-400/40',
    title: 'Chaos',
    body: 'Too many tasks. No leverage.\nYour team is busy — but nothing compounds.',
  },
  {
    bg: 'bg-neutral-950',
    glow: 'radial-gradient(circle at 70% 40%, rgba(255,140,0,0.08) 0%, transparent 55%)',
    num: '02',
    numColor: 'text-orange-400/40',
    title: 'Friction',
    body: 'Time lost. Opportunities missed.\nEvery manual process is a tax on growth.',
  },
  {
    bg: 'bg-black',
    glow: 'radial-gradient(circle at 50% 50%, rgba(0,200,255,0.06) 0%, transparent 50%)',
    num: '03',
    numColor: 'text-cyan-400/40',
    title: 'Korantis Engine',
    body: 'Automation replaces effort.\nSystems execute while you strategize.',
  },
  {
    bg: 'bg-neutral-950',
    glow: 'radial-gradient(circle at 40% 60%, rgba(0,255,136,0.06) 0%, transparent 50%)',
    num: '04',
    numColor: 'text-emerald-400/40',
    title: 'Scale',
    body: 'Systems grow while you focus.\nInfrastructure that compounds, not degrades.',
  },
  {
    bg: 'bg-black',
    glow: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 45%)',
    num: '05',
    numColor: 'text-neutral-300/40',
    title: 'Dominance',
    body: 'You operate. Systems execute.\nThis is what it looks like when everything works.',
  },
] as const;

// ── Component ──────────────────────────────────────────────────────────

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

  // Mobile: IntersectionObserver reveal (runs only when isMobile is true)
  useMobilePanelReveal(isMobile);

  // Desktop: full GSAP horizontal scroll
  useLayoutEffect(() => {
    if (isMobile || !sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const progressBar = progressRef.current;
    const totalWidth = container.scrollWidth;
    const scrollAmount = totalWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // ── MAIN HORIZONTAL SCROLL ──────────────────────────────
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
              gsap.to(progressBar, { width: `${self.progress * 100}%`, duration: 0.1 });
            }
          },
        },
      });

      // ── PARALLAX DEPTH LAYERS ───────────────────────────────
      if (starsRef.current) {
        gsap.to(starsRef.current, {
          x: 60, ease: 'none',
          scrollTrigger: { trigger: section, containerAnimation: scrollTween, scrub: 1 },
        });
      }
      if (midRef.current) {
        gsap.to(midRef.current, {
          x: 140, ease: 'none',
          scrollTrigger: { trigger: section, containerAnimation: scrollTween, scrub: 1 },
        });
      }
      if (nearRef.current) {
        gsap.to(nearRef.current, {
          x: 240, ease: 'none',
          scrollTrigger: { trigger: section, containerAnimation: scrollTween, scrub: 1 },
        });
      }

      // ── TEXT CINEMATIC REVEAL ───────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-panel').forEach((panel) => {
        const content = panel.querySelector('.story-content');
        if (!content) return;
        gsap.fromTo(
          content,
          { opacity: 0, y: 100, scale: 0.9 },
          {
            opacity: 1, y: 0, scale: 1, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel, containerAnimation: scrollTween,
              start: 'left center', end: 'center center', scrub: 1,
            },
          }
        );
      });

      // ── PANEL SCALE + FOCUS ─────────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-panel').forEach((panel) => {
        gsap.fromTo(
          panel,
          { scale: 0.85, opacity: 0.55 },
          {
            scale: 1, opacity: 1, ease: 'power1.out',
            scrollTrigger: {
              trigger: panel, containerAnimation: scrollTween,
              start: 'left 60%', end: 'center center', scrub: 1,
            },
          }
        );
      });

      // ── GLOW PULSE ──────────────────────────────────────────
      gsap.utils.toArray<HTMLDivElement>('.story-glow').forEach((glow) => {
        gsap.fromTo(
          glow,
          { opacity: 0.3, scale: 0.8 },
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

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black text-white"
      aria-label="Korantis story"
    >
      {/* ── PROGRESS BAR (desktop only) ───────────────────────── */}
      <div className="fixed top-0 left-0 z-50 w-full h-[2px] bg-white/5 hidden md:block">
        <div ref={progressRef} className="h-full bg-white/80" style={{ width: '0%' }} />
      </div>

      {/* ── MOBILE PANEL COUNTER ──────────────────────────────── */}
      {isMobile && (
        <div className="sticky top-14 z-40 flex items-center justify-between px-5 py-2 bg-black/70 backdrop-blur-sm border-b border-white/5 md:hidden">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Korantis Story
          </span>
          <span className="font-mono text-xs text-neutral-600">
            {PANELS.length} chapters
          </span>
        </div>
      )}

      {/* ── SPACE BACKGROUND (3 depth layers) ─────────────────── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
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

      {/* ── PANELS ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative z-10 flex ${isMobile ? 'flex-col w-full' : 'w-max'}`}
      >
        {PANELS.map((panel, i) => (
          <div
            key={panel.num}
            className={`story-panel relative flex items-center justify-center overflow-hidden ${panel.bg} ${
              isMobile
                ? 'w-full min-h-[100svh]'
                : 'h-screen min-w-[100vw]'
            }`}
          >
            {/* Glow layer */}
            <div
              className="story-glow absolute inset-0"
              style={{ background: panel.glow }}
            />

            {/* Content */}
            <div className="story-content relative z-10 mx-auto max-w-2xl px-6 text-center">
              <span className={`font-mono text-sm uppercase tracking-[0.3em] ${panel.numColor}`}>
                {panel.num}
              </span>
              <h2 className="mt-6 text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-none">
                {panel.title}
              </h2>
              <p className="mt-5 text-base sm:text-lg md:text-xl text-neutral-400 leading-relaxed">
                {panel.body.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < panel.body.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>

            {/* Mobile: scroll hint arrow (all panels except last) */}
            {isMobile && i < PANELS.length - 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 text-neutral-700">
                <svg
                  className="w-5 h-5 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            )}

            {/* Mobile: "The end" marker on last panel */}
            {isMobile && i === PANELS.length - 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-700">
                  End of story
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
