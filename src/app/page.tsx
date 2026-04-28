import { supabaseAdmin } from '@/lib/supabase/server';
import Navbar from '@/components/landing/Navbar';
import HeroV2 from '@/components/landing/HeroV2';
import HeroCards from '@/components/landing/HeroCards';
import SocialStats from '@/components/landing/SocialStats';
import SocialEmbed from '@/components/landing/SocialEmbed';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import ShopSection from '@/components/landing/ShopSection';
import TrustBadges from '@/components/ecommerce/TrustBadges';
import HabitTip from '@/components/landing/HabitTip';
import CommunityGrowth from '@/components/landing/CommunityGrowth';
import SocialProof from '@/components/landing/SocialProof';
import DiagnosisPreview from '@/components/landing/DiagnosisPreview';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import WaveDivider from '@/components/ui/WaveDivider';

const PRODUCT_COLUMNS =
  'id, type, slug, name, description, short_description, image_url, images, price, price_cents, compare_at_price_cents, currency, affiliate_url, category, is_featured, created_at, badge, rating, review_count';

async function getHeroProducts() {
  // Try featured first, fall back to any active products
  const { data: featured } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, image_url, images, price_cents, compare_at_price_cents, price, category, currency, badge, rating, review_count')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('sort_order')
    .limit(3);
  if (featured && featured.length > 0) return featured;

  const { data } = await supabaseAdmin
    .from('products')
    .select('id, name, slug, image_url, images, price_cents, compare_at_price_cents, price, category, currency, badge, rating, review_count')
    .eq('is_active', true)
    .order('sort_order')
    .limit(3);
  return data || [];
}

async function getAllProducts() {
  const { data } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('is_active', true)
    .order('sort_order')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function Home() {
  const [heroProducts, allProducts] = await Promise.all([
    getHeroProducts(),
    getAllProducts(),
  ]);

  return (
    <main className="relative bg-ofira-bg">
      <Navbar />
      <HeroV2 />
      <HeroCards products={heroProducts} />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <SocialStats />
      <WaveDivider fromColor="#f0faf8" toColor="#ffffff" flip />
      <SocialEmbed />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <div className="section-alt">
        <ShopSection products={allProducts} />
      </div>
      <div className="section-alt">
        <div className="px-4 pb-16 sm:px-6">
          <TrustBadges />
        </div>
      </div>
      <WaveDivider fromColor="#f0faf8" toColor="#ffffff" flip />
      <HowItWorksV2 />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" flip />
      <HabitTip />
      <WaveDivider fromColor="#ffffff" toColor="#ffffff" />
      <SocialProof />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <DiagnosisPreview />
      <WaveDivider fromColor="#f0faf8" toColor="#ffffff" flip />
      <CommunityGrowth />
      <FAQ />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <div className="section-alt">
        <Footer />
      </div>
    </main>
  );
}
