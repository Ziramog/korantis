'use client';

import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DataFlowBackground from './DataFlowBackground';

gsap.registerPlugin(ScrollTrigger);

/**
 * HorizontalScrollSection
 *
 * Pins a section and converts vertical scroll into horizontal movement.
 * After the last panel, normal vertical scroll resumes.
 *
 * - Uses gsap.context() for clean React cleanup
 * - Disables on mobile (<768px) → panels stack vertically
 * - Calculates totalWidth dynamically on refresh
 * - No querySelector, refs only
 */
export default function HorizontalScrollSection({
  panels,
}: {
  panels: React.ReactNode[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useLayoutEffect(() => {
    if (isMobile || !sectionRef.current || !containerRef.current) return;

    const section = sectionRef.current;
    const container = containerRef.current;
    const totalScrollWidth = container.scrollWidth;
    const scrollAmount = totalScrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      gsap.to(container, {
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
    }, sectionRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
  }, [isMobile, panels]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      aria-label="Horizontal scroll section"
    >
      {/* Absolute atmospheric flow background fixed behind horizontal scrolling panels */}
      {!isMobile && <DataFlowBackground />}

      <div
        ref={containerRef}
        className={`flex ${isMobile ? '!flex-col !h-auto !w-full' : 'w-max'}`}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            className={`${
              isMobile
                ? 'min-h-[100svh] w-full'
                : 'h-screen min-w-[100vw]'
            } flex flex-col items-center justify-center`}
          >
            {panel}
          </div>
        ))}
      </div>
    </section>
  );
}
