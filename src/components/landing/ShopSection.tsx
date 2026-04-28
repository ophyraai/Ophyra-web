'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  ShoppingBag,
  Package,
  ShoppingCart,
  ExternalLink,
  Check,
  Star,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ShopProduct {
  id: string;
  type: 'affiliate' | 'own';
  slug: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  price: number | null;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  currency: string | null;
  affiliate_url: string | null;
  category: string;
  is_featured?: boolean;
  created_at?: string;
  badge?: string | null;
  rating?: number | null;
  review_count?: number;
}

const CATEGORIES = [
  'all',
  'sleep',
  'nutrition',
  'stress',
  'exercise',
  'hydration',
  'productivity',
] as const;

const categoryColors: Record<string, string> = {
  sleep: 'bg-indigo-50 text-indigo-700',
  exercise: 'bg-orange-50 text-orange-700',
  nutrition: 'bg-green-50 text-green-700',
  stress: 'bg-purple-50 text-purple-700',
  productivity: 'bg-blue-50 text-blue-700',
  hydration: 'bg-cyan-50 text-cyan-700',
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/** Auto-compute a badge based on product data */
function computeBadge(product: ShopProduct, index: number): string | null {
  const hasOffer =
    product.price_cents != null &&
    product.compare_at_price_cents != null &&
    product.compare_at_price_cents > product.price_cents;
  const offerPercent = hasOffer
    ? Math.round(
        ((product.compare_at_price_cents! - product.price_cents!) /
          product.compare_at_price_cents!) *
          100,
      )
    : 0;

  // First product in sort = top seller
  if (index === 0) return 'Top ventas';

  // Has a big discount
  if (offerPercent >= 15) return `-${offerPercent}%`;

  // Recently created (last 30 days)
  if (product.created_at) {
    const created = new Date(product.created_at);
    const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 30) return 'Nuevo';
  }

  return null;
}

function Stars({ count = 5, size = 12 }: { count?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="fill-current" style={{ width: size, height: size }} />
      ))}
    </span>
  );
}

// ── Product Card ───────────────────────────────────────────────
function ShopProductCard({
  product,
  index,
}: {
  product: ShopProduct;
  index: number;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const thumb =
    (product.images && product.images.length > 0 ? product.images[0] : null) ||
    product.image_url;
  const hasOffer =
    product.price_cents != null &&
    product.compare_at_price_cents != null &&
    product.compare_at_price_cents > product.price_cents;
  const offerPercent = hasOffer
    ? Math.round(
        ((product.compare_at_price_cents! - product.price_cents!) /
          product.compare_at_price_cents!) *
          100,
      )
    : 0;
  const badge = product.badge || computeBadge(product, index);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (product.price_cents == null || !product.slug) return;
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: thumb,
      unit_price_cents: product.price_cents,
      compare_at_price_cents: product.compare_at_price_cents ?? null,
      currency: product.currency || 'eur',
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  const detailHref = product.slug ? `/shop/${product.slug}` : null;

  const inner = (
    <>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        {thumb ? (
          <Image
            src={thumb}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
            <Package className="size-10 text-teal-300" />
          </div>
        )}

        {/* Badge (top-left) */}
        {badge && (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center rounded-full bg-[#0b1614] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-white shadow-md">
              {badge}
            </span>
          </div>
        )}

        {/* Add-to-cart button (bottom-right, appears on hover) */}
        {product.type === 'own' && product.price_cents != null && (
          <button
            type="button"
            onClick={handleAdd}
            className={`absolute bottom-3 right-3 z-10 grid size-10 place-items-center rounded-full border shadow-lg transition-all duration-200 ${
              justAdded
                ? 'border-emerald-400 bg-emerald-500 text-white'
                : 'border-white/80 bg-white text-ofira-text hover:bg-ofira-surface1'
            }`}
          >
            {justAdded ? <Check className="size-[18px]" /> : <ShoppingCart className="size-[18px]" />}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Category */}
        <span
          className={`mb-1.5 inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] ${
            categoryColors[product.category] || 'bg-gray-50 text-gray-700'
          }`}
        >
          {product.category}
        </span>

        {/* Name */}
        <h4 className="mb-1.5 text-[15px] font-semibold leading-snug text-ofira-text line-clamp-2">
          {product.name}
        </h4>

        {/* Rating row */}
        {product.rating != null && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-ofira-text-secondary">
            <Stars size={11} />
            <span className="tabular-nums font-medium">
              {product.rating}{product.review_count ? ` · ${product.review_count} reseñas` : ''}
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto flex items-baseline gap-2">
          {product.price_cents != null && (
            <span className="text-lg font-bold text-ofira-text">
              {formatMoney(product.price_cents, product.currency || 'eur')}
            </span>
          )}
          {hasOffer && product.compare_at_price_cents != null && (
            <>
              <span className="text-sm text-ofira-text-secondary line-through">
                {formatMoney(product.compare_at_price_cents, product.currency || 'eur')}
              </span>
              <span className="ml-auto inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                -{offerPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      className="card-hover group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ofira-card-border bg-white"
    >
      {detailHref ? (
        <Link href={detailHref} className="flex flex-1 flex-col">
          {inner}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{inner}</div>
      )}

      {/* External CTA for affiliates */}
      {product.type === 'affiliate' && product.affiliate_url && (
        <div className="border-t border-ofira-card-border p-3">
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofira-text px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-ofira-text/90"
          >
            Ver en tienda
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────
export default function ShopSection({ products }: { products: ShopProduct[] }) {
  const t = useTranslations('landing.shopSection');
  const [category, setCategory] = useState<string>('all');

  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return CATEGORIES.filter((c) => c === 'all' || cats.has(c));
  }, [products]);

  const filtered = useMemo(() => {
    if (category === 'all') return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  if (products.length === 0) return null;

  return (
    <section id="shop-section" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-9 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              {t('eyebrow')}
            </span>
            <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl lg:text-[clamp(2rem,4vw,3.25rem)]"
              style={{ lineHeight: 1.05 }}
            >
              {t('title')}{' '}
              <span className="text-ofira-text-secondary">{t('titleFaded')}</span>
            </h2>
            <p className="mt-3 max-w-[500px] text-[17px] text-ofira-text-secondary">
              {t('subtitle')}
            </p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-all ${
                  category === cat
                    ? 'bg-ofira-text text-white shadow-sm'
                    : 'border border-ofira-card-border bg-white text-ofira-text-secondary hover:border-teal-300'
                }`}
              >
                {t(`cat_${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {filtered.slice(0, 8).map((p, i) => (
            <ShopProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 rounded-full border border-ofira-card-border bg-white px-6 py-3 text-sm font-semibold text-ofira-text shadow-sm transition-all hover:border-teal-300 hover:-translate-y-px hover:shadow-md"
          >
            <ShoppingBag className="size-4 text-teal-600" />
            {t('viewAll')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
