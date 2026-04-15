'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Lock,
  Package,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import ShippingDisclaimer from '@/components/shop/ShippingDisclaimer';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase/client';
import {
  calculateShipping,
  COUNTRY_OPTIONS,
  SHIPPING_ZONES,
} from '@/lib/shipping';

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const SHIPPING_COUNTRY_STORAGE_KEY = 'ophyra:shipping_country';

export default function CartPage() {
  const { items, hydrated, subtotal_cents, currency, updateQty, remove } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [shippingCountry, setShippingCountry] = useState('ES');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    // Recordamos el país entre sesiones (una pequeña mejora UX)
    try {
      const saved = localStorage.getItem(SHIPPING_COUNTRY_STORAGE_KEY);
      if (saved && /^[A-Z]{2}$/.test(saved)) setShippingCountry(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SHIPPING_COUNTRY_STORAGE_KEY, shippingCountry);
    } catch {
      /* ignore */
    }
  }, [shippingCountry]);

  // Hasta hidratar mostramos skeleton para evitar flash
  if (!hydrated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-ofira-bg pt-24">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="h-8 w-32 animate-pulse rounded bg-ofira-surface1" />
          </div>
        </div>
      </>
    );
  }

  const isEmpty = items.length === 0;
  const shippingCalc = calculateShipping(shippingCountry, subtotal_cents);
  const shipping_cents = isEmpty ? 0 : shippingCalc.shipping_cents;
  const total_cents = subtotal_cents + shipping_cents;

  async function handleCheckout() {
    if (!isLoggedIn) {
      window.location.href = '/auth/login?next=/cart';
      return;
    }
    setSubmitting(true);
    setCheckoutError(null);

    try {
      const res = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            expected_unit_price_cents: i.unit_price_cents,
          })),
          locale: 'es',
          shipping_country: shippingCountry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'PRICE_CHANGED') {
          setCheckoutError(data.error + ' Refresca la página.');
        } else {
          setCheckoutError(data.error || 'Error al iniciar el pago');
        }
        setSubmitting(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError('No se pudo obtener la URL de pago');
        setSubmitting(false);
      }
    } catch (err) {
      setCheckoutError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-ofira-bg pt-20">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ofira-text-secondary hover:text-ofira-violet"
          >
            <ArrowLeft className="size-4" />
            Seguir comprando
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-ofira-text">Tu carrito</h1>
            {!isEmpty && (
              <span className="rounded-full bg-ofira-surface1 px-3 py-1 text-sm font-medium text-ofira-text-secondary">
                {items.reduce((acc, i) => acc + i.quantity, 0)} artículos
              </span>
            )}
          </div>

          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ofira-card-border bg-white p-16 text-center"
            >
              <div className="mb-4 rounded-2xl bg-ofira-surface1 p-5">
                <ShoppingBag className="size-12 text-ofira-text-secondary/40" />
              </div>
              <h2 className="text-xl font-semibold text-ofira-text">
                Tu carrito está vacío
              </h2>
              <p className="mt-1 text-sm text-ofira-text-secondary">
                Explora la tienda y añade productos Marca Ophyra.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ofira-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-ofira-violet/90"
              >
                Ir al shop
              </Link>
            </motion.div>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {/* Lista de items */}
              <div className="space-y-3 lg:col-span-2">
                <ShippingDisclaimer variant="banner" />

                {items.map((item) => (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 rounded-2xl border border-ofira-card-border bg-white p-4"
                  >
                    {/* Imagen */}
                    <Link
                      href={`/shop/${item.slug}`}
                      className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-ofira-surface1"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="size-6 text-ofira-text-secondary/30" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/shop/${item.slug}`}
                        className="font-semibold text-ofira-text hover:text-ofira-violet"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 text-sm text-ofira-text-secondary">
                        {formatMoney(item.unit_price_cents, item.currency)} / unidad
                      </div>

                      {/* Qty + remove */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex items-center rounded-lg border border-ofira-card-border">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.product_id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="flex size-8 items-center justify-center text-ofira-text-secondary hover:bg-ofira-surface1 disabled:opacity-30"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-ofira-text">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.product_id, item.quantity + 1)
                            }
                            className="flex size-8 items-center justify-center text-ofira-text-secondary hover:bg-ofira-surface1"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.product_id)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Total línea */}
                    <div className="text-right text-sm font-bold text-ofira-text">
                      {formatMoney(item.unit_price_cents * item.quantity, item.currency)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Resumen */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-2xl border border-ofira-card-border bg-white p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                    Resumen
                  </h2>

                  {/* Selector de país — determina la zona de envío */}
                  <div className="mt-4">
                    <label className="mb-1 block text-xs font-medium text-ofira-text-secondary">
                      País de envío
                    </label>
                    <select
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      className="w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm"
                    >
                      <optgroup label="España">
                        {COUNTRY_OPTIONS.filter((c) => c.zone === 1).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name_es}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="UE + Reino Unido">
                        {COUNTRY_OPTIONS.filter((c) => c.zone === 2).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name_es}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Latinoamérica">
                        {COUNTRY_OPTIONS.filter((c) => c.zone === 3).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name_es}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Resto del mundo">
                        {COUNTRY_OPTIONS.filter((c) => c.zone === 4).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name_es}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Mensaje de free shipping */}
                  {!isEmpty && !shippingCalc.is_free && (
                    <div className="mt-3 rounded-lg bg-ofira-violet/5 p-3 text-xs text-ofira-text">
                      🎁 Añade{' '}
                      <strong>
                        {formatMoney(
                          shippingCalc.amount_to_free_cents,
                          currency,
                        )}
                      </strong>{' '}
                      más y tu envío es{' '}
                      <strong>gratis</strong> a{' '}
                      {SHIPPING_ZONES[shippingCalc.zone].label_es}.
                    </div>
                  )}
                  {!isEmpty && shippingCalc.is_free && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                      ✅ ¡Envío gratis a {SHIPPING_ZONES[shippingCalc.zone].label_es}!
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ofira-text-secondary">Subtotal</span>
                      <span className="font-medium text-ofira-text">
                        {formatMoney(subtotal_cents, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ofira-text-secondary">
                        Envío ({SHIPPING_ZONES[shippingCalc.zone].label_es})
                      </span>
                      {shipping_cents === 0 && !isEmpty ? (
                        <span className="font-medium text-emerald-600">
                          GRATIS
                        </span>
                      ) : (
                        <span className="font-medium text-ofira-text">
                          {formatMoney(shipping_cents, currency)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-ofira-text-secondary">
                      <span>IVA</span>
                      <span>Calculado en checkout</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-ofira-card-border pt-4">
                    <span className="font-semibold text-ofira-text">Total</span>
                    <span className="text-xl font-bold text-ofira-text">
                      {formatMoney(total_cents, currency)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ofira-violet px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90 disabled:opacity-60"
                  >
                    {isLoggedIn === false ? (
                      <>
                        <Lock className="size-4" />
                        Iniciar sesión para pagar
                      </>
                    ) : (
                      'Continuar al pago'
                    )}
                  </button>

                  {checkoutError && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {checkoutError}
                    </div>
                  )}

                  <p className="mt-3 text-center text-xs text-ofira-text-secondary">
                    Pago seguro con Stripe. Aceptamos Visa, Mastercard, Apple Pay.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
