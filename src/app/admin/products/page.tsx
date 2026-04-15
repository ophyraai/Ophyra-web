import Link from 'next/link';
import Image from 'next/image';
import { Plus, Sparkles, Tag, Pencil, Package } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductRowActions from './ProductRowActions';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ type?: string }>;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string | null;
  type: 'affiliate' | 'own';
  category: string;
  price_cents: number | null;
  price: number | null;
  currency: string;
  is_active: boolean;
  image_url: string | null;
  images: string[];
  affiliate_url: string | null;
  stripe_price_id: string | null;
}

async function getProducts(typeFilter?: string): Promise<ProductRow[]> {
  let q = supabaseAdmin
    .from('products')
    .select(
      'id, name, slug, type, category, price_cents, price, currency, is_active, image_url, images, affiliate_url, stripe_price_id',
    )
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (typeFilter === 'own' || typeFilter === 'affiliate') {
    q = q.eq('type', typeFilter);
  }

  const { data, error } = await q;
  if (error) {
    console.error('admin products list error:', error);
    return [];
  }
  return (data as ProductRow[]) || [];
}

function formatMoney(cents: number | null, fallback: number | null, currency: string) {
  const value = cents != null ? cents / 100 : fallback;
  if (value == null) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value);
}

function getThumbnail(p: ProductRow): string | null {
  if (p.images && p.images.length > 0) return p.images[0];
  return p.image_url;
}

export default async function AdminProductsPage(props: Props) {
  const params = await props.searchParams;
  const typeFilter = params.type;
  const products = await getProducts(typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-ofira-text">Productos</h1>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Gestiona productos de marca propia y enlaces de afiliación.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ofira-violet/90"
        >
          <Plus className="size-4" />
          Nuevo producto
        </Link>
      </div>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/products"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            !typeFilter
              ? 'border-ofira-violet bg-ofira-violet text-white'
              : 'border-ofira-card-border bg-white text-ofira-text-secondary hover:border-ofira-violet'
          }`}
        >
          Todos
        </Link>
        <Link
          href="/admin/products?type=own"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            typeFilter === 'own'
              ? 'border-ofira-violet bg-ofira-violet text-white'
              : 'border-ofira-card-border bg-white text-ofira-text-secondary hover:border-ofira-violet'
          }`}
        >
          <Sparkles className="size-3.5" />
          Marca Ophyra
        </Link>
        <Link
          href="/admin/products?type=affiliate"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            typeFilter === 'affiliate'
              ? 'border-ofira-violet bg-ofira-violet text-white'
              : 'border-ofira-card-border bg-white text-ofira-text-secondary hover:border-ofira-violet'
          }`}
        >
          <Tag className="size-3.5" />
          Afiliados
        </Link>
      </div>

      {/* Tabla de productos */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ofira-card-border bg-white p-16 text-center">
          <Package className="mx-auto size-12 text-ofira-text-secondary/40" />
          <h3 className="mt-4 text-lg font-semibold text-ofira-text">
            Aún no hay productos
          </h3>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Crea tu primer producto haciendo click en &quot;Nuevo producto&quot; arriba.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ofira-card-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ofira-surface1 text-left text-xs uppercase tracking-wider text-ofira-text-secondary">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ofira-card-border">
              {products.map((p) => {
                const thumb = getThumbnail(p);
                return (
                  <tr key={p.id} className="hover:bg-ofira-surface1/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-ofira-surface1">
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="size-5 text-ofira-text-secondary/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-ofira-text">
                            {p.name}
                          </div>
                          {p.slug && (
                            <div className="truncate font-mono text-xs text-ofira-text-secondary">
                              /{p.slug}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.type === 'own' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ofira-violet/10 px-2 py-0.5 text-xs font-semibold text-ofira-violet">
                          <Sparkles className="size-3" />
                          Marca Ophyra
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Tag className="size-3" />
                          Afiliado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-ofira-text-secondary">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 font-medium text-ofira-text">
                      {formatMoney(p.price_cents, p.price, p.currency || 'eur')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.is_active ? 'Activo' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ofira-text-secondary hover:bg-ofira-surface1 hover:text-ofira-text"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </Link>
                        <ProductRowActions
                          id={p.id}
                          name={p.name}
                          isActive={p.is_active}
                        />
                      </div>
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
