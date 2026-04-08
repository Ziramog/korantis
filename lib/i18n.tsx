'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ── Types ──────────────────────────────────────────────────────────────

export type Lang = 'en' | 'es';

// ── Translations ───────────────────────────────────────────────────────

export const translations = {
  en: {
    nav: {
      layers: 'Layers',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      label: 'Intelligence Infrastructure',
      heading1: 'We build systems',
      heading2: 'that run your business.',
      tagline: 'From operations to intelligence. Scalable infrastructure for modern companies.',
      body: "Most companies don't scale because their systems don't. We design the operational infrastructure that makes companies scale.",
      ctaPrimary: 'Enter System',
      ctaSecondary: 'Explore layers',
    },
    problem: {
      label: 'The Problem',
      heading: "Most companies don't scale because their systems don't.",
      body: "Tools don't scale companies. Systems do. Most organizations layer software on top of broken processes and wonder why nothing changes. We start where most stop — at the architecture level.",
    },
    layers: {
      label: 'What we build',
      heading: 'System Layers',
      items: [
        {
          code: '001',
          title: 'Systems Architecture',
          description: 'We design the structural foundation of your operations — how data flows, how teams connect, how decisions cascade.',
        },
        {
          code: '002',
          title: 'Operational Intelligence',
          description: 'Real-time visibility into how your systems perform. Patterns surfaced. Bottlenecks identified. Decisions accelerated.',
        },
        {
          code: '003',
          title: 'Process Control',
          description: 'Governance frameworks that keep systems running as intended. Compliance, quality, and consistency at scale.',
        },
      ],
    },
    outcomes: {
      label: 'The Outcome',
      heading: 'What changes',
      items: [
        { number: '01', label: 'Less manual work',      description: 'Systems that execute, not just track.' },
        { number: '02', label: 'Faster execution',      description: 'Decisions made in seconds, not weeks.' },
        { number: '03', label: 'Scalable operations',   description: 'Infrastructure that grows with you.' },
      ],
    },
    about: {
      label: 'About',
      heading: 'Korantis',
      body1: 'We are a systems company. We design how businesses run — from the architecture of operations to the intelligence that drives them.',
      body2: "Every company is a system. Most just don't know it yet. We help them see it, build it, and run it.",
    },
    contact: {
      label: 'Start',
      heading: 'Build your system.',
      body: "Tell us about your operations. We'll show you what's possible when your systems actually work.",
      fields: {
        name:    { label: 'Name',    placeholder: 'Your name' },
        email:   { label: 'Email',   placeholder: 'you@company.com' },
        message: { label: 'Message', placeholder: 'Tell us about your system...' },
      },
      submit:      'Transmit Request',
      submitting:  'Transmitting...',
      success:     'Signal received.',
      error:       'Transmission failed. Retry.',
      validation: {
        name:    'Name must be at least 2 characters',
        email:   'Enter a valid email',
        message: 'Message must be at least 10 characters',
      },
    },
    footer: {
      poweredBy: 'Powered by',
    },
    story: {
      panels: [
        { title: 'Chaos',           body: ['Too many tasks. No leverage.',             'Your team is busy — but nothing compounds.'] },
        { title: 'Friction',        body: ['Time lost. Opportunities missed.',          'Every manual process is a tax on growth.'] },
        { title: 'Korantis Engine', body: ['Automation replaces effort.',               'Systems execute while you strategize.'] },
        { title: 'Scale',           body: ['Systems grow while you focus.',             'Infrastructure that compounds, not degrades.'] },
        { title: 'Dominance',       body: ['You operate. Systems execute.',             'This is what it looks like when everything works.'] },
      ],
    },
  },

  es: {
    nav: {
      layers: 'Capas',
      about: 'Nosotros',
      contact: 'Contacto',
    },
    hero: {
      label: 'Infraestructura de Inteligencia',
      heading1: 'Construimos sistemas',
      heading2: 'que hacen funcionar tu empresa.',
      tagline: 'De las operaciones a la inteligencia. Infraestructura escalable para empresas modernas.',
      body: 'La mayoría de las empresas no escalan porque sus sistemas no lo hacen. Diseñamos la infraestructura operacional que hace escalar a las empresas.',
      ctaPrimary: 'Entrar al Sistema',
      ctaSecondary: 'Explorar capas',
    },
    problem: {
      label: 'El Problema',
      heading: 'La mayoría de las empresas no escalan porque sus sistemas no lo hacen.',
      body: 'Las herramientas no escalan empresas. Los sistemas sí. La mayoría de las organizaciones apilan software sobre procesos rotos y se preguntan por qué nada cambia. Empezamos donde la mayoría se detiene — en el nivel de la arquitectura.',
    },
    layers: {
      label: 'Lo que construimos',
      heading: 'Capas del Sistema',
      items: [
        {
          code: '001',
          title: 'Arquitectura de Sistemas',
          description: 'Diseñamos la base estructural de sus operaciones — cómo fluyen los datos, cómo se conectan los equipos, cómo se toman las decisiones.',
        },
        {
          code: '002',
          title: 'Inteligencia Operacional',
          description: 'Visibilidad en tiempo real sobre el rendimiento de sus sistemas. Patrones identificados. Cuellos de botella detectados. Decisiones aceleradas.',
        },
        {
          code: '003',
          title: 'Control de Procesos',
          description: 'Marcos de gobernanza que mantienen los sistemas funcionando según lo previsto. Cumplimiento, calidad y consistencia a escala.',
        },
      ],
    },
    outcomes: {
      label: 'El Resultado',
      heading: 'Qué cambia',
      items: [
        { number: '01', label: 'Menos trabajo manual',    description: 'Sistemas que ejecutan, no solo rastrean.' },
        { number: '02', label: 'Ejecución más rápida',    description: 'Decisiones en segundos, no semanas.' },
        { number: '03', label: 'Operaciones escalables',  description: 'Infraestructura que crece contigo.' },
      ],
    },
    about: {
      label: 'Acerca de',
      heading: 'Korantis',
      body1: 'Somos una empresa de sistemas. Diseñamos cómo funcionan los negocios — desde la arquitectura de las operaciones hasta la inteligencia que los impulsa.',
      body2: 'Toda empresa es un sistema. La mayoría simplemente aún no lo sabe. Los ayudamos a verlo, construirlo y hacerlo funcionar.',
    },
    contact: {
      label: 'Comenzar',
      heading: 'Construye tu sistema.',
      body: 'Cuéntanos sobre tus operaciones. Te mostraremos lo que es posible cuando tus sistemas realmente funcionan.',
      fields: {
        name:    { label: 'Nombre',  placeholder: 'Tu nombre' },
        email:   { label: 'Correo',  placeholder: 'tu@empresa.com' },
        message: { label: 'Mensaje', placeholder: 'Cuéntanos sobre tu sistema...' },
      },
      submit:      'Enviar Solicitud',
      submitting:  'Transmitiendo...',
      success:     'Señal recibida.',
      error:       'Transmisión fallida. Reintentar.',
      validation: {
        name:    'El nombre debe tener al menos 2 caracteres',
        email:   'Ingresa un correo electrónico válido',
        message: 'El mensaje debe tener al menos 10 caracteres',
      },
    },
    footer: {
      poweredBy: 'Desarrollado por',
    },
    story: {
      panels: [
        { title: 'Caos',           body: ['Demasiadas tareas. Sin apalancamiento.',          'Tu equipo está ocupado — pero nada se acumula.'] },
        { title: 'Fricción',       body: ['Tiempo perdido. Oportunidades perdidas.',          'Cada proceso manual es un impuesto al crecimiento.'] },
        { title: 'Motor Korantis', body: ['La automatización reemplaza el esfuerzo.',         'Los sistemas ejecutan mientras tú estrategizas.'] },
        { title: 'Escala',         body: ['Los sistemas crecen mientras tú te enfocas.',      'Infraestructura que crece, no que se degrada.'] },
        { title: 'Dominio',        body: ['Tú operas. Los sistemas ejecutan.',                'Así se ve cuando todo funciona.'] },
      ],
    },
  },
} as const;

export type T = (typeof translations)[Lang];

// ── Context ────────────────────────────────────────────────────────────

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  t: T;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  toggle: () => {},
  t: translations.en,
});

// ── Provider ───────────────────────────────────────────────────────────

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  // Restore from localStorage after hydration (avoid SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('korantis-lang');
    if (stored === 'en' || stored === 'es') setLang(stored);
  }, []);

  const toggle = () => {
    setLang((prev) => {
      const next: Lang = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('korantis-lang', next);
      return next;
    });
  };

  return (
    <LangContext.Provider value={{ lang, toggle, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useLang() {
  return useContext(LangContext);
}
