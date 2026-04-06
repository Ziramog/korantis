'use client';

import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Premium 2-panel horizontal scroll with background images.
 * Grid fades during this section. Clean, cinematic, controlled.
 */

const PANELS = [
  {
    img: '/back1.webp',
    code: '001',
  },
  {
    img: '/back2.webp',
    code: '002',
  },
] as const;

export default function KorantisStorySection() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      // Grid fade on enter/exit
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

      // Horizontal scroll
      const scrollAmount = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${scrollAmount}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Panel reveal
      gsap.utils.toArray<HTMLElement>('.story-panel').forEach((panel) => {
        const overlay = panel.querySelector('.panel-overlay');
        if (!overlay) return;
        gsap.fromTo(
          overlay,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, ease: 'power2.out',
            scrollTrigger: {
              trigger: panel, containerAnimation: gsap.getById('hscroll') as any,
              start: 'left center', end: 'center center', scrub: 1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Cleanup grid class on unmount
  useEffect(() => {
    return () => { document.body.classList.remove('no-grid'); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="h-scroll"
      aria-label="Korantis story"
    >
      <div ref={trackRef} className="h-track">
        {PANELS.map((panel, i) => {
          const text = t.story.panels[i];
          return (
            <div key={panel.code} className="story-panel">
              <img src={panel.img} alt="" aria-hidden="true" />
              <div className="panel-grid-overlay" />
              <div className="panel-overlay">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
                  {panel.code}
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-none text-white">
                  {text.title}
                </h2>
                <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed">
                  {text.body[0]}<br />{text.body[1]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
