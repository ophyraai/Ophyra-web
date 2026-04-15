'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Sparkles, Tag } from 'lucide-react';
import ImageUploader from './ImageUploader';
import CategoryCombobox from './CategoryCombobox';
import type { AdminProduct } from '@/types/marketplace';

const inputCls =
  'w-full rounded-lg border border-ofira-card-border bg-white px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary/60 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20';

// Sugerencias de categorías. El usuario puede elegir una o escribir la suya.
// Las primeras 6 son las "core" del sistema de diagnóstico.
const CATEGORY_SUGGESTIONS = [
  // Wellness / diagnóstico (mantienen relación con scoring)
  'sleep',
  'exercise',
  'nutrition',
  'stress',
  'productivity',
  'hydration',
  // Otras categorías de marketplace
  'belleza',
  'suplementos',
  'tecnologia',
  'wearables',
  'hogar',
  'cocina',
  'ropa-deportiva',
  'accesorios',
  'libros',
  'mente',
  'meditacion',
  'aromaterapia',
  'higiene',
  'viajes',
  'oficina',
] as const;

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminProduct;
}

interface FormState {
  type: 'affiliate' | 'own';
  name: string;
  slug: string;
  category: string;
  short_description: string;
  long_description: string;
  images: string[];
  is_active: boolean;
  sort_order: number;
  // affiliate-only
  affiliate_url: string;
  // own-only
  price_eur: string; // input en EUR; se convierte a cents al enviar
  currency: string;
  weight_grams: string;
  supplier_url: string;
  supplier_sku: string;
  supplier_notes: string;
  internal_ref: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function emptyState(initial?: AdminProduct): FormState {
  return {
    type: initial?.type || 'own',
    name: initial?.name || '',
    slug: initial?.slug || '',
    category: initial?.category || '',
    short_description: initial?.short_description || '',
    long_description: initial?.long_description || initial?.description || '',
    images: initial?.images || (initial?.image_url ? [initial.image_url] : []),
    is_active: initial?.is_active ?? false,
    sort_order: initial?.sort_order ?? 0,
    affiliate_url: initial?.affiliate_url || '',
    price_eur:
      initial?.price_cents != null
        ? (initial.price_cents / 100).toString()
        : initial?.price != null
          ? initial.price.toString()
          : '',
    currency: initial?.currency || 'eur',
    weight_grams: initial?.weight_grams != null ? initial.weight_grams.toString() : '',
    supplier_url: initial?.supplier_url || '',
    supplier_sku: initial?.supplier_sku || '',
    supplier_notes: initial?.supplier_notes || '',
    internal_ref: initial?.internal_ref || '',
  };
}

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyState(initial));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onNameBlur() {
    if (mode === 'create' && !form.slug && form.name) {
      update('slug', slugify(form.name));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Construir payload según type
    const base = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category,
      short_description: form.short_description.trim() || null,
      long_description: form.long_description.trim() || null,
      images: form.images,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    };

    let payload: Record<string, unknown>;

    if (form.type === 'affiliate') {
      payload = {
        ...base,
        type: 'affiliate' as const,
        affiliate_url: form.affiliate_url.trim(),
        price_cents: form.price_eur
          ? Math.round(parseFloat(form.price_eur) * 100)
          : null,
      };
    } else {
      const priceCents = Math.round(parseFloat(form.price_eur) * 100);
      if (!Number.isFinite(priceCents) || priceCents <= 0) {
        setError('El precio debe ser mayor que 0');
        return;
      }
      payload = {
        ...base,
        type: 'own' as const,
        price_cents: priceCents,
        currency: form.currency.toLowerCase(),
        weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
        supplier_url: form.supplier_url.trim() || null,
        supplier_sku: form.supplier_sku.trim() || null,
        supplier_notes: form.supplier_notes.trim() || null,
        internal_ref: form.internal_ref.trim() || null,
      };
    }

    setSubmitting(true);
    try {
      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  const isOwn = form.type === 'own';
  const typeLocked = mode === 'edit'; // No permitir cambiar type en edit

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm text-ofira-text-secondary hover:text-ofira-violet"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-ofira-text">
            {mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
          </h1>
        </div>
      </div>

      {/* Selector de tipo */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ofira-text">
          Tipo de producto
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={typeLocked}
            onClick={() => update('type', 'own')}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isOwn
                ? 'border-ofira-violet bg-ofira-violet/5'
                : 'border-ofira-card-border bg-white hover:border-ofira-violet/40'
            }`}
          >
            <Sparkles
              className={`mt-0.5 size-5 ${isOwn ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`}
            />
            <div>
              <div className="font-semibold text-ofira-text">Marca Ophyra</div>
              <div className="text-xs text-ofira-text-secondary">
                Producto propio. Se vende con Stripe Checkout, se procesa pedido en /admin/orders.
              </div>
            </div>
          </button>
          <button
            type="button"
            disabled={typeLocked}
            onClick={() => update('type', 'affiliate')}
            className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              !isOwn
                ? 'border-ofira-violet bg-ofira-violet/5'
                : 'border-ofira-card-border bg-white hover:border-ofira-violet/40'
            }`}
          >
            <Tag
              className={`mt-0.5 size-5 ${!isOwn ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`}
            />
            <div>
              <div className="font-semibold text-ofira-text">Afiliado</div>
              <div className="text-xs text-ofira-text-secondary">
                Recomendación con enlace externo (Amazon, etc.). El usuario sale del sitio.
              </div>
            </div>
          </button>
        </div>
        {typeLocked && (
          <p className="mt-2 text-xs text-ofira-text-secondary">
            El tipo no se puede cambiar después de crear el producto.
          </p>
        )}
      </div>

      {/* Sección: básico */}
      <Section title="Información básica">
        <Field label="Nombre" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={onNameBlur}
            className={inputCls}
            placeholder="ej. Cinta de correr plegable Pro"
          />
        </Field>
        <Field label="Slug (URL)" required hint="lowercase con guiones, ej: cinta-correr-pro">
          <input
            type="text"
            required
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className={`${inputCls} font-mono text-sm`}
            placeholder="cinta-correr-pro"
          />
        </Field>
        <Field
          label="Categoría"
          required
          hint="Elige una de la lista o escribe la tuya (mín 2 caracteres)."
        >
          <CategoryCombobox
            value={form.category}
            onChange={(v) => update('category', v)}
            suggestions={CATEGORY_SUGGESTIONS}
            placeholder="ej. belleza, electrónica, ropa deportiva..."
          />
        </Field>
        <Field label="Descripción corta" hint="Aparece en la card del shop. Máx 280 caracteres.">
          <textarea
            value={form.short_description}
            onChange={(e) => update('short_description', e.target.value)}
            maxLength={280}
            rows={2}
            className={inputCls}
            placeholder="Una frase que enganche."
          />
        </Field>
        <Field label="Descripción larga" hint="Aparece en la página de detalle del producto.">
          <textarea
            value={form.long_description}
            onChange={(e) => update('long_description', e.target.value)}
            rows={6}
            className={inputCls}
            placeholder="Características, beneficios, instrucciones..."
          />
        </Field>
      </Section>

      {/* Imágenes */}
      <Section title="Imágenes">
        <ImageUploader
          value={form.images}
          onChange={(urls) => update('images', urls)}
        />
      </Section>

      {/* Sección: precio + stripe (own) o URL (affiliate) */}
      {isOwn ? (
        <>
          <Section title="Precio y envío">
            <Field label="Precio (EUR)" required hint="Sin IVA. Stripe Tax añade el IVA en checkout.">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.price_eur}
                onChange={(e) => update('price_eur', e.target.value)}
                className={inputCls}
                placeholder="29.90"
              />
            </Field>
            <Field label="Peso (gramos)" hint="Solo informativo, no se cobra en envío.">
              <input
                type="number"
                min="0"
                value={form.weight_grams}
                onChange={(e) => update('weight_grams', e.target.value)}
                className={inputCls}
                placeholder="500"
              />
            </Field>
          </Section>

          <Section title="Información de proveedor (privada)">
            <p className="-mt-2 mb-4 text-xs text-ofira-text-secondary">
              Estos campos NO son visibles al cliente. Sirven para que tú puedas pedirle el
              producto al proveedor cuando llegue un pedido.
            </p>
            <Field label="URL del proveedor" hint="ej. AliExpress, Alibaba">
              <input
                type="url"
                value={form.supplier_url}
                onChange={(e) => update('supplier_url', e.target.value)}
                className={inputCls}
                placeholder="https://aliexpress.com/item/..."
              />
            </Field>
            <Field label="SKU del proveedor">
              <input
                type="text"
                value={form.supplier_sku}
                onChange={(e) => update('supplier_sku', e.target.value)}
                className={inputCls}
                placeholder="ABC-123"
              />
            </Field>
            <Field label="Referencia interna">
              <input
                type="text"
                value={form.internal_ref}
                onChange={(e) => update('internal_ref', e.target.value)}
                className={inputCls}
                placeholder="OPH-001"
              />
            </Field>
            <Field label="Notas">
              <textarea
                value={form.supplier_notes}
                onChange={(e) => update('supplier_notes', e.target.value)}
                rows={3}
                className={inputCls}
                placeholder="Color preferido, variante específica, contacto del proveedor..."
              />
            </Field>
          </Section>
        </>
      ) : (
        <Section title="Enlace de afiliación">
          <Field
            label="URL de afiliado"
            required
            hint="Aquí va el enlace con tu tag de afiliado (Amazon, etc.)"
          >
            <input
              type="url"
              required
              value={form.affiliate_url}
              onChange={(e) => update('affiliate_url', e.target.value)}
              className={inputCls}
              placeholder="https://amazon.es/dp/XXXX?tag=ophyra-21"
            />
          </Field>
          <Field
            label="Precio (EUR)"
            hint="Solo display. No se cobra desde Ophyra."
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price_eur}
              onChange={(e) => update('price_eur', e.target.value)}
              className={inputCls}
              placeholder="29.90"
            />
          </Field>
        </Section>
      )}

      {/* Visibilidad */}
      <Section title="Visibilidad">
        <Field label="Orden" hint="Los más bajos aparecen primero">
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => update('sort_order', Number(e.target.value) as never)}
            className={`${inputCls} w-32`}
          />
        </Field>
        <label className="flex items-start gap-3 rounded-xl border border-ofira-card-border bg-white p-4">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="mt-1 size-4 rounded border-ofira-card-border text-ofira-violet focus:ring-ofira-violet"
          />
          <div>
            <div className="font-medium text-ofira-text">Activo</div>
            <div className="text-xs text-ofira-text-secondary">
              Si está activo aparecerá en /shop. Déjalo desactivado mientras lo preparas.
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
          href="/admin/products"
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
          {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
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
