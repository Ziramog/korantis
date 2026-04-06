'use client';

import { useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '@/lib/i18n';

gsap.registerPlugin(ScrollTrigger);

/**
 * KorantisStorySection
 *
 * Cinematic 2-panel horizontal scroll.
 * Friction, fade transitions, top-right text, system numbers.
 */

const PANELS = [
  { img: '/back1.webp', code: '01' },
  { img: '/back2.webp', code: '02' },
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
      // Grid dim on enter/exit
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

      // Horizontal scroll with friction
      const scrollAmount = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollAmount,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top center',
          end: '+=180%',
          scrub: 1.4,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Panel overlay reveal
      gsap.utils.toArray<HTMLElement>('.panel-overlay').forEach((overlay) => {
        gsap.fromTo(
          overlay,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, ease: 'power2.out',
            scrollTrigger: {
              trigger: overlay.closest('.story-panel'),
              start: 'center center',
              end: 'center 30%',
              scrub: 1,
            },
          }
        );
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
          {PANELS.map((panel, i) => {
            const text = t.story.panels[i];
            return (
              <div key={panel.code} className="story-panel">
                <img src={panel.img} alt="" aria-hidden="true" />

                <div className="panel-id" aria-hidden="true">{panel.code}</div>

                <div className="k-anchor-wrap" aria-hidden="true">
                  <img src="/Kbrand.png" className="k-anchor" alt="" />
                </div>

                <div className="panel-overlay">
                  <div className="panel-meta">
                    {text.body[0]}<br />
                    {text.body[1]}
                  </div>
                  <h2>{text.title}</h2>
                  <p>{text.body[1]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
