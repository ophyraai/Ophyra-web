import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Columnas explícitas — NUNCA exponer supplier_*, stripe_*
const PUBLIC_COLUMNS =
  'id, type, name, slug, category, short_description, long_description, description, image_url, images, price, price_cents, currency, affiliate_url, is_active';

async function getProduct(slug: string) {
  const { data } = await supabaseAdmin
    .from('products')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return data;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: 'Producto no encontrado · Ophyra' };
  }

  return {
    title: `${product.name} · Ophyra Shop`,
    description: product.short_description || product.description || undefined,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
      images: product.image_url ? [product.image_url] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductDetailPage(props: Props) {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  // schema.org Product JSON-LD — se lo comen Google, Bing, Pinterest, etc. y
  // habilita rich results (precio, disponibilidad) en SERPs.
  const priceValue =
    product.price_cents != null
      ? (product.price_cents / 100).toFixed(2)
      : product.price != null
        ? product.price.toFixed(2)
        : null;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description:
      product.short_description ||
      product.long_description ||
      product.description ||
      undefined,
    image: images.length > 0 ? images : undefined,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.type === 'own' ? 'Ophyra' : 'Ophyra (afiliado)',
    },
    category: product.category,
  };

  if (priceValue) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: priceValue,
      priceCurrency: (product.currency || 'eur').toUpperCase(),
      availability: 'https://schema.org/InStock',
      url: `${baseUrl}/shop/${product.slug}`,
      ...(product.type === 'affiliate' &&
        product.affiliate_url && { seller: { '@type': 'Organization', name: 'Vendedor afiliado' } }),
    };
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        // Seguro: no contiene input de usuario, solo datos de producto del dueño
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-ofira-bg pt-20">
        <ProductDetailClient product={product} />
      </div>
    </>
  );
}
