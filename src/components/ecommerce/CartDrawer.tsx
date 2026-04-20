'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Package,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import FreeShippingProgress from './FreeShippingProgress';
import PriceDisplay from './PriceDisplay';
import CouponInput from './CouponInput';
import { computeDiscountCents } from '@/lib/coupons/compute';

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const SHIPPING_COUNTRY_STORAGE_KEY = 'ophyra:shipping_country';

export default function CartDrawer() {
  const {
    items,
    hydrated,
    subtotal_cents,
    currency,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    remove,
    appliedCoupon,
  } = useCart();

  const discountCents = appliedCoupon
    ? computeDiscountCents(appliedCoupon, subtotal_cents)
    : 0;

  // Read saved country (shared with /cart page)
  const country =
    typeof window !== 'undefined'
      ? localStorage.getItem(SHIPPING_COUNTRY_STORAGE_KEY) || 'ES'
      : 'ES';

  // Close on ESC
  useEffect(() => {
    if (!isDrawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll
  useEffect(() => {
    if (!isDrawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isDrawerOpen]);

  if (!hydrated) return null;

  const isEmpty = items.length === 0;
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[420px] flex-col bg-white shadow-[-8px_0_32px_rgba(0,0,0,0.08)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ofira-card-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-ofira-violet" />
                <h2 className="text-base font-semibold text-ofira-text">
                  Tu carrito
                </h2>
                {itemCount > 0 && (
                  <span className="rounded-full bg-ofira-surface1 px-2 py-0.5 text-xs font-medium text-ofira-text-secondary">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar carrito"
                className="rounded-lg p-2 text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-text"
              >
                <X className="size-5" />
              </button>
            </div>

            {isEmpty ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 rounded-2xl bg-ofira-surface1 p-5">
                  <ShoppingBag className="size-10 text-ofira-text-secondary/40" />
                </div>
                <h3 className="text-lg font-semibold text-ofira-text">
                  Tu carrito está vacío
                </h3>
                <p className="mt-1 text-sm text-ofira-text-secondary">
                  Descubre productos seleccionados para mejorar tus hábitos.
                </p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ofira-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-ofira-violet/90"
                >
                  Ir a la tienda
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div className="px-5 pt-4">
                  <FreeShippingProgress
                    subtotalCents={subtotal_cents}
                    countryCode={country}
                    variant="compact"
                  />
                </div>

                {/* Items scroll */}
                <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {items.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex gap-3 rounded-xl border border-ofira-card-border bg-white p-3"
                    >
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={closeDrawer}
                        className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-ofira-surface1"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="size-5 text-ofira-text-secondary/30" />
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-sm font-semibold leading-tight text-ofira-text hover:text-ofira-violet"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1">
                          <PriceDisplay
                            priceCents={item.unit_price_cents}
                            compareAtCents={item.compare_at_price_cents}
                            currency={item.currency}
                            size="sm"
                            showSavings={false}
                          />
                        </div>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                          <div className="inline-flex items-center rounded-lg border border-ofira-card-border">
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(item.product_id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              aria-label="Reducir cantidad"
                              className="flex size-7 items-center justify-center text-ofira-text-secondary hover:bg-ofira-surface1 disabled:opacity-30"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="min-w-[1.75rem] text-center text-xs font-semibold text-ofira-text">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQty(item.product_id, item.quantity + 1)
                              }
                              aria-label="Aumentar cantidad"
                              className="flex size-7 items-center justify-center text-ofira-text-secondary hover:bg-ofira-surface1"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-ofira-text">
                              {formatMoney(
                                item.unit_price_cents * item.quantity,
                                item.currency,
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(item.product_id)}
                              aria-label="Eliminar del carrito"
                              className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-rose-600 hover:underline"
                            >
                              <Trash2 className="size-3" />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer sticky */}
                <div className="border-t border-ofira-card-border bg-white px-5 py-4">
                  <div className="mb-3">
                    <CouponInput subtotalCents={subtotal_cents} compact />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ofira-text-secondary">Subtotal</span>
                      <span className="font-medium text-ofira-text">
                        {formatMoney(subtotal_cents, currency)}
                      </span>
                    </div>
                    {discountCents > 0 && appliedCoupon && (
                      <div className="flex justify-between text-emerald-700">
                        <span>
                          Descuento{' '}
                          <span className="font-mono text-[11px]">
                            ({appliedCoupon.code})
                          </span>
                        </span>
                        <span className="font-semibold">
                          −{formatMoney(discountCents, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-ofira-text-secondary">Total</span>
                      <span className="text-lg font-bold text-ofira-text">
                        {formatMoney(
                          Math.max(0, subtotal_cents - discountCents),
                          currency,
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-ofira-text-secondary">
                    Envío e impuestos calculados en el checkout
                  </p>

                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-violet px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90"
                  >
                    Finalizar compra
                    <ArrowRight className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-ofira-text-secondary hover:text-ofira-text"
                  >
                    Seguir comprando
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
