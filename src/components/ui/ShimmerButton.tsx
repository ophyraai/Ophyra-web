'use client';

import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';

interface ShimmerButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ShimmerButton({ href, onClick, children, className = '', disabled }: ShimmerButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    // Magnetic pull — moves up to 6px toward cursor
    x.set(distX * 0.15);
    y.set(distY * 0.15);
  }, [disabled, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const content = (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-8 text-base font-semibold text-white ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        background: 'linear-gradient(135deg, #0d9488, #059669)',
        x: springX,
        y: springY,
      }}
    >
      {/* Shimmer sweep */}
      <span
        className="pointer-events-none absolute inset-0 animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      {/* Bloom on hover */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.15), transparent 70%)',
        }}
      />

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.span>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return <button onClick={onClick} disabled={disabled} type="button">{content}</button>;
}
