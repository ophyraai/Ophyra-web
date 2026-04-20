import Navbar from '@/components/landing/Navbar';
import HeroV2 from '@/components/landing/HeroV2';
import SocialStats from '@/components/landing/SocialStats';
import SocialEmbed from '@/components/landing/SocialEmbed';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import FeaturedProducts from '@/components/landing/FeaturedProducts';
import HabitTip from '@/components/landing/HabitTip';
import CommunityGrowth from '@/components/landing/CommunityGrowth';
import SocialProof from '@/components/landing/SocialProof';
import DiagnosisPreview from '@/components/landing/DiagnosisPreview';
import Footer from '@/components/landing/Footer';
import WaveDivider from '@/components/ui/WaveDivider';

export default function Home() {
  return (
    <main className="relative bg-ofira-bg">
      <Navbar />
      <HeroV2 />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <div className="section-alt">
        <FeaturedProducts />
      </div>
      <WaveDivider fromColor="#f0faf8" toColor="#ffffff" flip />
      <SocialStats />
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <div className="section-alt">
        <SocialEmbed />
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
      <WaveDivider fromColor="#ffffff" toColor="#f0faf8" />
      <div className="section-alt">
        <Footer />
      </div>
    </main>
  );
}
