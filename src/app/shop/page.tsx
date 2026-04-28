import { supabaseAdmin } from '@/lib/supabase/server';
import Navbar from '@/components/landing/Navbar';
import ShopClient from './ShopClient';

const PUBLIC_COLUMNS =
  'id, type, slug, name, description, short_description, image_url, images, price, price_cents, compare_at_price_cents, currency, affiliate_url, category, badge, rating, review_count';

async function getProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PUBLIC_COLUMNS)
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Shop products fetch failed:', error);
    return [];
  }
  return data || [];
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <ShopClient products={products} />
    </>
  );
}
