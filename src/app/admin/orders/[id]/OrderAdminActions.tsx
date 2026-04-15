'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Truck, Undo2 } from 'lucide-react';

interface Props {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
  currentTrackingUrl: string | null;
  currentCarrier: string | null;
  totalCents: number;
  currency: string;
  canRefund: boolean;
}

const STATUS_OPTIONS = [
  { value: 'paid', label: 'Pagado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function OrderAdminActions({
  orderId,
  currentStatus,
  currentTracking,
  currentTrackingUrl,
  currentCarrier,
  totalCents,
  currency,
  canRefund,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Status form
  const [status, setStatus] = useState(currentStatus);

  // Tracking form
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || '');
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl || '');
  const [carrier, setCarrier] = useState(currentCarrier || '');

  // Refund form
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] =
    useState<'requested_by_customer' | 'duplicate' | 'fraudulent' | 'other'>(
      'requested_by_customer',
    );
  const [refundNote, setRefundNote] = useState('');
  const [refundConfirm, setRefundConfirm] = useState(false);

  // UI state
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function callPatch(payload: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'err', text: data.error || 'Error' });
      return false;
    }
    return true;
  }

  function handleStatusChange() {
    if (status === currentStatus) {
      setMessage({ type: 'err', text: 'El status es el mismo' });
      return;
    }
    startTransition(async () => {
      const ok = await callPatch({ status });
      if (ok) {
        setMessage({ type: 'ok', text: `Status actualizado a "${status}"` });
        router.refresh();
      }
    });
  }

  function handleTrackingSubmit() {
    if (!trackingNumber.trim()) {
      setMessage({ type: 'err', text: 'El número de tracking es obligatorio' });
      return;
    }
    const payload: Record<string, unknown> = {
      tracking_number: trackingNumber.trim(),
      tracking_url: trackingUrl.trim() || null,
      tracking_carrier: carrier.trim() || null,
    };
    // Si el pedido aún no está en 'shipped', pasamos a shipped — eso
    // también dispara el email de envío.
    if (currentStatus !== 'shipped' && currentStatus !== 'delivered') {
      payload.status = 'shipped';
    }
    startTransition(async () => {
      const ok = await callPatch(payload);
      if (ok) {
        setMessage({
          type: 'ok',
          text: 'Tracking guardado. Email enviado al cliente.',
        });
        router.refresh();
      }
    });
  }

  function handleRefund() {
    if (!refundConfirm) {
      setMessage({ type: 'err', text: 'Confirma la acción marcando el checkbox' });
      return;
    }
    const payload: Record<string, unknown> = { reason: refundReason };
    if (refundAmount.trim()) {
      const euros = parseFloat(refundAmount.replace(',', '.'));
      if (isNaN(euros) || euros <= 0) {
        setMessage({ type: 'err', text: 'Importe inválido' });
        return;
      }
      payload.amount_cents = Math.round(euros * 100);
    }
    if (refundNote.trim()) payload.note = refundNote.trim();

    startTransition(async () => {
      setMessage(null);
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || 'Error en refund' });
        return;
      }
      setMessage({
        type: 'ok',
        text: `Reembolso de ${formatMoney(data.amount, currency)} creado en Stripe`,
      });
      setRefundConfirm(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Cambiar status */}
      <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
          <Send className="size-4" />
          Cambiar status
        </h3>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusChange}
            disabled={isPending || status === currentStatus}
            className="rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Tracking */}
      <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
          <Truck className="size-4" />
          Tracking
        </h3>
        <div className="space-y-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Número de seguimiento"
            className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm font-mono"
          />
          <input
            type="url"
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="URL del seguimiento (opcional)"
            className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="Transportista (ej. Correos, SEUR) — opcional"
            className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
          />
          <button
            onClick={handleTrackingSubmit}
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="mx-auto size-4 animate-spin" />
            ) : currentStatus !== 'shipped' && currentStatus !== 'delivered' ? (
              'Guardar y marcar como enviado (envía email)'
            ) : (
              'Actualizar tracking'
            )}
          </button>
        </div>
      </div>

      {/* Refund */}
      {canRefund && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-rose-700">
            <Undo2 className="size-4" />
            Reembolso
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-ofira-text-secondary">
                Importe (€) — vacío = total ({formatMoney(totalCents, currency)})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={(totalCents / 100).toFixed(2)}
                className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
              />
            </div>
            <select
              value={refundReason}
              onChange={(e) =>
                setRefundReason(e.target.value as typeof refundReason)
              }
              className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
            >
              <option value="requested_by_customer">Solicitado por cliente</option>
              <option value="duplicate">Duplicado</option>
              <option value="fraudulent">Fraudulento</option>
              <option value="other">Otro</option>
            </select>
            <textarea
              value={refundNote}
              onChange={(e) => setRefundNote(e.target.value)}
              placeholder="Nota interna (opcional)"
              rows={2}
              className="w-full rounded-lg border border-ofira-card-border px-3 py-2 text-sm"
            />
            <label className="flex items-start gap-2 text-xs text-ofira-text-secondary">
              <input
                type="checkbox"
                checked={refundConfirm}
                onChange={(e) => setRefundConfirm(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Confirmo que quiero reembolsar este pedido. Esta acción es
                irreversible y se procesará en Stripe inmediatamente.
              </span>
            </label>
            <button
              onClick={handleRefund}
              disabled={isPending || !refundConfirm}
              className="w-full rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="mx-auto size-4 animate-spin" />
              ) : (
                'Reembolsar vía Stripe'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
