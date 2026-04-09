'use client';

import { useMemo } from 'react';

/**
 * DataFlowBackground
 * 
 * A high-end, seamless horizontal background designed for scrolling sections.
 * Represents subtle fiber-optic/data-flow system using CSS/SVG.
 * Extremely low contrast, atmospheric, and infinite flow.
 * 
 * Fits within the constraints:
 * - Ultra minimal, dark, elegant
 * - Faint lines (white, blue, violet)
 * - Horizontal continuous flow
 * - No UI elements, dense networks, or specific shapes
 */
export default function DataFlowBackground() {
  // Deterministically generate strands to avoid hydration mismatches
  const strands = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => {
      const top = (i * 137.5) % 100; // Evenish distribution 0-100%
      const stagger = (i * 13) % 40; // 0 to 40 staggered start delay for organic growth
      const width = 20 + ((i * 7) % 60); // 20vw to 80vw length
      const opacity = 0.08 + (((i * 3) % 15) / 100); // 0.08 to 0.22 - bumped for better visibility
      const colorToken = i % 3 === 0 ? '#a5b4fc' : i % 4 === 0 ? '#c4b5fd' : '#ffffff';

      return { top, stagger, width, opacity, colorToken };
    });
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-[0] overflow-hidden bg-[#030303]" aria-hidden="true">
      {/* Background soft grain / noise overlay for texture without visual noise */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }}
      />

      {/* Extremely faint dark radial gradient to give depth, preventing total flatness */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,25,30,0.06)_0%,transparent_100%)]" />

      {/* The light strands growing from the right mapped to the scroll progress */}
      <div 
        className="absolute inset-0 will-change-transform"
        style={{ 
          transform: 'translateY(calc(var(--scroll-pulse, 0) * 8vh)) rotate(calc(var(--scroll-progress, 0) * 5deg)) scale(1.1)',
          opacity: 'calc(0.6 + (var(--scroll-pulse, 0) * 0.4))',
          transition: 'transform 0.1s linear, opacity 0.1s linear'
        }}
      >
        {strands.map((strand, i) => (
          <div
            key={`strand-${i}`}
            className="absolute right-0 h-[1px]"
            style={{
              top: `${strand.top}%`,
              // This clamp ensures they organically grow from 0 to their max width staggered over the scroll duration!
              width: `clamp(0vw, calc((var(--scroll-progress, 0) * 140vw) - ${strand.stagger}vw), ${strand.width}vw)`,
              opacity: strand.opacity,
              background: `linear-gradient(-90deg, transparent 0%, ${strand.colorToken} 50%, transparent 100%)`,
              willChange: 'width',
              filter: 'blur(1px)', // Diffused, soft glow
            }}
          />
        ))}
      </div>

      {/* Subtle curved SVG path data flows growing incrementally right-to-left */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.14] will-change-transform" 
        style={{ 
          transform: 'translateY(calc(var(--scroll-pulse, 0) * -4vh)) rotate(calc(var(--scroll-progress, 0) * -2deg))',
          opacity: 'calc(0.7 + (var(--scroll-pulse, 0) * 0.3))',
          transition: 'transform 0.1s linear, opacity 0.1s linear'
        }}
        preserveAspectRatio="none"
      >
        <style>
          {`
            .flow-line, .flow-line-blue, .flow-line-violet {
              fill: none;
              stroke-dasharray: 1000;
              /* Draw from end to start (right to left) tied perfectly to scroll */
              stroke-dashoffset: calc(-1000 + (var(--scroll-progress, 0) * 1000));
            }
            .flow-line {
              stroke: url(#flow-grad-white);
              stroke-width: 0.8px;
            }
            .flow-line-blue {
              stroke: url(#flow-grad-blue);
              stroke-width: 0.5px;
            }
            .flow-line-violet {
              stroke: url(#flow-grad-violet);
              stroke-width: 0.6px;
            }
          `}
        </style>
        <defs>
          <linearGradient id="flow-grad-white" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="flow-grad-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="flow-grad-violet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        {/* Abstract flow curves scaling up horizontally */}
        <path className="flow-line" pathLength="1000" d="M0,20 Q 25,25 50,15 T 100,30 T 150,25 T 200,40" transform="scale(10, 15)" />
        <path className="flow-line-blue" pathLength="1000" d="M0,50 Q 30,45 60,55 T 120,30 T 180,40 T 200,20" transform="scale(12, 12)" />
        <path className="flow-line-violet" pathLength="1000" d="M0,5 Q 40,15 80,5 T 160,15 T 200,5" transform="scale(15, 20)" />
      </svg>
    </div>
  );
}
