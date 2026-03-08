'use client';

import { motion } from 'framer-motion';

interface ConstellationProgressProps {
  current: number;
  total: number;
}

export default function ConstellationProgress({ current, total }: ConstellationProgressProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-0">
        {Array.from({ length: total }, (_, i) => {
          const isCompleted = i < current;
          const isCurrent = i === current;
          const isFuture = i > current;

          return (
            <div key={i} className="flex items-center">
              {/* Dot */}
              <div className="relative flex items-center justify-center">
                {/* Expanding ring for current */}
                {isCurrent && (
                  <motion.div
                    className="absolute rounded-full border border-ofira-peach/40"
                    initial={{ width: 16, height: 16, opacity: 1 }}
                    animate={{ width: 28, height: 28, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}

                <motion.div
                  className="relative rounded-full"
                  animate={{
                    width: isCurrent ? 14 : 8,
                    height: isCurrent ? 14 : 8,
                    backgroundColor: isCompleted
                      ? '#c4a1ff'
                      : isCurrent
                        ? '#ff9e7a'
                        : 'rgba(196,161,255,0.15)',
                    boxShadow: isCompleted
                      ? '0 0 10px rgba(196,161,255,0.4)'
                      : isCurrent
                        ? '0 0 15px rgba(255,158,122,0.5)'
                        : 'none',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </div>

              {/* Connecting line */}
              {i < total - 1 && (
                <div className="relative h-[2px] w-4 sm:w-6">
                  <div className="absolute inset-0 bg-ofira-card-border" />
                  {i < current && (
                    <motion.div
                      className="absolute inset-0 bg-ofira-violet"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
