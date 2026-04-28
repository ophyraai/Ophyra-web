'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShoppingBag, Bell, Sparkles, Tag } from 'lucide-react';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductCard from '@/components/shop/ProductCard';

interface Product {
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
  badge: string | null;
  rating: number | null;
  review_count: number;
}

type TypeFilter = 'all' | 'own' | 'affiliate';

export default function ShopClient({ products }: { products: Product[] }) {
  const t = useTranslations('shop');
  const [category, setCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      return true;
    });
  }, [products, category, typeFilter]);

  return (
    <div className="min-h-screen bg-ofira-bg px-4 pb-8 pt-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-ofira-text">{t('title')}</h1>
          <p className="mt-1 text-sm text-ofira-text-secondary">
            Productos de marca propia y recomendaciones cuidadosamente seleccionadas.
          </p>
        </motion.div>

        {/* Tabs por tipo */}
        <div className="mb-4 flex flex-wrap gap-2">
          <TypeTab
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            Todos
          </TypeTab>
          <TypeTab
            active={typeFilter === 'own'}
            onClick={() => setTypeFilter('own')}
          >
            <Sparkles className="size-3.5" />
            Marca Ophyra
          </TypeTab>
          <TypeTab
            active={typeFilter === 'affiliate'}
            onClick={() => setTypeFilter('affiliate')}
          >
            <Tag className="size-3.5" />
            Recomendaciones
          </TypeTab>
        </div>

        <CategoryFilter selected={category} onChange={setCategory} />

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
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
                badge={p.badge}
                rating={p.rating}
                review_count={p.review_count}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 flex flex-col items-center text-center"
          >
            <div className="mb-6 rounded-2xl bg-ofira-surface1 p-6">
              <ShoppingBag className="size-12 text-ofira-violet" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-ofira-text">
              {t('comingSoon')}
            </h2>
            <p className="mb-6 max-w-md text-ofira-text-secondary">
              {t('comingSoonDesc')}
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white hover:bg-ofira-violet/90">
              <Bell className="size-4" />
              {t('notify')}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TypeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-ofira-violet bg-ofira-violet text-white'
          : 'border-ofira-card-border bg-white text-ofira-text-secondary hover:border-ofira-violet hover:text-ofira-text'
      }`}
    >
      {children}
    </button>
  );
}
