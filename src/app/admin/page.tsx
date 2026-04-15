import Link from 'next/link';
import { Package, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function getStats() {
  // Conteos en paralelo
  const [productsAll, productsOwn, productsAffiliate, ordersAll, ordersByStatus, recentOrders] =
    await Promise.all([
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'own'),
      supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'affiliate'),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('status'),
      supabaseAdmin
        .from('orders')
        .select('id, email, total_cents, currency, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const statusCounts: Record<string, number> = {};
  for (const row of ordersByStatus.data || []) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }

  return {
    productsTotal: productsAll.count || 0,
    productsOwn: productsOwn.count || 0,
    productsAffiliate: productsAffiliate.count || 0,
    ordersTotal: ordersAll.count || 0,
    statusCounts,
    recentOrders: recentOrders.data || [],
  };
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  icon: typeof Package;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-ofira-card-border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(13,148,136,0.08)]">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-ofira-surface1 p-2.5">
          <Icon className="size-5 text-ofira-violet" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold text-ofira-text">{value}</div>
      <div className="text-sm text-ofira-text-secondary">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

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

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ofira-text">Panel admin</h1>
        <p className="mt-1 text-sm text-ofira-text-secondary">
          Gestión del marketplace híbrido (productos propios + afiliación) y pedidos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Productos totales"
          value={stats.productsTotal}
          icon={Package}
          href="/admin/products"
        />
        <StatCard
          label="Marca Ophyra"
          value={stats.productsOwn}
          icon={Sparkles}
          href="/admin/products?type=own"
        />
        <StatCard
          label="Afiliados"
          value={stats.productsAffiliate}
          icon={Tag}
          href="/admin/products?type=affiliate"
        />
        <StatCard
          label="Pedidos totales"
          value={stats.ordersTotal}
          icon={ShoppingBag}
          href="/admin/orders"
        />
      </div>

      {/* Pedidos por estado */}
      {Object.keys(stats.statusCounts).length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
            Pedidos por estado
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                  STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {STATUS_LABELS[status] || status}
                <span className="rounded-full bg-white/60 px-1.5 py-0 text-xs font-bold">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos recientes */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
            Pedidos recientes
          </h2>
          {stats.ordersTotal > 5 && (
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-ofira-violet hover:underline"
            >
              Ver todos →
            </Link>
          )}
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ofira-card-border bg-white p-10 text-center">
            <ShoppingBag className="mx-auto size-10 text-ofira-text-secondary/40" />
            <p className="mt-3 text-sm text-ofira-text-secondary">
              Aún no hay pedidos. Cuando llegue el primero aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ofira-card-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-ofira-surface1 text-left text-xs uppercase tracking-wider text-ofira-text-secondary">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ofira-card-border">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-ofira-surface1/50">
                    <td className="px-4 py-3 font-mono text-xs text-ofira-text-secondary">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-ofira-violet">
                        {o.id.slice(0, 8)}…
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ofira-text">{o.email}</td>
                    <td className="px-4 py-3 font-medium text-ofira-text">
                      {formatMoney(o.total_cents, o.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ofira-text-secondary">
                      {new Date(o.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
