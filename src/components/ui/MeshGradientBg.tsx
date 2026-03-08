'use client';

import { useEffect, useRef } from 'react';

export default function MeshGradientBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !containerRef.current) return;

    let angle = 0;
    let animId: number;
    const el = containerRef.current.querySelector('.conic-layer') as HTMLElement;
    if (!el) return;

    const tick = () => {
      angle = (angle + 0.15) % 360;
      el.style.background = `conic-gradient(from ${angle}deg at 50% 50%, rgba(196,161,255,0.12), rgba(255,158,122,0.08), rgba(125,211,192,0.06), rgba(196,161,255,0.12))`;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Rotating conic gradient */}
      <div
        className="conic-layer absolute inset-0"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(196,161,255,0.12), rgba(255,158,122,0.08), rgba(125,211,192,0.06), rgba(196,161,255,0.12))',
          willChange: 'background',
        }}
      />

      {/* Floating blob 1 */}
      <svg
        className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] opacity-30"
        viewBox="0 0 200 200"
        style={{ animation: 'float 20s ease-in-out infinite' }}
      >
        <ellipse cx="100" cy="100" rx="80" ry="60" fill="url(#blob1)" />
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(196,161,255,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Floating blob 2 */}
      <svg
        className="absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] opacity-20"
        viewBox="0 0 200 200"
        style={{ animation: 'float 25s ease-in-out infinite reverse' }}
      >
        <ellipse cx="100" cy="100" rx="70" ry="90" fill="url(#blob2)" />
        <defs>
          <radialGradient id="blob2" cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255,158,122,0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ofira-bg" />
    </div>
  );
}
