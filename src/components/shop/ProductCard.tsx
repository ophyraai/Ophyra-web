'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Package, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import AffiliateBadge from './AffiliateBadge';
import ShippingDisclaimer from './ShippingDisclaimer';
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
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Package className="size-12 text-ofira-text-secondary/30" />
          )}
          {/* Badge marca propia/afiliado en esquina */}
          <div className="absolute left-3 top-3">
            {type === 'own' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ofira-violet px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                <Sparkles className="size-3" />
                Marca Ophyra
              </span>
            ) : (
              <AffiliateBadge variant="compact" />
            )}
          </div>
          {/* Badge de oferta */}
          {hasOffer && (
            <div className="absolute right-3 top-3">
              <span className="inline-flex items-center rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                −{offerPercent}%
              </span>
            </div>
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
          <h3 className="mb-1 font-semibold text-ofira-text">{name}</h3>
          {desc && (
            <p className="mb-3 text-sm text-ofira-text-secondary line-clamp-2">{desc}</p>
          )}

          {/* Aviso compacto de envío para own */}
          {type === 'own' && (
            <ShippingDisclaimer variant="compact" className="mb-3" />
          )}

          <div className="mt-auto flex items-center justify-between">
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ofira-card-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
    >
      {detailHref ? (
        <Link href={detailHref} className="block">
          {cardInner}
        </Link>
      ) : (
        <div>{cardInner}</div>
      )}

      {/* CTA fuera del Link para que el botón no propague */}
      <div className="border-t border-ofira-card-border bg-white p-3">
        {type === 'own' ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={price_cents == null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ofira-violet/90 disabled:opacity-50"
          >
            {justAdded ? (
              <>
                <Check className="size-4" />
                Añadido
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                Añadir al carrito
              </>
            )}
          </button>
        ) : affiliateUrl ? (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofira-text px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ofira-text/90"
          >
            Ver en tienda
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </motion.div>
  );
}
