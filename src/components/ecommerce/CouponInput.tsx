'use client';

import { useState } from 'react';
import { Ticket, X, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Props {
  subtotalCents: number;
  compact?: boolean;
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

export default function CouponInput({ subtotalCents, compact = false }: Props) {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/cart/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          subtotal_cents: subtotalCents,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Cupón no válido');
      }
      applyCoupon({
        code: data.code,
        type: data.type,
        percent_off: data.percent_off,
        amount_off_cents: data.amount_off_cents,
        discount_cents: data.discount_cents,
      });
      setCode('');
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (appliedCoupon) {
    return (
      <div
        className={[
          'flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50',
          compact ? 'px-2.5 py-2 text-xs' : 'px-3 py-2.5 text-sm',
        ].join(' ')}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Ticket
            className={[
              'shrink-0 text-emerald-700',
              compact ? 'size-3.5' : 'size-4',
            ].join(' ')}
          />
          <div className="min-w-0">
            <div className="truncate font-mono font-bold text-emerald-800">
              {appliedCoupon.code}
            </div>
            <div className="text-[11px] text-emerald-700">
              −{formatMoney(appliedCoupon.discount_cents)}
              {appliedCoupon.type === 'percent' &&
                appliedCoupon.percent_off != null && (
                  <> ({appliedCoupon.percent_off}%)</>
                )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={removeCoupon}
          aria-label="Quitar cupón"
          className="shrink-0 rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
        >
          <X className={compact ? 'size-3.5' : 'size-4'} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          'inline-flex items-center gap-1.5 font-medium text-ofira-text-secondary hover:text-ofira-violet',
          compact ? 'text-xs' : 'text-sm',
        ].join(' ')}
      >
        <Ticket className={compact ? 'size-3.5' : 'size-4'} />
        ¿Tienes un código promocional?
      </button>
    );
  }

  return (
    <form onSubmit={onApply} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setError(null);
            setCode(e.target.value.toUpperCase());
          }}
          placeholder="CÓDIGO"
          autoFocus
          className={[
            'flex-1 rounded-lg border border-ofira-card-border bg-white px-3 py-2 font-mono uppercase text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20',
            compact ? 'text-xs' : 'text-sm',
          ].join(' ')}
        />
        <button
          type="submit"
          disabled={submitting || !code.trim()}
          className={[
            'inline-flex items-center gap-1 rounded-lg bg-ofira-text px-3 font-semibold text-white hover:bg-ofira-text/90 disabled:opacity-50',
            compact ? 'text-xs' : 'text-sm',
          ].join(' ')}
        >
          {submitting ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Aplicar
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setCode('');
            setError(null);
          }}
          aria-label="Cancelar"
          className="rounded-lg p-2 text-ofira-text-secondary hover:bg-ofira-surface1"
        >
          <X className={compact ? 'size-3.5' : 'size-4'} />
        </button>
      </div>
      {error && (
        <p className="text-[11px] font-medium text-rose-600">{error}</p>
      )}
    </form>
  );
}
