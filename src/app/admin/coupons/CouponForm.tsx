'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Percent, Euro } from 'lucide-react';

const inputCls =
  'w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary/60 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20';

interface Initial {
  id: string;
  code: string;
  type: 'percent' | 'amount';
  percent_off: number | null;
  amount_off_cents: number | null;
  active: boolean;
  max_redemptions: number | null;
  times_redeemed: number;
  min_subtotal_cents: number | null;
  expires_at: string | null;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Initial;
}

interface FormState {
  code: string;
  type: 'percent' | 'amount';
  percent_off: string;
  amount_off_eur: string;
  max_redemptions: string;
  min_subtotal_eur: string;
  expires_at: string; // yyyy-mm-dd
  active: boolean;
}

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

function empty(initial?: Initial): FormState {
  return {
    code: initial?.code || '',
    type: initial?.type || 'percent',
    percent_off:
      initial?.percent_off != null ? String(initial.percent_off) : '',
    amount_off_eur:
      initial?.amount_off_cents != null
        ? (initial.amount_off_cents / 100).toString()
        : '',
    max_redemptions:
      initial?.max_redemptions != null ? String(initial.max_redemptions) : '',
    min_subtotal_eur:
      initial?.min_subtotal_cents != null
        ? (initial.min_subtotal_cents / 100).toString()
        : '',
    expires_at: toDateInput(initial?.expires_at || null),
    active: initial?.active ?? true,
  };
}

export default function CouponForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(empty(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const lockedImmutable = mode === 'edit'; // code, type, valor no editables

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'create') {
        const payload: Record<string, unknown> = {
          code: form.code.toUpperCase(),
          type: form.type,
        };
        if (form.type === 'percent') {
          const pct = parseInt(form.percent_off, 10);
          if (!Number.isFinite(pct) || pct < 1 || pct > 100) {
            throw new Error('Porcentaje entre 1 y 100');
          }
          payload.percent_off = pct;
        } else {
          const cents = Math.round(parseFloat(form.amount_off_eur) * 100);
          if (!Number.isFinite(cents) || cents <= 0) {
            throw new Error('Importe mayor que 0');
          }
          payload.amount_off_cents = cents;
        }
        if (form.max_redemptions.trim()) {
          payload.max_redemptions = parseInt(form.max_redemptions, 10);
        }
        if (form.min_subtotal_eur.trim()) {
          payload.min_subtotal_cents = Math.round(
            parseFloat(form.min_subtotal_eur) * 100,
          );
        }
        if (form.expires_at) {
          payload.expires_at = new Date(form.expires_at + 'T23:59:59Z').toISOString();
        }

        const res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      } else {
        // Edit: solo active/max_redemptions/min_subtotal/expires_at
        const payload: Record<string, unknown> = { active: form.active };
        if (form.max_redemptions.trim()) {
          payload.max_redemptions = parseInt(form.max_redemptions, 10);
        } else {
          payload.max_redemptions = null;
        }
        if (form.min_subtotal_eur.trim()) {
          payload.min_subtotal_cents = Math.round(
            parseFloat(form.min_subtotal_eur) * 100,
          );
        } else {
          payload.min_subtotal_cents = null;
        }
        if (form.expires_at) {
          payload.expires_at = new Date(form.expires_at + 'T23:59:59Z').toISOString();
        } else {
          payload.expires_at = null;
        }

        const res = await fetch(`/api/admin/coupons/${initial!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
      }

      router.push('/admin/coupons');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-1.5 text-sm text-ofira-text-secondary hover:text-ofira-violet"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-ofira-text">
          {mode === 'create' ? 'Nuevo cupón' : `Editar ${initial?.code}`}
        </h1>
      </div>

      {mode === 'edit' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          El código y el valor del descuento no se pueden cambiar tras crear el
          cupón. Para cambiar el descuento, archiva este cupón y crea uno nuevo.
        </div>
      )}

      <Section title="Código y descuento">
        <Field label="Código" required hint="Solo letras, números, - y _. Se guarda en mayúsculas.">
          <input
            type="text"
            required
            disabled={lockedImmutable}
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            className={`${inputCls} font-mono uppercase disabled:bg-ofira-surface1 disabled:opacity-80`}
            placeholder="PRIMAVERA20"
          />
        </Field>

        <div>
          <label className="mb-2 block text-sm font-medium text-ofira-text">
            Tipo de descuento
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={lockedImmutable}
              onClick={() => update('type', 'percent')}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                form.type === 'percent'
                  ? 'border-ofira-violet bg-ofira-violet/5'
                  : 'border-ofira-card-border bg-white hover:border-ofira-violet/40'
              }`}
            >
              <Percent
                className={`mt-0.5 size-5 ${form.type === 'percent' ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`}
              />
              <div>
                <div className="font-semibold text-ofira-text">Porcentaje</div>
                <div className="text-xs text-ofira-text-secondary">
                  Ej: 20% off. Se aplica sobre el subtotal.
                </div>
              </div>
            </button>
            <button
              type="button"
              disabled={lockedImmutable}
              onClick={() => update('type', 'amount')}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                form.type === 'amount'
                  ? 'border-ofira-violet bg-ofira-violet/5'
                  : 'border-ofira-card-border bg-white hover:border-ofira-violet/40'
              }`}
            >
              <Euro
                className={`mt-0.5 size-5 ${form.type === 'amount' ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`}
              />
              <div>
                <div className="font-semibold text-ofira-text">Importe fijo</div>
                <div className="text-xs text-ofira-text-secondary">
                  Ej: 5€ off. Capado al subtotal.
                </div>
              </div>
            </button>
          </div>
        </div>

        {form.type === 'percent' ? (
          <Field label="Porcentaje (%)" required>
            <input
              type="number"
              min="1"
              max="100"
              required
              disabled={lockedImmutable}
              value={form.percent_off}
              onChange={(e) => update('percent_off', e.target.value)}
              className={`${inputCls} w-32 disabled:bg-ofira-surface1 disabled:opacity-80`}
              placeholder="20"
            />
          </Field>
        ) : (
          <Field label="Importe (EUR)" required>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              disabled={lockedImmutable}
              value={form.amount_off_eur}
              onChange={(e) => update('amount_off_eur', e.target.value)}
              className={`${inputCls} w-32 disabled:bg-ofira-surface1 disabled:opacity-80`}
              placeholder="5.00"
            />
          </Field>
        )}
      </Section>

      <Section title="Reglas opcionales">
        <Field
          label="Usos máximos"
          hint="Déjalo vacío para permitir usos ilimitados."
        >
          <input
            type="number"
            min="1"
            value={form.max_redemptions}
            onChange={(e) => update('max_redemptions', e.target.value)}
            className={`${inputCls} w-32`}
            placeholder="100"
          />
        </Field>
        <Field
          label="Subtotal mínimo (EUR)"
          hint="Requiere que el carrito alcance este importe. Déjalo vacío para no exigir mínimo."
        >
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.min_subtotal_eur}
            onChange={(e) => update('min_subtotal_eur', e.target.value)}
            className={`${inputCls} w-32`}
            placeholder="25"
          />
        </Field>
        <Field label="Expira el" hint="Opcional. Deja en blanco para no caducar.">
          <input
            type="date"
            value={form.expires_at}
            onChange={(e) => update('expires_at', e.target.value)}
            className={`${inputCls} w-48`}
          />
        </Field>
        <label className="flex items-start gap-3 rounded-xl border border-ofira-card-border bg-white p-4">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => update('active', e.target.checked)}
            className="mt-1 size-4 rounded border-ofira-card-border text-ofira-violet focus:ring-ofira-violet"
          />
          <div>
            <div className="font-medium text-ofira-text">Activo</div>
            <div className="text-xs text-ofira-text-secondary">
              Si está inactivo, los clientes no podrán aplicarlo en el checkout.
            </div>
          </div>
        </label>
      </Section>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-ofira-card-border pt-5">
        <Link
          href="/admin/coupons"
          className="rounded-lg px-4 py-2 text-sm font-medium text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {mode === 'create' ? 'Crear cupón' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-ofira-card-border bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ofira-text">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ofira-text-secondary">{hint}</p>}
    </div>
  );
}
