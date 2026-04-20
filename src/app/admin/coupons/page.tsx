import Link from 'next/link';
import { Plus, Ticket, Percent, Euro } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import CouponRowActions from './CouponRowActions';

export const dynamic = 'force-dynamic';

interface CouponRow {
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
  created_at: string;
}

async function getCoupons(): Promise<CouponRow[]> {
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('admin coupons list error:', error);
    return [];
  }
  return (data as CouponRow[]) || [];
}

function formatValue(c: CouponRow) {
  if (c.type === 'percent' && c.percent_off != null) {
    return `-${c.percent_off}%`;
  }
  if (c.type === 'amount' && c.amount_off_cents != null) {
    return `-${(c.amount_off_cents / 100).toFixed(2)}€`;
  }
  return '—';
}

function formatExpiration(iso: string | null) {
  if (!iso) return 'Sin expiración';
  const d = new Date(iso);
  const now = Date.now();
  if (d.getTime() < now) return 'Expirado';
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ofira-text">Cupones</h1>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Códigos de descuento con sync automático a Stripe.
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90"
        >
          <Plus className="size-4" />
          Nuevo cupón
        </Link>
      </div>

      {coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ofira-card-border bg-white p-16 text-center">
          <Ticket className="mx-auto size-12 text-ofira-text-secondary/40" />
          <h3 className="mt-4 text-lg font-semibold text-ofira-text">
            Aún no hay cupones
          </h3>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Crea tu primer cupón para campañas promocionales.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ofira-card-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ofira-surface1 text-left text-xs uppercase tracking-wider text-ofira-text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Descuento</th>
                <th className="px-4 py-3 font-semibold">Usos</th>
                <th className="px-4 py-3 font-semibold">Mínimo</th>
                <th className="px-4 py-3 font-semibold">Expira</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ofira-card-border">
              {coupons.map((c) => {
                const expired =
                  c.expires_at && new Date(c.expires_at).getTime() < Date.now();
                const depleted =
                  c.max_redemptions != null &&
                  c.times_redeemed >= c.max_redemptions;
                const status = !c.active
                  ? 'Inactivo'
                  : expired
                    ? 'Expirado'
                    : depleted
                      ? 'Agotado'
                      : 'Activo';
                const statusColor =
                  status === 'Activo'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-600';

                return (
                  <tr key={c.id} className="hover:bg-ofira-surface1/40">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-ofira-text">
                      {c.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                        {c.type === 'percent' ? (
                          <Percent className="size-3" />
                        ) : (
                          <Euro className="size-3" />
                        )}
                        {formatValue(c)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ofira-text">
                      {c.times_redeemed}
                      {c.max_redemptions != null && ` / ${c.max_redemptions}`}
                    </td>
                    <td className="px-4 py-3 text-ofira-text-secondary">
                      {c.min_subtotal_cents != null
                        ? `${(c.min_subtotal_cents / 100).toFixed(2)}€`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-ofira-text-secondary">
                      {formatExpiration(c.expires_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <CouponRowActions id={c.id} code={c.code} active={c.active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
