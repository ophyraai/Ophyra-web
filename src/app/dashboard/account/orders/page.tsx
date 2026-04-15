import Link from 'next/link';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import AccountNav from '@/components/dashboard/AccountNav';
import ClearCartOnSuccess from '@/components/shop/ClearCartOnSuccess';
import { Package, ArrowRight, CheckCircle2 } from 'lucide-react';

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

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

interface Props {
  searchParams: Promise<{ checkout?: string }>;
}

export default async function OrdersPage(props: Props) {
  // El dashboard layout ya valida sesión y hace redirect a login
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await props.searchParams;
  const justCheckedOut = params.checkout === 'success';

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, status, total_cents, currency, shipping_name, created_at')
    .eq('email', user!.email!)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <AccountNav />

      {justCheckedOut && <ClearCartOnSuccess />}

      <h1 className="text-2xl font-bold text-ofira-text">Mis pedidos</h1>

      {justCheckedOut && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <strong>¡Pago confirmado!</strong> Tu pedido está en camino.
            Recibirás un email con el número de seguimiento pronto.
          </div>
        </div>
      )}

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ofira-card-border bg-white p-16 text-center">
          <Package className="size-12 text-ofira-text-secondary/40" />
          <h2 className="mt-4 text-lg font-semibold text-ofira-text">
            No tienes pedidos aún
          </h2>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Cuando compres tu primer producto Marca Ophyra aparecerá aquí.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-ofira-violet/90"
          >
            Ir al shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/account/orders/${o.id}`}
              className="flex items-center justify-between rounded-2xl border border-ofira-card-border bg-white p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-ofira-text-secondary">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-ofira-text-secondary">
                  {new Date(o.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-ofira-text">
                  {formatMoney(o.total_cents, o.currency)}
                </span>
                <ArrowRight className="size-4 text-ofira-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
