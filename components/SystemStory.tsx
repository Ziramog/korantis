'use client';

import { useRef, useEffect } from 'react';
import { useLang } from '@/lib/i18n';
import DataFlowBackground from './DataFlowBackground';
import '@/public/css/story.css';

const PANELS = {
  en: [
    { index: '01', title: 'Friction', text: 'Time lost. Opportunities missed. Every manual process is a tax on growth.' },
    { index: '02', title: 'Systems are not tools', text: 'They are the architecture of execution.' },
    { index: '03', title: 'Visibility creates leverage', text: 'What you can see, you can scale.' },
    { index: '04', title: 'Execution compounds', text: 'Systems turn consistency into exponential results.' },
  ],
  es: [
    { index: '01', title: 'Fricción', text: 'Tiempo perdido. Oportunidades perdidas. Cada proceso manual supone un lastre para el crecimiento.' },
    { index: '02', title: 'Los sistemas no son herramientas', text: 'Son la arquitectura de la ejecución.' },
    { index: '03', title: 'La visibilidad genera influencia', text: 'Lo que puedes ver, puedes escalarlo.' },
    { index: '04', title: 'La ejecución se compone', text: 'Los sistemas transforman la consistencia en resultados exponenciales.' },
  ],
} as const;

export default function SystemStory() {
  const { lang } = useLang();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (window.innerWidth < 768) {
      // On mobile, bypass horizontal scroll logic and let CSS vertical stacking take over natively
      section.style.setProperty('--scroll-progress', '0');
      section.style.setProperty('--scroll-pulse', '0');
      section.style.setProperty('--scroll-exit', '0');
      section.style.setProperty('--entry-progress', '1');
      return;
    }

    const w = window.innerWidth;
    const pw = w * 0.66;

    // Track positions so first panel starts centered, last panel ends centered
    const trackStart = w / 2 - pw / 2;
    const trackEnd = w / 2 - (PANELS.en.length - 0.5) * pw;
    const maxScroll = trackStart - trackEnd;

    // Precompute panel centers in track space
    const panelCenters = PANELS.en.map((_, i) => (i + 0.5) * pw);

    let raf: number;
    let smoothProgress = 0;
    const lerp = 0.06;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - w;
      const raw = Math.min(Math.max(-rect.top / scrollRange, 0), 1);

      smoothProgress += (raw - smoothProgress) * lerp;

      // Move track
      const tx = trackStart - maxScroll * smoothProgress;
      track.style.transform = `translateX(${tx}px)`;

      // Update custom property for background parallax depth and spiral
      section.style.setProperty('--scroll-progress', smoothProgress.toString());
      
      // Track vertical entry so strands can print/grow before the lock
      const entryRaw = Math.min(Math.max(1 - (rect.top / window.innerHeight), 0), 1);
      section.style.setProperty('--entry-progress', entryRaw.toString());
      
      // Calculate a fading "pulse" wave that peaks as captions center
      const numPanels = track.children.length;
      const pulse = Math.sin(smoothProgress * Math.PI * (numPanels - 1));
      section.style.setProperty('--scroll-pulse', pulse.toString());

      // Track 'exiting' phase: only ramps from 0 to 1 between the last two panels (approaching 04)
      const lastPanelThreshold = (numPanels - 2) / (numPanels - 1); // e.g. 2/3 for 4 panels = 0.666
      const exitProgress = Math.max(0, (smoothProgress - lastPanelThreshold) / (1 - lastPanelThreshold));
      section.style.setProperty('--scroll-exit', exitProgress.toString());

      // Viewport center in track coordinates
      const vpCenter = -tx + w / 2;

      const panels = track.children;
      const count = panels.length;

      for (let i = 0; i < count; i++) {
        const panel = panels[i] as HTMLElement;
        const dist = Math.abs(panelCenters[i] - vpCenter) / pw;

        // Wider Gaussian: readable zone is ~40% of viewport
        const brightness = Math.exp(-dist * dist * 6);
        const opacity = Math.max(0.12, brightness);

        // Depth: off-center panels recede
        const scale = 0.94 + 0.06 * brightness;
        const blur = (1 - brightness) * 2.5;
        const y = (1 - brightness) * 16;

        panel.style.opacity = String(opacity);
        panel.style.filter = `blur(${blur}px)`;
        panel.style.transform = `scale(${scale}) translateY(${y}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const panels = PANELS[lang];

  return (
    <section ref={sectionRef} className="story-wrapper" aria-label="How systems scale">
      <div className="story-sticky">
        <DataFlowBackground />
        <div ref={trackRef} className="story-track">
          {panels.map((panel) => (
            <Panel key={panel.index} {...panel} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Panel({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="panel">
      <div className="panel-inner">
        <span className="panel-index">{index}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
