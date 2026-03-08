'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, animate, useInView } from 'framer-motion';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedStat({ value, suffix = '', className = '' }: AnimatedStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, value, {
      duration: 1,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${Math.round(v)}${suffix}`;
        }
      },
    });

    return () => controls.stop();
  }, [isInView, value, suffix, motionValue]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
