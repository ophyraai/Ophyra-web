'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Compass,
  ShoppingBag,
  ArrowRight,
  Moon,
  Droplets,
  Sparkles,
  Package,
} from 'lucide-react';
import PriceDisplay from '@/components/ecommerce/PriceDisplay';

interface MiniProduct {
  id: string;
  name: string;
  slug: string | null;
  image_url: string | null;
  images: string[] | null;
  price_cents: number | null;
  compare_at_price_cents?: number | null;
  price: number | null;
  category: string;
  currency: string | null;
  badge?: string | null;
  rating?: number | null;
  review_count?: number;
}

function formatPrice(cents: number | null, fallback: number | null, currency: string) {
  const value = cents != null ? cents / 100 : fallback;
  if (value == null) return '';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.8 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

// ── Diagnosis preview card (dark) ──────────────────────────────
function DiagCard() {
  const t = useTranslations('landing.heroCards');
  const [selected] = useState(2);

  const options = [
    t('diagOpt1'),
    t('diagOpt2'),
    t('diagOpt3'),
    t('diagOpt4'),
  ];

  return (
    <motion.div
      custom={0}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="card-hover relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b1614] p-6 sm:p-7"
    >
      {/* Grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(13,148,136,0.3) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-[10px] bg-emerald-500/15 text-emerald-400">
            <Compass className="size-[18px]" />
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-300">
              {t('diagLabel')}
            </p>
            <p className="text-sm font-semibold text-white">{t('diagSub')}</p>
          </div>
          <span className="ml-auto font-mono text-xs text-white/40">01 / 12</span>
        </div>

        {/* Question */}
        <h3 className="mb-4 max-w-[380px] text-xl font-semibold leading-tight text-white sm:text-2xl">
          {t('diagQuestion')}
        </h3>

        {/* Options */}
        <div className="mb-5 grid gap-2">
          {options.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors ${
                i === selected
                  ? 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200'
                  : 'border-white/8 bg-white/3 text-white/60'
              }`}
            >
              <span
                className={`size-4 flex-shrink-0 rounded-full border-[1.5px] ${
                  i === selected
                    ? 'border-emerald-400 bg-emerald-500'
                    : 'border-white/20 bg-transparent'
                }`}
              />
              {opt}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/diagnosis"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0b1614] transition-transform hover:scale-[1.02]"
          >
            {t('diagCta')}
            <ArrowRight className="size-3.5" />
          </Link>
          <span className="text-xs text-white/50">{t('diagNote')}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Shop preview card (light) ──────────────────────────────────
function ShopCard({ products }: { products: MiniProduct[] }) {
  const t = useTranslations('landing.heroCards');
  const shown = products.slice(0, 3);

  return (
    <motion.div
      custom={1}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="card-hover rounded-2xl border border-ofira-card-border bg-gradient-to-br from-[#f7fbfa] to-[#eef6f4] p-6 sm:p-7"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-[10px] bg-white text-teal-600 shadow-sm">
          <ShoppingBag className="size-[18px]" />
        </div>
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">
            {t('shopLabel')}
          </p>
          <p className="text-sm font-semibold text-ofira-text">{t('shopSub')}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {t('shopShipping')}
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-4 max-w-[320px] text-lg font-semibold leading-snug text-ofira-text sm:text-xl">
        {t('shopTitle')}
      </h3>

      {/* Mini product grid */}
      {shown.length > 0 ? (
        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {shown.map((p, i) => {
            const thumb = (p.images && p.images.length > 0 ? p.images[0] : null) || p.image_url;
            return (
              <Link
                key={p.id}
                href={p.slug ? `/shop/${p.slug}` : '/shop'}
                className="group rounded-xl border border-ofira-card-border bg-white p-2.5 transition-shadow hover:shadow-md"
              >
                <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-ofira-surface1">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt={p.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                      {...(i === 0 ? { priority: true } : {})}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                      <Package className="size-8 text-teal-300" />
                    </div>
                  )}
                  {/* Badge (left) */}
                  {p.badge && (
                    <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-[#0b1614] px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wide text-white shadow">
                      {p.badge}
                    </span>
                  )}
                  {/* Discount badge (right) */}
                  {(() => {
                    const hasOffer = p.price_cents != null && p.compare_at_price_cents != null && p.compare_at_price_cents > p.price_cents;
                    const pct = hasOffer ? Math.round(((p.compare_at_price_cents! - p.price_cents!) / p.compare_at_price_cents!) * 100) : 0;
                    return hasOffer && pct > 0 ? (
                      <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                        −{pct}%
                      </span>
                    ) : null;
                  })()}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-ofira-text-secondary">
                  {p.category}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold leading-tight text-ofira-text line-clamp-2">
                  {p.name}
                </p>
                {p.rating != null && (
                  <p className="mt-0.5 text-[10px] text-ofira-text-secondary">
                    <span className="text-amber-400">★</span> {p.rating}{p.review_count ? ` · ${p.review_count}` : ''}
                  </p>
                )}
                {p.price_cents != null ? (
                  <div className="mt-1">
                    <PriceDisplay
                      priceCents={p.price_cents}
                      compareAtCents={p.compare_at_price_cents}
                      currency={p.currency || 'eur'}
                      size="sm"
                      showSavings={false}
                    />
                  </div>
                ) : (
                  <p className="mt-1 text-[13px] font-bold text-teal-700">
                    {formatPrice(p.price_cents, p.price, p.currency || 'eur')}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-ofira-card-border bg-white p-2.5">
              <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50">
                <Package className="size-8 text-teal-300" />
              </div>
              <div className="h-2 w-12 rounded bg-ofira-surface2" />
              <div className="mt-1.5 h-3 w-full rounded bg-ofira-surface2" />
              <div className="mt-1.5 h-3 w-10 rounded bg-ofira-surface2" />
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 rounded-full border border-ofira-card-border bg-white px-4 py-2.5 text-sm font-semibold text-ofira-text shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
      >
        {t('shopCta')}
        <ArrowRight className="size-3.5" />
      </Link>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function HeroCards({ products }: { products: MiniProduct[] }) {
  return (
    <section className="relative -mt-8 px-4 pb-12 sm:px-6 md:-mt-12">
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
        <DiagCard />
        <ShopCard products={products} />
      </div>
    </section>
  );
}
