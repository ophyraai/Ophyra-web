'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Package, Sparkles, ShoppingCart, Check, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import AffiliateBadge from './AffiliateBadge';
import PriceDisplay from '@/components/ecommerce/PriceDisplay';

interface ProductCardProps {
  id: string;
  type: 'affiliate' | 'own';
  name: string;
  slug: string | null;
  description: string | null;
  short_description?: string | null;
  imageUrl: string | null;
  images?: string[];
  price: number | null;
  price_cents?: number | null;
  compare_at_price_cents?: number | null;
  currency?: string;
  affiliateUrl: string | null;
  category: string;
  badge?: string | null;
  rating?: number | null;
  review_count?: number;
  priority?: boolean;
}

const categoryColors: Record<string, string> = {
  sleep: 'bg-indigo-50 text-indigo-700',
  exercise: 'bg-orange-50 text-orange-700',
  nutrition: 'bg-green-50 text-green-700',
  stress: 'bg-purple-50 text-purple-700',
  productivity: 'bg-blue-50 text-blue-700',
  hydration: 'bg-cyan-50 text-cyan-700',
};

function formatMoney(cents: number | null, fallback: number | null, currency: string) {
  const value = cents != null ? cents / 100 : fallback;
  if (value == null) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

export default function ProductCard({
  id,
  type,
  name,
  slug,
  description,
  short_description,
  imageUrl,
  images,
  price,
  price_cents,
  compare_at_price_cents,
  currency = 'eur',
  affiliateUrl,
  category,
  badge,
  rating,
  review_count,
  priority,
}: ProductCardProps) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const thumb = (images && images.length > 0 ? images[0] : null) || imageUrl;
  const detailHref = slug ? `/shop/${slug}` : null;
  const hasOffer =
    price_cents != null &&
    compare_at_price_cents != null &&
    compare_at_price_cents > price_cents;
  const offerPercent = hasOffer
    ? Math.round(
        ((compare_at_price_cents! - price_cents!) / compare_at_price_cents!) *
          100,
      )
    : 0;
  const formattedPrice = formatMoney(price_cents ?? null, price, currency);
  const desc = short_description || description;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (price_cents == null || !slug) return;
    add({
      product_id: id,
      slug,
      name,
      image: thumb,
      unit_price_cents: price_cents,
      compare_at_price_cents: compare_at_price_cents ?? null,
      currency,
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  // Contenido superior (imagen + info). Si hay slug, lo envolvemos en <Link>;
  // si no, en <div>. Lo declaramos fuera del JSX principal para no crear
  // un componente nuevo en cada render.
  const cardInner = (
    <>
      {/* Imagen */}
        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-ofira-surface1">
          {thumb ? (
            <Image
              src={thumb}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              {...(priority ? { priority: true } : {})}
            />
          ) : (
            <Package className="size-12 text-ofira-text-secondary/30" />
          )}
          {/* Badge configurable (admin) */}
          {badge && (
            <div className="absolute left-3 top-3 z-10">
              <span className="inline-flex items-center rounded-full bg-[#0b1614] px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide text-white shadow-md">
                {badge}
              </span>
            </div>
          )}
          {/* Fallback: marca propia o afiliado si no hay badge */}
          {!badge && (
            <div className="absolute left-3 top-3">
              {type === 'own' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-ofira-violet px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                  <Sparkles className="size-3" />
                  Ophyra
                </span>
              ) : (
                <AffiliateBadge variant="compact" />
              )}
            </div>
          )}
          {/* Badge de oferta (esquina derecha) */}
          {hasOffer && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                −{offerPercent}%
              </span>
            </div>
          )}
          {/* Botón add-to-cart */}
          {type === 'own' && price_cents != null && (
            <button
              type="button"
              onClick={handleAddToCart}
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

        <div className="flex flex-1 flex-col p-5">
          <span
            className={`mb-2 inline-block self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${
              categoryColors[category] || 'bg-gray-50 text-gray-700'
            }`}
          >
            {category}
          </span>
          <h3 className="mb-1 text-[15px] font-semibold leading-snug text-ofira-text">{name}</h3>

          {/* Rating */}
          {rating != null && (
            <div className="mb-2 flex items-center gap-1.5 text-xs text-ofira-text-secondary">
              <span className="inline-flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </span>
              <span className="tabular-nums font-medium">
                {rating}{review_count ? ` · ${review_count} reseñas` : ''}
              </span>
            </div>
          )}

          {desc && (
            <p className="mb-3 text-sm text-ofira-text-secondary line-clamp-2">{desc}</p>
          )}

          {/* Price row */}
          <div className="mt-auto flex items-baseline gap-2">
            {price_cents != null ? (
              <PriceDisplay
                priceCents={price_cents}
                compareAtCents={compare_at_price_cents}
                currency={currency}
                size="md"
                showSavings={false}
              />
            ) : formattedPrice ? (
              <span className="text-lg font-bold text-ofira-text">{formattedPrice}</span>
            ) : (
              <span />
            )}
          </div>
        </div>
    </>
  );

  return (
    <div
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-ofira-card-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
    >
      {detailHref ? (
        <Link href={detailHref} className="block">
          {cardInner}
        </Link>
      ) : (
        <div>{cardInner}</div>
      )}

      {/* CTA para afiliados */}
      {type === 'affiliate' && affiliateUrl && (
        <div className="border-t border-ofira-card-border bg-white p-3">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofira-text px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ofira-text/90"
          >
            Ver en tienda
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
