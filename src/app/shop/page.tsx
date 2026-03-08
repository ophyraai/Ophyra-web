'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShoppingBag, Bell } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductCard from '@/components/shop/ProductCard';

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  affiliate_url: string;
  category: string;
}

export default function ShopPage() {
  const t = useTranslations('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products${category !== 'all' ? `?category=${category}` : ''}`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-ofira-bg px-4 pb-8 pt-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-ofira-text">{t('title')}</h1>
          </motion.div>

          <CategoryFilter selected={category} onChange={setCategory} />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ofira-violet border-t-transparent" />
            </div>
          ) : products.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(p => (
                <ProductCard key={p.id} {...p} imageUrl={p.image_url} affiliateUrl={p.affiliate_url} />
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
              <h2 className="mb-2 text-xl font-bold text-ofira-text">{t('comingSoon')}</h2>
              <p className="mb-6 max-w-md text-ofira-text-secondary">{t('comingSoonDesc')}</p>
              <button className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white hover:bg-ofira-violet/90">
                <Bell className="size-4" />
                {t('notify')}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
