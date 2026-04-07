'use client';

import { useRef, useEffect } from 'react';
import '@/public/css/story.css';

const PANELS = [
  { index: '01', title: 'Friction', text: 'Time lost. Opportunities missed. Every manual process is a tax on growth.' },
  { index: '02', title: 'Systems are not tools', text: 'They are the architecture of execution.' },
  { index: '03', title: 'Visibility creates leverage', text: 'What you can see, you can scale.' },
  { index: '04', title: 'Execution compounds', text: 'Systems turn consistency into exponential results.' },
] as const;

export default function SystemStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let raf: number;
    let smoothProgress = 0;
    const lerp = 0.07;

    // Layout constants
    const panelWidth = window.innerWidth * 0.66; // 66vw — 1/3 narrower
    const trackWidth = PANELS.length * panelWidth;
    const maxScroll = trackWidth - window.innerWidth;
    const initialOffset = (window.innerWidth - panelWidth) / 2; // center first panel

    // Precompute panel centers in track space
    const panelCenters = PANELS.map((_, i) => (i + 0.5) * panelWidth);

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - window.innerHeight;
      const raw = Math.min(Math.max(-rect.top / scrollRange, 0), 1);

      smoothProgress += (raw - smoothProgress) * lerp;

      // Move track
      const x = maxScroll * smoothProgress;
      track.style.transform = `translateX(${-initialOffset - x}px)`;

      // Viewport center in track coordinates
      const vpCenter = initialOffset + panelWidth / 2 + x;

      // Spotlight: each panel's brightness based on distance to viewport center
      const panels = track.children;
      const count = panels.length;

      for (let i = 0; i < count; i++) {
        const panel = panels[i] as HTMLElement;
        const dist = Math.abs(panelCenters[i] - vpCenter) / panelWidth;

        // Gaussian falloff: 1.0 at center, ~0.1 at dist=0.5
        const brightness = Math.exp(-dist * dist * 12);
        const opacity = Math.max(0.08, brightness);

        // Depth: panels off-center get subtle scale-down + blur
        const scale = 0.92 + 0.08 * brightness;
        const blur = (1 - brightness) * 3;
        const y = (1 - brightness) * 20;

        panel.style.opacity = String(opacity);
        panel.style.filter = `blur(${blur}px)`;
        panel.style.transform = `scale(${scale}) translateY(${y}px)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={sectionRef} className="story-wrapper" aria-label="How systems scale">
      <div className="story-sticky">
        <div ref={trackRef} className="story-track">
          {PANELS.map((panel) => (
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
