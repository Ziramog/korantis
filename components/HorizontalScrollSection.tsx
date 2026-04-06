'use client';

import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * HorizontalScrollSection
 *
 * Pins a vertical-scrolling page and converts scroll into horizontal movement.
 * Each child panel takes 100vw. After the last panel, vertical scroll resumes.
 *
 * Mobile (<768px): horizontal effect disabled, panels stack vertically.
 */
export default function HorizontalScrollSection({
  panels,
  className = '',
  panelClassName = '',
}: {
  panels: React.ReactNode[];
  className?: string;
  panelClassName?: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Track viewport width to disable effect on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // GSAP animation — runs only on desktop
  useLayoutEffect(() => {
    if (isMobile || !sectionRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const section = sectionRef.current;
    const totalWidth = container.scrollWidth - window.innerWidth;

    // Create a GSAP context for easy cleanup
    const ctx = gsap.context(() => {
      gsap.to(container, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: `+=${totalWidth}`,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    ctxRef.current = ctx;

    return () => {
      ctx.revert();
    };
  }, [isMobile, panels]);

  return (
    <section
      ref={sectionRef}
      className={`overflow-hidden ${className}`}
      aria-label="Horizontal scroll section"
    >
      <div
        ref={containerRef}
        className={`flex h-screen w-max ${isMobile ? '!flex-col !h-auto !w-full' : ''}`}
      >
        {panels.map((panel, i) => (
          <div
            key={i}
            ref={(el) => { panelsRef.current[i] = el; }}
            className={`flex h-screen min-w-[100vw] flex-col items-center justify-center p-8 ${isMobile ? '!min-w-full !min-h-[100svh]' : ''} ${panelClassName}`}
          >
            {panel}
          </div>
        ))}
      </div>
    </section>
  );
}
