import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductCard from '@/components/shop/ProductCard';

interface FeaturedProduct {
  id: string;
  type: 'affiliate' | 'own';
  slug: string | null;
  name: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  images: string[] | null;
  price: number | null;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  currency: string | null;
  affiliate_url: string | null;
  category: string;
}

async function getFeatured(): Promise<FeaturedProduct[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'id, type, slug, name, description, short_description, image_url, images, price, price_cents, compare_at_price_cents, currency, affiliate_url, category',
    )
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(4);

  if (error) {
    console.error('FeaturedProducts fetch failed:', error);
    return [];
  }
  return (data as FeaturedProduct[]) || [];
}

export default async function FeaturedProducts() {
  const [products, t] = await Promise.all([
    getFeatured(),
    getTranslations('landing.featured'),
  ]);

  if (products.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-block rounded-full bg-ofira-surface1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ofira-violet">
              {t('eyebrow')}
            </span>
            <h2 className="text-3xl font-bold text-ofira-text sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-2 max-w-xl text-base text-ofira-text-secondary">
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ofira-violet transition-colors hover:text-ofira-violet/80"
          >
            {t('viewAll')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              type={p.type}
              slug={p.slug}
              name={p.name}
              description={p.description}
              short_description={p.short_description}
              imageUrl={p.image_url}
              images={p.images || []}
              price={p.price}
              price_cents={p.price_cents}
              compare_at_price_cents={p.compare_at_price_cents}
              currency={p.currency || 'eur'}
              affiliateUrl={p.affiliate_url}
              category={p.category}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
