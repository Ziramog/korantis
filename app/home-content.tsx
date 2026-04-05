'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

// ─── Background Depth Layers ─────────────────────────────────────────
// Deterministic particle canvas + grid + vignette.
// Particles react to awake state and cursor position.

function BackgroundLayers({ awake, cursor }: { awake: boolean; cursor?: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);

    const N = 60;
    const particles = Array.from({ length: N }).map((_, i) => ({
      x: (i * 97) % w,
      y: (i * 73) % h,
      vx: ((i * 13) % 7) / 1000,
      vy: ((i * 11) % 7) / 1000,
    }));

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (let p of particles) {
        const speed = awake ? 2 : 1;
        p.x += p.vx * speed * 0.8;
        p.y += p.vy * speed * 0.8;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
        if (cursor) {
          const dx = cursor.x - p.x;
          const dy = cursor.y - p.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const pull = 0.04 / dist;
          p.vx += dx * pull * 0.01;
          p.vy += dy * pull * 0.01;
        }
        ctx.fillStyle = awake ? 'rgba(180, 200, 255, 0.9)' : 'rgba(180, 200, 255, 0.5)';
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [awake, cursor?.x, cursor?.y]);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} />
      <div className="korantis-atmosphere-grid" aria-hidden="true" />
      <div className="korantis-vignette" aria-hidden="true" />
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

interface HeroSectionProps {
  awake: boolean;
  onActivate: () => void;
}

function HeroSection({ awake, onActivate }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-screen flex items-center transition-all duration-1000"
      aria-labelledby="hero-heading"
      onMouseMove={onActivate}
      onClick={onActivate}
      style={{ opacity: awake ? 1 : 0.7 }}
    >
      <div className="container relative">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-border" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-subtle">
              Systems Infrastructure
            </p>
          </div>

          <h1 id="hero-heading" className="text-balance transition-all duration-700" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700 }}>
            We build systems<br />that run companies.
          </h1>

          <p className="mt-8 text-base text-ink-muted leading-relaxed max-w-lg text-balance transition-all duration-700" style={{ opacity: awake ? 1 : 0.6 }}>
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
  const [awake, setAwake] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | undefined>();
  const activateRef = useRef(false);

  const handleActivate = useCallback(() => {
    if (!activateRef.current) {
      activateRef.current = true;
      setAwake(true);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setCursor({ x: e.clientX, y: e.clientY });
    if (!activateRef.current) {
      activateRef.current = true;
      setAwake(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 10 }}>
      <BackgroundLayers awake={awake} cursor={cursor} />
      <SchemaScript />
      <Header menuOpen={menuOpen} onToggle={useCallback(() => setMenuOpen((p) => !p), [])} />
      <HeroSection awake={awake} onActivate={handleActivate} />
      <ProblemSection />
      <LayersSection />
      <OutcomeSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
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
