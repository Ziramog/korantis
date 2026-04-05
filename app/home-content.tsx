'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ContactFormData } from '@/lib/types';

// ─── Brand ────────────────────────────────────────────────────────────

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Korantis',
  url: siteUrl,
  description: 'Korantis designs operational intelligence systems for companies that scale.',
};

// ─── Mathematical K Construction (SVG) ───────────────────────────────
// The letter K is constructed from 3 mathematical functions:
//   1. Vertical stem:  x = c          (drawn top→bottom, 0.8s)
//   2. Upper diagonal:  y =  a(x - x₀) (drawn center→out, 1.2s)
//   3. Lower diagonal:  y = -a(x - x₀) (drawn center→out, 1.2s)
// Micro-jitter → stabilize → fade → hero enters

// K geometry
const VIEW_W = 200;
const VIEW_H = 240;
const STEM_X = 55;
const STEM_TOP = 20;
const STEM_BOT = 220;
const JUNCTION_Y = 120;
const UPPER_END = { x: 160, y: 25 };
const LOWER_END = { x: 160, y: 215 };
const JUNCTION = { x: STEM_X, y: JUNCTION_Y };

function linePath(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function IntroAnimation({ onDone }: { onDone: () => void }) {
  const vPathRef = useRef<SVGPathElement>(null);
  const uPathRef = useRef<SVGPathElement>(null);
  const lPathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<'draw-v' | 'draw-diag' | 'jitter' | 'pause' | 'curve-fade' | 'overlay-fade' | 'done'>('draw-v');

  useEffect(() => {
    const vPath = vPathRef.current;
    const uPath = uPathRef.current;
    const lPath = lPathRef.current;
    const svg = svgRef.current;
    if (!vPath || !uPath || !lPath) return;

    const vLen = vPath.getTotalLength();
    const uLen = uPath.getTotalLength();
    const lLen = lPath.getTotalLength();

    // Initialize all hidden
    [vPath, uPath, lPath].forEach((p) => {
      p.style.strokeDasharray = String(p.getTotalLength());
      p.style.strokeDashoffset = String(p.getTotalLength());
      p.style.opacity = '0';
    });

    // Camera approach
    if (svg) {
      svg.style.transform = 'scale(0.92)';
      svg.style.transformOrigin = 'center center';
      svg.style.transition = 'transform 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          svg.style.transform = 'scale(1)';
        });
      });
    }

    const VERTICAL_DURATION = 800;
    const DIAGONAL_DURATION = 1200;
    const JITTER_DURATION = 400;
    const PAUSE_DELAY = 300;
    const CURVE_FADE_DURATION = 600;
    const OVERLAY_FADE_DURATION = 700;

    // Capture refs into locals that nested functions can safely use
    const _vPath = vPath;
    const _uPath = uPath;
    const _lPath = lPath;
    const _vLen = vLen;
    const _uLen = uLen;
    const _lLen = lLen;

    // ── Phase 1: Vertical stem ──
    const vertStart = performance.now();

    function drawVert(now: number) {
      const elapsed = now - vertStart;
      const progress = Math.min(elapsed / VERTICAL_DURATION, 1);
      const eased = easeOutCubic(progress);
      _vPath.style.opacity = String(0.6 + eased * 0.3);
      _vPath.style.strokeDashoffset = String(_vLen * (1 - eased));

      if (progress < 1) {
        requestAnimationFrame(drawVert);
      } else {
        _vPath.style.strokeDashoffset = '0';
        _vPath.style.opacity = '0.9';
        setPhase('draw-diag');
        drawDiag();
      }
    }

    // ── Phase 2: Diagonals ──
    function drawDiag() {
      const diagStart = performance.now();

      function diagFrame() {
        const now = performance.now();
        const elapsed = now - diagStart;
        const progress = Math.min(elapsed / DIAGONAL_DURATION, 1);
        const eased = easeOutCubic(progress);

        _uPath.style.opacity = String(0.4 + eased * 0.5);
        _lPath.style.opacity = String(0.4 + eased * 0.5);
        _uPath.style.strokeDashoffset = String(_uLen * (1 - eased));
        _lPath.style.strokeDashoffset = String(_lLen * (1 - eased));

        if (progress < 1) {
          requestAnimationFrame(diagFrame);
        } else {
          _uPath.style.strokeDashoffset = '0';
          _lPath.style.strokeDashoffset = '0';
          _uPath.style.opacity = '0.9';
          _lPath.style.opacity = '0.9';
          setPhase('jitter');
          startJitter();
        }
      }

      requestAnimationFrame(diagFrame);
    }

    // ── Phase 3: Micro-jitter → stabilize ──
    const jitterStart = Date.now();

    function startJitter() {
      function jitterFrame() {
        const elapsed = Date.now() - jitterStart;
        if (elapsed >= JITTER_DURATION) {
          // Clear jitter
          [_vPath, _uPath, _lPath].forEach((p) => { p.style.transform = ''; });
          setPhase('pause');
          setTimeout(() => {
            setPhase('curve-fade');
            fadeCurve();
          }, PAUSE_DELAY);
          return;
        }

        const decay = Math.exp(-elapsed / (JITTER_DURATION * 0.4));
        const jitterAmt = 0.8 * decay;

        [_vPath, _uPath, _lPath].forEach((p) => {
          const dx = (Math.random() - 0.5) * jitterAmt * 2;
          const dy = (Math.random() - 0.5) * jitterAmt * 2;
          p.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
        });

        requestAnimationFrame(jitterFrame);
      }

      requestAnimationFrame(jitterFrame);
    }

    // ── Phase 4: Fade ──
    function fadeCurve() {
      [_vPath, _uPath, _lPath].forEach((p) => {
        p.style.transition = `opacity ${CURVE_FADE_DURATION}ms ease-out`;
        p.style.opacity = '0';
      });

      setTimeout(() => {
        setPhase('overlay-fade');
        setTimeout(() => {
          setPhase('done');
          onDone();
        }, OVERLAY_FADE_DURATION);
      }, CURVE_FADE_DURATION);
    }

    requestAnimationFrame(drawVert);
  }, [onDone]);

  // K size — fixed default to avoid hydration mismatch, updated after mount
  const [kSize, setKSize] = useState(280);
  useEffect(() => {
    setKSize(Math.min(280, window.innerWidth * 0.35));
  }, []);

  const letters = 'KORANTIS'.split('');

  if (phase === 'done') return null;

  const overlayOpacity = phase === 'overlay-fade' ? 0 : 1;
  const kHeight = kSize * VIEW_H / VIEW_W;

  return (
    <div
      className="korantis-intro-overlay"
      style={{ opacity: overlayOpacity }}
      aria-hidden="true"
    >
      {/* KORANTIS label */}
      <div className="korantis-intro-label" aria-label="KORANTIS">
        {letters.map((letter, i) => (
          <span key={i} className="letter" style={{ animationDelay: `${0.08 * i}s` }}>
            {letter}
          </span>
        ))}
      </div>

      {/* SVG K construction */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: `${kSize}px`, height: `${kHeight}px` }}
        role="img"
        aria-label="Mathematical K construction"
      >
        {/* 1. Vertical stem: x = constant */}
        <path
          ref={vPathRef}
          d={linePath(STEM_X, STEM_TOP, STEM_X, STEM_BOT)}
          className="korantis-intro-curve"
        />
        {/* 2. Upper diagonal: y = a(x - x₀) */}
        <path
          ref={uPathRef}
          d={linePath(JUNCTION.x, JUNCTION.y, UPPER_END.x, UPPER_END.y)}
          className="korantis-intro-curve"
        />
        {/* 3. Lower diagonal: y = -a(x - x₀) */}
        <path
          ref={lPathRef}
          d={linePath(JUNCTION.x, JUNCTION.y, LOWER_END.x, LOWER_END.y)}
          className="korantis-intro-curve"
        />
      </svg>
    </div>
  );
}

// ─── Background Depth Layers ─────────────────────────────────────────
// Single grid + vignette. Particles handled by space.js canvas.
// No stars, no glows, no overlays.

function BackgroundLayers() {
  return (
    <>
      {/* Layer 1: Atmosphere grid */}
      <div
        className="korantis-atmosphere-grid"
        aria-hidden="true"
      />

      {/* Layer 2: Vignette — edge darkening for depth */}
      <div
        className="korantis-vignette"
        aria-hidden="true"
      />

      {/* Canvas particles (space.js) — auto-injected at z-index 1 */}
    </>
  );
}

// ─── Contact Form Hook ────────────────────────────────────────────────

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = useCallback((data: ContactFormData): FormErrors => {
    const e: FormErrors = {};
    if (!data.name || data.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email';
    if (!data.message || data.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });
  }, []);

  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(formData);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
    setTimeout(() => setStatus('idle'), 5000);
  }, [formData, validate]);

  return { formData, errors, submitting, status, onChange, onSubmit, resetStatus: () => setStatus('idle') };
}

// ─── Icons ────────────────────────────────────────────────────────────

function IconArchitecture() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" />
    </svg>
  );
}

function IconIntelligence() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </svg>
  );
}

function IconControl() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Shared Section Divider ──────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-px bg-border" />
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-subtle">{children}</p>
    </div>
  );
}

// ─── K Logo Icon — matches /korantisicon.svg ─────────────────────────
// Single source of truth for the K icon across the app.
// Paths: #k-stem, #k-upper, #k-lower — animation-ready.

function KLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g id="korantis-k" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path id="k-stem" d="M16 8 L16 56" />
        <path id="k-upper" d="M16 32 L48 8" />
        <path id="k-lower" d="M16 32 L48 56" />
      </g>
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────

interface HeaderProps {
  menuOpen: boolean;
  onToggle: () => void;
}

function Header({ menuOpen, onToggle }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-border/50" role="banner">
      <div className="container flex items-center justify-between h-14">
        <a href="/" className="korantis-nav-logo" aria-label="Korantis home">
          <img src="/korantisicon.svg" alt="Korantis" className="w-16 h-16" />
        </a>

        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          <a href="#layers" className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">
            Layers
          </a>
          <a href="#about" className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">
            About
          </a>
          <a href="#contact" className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">
            Contact
          </a>
        </nav>

        <button
          className="md:hidden p-2 text-ink-subtle hover:text-ink transition-colors"
          onClick={onToggle}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <nav
        className={`md:hidden bg-canvas border-t border-border overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="container py-2">
          <a href="#layers" className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle border-b border-border hover:text-ink transition-colors" onClick={onToggle}>Layers</a>
          <a href="#about" className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle border-b border-border hover:text-ink transition-colors" onClick={onToggle}>About</a>
          <a href="#contact" className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle hover:text-ink transition-colors" onClick={onToggle}>Contact</a>
        </div>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center" aria-labelledby="hero-heading">
      <div className="container relative">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-border" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-subtle">
              Systems Infrastructure
            </p>
          </div>

          <h1 id="hero-heading" className="text-balance" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: 1.1, letterSpacing: '-0.03em', fontWeight: 600 }}>
            We build systems<br />that run companies.
          </h1>

          <p className="mt-8 text-base text-ink-muted leading-relaxed max-w-lg text-balance">
            Most companies don&apos;t scale because their systems don&apos;t. We design the operational infrastructure that makes companies scale.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#layers"
              className="korantis-btn"
            >
              Enter System
            </a>
            <a
              href="#layers"
              className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-ink"
            >
              Explore layers
              <IconArrow />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-border to-transparent" />
      </div>
    </section>
  );
}

// ─── System Layers ────────────────────────────────────────────────────

const LAYERS = [
  {
    Icon: IconArchitecture,
    code: '001',
    title: 'Systems Architecture',
    description: 'We design the structural foundation of your operations — how data flows, how teams connect, how decisions cascade.',
  },
  {
    Icon: IconIntelligence,
    code: '002',
    title: 'Operational Intelligence',
    description: 'Real-time visibility into how your systems perform. Patterns surfaced. Bottlenecks identified. Decisions accelerated.',
  },
  {
    Icon: IconControl,
    code: '003',
    title: 'Process Control',
    description: 'Governance frameworks that keep systems running as intended. Compliance, quality, and consistency at scale.',
  },
] as const;

function LayersSection() {
  return (
    <section id="layers" className="section-padding border-t border-border" aria-labelledby="layers-heading">
      <div className="container">
        <SectionLabel>What we build</SectionLabel>
        <h2 id="layers-heading" className="text-2xl font-medium mb-16">System Layers</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {LAYERS.map((layer) => (
            <article key={layer.code} className="bg-canvas p-8 transition-colors duration-500 hover:border-t hover:border-violet-500/10" style={{ background: 'var(--color-canvas)' }}>
              <div className="flex items-center gap-3 mb-6">
                <layer.Icon />
                <span className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle">{layer.code}</span>
              </div>
              <h3 className="text-lg font-medium mb-3 text-ink">{layer.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{layer.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────

function ProblemSection() {
  return (
    <section className="section-padding border-t border-border" aria-labelledby="problem-heading">
      <div className="container">
        <div className="max-w-2xl">
          <SectionLabel>The Problem</SectionLabel>
          <h2 id="problem-heading" className="text-2xl md:text-3xl font-medium leading-snug text-balance">
            Most companies don&apos;t scale because their systems don&apos;t.
          </h2>
          <p className="mt-6 text-base text-ink-muted leading-relaxed text-balance">
            Tools don&apos;t scale companies. Systems do. Most organizations layer software on top of broken processes and wonder why nothing changes. We start where most stop — at the architecture level.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Outcome ──────────────────────────────────────────────────────────

const OUTCOMES = [
  { number: '01', label: 'Less manual work', description: 'Systems that execute, not just track.' },
  { number: '02', label: 'Faster execution', description: 'Decisions made in seconds, not weeks.' },
  { number: '03', label: 'Scalable operations', description: 'Infrastructure that grows with you.' },
];

function OutcomeSection() {
  return (
    <section className="section-padding border-t border-border" aria-labelledby="outcome-heading">
      <div className="container">
        <SectionLabel>The Outcome</SectionLabel>
        <h2 id="outcome-heading" className="text-2xl font-medium mb-16">What changes</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {OUTCOMES.map((item) => (
            <div key={item.number}>
              <span className="text-xs font-mono text-ink-subtle">{item.number}</span>
              <h3 className="text-lg font-medium mt-3 mb-2 text-ink">{item.label}</h3>
              <p className="text-sm text-ink-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" className="section-padding border-t border-border" aria-labelledby="about-heading">
      <div className="container">
        <div className="max-w-2xl">
          <SectionLabel>About</SectionLabel>
          <h2 id="about-heading" className="text-2xl font-medium mb-6">Korantis</h2>
          <p className="text-base text-ink-muted leading-relaxed text-balance">
            We are a systems company. We design how businesses run — from the architecture of operations to the intelligence that drives them.
          </p>
          <p className="mt-4 text-base text-ink-muted leading-relaxed text-balance">
            Every company is a system. Most just don&apos;t know it yet. We help them see it, build it, and run it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Contact / CTA ────────────────────────────────────────────────────

function ContactSection() {
  const { formData, errors, submitting, status, onChange, onSubmit } = useContactForm();

  const fields = useMemo(() => [
    { name: 'name' as const, label: 'Name', type: 'text', placeholder: 'Your name' },
    { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@company.com' },
    { name: 'message' as const, label: 'Message', type: 'textarea', placeholder: 'Tell us about your system...' },
  ], []);

  return (
    <section id="contact" className="section-padding border-t border-border" aria-labelledby="contact-heading">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <SectionLabel>Start</SectionLabel>
            <h2 id="contact-heading" className="text-2xl md:text-3xl font-medium mb-6 text-balance">
              Build your system.
            </h2>
            <p className="text-base text-ink-muted leading-relaxed text-balance">
              Tell us about your operations. We&apos;ll show you what&apos;s possible when your systems actually work.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="max-w-md">
            {fields.map((field) => (
              <div key={field.name} className="mb-6">
                <label htmlFor={field.name} className="block text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle mb-3">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`korantis-input korantis-input--textarea ${errors[field.name] ? '!border-error' : ''}`}
                    aria-invalid={errors[field.name] ? 'true' : undefined}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={onChange}
                    placeholder={field.placeholder}
                    className={`korantis-input ${errors[field.name] ? '!border-error' : ''}`}
                    aria-invalid={errors[field.name] ? 'true' : undefined}
                  />
                )}
                {errors[field.name] && (
                  <p className="mt-1.5 text-xs text-error flex items-center gap-1.5" role="alert">
                    <IconAlert />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 mb-4 border border-success-border rounded-sm" style={{ background: 'rgba(52, 211, 153, 0.08)' }}>
                <IconCheck />
                <p className="text-success text-xs font-mono uppercase tracking-wider" role="status">Signal received.</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 mb-4 border border-error-border rounded-sm" style={{ background: 'rgba(248, 113, 113, 0.08)' }}>
                <IconAlert />
                <p className="text-error text-xs font-mono uppercase tracking-wider" role="alert">Transmission failed. Retry.</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="korantis-btn korantis-btn--primary mt-2 w-full">
              {submitting ? (<><Spinner /> Transmitting...</>) : (<>Transmit Request <IconArrow /></>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="py-8 border-t border-border" role="contentinfo">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-ink-subtle">&copy; {new Date().getFullYear()} Korantis</p>
        <p className="text-xs font-mono text-ink-subtle">
          Powered by <span className="text-ink-muted">Wolfim&trade;</span>
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [fading, setFading] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const handleIntroDone = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setIntro(false);
      // Trigger hero fade in with slight upward motion
      setHeroVisible(true);
    }, 700);
  }, []);

  return (
    <>
      {intro && (
        <div
          className="fixed inset-0 z-[100] transition-opacity duration-700"
          style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? 'none' : 'auto' }}
        >
          <IntroAnimation onDone={handleIntroDone} />
        </div>
      )}
      <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 10 }}>
        <BackgroundLayers />
        <SchemaScript />
        <Header menuOpen={menuOpen} onToggle={useCallback(() => setMenuOpen((p) => !p), [])} />
        <div
          className="korantis-hero-entry"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
          }}
        >
          <HeroSection />
          <ProblemSection />
          <LayersSection />
          <OutcomeSection />
          <AboutSection />
          <ContactSection />
          <Footer />
        </div>
      </main>
    </>
  );
}

function SchemaScript() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
