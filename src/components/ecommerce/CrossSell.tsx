'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase/client';

interface CrossSellProduct {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  images: string[] | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  currency: string;
}

export default function CrossSell({ excludeIds }: { excludeIds: string[] }) {
  const t = useTranslations('cart.crossSell');
  const { add } = useCart();
  const [products, setProducts] = useState<CrossSellProduct[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('products')
      .select('id, slug, name, image_url, images, price_cents, compare_at_price_cents, currency')
      .eq('is_active', true)
      .eq('type', 'own')
      .not('price_cents', 'is', null)
      .order('sort_order')
      .limit(10)
      .then(({ data }) => {
        if (data) {
          const filtered = data.filter((p) => !excludeIds.includes(p.id)).slice(0, 3);
          setProducts(filtered as CrossSellProduct[]);
        }
      });
  }, [excludeIds]);

  if (products.length === 0) return null;

  function handleAdd(p: CrossSellProduct) {
    add({
      product_id: p.id,
      slug: p.slug,
      name: p.name,
      image: (p.images && p.images[0]) || p.image_url,
      unit_price_cents: p.price_cents,
      compare_at_price_cents: p.compare_at_price_cents,
      currency: p.currency || 'eur',
      quantity: 1,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="mt-6 rounded-2xl border border-ofira-card-border bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ofira-text-secondary">
        {t('title')}
      </h3>
      <div className="space-y-3">
        {products.map((p) => {
          const thumb = (p.images && p.images[0]) || p.image_url;
          const added = addedId === p.id;
          return (
            <div key={p.id} className="flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ofira-surface1">
                {thumb ? (
                  <Image src={thumb} alt={p.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Package className="size-6 text-ofira-text-secondary/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ofira-text truncate">{p.name}</p>
                <p className="text-sm font-bold text-ofira-text">
                  {new Intl.NumberFormat('es-ES', { style: 'currency', currency: (p.currency || 'eur').toUpperCase() }).format(p.price_cents / 100)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(p)}
                className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all ${
                  added
                    ? 'border-emerald-400 bg-emerald-500 text-white'
                    : 'border-ofira-card-border bg-white text-ofira-text hover:bg-ofira-surface1'
                }`}
              >
                {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
