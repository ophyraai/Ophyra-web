import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import AccountNav from '@/components/dashboard/AccountNav';
import { ArrowLeft, Package, MapPin, Truck, ExternalLink } from 'lucide-react';
import type { ShippingAddress, OrderItem } from '@/types/marketplace';

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

const STATUS_ORDER = ['paid', 'processing', 'shipped', 'delivered'];

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage(props: Props) {
  const { id } = await props.params;

  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('email', user!.email!)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', id)
    .order('created_at');

  const orderItems = (items || []) as OrderItem[];
  const address = order.shipping_address as ShippingAddress;
  const currentStep = STATUS_ORDER.indexOf(order.status);
  const isTerminal = ['cancelled', 'refunded'].includes(order.status);

  return (
    <div className="space-y-6">
      <AccountNav />

      <Link
        href="/dashboard/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ofira-text-secondary hover:text-ofira-violet"
      >
        <ArrowLeft className="size-4" />
        Mis pedidos
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-ofira-text">
            Pedido #{id.slice(0, 8).toUpperCase()}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <div className="mt-1 text-sm text-ofira-text-secondary">
          {new Date(order.created_at).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {!isTerminal && (
        <div>
          <div className="flex items-center gap-0">
            {STATUS_ORDER.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step} className="flex flex-1 items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? 'bg-ofira-violet text-white'
                        : 'bg-ofira-surface1 text-ofira-text-secondary'
                    } ${active ? 'ring-2 ring-ofira-violet/30' : ''}`}
                  >
                    {i + 1}
                  </div>
                  {i < STATUS_ORDER.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        i < currentStep ? 'bg-ofira-violet' : 'bg-ofira-surface2'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex text-[11px] text-ofira-text-secondary">
            {STATUS_ORDER.map((s) => (
              <div key={s} className="flex-1 text-center">
                {STATUS_LABELS[s]}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.tracking_number && (
        <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
          <Truck className="mt-0.5 size-5 shrink-0" />
          <div>
            <div className="font-semibold">Tu paquete está en camino</div>
            <div className="mt-1">
              Tracking: <strong>{order.tracking_number}</strong>
              {order.tracking_url && (
                <>
                  {' '}
                  —{' '}
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium underline"
                  >
                    Seguir envío <ExternalLink className="size-3" />
                  </a>
                </>
              )}
            </div>
            {order.tracking_carrier && (
              <div className="mt-0.5 text-xs">
                Transportista: {order.tracking_carrier}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-ofira-card-border bg-white p-4"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-ofira-surface1">
                {item.image_snapshot ? (
                  <Image
                    src={item.image_snapshot}
                    alt={item.name_snapshot}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="size-5 text-ofira-text-secondary/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ofira-text">
                  {item.name_snapshot}
                </div>
                <div className="text-sm text-ofira-text-secondary">
                  {item.quantity}x{' '}
                  {formatMoney(item.unit_price_cents, order.currency)}
                </div>
              </div>
              <div className="text-sm font-bold text-ofira-text">
                {formatMoney(item.line_total_cents, order.currency)}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
              Resumen
            </h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ofira-text-secondary">Subtotal</span>
                <span>{formatMoney(order.subtotal_cents, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ofira-text-secondary">Envío</span>
                <span>{formatMoney(order.shipping_cents, order.currency)}</span>
              </div>
              {order.tax_cents > 0 && (
                <div className="flex justify-between">
                  <span className="text-ofira-text-secondary">IVA</span>
                  <span>{formatMoney(order.tax_cents, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ofira-card-border pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total_cents, order.currency)}</span>
              </div>
            </div>
          </div>

          {address && (
            <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                <MapPin className="size-4" />
                Dirección de envío
              </h2>
              <div className="mt-3 text-sm text-ofira-text">
                <div>{order.shipping_name}</div>
                <div>{address.line1}</div>
                {address.line2 && <div>{address.line2}</div>}
                <div>
                  {address.postal_code} {address.city}
                </div>
                {address.region && <div>{address.region}</div>}
                <div>{address.country}</div>
                {order.phone && (
                  <div className="mt-1 text-ofira-text-secondary">
                    Tel: {order.phone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
