'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ContactFormData } from '@/lib/types';
import { LangProvider, useLang } from '@/lib/i18n';
import KorantisStorySection from '@/components/KorantisStorySection';

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

function BackgroundLayers({ awake: _awake }: { awake: boolean }) {
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

    let offsetX = 0;
    let offsetY = 0;
    let time = 0;

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const onMouseMove = (e: MouseEvent) => {
      offsetX = (e.clientX - w / 2) * 0.01;
      offsetY = (e.clientY - h / 2) * 0.01;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let raf = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, w, h);

      const size = 100;
      const centerX = w / 2;
      const centerY = h / 2;

      // Vertical lines
      const pulse = Math.sin(time) * 0.003;

      for (let x = 0; x < w; x += size) {
        const dist = Math.abs(x + offsetX - centerX) / w;
        const isMajor = x % (size * 4) === 0;
        const base = isMajor ? 0.03 : 0.015;
        const lw = isMajor ? 0.8 : 0.4;
        const opacity = base + (1 - dist) * (0.015 + pulse);

        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.lineWidth = lw;

        ctx.beginPath();
        ctx.moveTo(x + offsetX, 0);
        ctx.lineTo(x + offsetX, h);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < h; y += size) {
        const distY = Math.abs(y + offsetY - centerY) / h;
        const isMajorY = y % (size * 4) === 0;
        const baseY = isMajorY ? 0.03 : 0.015;
        const lwY = isMajorY ? 0.8 : 0.4;
        const opacityY = baseY + (1 - distY) * (0.015 + pulse);

        ctx.strokeStyle = `rgba(255,255,255,${opacityY})`;
        ctx.lineWidth = lwY;

        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(w, y + offsetY);
        ctx.stroke();
      }

      // Soft center fade
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, w * 0.9
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const animate = () => {
      time += 0.01;
      drawGrid();
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="grid-zone" aria-hidden="true">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'transparent' }}
      />
    </div>
  );
}

// ─── Contact Form Hook ────────────────────────────────────────────────

interface FormErrors { name?: string; email?: string; message?: string; }

function useContactForm() {
  const { t } = useLang();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validate = useCallback((data: ContactFormData): FormErrors => {
    const e: FormErrors = {};
    if (!data.name || data.name.trim().length < 2) e.name = t.contact.validation.name;
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = t.contact.validation.email;
    if (!data.message || data.message.trim().length < 10) e.message = t.contact.validation.message;
    return e;
  }, [t]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[name as keyof FormErrors]; return next; });
  }, []);

  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(formData);
    if (Object.keys(v).length > 0) { setErrors(v); return; }
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

  return { formData, errors, submitting, status, onChange, onSubmit };
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

// ─── Shared ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-px bg-border" />
      <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-subtle">{children}</p>
    </div>
  );
}

function KLogoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <g id="korantis-k" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path id="k-stem" d="M16 8 L16 56" />
        <path id="k-upper" d="M16 32 L48 8" />
        <path id="k-lower" d="M16 32 L48 56" />
      </g>
    </svg>
  );
}

// ─── Lang Toggle ──────────────────────────────────────────────────────

function LangToggle() {
  const { lang, toggle } = useLang();
  return (
    <button
      onClick={toggle}
      aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
      className="flex items-center gap-1 font-mono text-xs uppercase tracking-[0.15em] text-ink-subtle hover:text-ink transition-colors duration-300 select-none"
    >
      <span className={lang === 'en' ? 'text-ink' : 'text-ink-subtle'}>EN</span>
      <span className="text-ink-subtle/40">·</span>
      <span className={lang === 'es' ? 'text-ink' : 'text-ink-subtle'}>ES</span>
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────

interface HeaderProps { menuOpen: boolean; onToggle: () => void; }

function Header({ menuOpen, onToggle }: HeaderProps) {
  const { t } = useLang();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-border/50" role="banner">
      <div className="container flex items-center justify-between h-14">

        <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
          <a href="#layers" className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">{t.nav.layers}</a>
          <a href="#about"  className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">{t.nav.about}</a>
          <a href="#contact" className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle transition-colors duration-300 hover:text-ink">{t.nav.contact}</a>
        </nav>

        <LangToggle />

        <button className="md:hidden p-2 text-ink-subtle hover:text-ink transition-colors" onClick={onToggle} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      <nav className={`md:hidden bg-canvas border-t border-border overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`} aria-hidden={!menuOpen}>
        <div className="container py-2">
          <a href="#layers"  className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle border-b border-border hover:text-ink transition-colors" onClick={onToggle}>{t.nav.layers}</a>
          <a href="#about"   className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle border-b border-border hover:text-ink transition-colors" onClick={onToggle}>{t.nav.about}</a>
          <a href="#contact" className="block py-3 px-4 text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle hover:text-ink transition-colors" onClick={onToggle}>{t.nav.contact}</a>
          <div className="py-3 px-4"><LangToggle /></div>
        </div>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────

function HeroSection({ awake, onActivate }: { awake: boolean; onActivate: () => void }) {
  const { t } = useLang();
  return (
    <section className="relative min-h-screen flex items-center transition-all duration-1000" aria-labelledby="hero-heading" onMouseMove={onActivate} onClick={onActivate} style={{ opacity: awake ? 1 : 0.7 }}>
      <div className="container relative">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-border" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink-subtle">{t.hero.label}</p>
          </div>
          <h1 id="hero-heading" className="text-balance transition-all duration-700" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 700 }}>
            {t.hero.heading1}<br />{t.hero.heading2}
          </h1>
          <p className="mt-8 text-base text-ink-muted leading-relaxed max-w-lg text-balance transition-all duration-700" style={{ opacity: awake ? 1 : 0.6 }}>
            {t.hero.body}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#layers" className="korantis-btn">{t.hero.ctaPrimary}</a>
            <a href="#layers" className="group inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-ink">
              {t.hero.ctaSecondary} <IconArrow />
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-border to-transparent" />
      </div>
    </section>
  );
}

// ─── System Layers ────────────────────────────────────────────────────

const LAYER_ICONS = [IconArchitecture, IconIntelligence, IconControl] as const;

function LayersSection() {
  const { t } = useLang();
  return (
    <section id="layers" className="section-padding border-t border-border" aria-labelledby="layers-heading">
      <div className="container">
        <SectionLabel>{t.layers.label}</SectionLabel>
        <h2 id="layers-heading" className="text-2xl font-medium mb-16">{t.layers.heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {t.layers.items.map((layer, i) => {
            const Icon = LAYER_ICONS[i];
            return (
              <article key={layer.code} className="bg-canvas p-8 transition-colors duration-500 hover:border-t hover:border-violet-500/10" style={{ background: 'var(--color-canvas)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon />
                  <span className="text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle">{layer.code}</span>
                </div>
                <h3 className="text-lg font-medium mb-3 text-ink">{layer.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{layer.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Problem ──────────────────────────────────────────────────────────

function ProblemSection() {
  const { t } = useLang();
  return (
    <section className="section-padding border-t border-border" aria-labelledby="problem-heading">
      <div className="container">
        <div className="max-w-2xl">
          <SectionLabel>{t.problem.label}</SectionLabel>
          <h2 id="problem-heading" className="text-2xl md:text-3xl font-medium leading-snug text-balance">{t.problem.heading}</h2>
          <p className="mt-6 text-base text-ink-muted leading-relaxed text-balance">{t.problem.body}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Outcome ──────────────────────────────────────────────────────────

function OutcomeSection() {
  const { t } = useLang();
  return (
    <section className="section-padding border-t border-border" aria-labelledby="outcome-heading">
      <div className="container">
        <SectionLabel>{t.outcomes.label}</SectionLabel>
        <h2 id="outcome-heading" className="text-2xl font-medium mb-16">{t.outcomes.heading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {t.outcomes.items.map((item) => (
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
  const { t } = useLang();
  return (
    <section id="about" className="section-padding border-t border-border" aria-labelledby="about-heading">
      <div className="container">
        <div className="max-w-2xl">
          <SectionLabel>{t.about.label}</SectionLabel>
          <h2 id="about-heading" className="text-2xl font-medium mb-6">{t.about.heading}</h2>
          <p className="text-base text-ink-muted leading-relaxed text-balance">{t.about.body1}</p>
          <p className="mt-4 text-base text-ink-muted leading-relaxed text-balance">{t.about.body2}</p>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────

function ContactSection() {
  const { t } = useLang();
  const { formData, errors, submitting, status, onChange, onSubmit } = useContactForm();

  const fields = useMemo(() => [
    { name: 'name'    as const, type: 'text',     ...t.contact.fields.name },
    { name: 'email'   as const, type: 'email',    ...t.contact.fields.email },
    { name: 'message' as const, type: 'textarea', ...t.contact.fields.message },
  ], [t]);

  return (
    <section id="contact" className="section-padding border-t border-border" aria-labelledby="contact-heading">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <SectionLabel>{t.contact.label}</SectionLabel>
            <h2 id="contact-heading" className="text-2xl md:text-3xl font-medium mb-6 text-balance">{t.contact.heading}</h2>
            <p className="text-base text-ink-muted leading-relaxed text-balance">{t.contact.body}</p>
          </div>

          <form onSubmit={onSubmit} noValidate className="max-w-md">
            {fields.map((field) => (
              <div key={field.name} className="mb-6">
                <label htmlFor={field.name} className="block text-xs font-mono uppercase tracking-[0.15em] text-ink-subtle mb-3">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea id={field.name} name={field.name} value={formData[field.name]} onChange={onChange} placeholder={field.placeholder} rows={4} className={`korantis-input korantis-input--textarea ${errors[field.name] ? '!border-error' : ''}`} aria-invalid={errors[field.name] ? 'true' : undefined} />
                ) : (
                  <input id={field.name} name={field.name} type={field.type} value={formData[field.name]} onChange={onChange} placeholder={field.placeholder} className={`korantis-input ${errors[field.name] ? '!border-error' : ''}`} aria-invalid={errors[field.name] ? 'true' : undefined} />
                )}
                {errors[field.name] && (
                  <p className="mt-1.5 text-xs text-error flex items-center gap-1.5" role="alert"><IconAlert />{errors[field.name]}</p>
                )}
              </div>
            ))}

            {status === 'success' && (
              <div className="flex items-center gap-2 p-3 mb-4 border border-success-border rounded-sm" style={{ background: 'rgba(52, 211, 153, 0.08)' }}>
                <IconCheck />
                <p className="text-success text-xs font-mono uppercase tracking-wider" role="status">{t.contact.success}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 mb-4 border border-error-border rounded-sm" style={{ background: 'rgba(248, 113, 113, 0.08)' }}>
                <IconAlert />
                <p className="text-error text-xs font-mono uppercase tracking-wider" role="alert">{t.contact.error}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="korantis-btn korantis-btn--primary mt-2 w-full">
              {submitting ? (<><Spinner /> {t.contact.submitting}</>) : (<>{t.contact.submit} <IconArrow /></>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────

function Footer() {
  const { t } = useLang();
  return (
    <footer className="py-8 border-t border-border" role="contentinfo">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-ink-subtle">&copy; {new Date().getFullYear()} Korantis</p>
        <p className="text-xs font-mono text-ink-subtle">
          {t.footer.poweredBy} <span className="text-ink-muted">Wolfim&trade;</span>
        </p>
      </div>
    </footer>
  );
}

// ─── Page (inner — consumes context) ─────────────────────────────────

function HomePageInner() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [awake, setAwake] = useState(false);
  const activateRef = useRef(false);

  const handleActivate = useCallback(() => {
    if (!activateRef.current) { activateRef.current = true; setAwake(true); }
  }, []);

  return (
    <main id="main-content" tabIndex={-1} style={{ position: 'relative', zIndex: 10 }}>
      <BackgroundLayers awake={awake} />
      <SchemaScript />
      <Header menuOpen={menuOpen} onToggle={useCallback(() => setMenuOpen((p) => !p), [])} />
      <HeroSection awake={awake} onActivate={handleActivate} />
      <ProblemSection />
      <KorantisStorySection />
      <LayersSection />
      <OutcomeSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}

// ─── Page (exported — provides context) ──────────────────────────────

export default function HomePage() {
  return (
    <LangProvider>
      <HomePageInner />
    </LangProvider>
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
