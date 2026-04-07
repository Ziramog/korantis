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
    const lerp = 0.075;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - window.innerHeight;
      const raw = Math.min(Math.max(-rect.top / scrollRange, 0), 1);

      smoothProgress += (raw - smoothProgress) * lerp;

      const maxTranslate = track.scrollWidth - window.innerWidth;
      const x = maxTranslate * smoothProgress;

      track.style.transform = `translateX(-${x}px)`;

      const panels = track.children;
      const count = panels.length;

      for (let i = 0; i < count; i++) {
        const panel = panels[i] as HTMLElement;
        const p = smoothProgress * count - i;
        const opacity = Math.max(0, Math.min(1, 1 - Math.abs(p) * 1.2));
        const y = (1 - opacity) * 30;

        panel.style.opacity = String(opacity);
        panel.style.transform = `translateY(${y}px)`;
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
      <span className="panel-index">{index}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
