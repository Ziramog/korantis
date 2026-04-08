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

    const w = window.innerWidth;
    const pw = w * 0.66;

    // Track positions so first panel starts centered, last panel ends centered
    const trackStart = w / 2 - pw / 2;
    const trackEnd = w / 2 - (PANELS.length - 0.5) * pw;
    const maxScroll = trackStart - trackEnd;

    // Precompute panel centers in track space
    const panelCenters = PANELS.map((_, i) => (i + 0.5) * pw);

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
