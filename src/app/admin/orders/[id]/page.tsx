import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react';
import type { ShippingAddress, OrderItem } from '@/types/marketplace';
import OrderAdminActions from './OrderAdminActions';

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

const EVENT_LABELS: Record<string, string> = {
  created: 'Pedido creado',
  status_changed: 'Status cambiado',
  tracking_added: 'Tracking añadido',
  refunded: 'Reembolsado',
  note: 'Nota interna',
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage(props: Props) {
  const { id } = await props.params;

  const [orderRes, itemsRes, eventsRes] = await Promise.all([
    supabaseAdmin.from('orders').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('created_at'),
    supabaseAdmin
      .from('order_events')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const order = orderRes.data;
  if (!order) notFound();

  const items = (itemsRes.data || []) as OrderItem[];
  const events = eventsRes.data || [];
  const address = order.shipping_address as ShippingAddress | null;
  const canRefund = !['refunded', 'cancelled'].includes(order.status);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ofira-text-secondary hover:text-ofira-violet"
      >
        <ArrowLeft className="size-4" />
        Volver a pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
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

      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ofira-text-secondary">
        <span>
          Creado:{' '}
          {new Date(order.created_at).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        {order.paid_at && (
          <span>
            Pagado: {new Date(order.paid_at).toLocaleString('es-ES')}
          </span>
        )}
        {order.shipped_at && (
          <span>
            Enviado: {new Date(order.shipped_at).toLocaleString('es-ES')}
          </span>
        )}
        {order.stripe_payment_intent_id && (
          <a
            href={`https://dashboard.stripe.com/${order.stripe_payment_intent_id.startsWith('pi_test_') || process.env.NODE_ENV !== 'production' ? 'test/' : ''}payments/${order.stripe_payment_intent_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-ofira-violet hover:underline"
          >
            Ver en Stripe <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: items + cliente + timeline */}
        <div className="space-y-5 lg:col-span-2">
          {/* Items */}
          <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
              Artículos ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ofira-surface1">
                    {item.image_snapshot ? (
                      <Image
                        src={item.image_snapshot}
                        alt={item.name_snapshot}
                        fill
                        sizes="56px"
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
                    <div className="text-xs text-ofira-text-secondary">
                      {item.quantity}x{' '}
                      {formatMoney(item.unit_price_cents, order.currency)}
                      {item.supplier_sku_snapshot && (
                        <span className="ml-2 font-mono">
                          SKU: {item.supplier_sku_snapshot}
                        </span>
                      )}
                    </div>
                    {item.supplier_url_snapshot && (
                      <a
                        href={item.supplier_url_snapshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-ofira-violet hover:underline"
                      >
                        Proveedor <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-sm font-bold text-ofira-text">
                    {formatMoney(item.line_total_cents, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cliente + dirección */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                <User className="size-4" />
                Cliente
              </h3>
              <div className="text-sm">
                <div className="font-semibold text-ofira-text">
                  {order.shipping_name || '—'}
                </div>
                <div className="text-ofira-text-secondary">{order.email}</div>
                {order.phone && (
                  <div className="text-ofira-text-secondary">
                    {order.phone}
                  </div>
                )}
                <div className="mt-1 text-xs text-ofira-text-secondary">
                  Idioma: {order.locale?.toUpperCase() || '—'}
                </div>
              </div>
            </div>

            {address && (
              <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
                  <MapPin className="size-4" />
                  Envío
                </h3>
                <div className="text-sm text-ofira-text">
                  <div>{address.line1}</div>
                  {address.line2 && <div>{address.line2}</div>}
                  <div>
                    {address.postal_code} {address.city}
                  </div>
                  {address.region && <div>{address.region}</div>}
                  <div className="font-semibold">{address.country}</div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
              <Clock className="size-4" />
              Historial
            </h3>
            {events.length === 0 ? (
              <p className="text-xs text-ofira-text-secondary">
                Sin eventos registrados
              </p>
            ) : (
              <ol className="space-y-3">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="flex gap-3 border-l-2 border-ofira-violet/30 pl-3"
                  >
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-ofira-text">
                        {EVENT_LABELS[e.type] || e.type}
                        {e.from_status && e.to_status && (
                          <span className="ml-1 font-normal text-ofira-text-secondary">
                            ({e.from_status} → {e.to_status})
                          </span>
                        )}
                      </div>
                      {e.note && (
                        <div className="mt-0.5 text-ofira-text-secondary">
                          {e.note}
                        </div>
                      )}
                      <div className="mt-0.5 text-[10px] text-ofira-text-secondary/70">
                        {new Date(e.created_at).toLocaleString('es-ES')} ·{' '}
                        {e.created_by || 'sistema'}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Columna derecha: resumen + acciones */}
        <div className="space-y-5 lg:col-span-1">
          <div className="rounded-2xl border border-ofira-card-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
              Resumen
            </h3>
            <div className="space-y-1.5 text-sm">
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
              <div className="flex justify-between border-t border-ofira-card-border pt-2 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total_cents, order.currency)}</span>
              </div>
            </div>
          </div>

          <OrderAdminActions
            orderId={id}
            currentStatus={order.status}
            currentTracking={order.tracking_number}
            currentTrackingUrl={order.tracking_url}
            currentCarrier={order.tracking_carrier}
            totalCents={order.total_cents}
            currency={order.currency}
            canRefund={canRefund}
          />
        </div>
      </div>
    </div>
  );
}
