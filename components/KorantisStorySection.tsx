'use client';

import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    code: '01',
    label: 'System Visualization',
    heading: 'Friction',
    body: 'Time lost. Opportunities missed.',
    sub: 'Every manual process is a tax on growth.',
  },
  {
    code: '02',
    label: 'Structure',
    heading: 'Systems are not tools.',
    body: 'They are the architecture of execution.',
    sub: '',
  },
  {
    code: '03',
    label: 'Control',
    heading: 'Visibility creates leverage.',
    body: 'Leverage creates scale.',
    sub: '',
  },
  {
    code: '04',
    label: 'Outcome',
    heading: 'Less manual work.',
    body: 'Faster execution. Scalable operations.',
    sub: '',
  },
] as const;

export default function KorantisStorySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // Dim global grid while in this section
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        onEnter: () => document.body.classList.add('no-grid'),
        onLeaveBack: () => document.body.classList.remove('no-grid'),
      });

      ScrollTrigger.create({
        trigger: section,
        endTrigger: section.nextElementSibling || 'footer',
        end: 'top 20%',
        onLeave: () => document.body.classList.remove('no-grid'),
        onEnterBack: () => document.body.classList.add('no-grid'),
      });

      // Horizontal scroll — smooth scrub
      const scrollAmount = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollAmount}`,
          scrub: 2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => { document.body.classList.remove('no-grid'); };
  }, []);

  return (
    <>
      <div className="section-label" aria-hidden="true">
        <span>01</span>
        <p>System Visualization</p>
      </div>

      <section
        ref={sectionRef}
        className="h-scroll"
        aria-label="Korantis story"
      >
        <div ref={trackRef} className="h-track">
          {PANELS.map((panel) => (
            <div key={panel.code} className="story-panel">
              <div className="panel-content">
                <span>{panel.label}</span>
                <h2>{panel.heading}</h2>
                <p>
                  {panel.body}
                  {panel.sub && <><br /><br />{panel.sub}</>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
