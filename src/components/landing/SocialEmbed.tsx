'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface VideoConfig {
  id: number;
  caption: string;
  views: string;
  tiktokId?: string;
}

const videos: VideoConfig[] = [
  { id: 1, caption: 'Hice el diagnóstico y me sorprendieron los resultados', views: '124K' },
  { id: 2, caption: 'Mi rutina de 30 dias con Ophyra', views: '89K' },
  { id: 3, caption: 'POV: descubres que duermes fatal', views: '203K' },
];

function TikTokEmbed({ tiktokId, caption, views }: { tiktokId: string; caption: string; views: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-ofira-card-border bg-ofira-surface1">
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mb-4 h-14 w-14 animate-pulse rounded-full bg-ofira-surface2" />
          <div className="mx-4 h-4 w-3/4 animate-pulse rounded bg-ofira-surface2" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-ofira-surface2" />
        </div>
      )}
      <iframe
        src={`https://www.tiktok.com/player/v1/${tiktokId}?music_info=1&description=1`}
        className="h-full w-full"
        style={{ opacity: loaded ? 1 : 0 }}
        loading="lazy"
        allow="encrypted-media"
        allowFullScreen
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function EmbedPlaceholder({ caption, views, index }: { caption: string; views: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative flex aspect-[9/16] flex-col items-center justify-center overflow-hidden rounded-2xl border border-ofira-card-border bg-ofira-surface1"
    >
      {/* Play button */}
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-ofira-violet/10 text-ofira-violet transition-transform group-hover:scale-110">
        <Play className="size-6 fill-current" />
      </div>
      <p className="px-4 text-center text-sm font-medium text-ofira-text">{caption}</p>
      <span className="mt-2 text-xs text-ofira-text-secondary">{views} views</span>

      {/* TikTok branding hint */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs text-ofira-text-secondary">
        <span className="font-semibold">@ophyra_secret</span>
      </div>
    </motion.div>
  );
}

export default function SocialEmbed() {
  const t = useTranslations('landing.socialEmbed');

  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">{t('title')}</h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {videos.map((v, i) =>
            v.tiktokId ? (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TikTokEmbed tiktokId={v.tiktokId} caption={v.caption} views={v.views} />
              </motion.div>
            ) : (
              <EmbedPlaceholder key={v.id} caption={v.caption} views={v.views} index={i} />
            )
          )}
        </div>

        {/* Watch more link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="https://www.tiktok.com/@ophyra_secret"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-ofira-violet transition-colors hover:text-ofira-peach"
          >
            {t('watchMore')}
            <ExternalLink className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
