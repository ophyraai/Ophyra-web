'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface WaveDividerProps {
  flip?: boolean;
  fromColor?: string;
  toColor?: string;
}

export default function WaveDivider({ flip = false, fromColor = '#ffffff', toColor = '#f0faf8' }: WaveDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Subtle horizontal shift as you scroll past
  const translateX = useTransform(scrollYProgress, [0, 1], [0, flip ? -30 : 30]);

  return (
    <div
      ref={ref}
      className="relative -my-px overflow-hidden"
      style={{ position: 'relative', transform: flip ? 'scaleY(-1)' : undefined }}
    >
      <motion.svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block w-full h-[40px] sm:h-[60px] md:h-[80px]"
        style={{ x: translateX }}
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill={toColor}
        />
        <path
          d="M0,50 C200,70 400,20 600,45 C800,70 1000,15 1200,40 C1350,55 1400,45 1440,50 L1440,80 L0,80 Z"
          fill={toColor}
          opacity="0.5"
        />
      </motion.svg>
    </div>
  );
}
