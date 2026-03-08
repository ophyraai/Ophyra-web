'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Share2, Copy, Check, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareCardProps {
  score: number;
  diagnosisId: string;
}

export default function ShareCard({ score, diagnosisId }: ShareCardProps) {
  const t = useTranslations('results.share');
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/diagnosis/${diagnosisId}`
    : '';

  const shareText = t('text', { score: String(score) });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const getScoreColor = (s: number) => {
    if (s < 40) return '#ef4444';
    if (s < 70) return '#ff9e7a';
    return '#c4a1ff';
  };

  return (
    <motion.div
      className="rounded-xl border border-[rgba(196,161,255,0.08)] bg-ofira-surface1 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="h-5 w-5 text-ofira-violet" />
        <h3 className="font-medium">{t('title')}</h3>
      </div>

      {/* Instagram Story preview */}
      <div className="mx-auto mb-6 w-40 overflow-hidden rounded-xl border border-[rgba(196,161,255,0.08)]" style={{ aspectRatio: '9/16' }}>
        <div
          className="flex h-full flex-col items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, #13111c, #1a1726, #0c0a14)' }}
        >
          <span className="mb-1 text-[10px] tracking-widest uppercase text-ofira-text-secondary">Ofira</span>
          <span
            className="text-4xl font-bold"
            style={{ color: getScoreColor(score) }}
          >
            {score}
          </span>
          <span className="text-[10px] text-ofira-text-secondary">/100</span>
          <div className="mt-3 h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #c4a1ff, transparent)' }} />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex-1 gap-2 border-[rgba(196,161,255,0.08)] bg-ofira-surface1 hover:bg-ofira-surface2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-ofira-violet" />
              <span className="text-ofira-violet">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy link</span>
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleTwitter}
          className="gap-2 border-[rgba(196,161,255,0.08)] bg-ofira-surface1 hover:bg-ofira-surface2"
        >
          <Twitter className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>
    </motion.div>
  );
}
