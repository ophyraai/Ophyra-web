'use client';

import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Only on desktop (no touch)
    if ('ontouchstart' in window) return;

    const el = glowRef.current;
    if (!el) return;

    let x = 0, y = 0;
    let currentX = 0, currentY = 0;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const tick = () => {
      currentX += (x - currentX) * 0.1;
      currentY += (y - currentY) * 0.1;
      el.style.transform = `translate(${currentX - 100}px, ${currentY - 100}px)`;
      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-30 h-[200px] w-[200px] rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(13,148,136,0.04), transparent 70%)',
        willChange: 'transform',
      }}
    />
  );
}
