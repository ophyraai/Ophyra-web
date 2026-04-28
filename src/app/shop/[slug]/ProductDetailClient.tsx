'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  ExternalLink,
  Sparkles,
  Check,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';
import AffiliateBadge from '@/components/shop/AffiliateBadge';
import ShippingDisclaimer from '@/components/shop/ShippingDisclaimer';
import PriceDisplay from '@/components/ecommerce/PriceDisplay';
import StarRating from '@/components/shop/StarRating';

interface Product {
  id: string;
  type: 'affiliate' | 'own';
  name: string;
  slug: string | null;
  category: string;
  short_description: string | null;
  long_description: string | null;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  price: number | null;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  currency: string | null;
  affiliate_url: string | null;
}

interface ProductDetailProps {
  product: Product;
  rating?: number | null;
  reviewCount?: number;
}

function formatMoney(cents: number | null, fallback: number | null, currency: string) {
  const value = cents != null ? cents / 100 : fallback;
  if (value == null) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

export default function ProductDetailClient({ product, rating, reviewCount }: ProductDetailProps) {
  const t = useTranslations('reviews');
  const { add } = useCart();
  const isOwn = product.type === 'own';
  const gallery: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  const [activeImg, setActiveImg] = useState(0);
  const [acknowledged, setAcknowledged] = useState(!isOwn);
  const [justAdded, setJustAdded] = useState(false);

  const formattedPrice = formatMoney(
    product.price_cents,
    product.price,
    product.currency || 'eur',
  );
  const longDesc = product.long_description || product.description;

  function handleAddToCart() {
    if (!isOwn || product.price_cents == null || !product.slug) return;
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image: gallery[0] || null,
      unit_price_cents: product.price_cents,
      compare_at_price_cents: product.compare_at_price_cents,
      currency: product.currency || 'eur',
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Volver */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ofira-text-secondary hover:text-ofira-violet"
      >
        <ArrowLeft className="size-4" />
        Volver al shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Galería */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-ofira-card-border bg-ofira-surface1">
            {gallery.length > 0 ? (
              <Image
                src={gallery[activeImg]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="size-20 text-ofira-text-secondary/30" />
              </div>
            )}
            {/* Badge type */}
            <div className="absolute left-4 top-4">
              {isOwn ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ofira-violet px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  <Sparkles className="size-3.5" />
                  Marca Ophyra
                </span>
              ) : (
                <AffiliateBadge variant="compact" />
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    i === activeImg
                      ? 'border-ofira-violet'
                      : 'border-transparent hover:border-ofira-card-border'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col"
        >
          <span className="mb-2 inline-block self-start rounded-full bg-ofira-surface1 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider text-ofira-text-secondary">
            {product.category}
          </span>

          <h1 className="text-3xl font-bold text-ofira-text">{product.name}</h1>

          {rating != null && (
            <a
              href="#reviews"
              className="mt-2 inline-flex items-center gap-2 text-sm text-ofira-text-secondary hover:text-ofira-violet"
            >
              <StarRating rating={rating} size="sm" />
              <span className="font-medium">
                {rating.toFixed(1)} · {t('seeReviews', {
                  count: reviewCount || 0,
                  label: (reviewCount || 0) === 1 ? t('review') : t('reviewsPlural'),
                })}
              </span>
            </a>
          )}

          {product.short_description && (
            <p className="mt-2 text-base text-ofira-text-secondary">
              {product.short_description}
            </p>
          )}

          {product.price_cents != null ? (
            <div className="mt-5">
              <PriceDisplay
                priceCents={product.price_cents}
                compareAtCents={product.compare_at_price_cents}
                currency={product.currency || 'eur'}
                size="lg"
              />
              {isOwn && (
                <span className="mt-1 block text-sm font-normal text-ofira-text-secondary">
                  IVA incluido en checkout
                </span>
              )}
            </div>
          ) : formattedPrice ? (
            <div className="mt-5 text-3xl font-bold text-ofira-text">
              {formattedPrice}
            </div>
          ) : null}

          {/* Aviso de envío MUY visible para own */}
          {isOwn && (
            <div className="mt-5">
              <ShippingDisclaimer variant="banner" />
            </div>
          )}

          {/* Aviso de afiliación para affiliate */}
          {!isOwn && (
            <div className="mt-5">
              <AffiliateBadge variant="full" />
            </div>
          )}

          {/* Checkbox obligatoria de tiempos de envío para own */}
          {isOwn && (
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-ofira-card-border bg-white p-3 text-sm">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 size-4 rounded border-ofira-card-border text-ofira-violet focus:ring-ofira-violet"
              />
              <span className="text-ofira-text">
                Entiendo que el envío puede tardar entre <strong>15 y 45 días</strong>{' '}
                desde el proveedor internacional.
              </span>
            </label>
          )}

          {/* CTA */}
          <div className="mt-6">
            {isOwn ? (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!acknowledged || product.price_cents == null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-violet px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {justAdded ? (
                  <>
                    <Check className="size-5" />
                    Añadido al carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-5" />
                    Añadir al carrito
                  </>
                )}
              </button>
            ) : product.affiliate_url ? (
              <a
                href={product.affiliate_url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-text px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ofira-text/90"
              >
                Ver en tienda
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>

          {/* Descripción larga */}
          {longDesc && (
            <div className="mt-8 border-t border-ofira-card-border pt-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                Descripción
              </h2>
              <div className="prose prose-sm max-w-none whitespace-pre-line text-ofira-text">
                {longDesc}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
