import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Search, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pagado',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-600',
  refunded: 'bg-rose-50 text-rose-700',
};

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'paid', label: 'Pagados' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviados' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'refunded', label: 'Reembolsados' },
];

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOrdersPage(props: Props) {
  const params = await props.searchParams;
  const status = params.status || '';
  const searchTerm = params.q || '';

  let query = supabaseAdmin
    .from('orders')
    .select(
      'id, status, email, shipping_name, total_cents, currency, tracking_number, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) query = query.eq('status', status);
  if (searchTerm) {
    const s = searchTerm.replace(/[%_,()]/g, '\\$&');
    // Buscamos en email y shipping_name. El id (uuid) no se puede filtrar
    // con ilike dentro de un .or() sin funciones auxiliares en PostgREST,
    // así que para buscar por prefijo de id hacemos una ruta distinta.
    if (/^[0-9a-fA-F-]+$/.test(searchTerm)) {
      // Parece prefijo de UUID: filtro exacto por startsWith via gte/lt
      query = query.ilike('id::text', `${s}%`);
    } else {
      query = query.or(`email.ilike.%${s}%,shipping_name.ilike.%${s}%`);
    }
  }

  const { data: orders, error: queryError } = await query;

  if (queryError) {
    console.error('[admin/orders] query error:', queryError);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ofira-text">Pedidos</h1>
        <p className="text-sm text-ofira-text-secondary">
          Gestiona los pedidos, tracking y reembolsos.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = status === f.value;
          const params = new URLSearchParams();
          if (f.value) params.set('status', f.value);
          if (searchTerm) params.set('q', searchTerm);
          const href = `/admin/orders${params.toString() ? '?' + params.toString() : ''}`;

          return (
            <Link
              key={f.value}
              href={href}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-ofira-violet text-white'
                  : 'border border-ofira-card-border bg-white text-ofira-text-secondary hover:bg-ofira-surface1'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Buscador */}
      <form
        action="/admin/orders"
        method="GET"
        className="mb-6 flex items-center gap-2"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ofira-text-secondary" />
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Buscar por email, nombre o ID..."
            className="w-full rounded-lg border border-ofira-card-border bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white hover:bg-ofira-violet/90"
        >
          Buscar
        </button>
      </form>

      {/* Tabla */}
      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ofira-card-border bg-white p-16 text-center">
          <Package className="size-10 text-ofira-text-secondary/40" />
          <p className="mt-3 text-sm text-ofira-text-secondary">
            No hay pedidos con estos filtros.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ofira-card-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ofira-surface1">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ofira-text-secondary">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ofira-card-border">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer transition-colors hover:bg-ofira-surface1/50"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-ofira-violet hover:underline"
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ofira-text-secondary">
                    {new Date(o.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-ofira-text">
                      {o.shipping_name || '—'}
                    </div>
                    <div className="text-xs text-ofira-text-secondary">
                      {o.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ofira-text-secondary">
                    {o.tracking_number || '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatMoney(o.total_cents, o.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
