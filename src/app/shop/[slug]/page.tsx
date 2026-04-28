import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import { createSupabaseServer, supabaseAdmin } from '@/lib/supabase/server';
import ProductDetailClient from './ProductDetailClient';
import ReviewSection from '@/components/shop/ReviewSection';
import ReviewForm from '@/components/shop/ReviewForm';
import type { Review } from '@/types/marketplace';

interface Props {
  params: Promise<{ slug: string }>;
}

// Columnas explícitas — NUNCA exponer supplier_*, stripe_*
const PUBLIC_COLUMNS =
  'id, type, name, slug, category, short_description, long_description, description, image_url, images, price, price_cents, compare_at_price_cents, currency, affiliate_url, is_active, rating, review_count';

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

  // Fetch reviews: real first, then seed, max 20
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('is_seed', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(20);

  const reviewList: Review[] = (reviews || []) as Review[];

  // Check if current user can leave a review (purchased + not yet reviewed)
  let canReview = false;
  let userId: string | null = null;
  let userName: string | undefined;
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      // Check if user bought this product
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('order_id')
        .eq('product_id', product.id);
      if (orderItems && orderItems.length > 0) {
        const orderIds = orderItems.map((oi) => oi.order_id);
        const { data: orders } = await supabaseAdmin
          .from('orders')
          .select('id')
          .in('id', orderIds)
          .eq('user_id', user.id)
          .in('status', ['paid', 'processing', 'shipped', 'delivered'])
          .limit(1);
        if (orders && orders.length > 0) {
          // Check not already reviewed
          const { data: existing } = await supabaseAdmin
            .from('reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .eq('is_seed', false)
            .maybeSingle();
          canReview = !existing;
        }
      }
      // Get user name for form
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('name')
        .eq('auth_id', user.id)
        .maybeSingle();
      userName = profile?.name || user.email?.split('@')[0];
    }
  } catch {
    // Not logged in — fine
  }

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

  if (product.rating != null && product.review_count > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

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
        <ProductDetailClient
          product={product}
          rating={product.rating}
          reviewCount={product.review_count}
        />
        <ReviewSection
          reviews={reviewList}
          rating={product.rating}
          reviewCount={product.review_count}
          productId={product.id}
          canReview={canReview}
          userId={userId}
        />
        {canReview && userId && (
          <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
            <ReviewForm productId={product.id} userName={userName} />
          </div>
        )}
      </div>
    </>
  );
}
