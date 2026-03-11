'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareCardProps {
  score: number;
  diagnosisId: string;
  name: string;
}

/* ── Icon type ─────────────────────────────────────────────────────── */

type IconProps = { className?: string; style?: React.CSSProperties };

/* ── Platform SVG icons ────────────────────────────────────────────── */

function WhatsAppIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function XIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function FacebookIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ThreadsIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.021.88-.727 2.1-1.138 3.446-1.16.95-.015 1.83.1 2.637.343-.075-1.005-.34-1.764-.793-2.266-.563-.624-1.413-.94-2.526-.94l-.074.002c-.807.02-1.476.253-1.986.694-.462.399-.76.93-.872 1.558l-2.006-.393c.169-.94.636-1.737 1.351-2.305.84-.669 1.926-1.023 3.142-1.027l.103-.001c1.722 0 3.077.573 4.03 1.703.862 1.023 1.308 2.482 1.326 4.337v.164c.028.14.043.282.043.426 0 .12-.009.237-.022.354.482.252.912.56 1.282.923.97 1.016 1.48 2.403 1.414 3.87-.074 1.646-.757 3.282-1.917 4.6-1.647 1.87-4.012 2.878-7.034 2.996l-.037.001zM8.89 15.96c.033.587.321 1.053.808 1.37.575.373 1.34.556 2.198.514 1.078-.06 1.895-.44 2.43-1.128.382-.49.656-1.132.82-1.928a7.946 7.946 0 00-2.17-.306c-.91.014-1.67.229-2.197.623-.45.337-.653.72-.637 1.037l-.003.002-.003-.002.002-.001-.002.001.002-.001-.003.002.004-.003-.003.003.002-.002-.003.002.004-.002-.002.002z" />
    </svg>
  );
}

/* ── Platform configs ─────────────────────────────────────────────── */

interface Platform {
  id: string;
  label: string;
  color: string;
  icon: React.FC<IconProps>;
  buildUrl: (text: string, url: string) => string;
}

const PLATFORMS: Platform[] = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: WhatsAppIcon,
    buildUrl: (text, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    color: '#E4405F',
    icon: InstagramIcon,
    buildUrl: (text, url) =>
      `https://www.instagram.com/`,
  },
  {
    id: 'x',
    label: 'X',
    color: '#000000',
    icon: XIcon,
    buildUrl: (text, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'threads',
    label: 'Threads',
    color: '#000000',
    icon: ThreadsIcon,
    buildUrl: (text, url) =>
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text}\n${url}`)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: FacebookIcon,
    buildUrl: (_, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: '#26A5E4',
    icon: TelegramIcon,
    buildUrl: (text, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: LinkedInIcon,
    buildUrl: (_, url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

/* ── Certificate preview card ──────────────────────────────────────── */

function CertificatePreview({ score, name }: { score: number; name: string }) {
  const getLevel = (s: number) => {
    if (s >= 80) return { label: 'TOP 10%', sub: 'Hábitos de élite', color: '#0d9488' };
    if (s >= 65) return { label: 'AVANZADO', sub: 'Por encima de la media', color: '#059669' };
    if (s >= 50) return { label: 'BASE SÓLIDA', sub: 'Buen punto de partida', color: '#0d9488' };
    if (s >= 35) return { label: 'DESPERTANDO', sub: 'Tu camino empieza aquí', color: '#0d9488' };
    return { label: 'PUNTO CERO', sub: 'Todo por ganar', color: '#0d9488' };
  };

  const level = getLevel(score);
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const displayName = name || 'Anonymous';

  return (
    <div
      className="relative mx-auto select-none"
      style={{
        width: 300,
        borderRadius: 16,
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(13,148,136,0.07), 0 0 0 1px rgba(13,148,136,0.05)',
      }}
    >
      {/* Content */}
      <div className="relative flex flex-col items-center px-8 pb-7 pt-8">

        {/* Brand wordmark */}
        <span
          className="text-[11px] font-bold tracking-[0.35em] uppercase"
          style={{ color: '#0d9488' }}
        >
          Ophyra
        </span>
        <span className="mt-px text-[7px] tracking-[0.2em] uppercase text-ofira-text-secondary/40">
          Wellness Assessment
        </span>

        {/* Separator */}
        <div className="my-4 flex w-full items-center gap-0">
          <div className="h-px flex-1 bg-ofira-text-secondary/10" />
          <div className="mx-3 h-1 w-1 rounded-full bg-ofira-text-secondary/15" />
          <div className="h-px flex-1 bg-ofira-text-secondary/10" />
        </div>

        {/* User name — the protagonist */}
        <span
          className="text-center text-[22px] font-bold leading-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#1a1625',
          }}
        >
          {displayName}
        </span>

        <span className="mt-1.5 text-[9px] text-ofira-text-secondary/50">
          ha completado su evaluación de bienestar
        </span>

        {/* Score block */}
        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-end gap-0.5">
            <motion.span
              className="text-[56px] font-black leading-none tabular-nums"
              style={{
                fontFamily: 'var(--font-display)',
                color: '#1a1625',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 15 }}
            >
              {score}
            </motion.span>
            <span className="mb-2 text-[13px] font-bold text-ofira-text-secondary/25">/100</span>
          </div>

          {/* Level pill */}
          <div
            className="mt-2 rounded-full px-4 py-1"
            style={{
              background: `${level.color}0d`,
              border: `1.5px solid ${level.color}25`,
            }}
          >
            <span
              className="text-[10px] font-bold tracking-[0.15em]"
              style={{ color: level.color }}
            >
              {level.label}
            </span>
          </div>
          <span className="mt-1.5 text-[8px] text-ofira-text-secondary/45">
            {level.sub}
          </span>
        </div>

        {/* Separator */}
        <div className="my-5 flex w-full items-center gap-0">
          <div className="h-px flex-1 bg-ofira-text-secondary/10" />
          <div className="mx-3 h-1 w-1 rounded-full bg-ofira-text-secondary/15" />
          <div className="h-px flex-1 bg-ofira-text-secondary/10" />
        </div>

        {/* Signature */}
        <div className="flex flex-col items-center">
          <span
            className="text-[28px] leading-none"
            style={{
              fontFamily: 'var(--font-signature)',
              color: '#1a1625',
              opacity: 0.6,
            }}
          >
            Ophyra
          </span>
          {/* Underline flourish */}
          <svg width="100" height="8" viewBox="0 0 100 8" fill="none" className="-mt-0.5">
            <path
              d="M5 5 Q25 2, 50 4 Q75 6, 95 3"
              stroke="#1a1625"
              strokeWidth="0.8"
              strokeOpacity="0.2"
              strokeLinecap="round"
            />
          </svg>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[7px] font-medium tracking-[0.12em] uppercase text-ofira-text-secondary/35">
              Certificado
            </span>
            <span className="text-[7px] text-ofira-text-secondary/20">·</span>
            <span className="text-[7px] text-ofira-text-secondary/35">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-1">
          <span className="text-[8px] text-ofira-text-secondary/35">
            Haz el tuyo en
          </span>
          <span className="text-[8px] font-bold" style={{ color: '#0d9488' }}>
            ophyra.com
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────── */

export default function ShareCard({ score, diagnosisId, name }: ShareCardProps) {
  const t = useTranslations('results.share');
  const [copied, setCopied] = useState(false);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [igTooltip, setIgTooltip] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/diagnosis/${diagnosisId}`
    : '';

  useEffect(() => {
    setHasNativeShare(!!navigator.share);
  }, []);

  const shareText = t('text', { score: String(score) });

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareText, shareUrl]);

  const handlePlatform = useCallback((platform: Platform) => {
    /* Instagram: copy link first, then open app */
    if (platform.id === 'instagram') {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setIgTooltip(true);
      setTimeout(() => setIgTooltip(false), 3000);
      setTimeout(() => {
        window.open(platform.buildUrl(shareText, shareUrl), '_blank', 'noopener');
      }, 800);
      return;
    }

    setActivePlatform(platform.id);
    setTimeout(() => setActivePlatform(null), 300);
    window.open(platform.buildUrl(shareText, shareUrl), '_blank', 'noopener');
  }, [shareText, shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ophyra', text: shareText, url: shareUrl });
      } catch {}
    }
  }, [shareText, shareUrl]);

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-[rgba(13,148,136,0.1)] bg-ofira-surface1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      {/* Header */}
      <div className="px-6 pb-3 pt-5">
        <h3 className="text-center text-base font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
          {t('title')}
        </h3>
        <p className="mt-0.5 text-center text-xs text-ofira-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="px-5 pb-6 pt-2">
        {/* Certificate preview */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <CertificatePreview score={score} name={name} />
        </motion.div>

        {/* Instagram tooltip */}
        <AnimatePresence>
          {igTooltip && (
            <motion.div
              className="mb-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-center text-xs font-medium text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {t('igCopied')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform grid */}
        <div className="mb-4 grid grid-cols-4 gap-1 sm:grid-cols-7">
          {PLATFORMS.map((platform, i) => {
            const Icon = platform.icon;
            const isActive = activePlatform === platform.id;

            return (
              <motion.button
                key={platform.id}
                type="button"
                onClick={() => handlePlatform(platform)}
                className="group flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-ofira-surface2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + i * 0.04 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-shadow group-hover:shadow-md"
                  style={{ backgroundColor: `${platform.color}10` }}
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: platform.color }} />
                </motion.div>
                <span className="text-[9px] font-medium text-ofira-text-secondary group-hover:text-ofira-text">
                  {platform.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[rgba(13,148,136,0.1)] bg-ofira-surface2/50 px-4 py-2.5 text-sm font-medium text-ofira-text-secondary transition-colors hover:bg-ofira-surface2 hover:text-ofira-text"
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span key="copied" className="flex items-center gap-2 text-emerald-600" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                  <Check className="h-4 w-4" />
                  {t('copied')}
                </motion.span>
              ) : (
                <motion.span key="copy" className="flex items-center gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                  <Copy className="h-4 w-4" />
                  {t('copyLink')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {hasNativeShare && (
            <motion.button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ofira-violet to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              whileTap={{ scale: 0.97 }}
            >
              <Share2 className="h-4 w-4" />
              {t('moreOptions')}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
