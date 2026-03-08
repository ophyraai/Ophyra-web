'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface ShimmerButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ShimmerButton({ href, onClick, children, className = '', disabled }: ShimmerButtonProps) {
  const content = (
    <motion.span
      className={`group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-8 text-base font-semibold text-white ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{
        background: 'linear-gradient(135deg, #c4a1ff, #ff9e7a)',
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
