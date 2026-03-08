import Navbar from '@/components/landing/Navbar';
import HeroV2 from '@/components/landing/HeroV2';
import SocialStats from '@/components/landing/SocialStats';
import SocialEmbed from '@/components/landing/SocialEmbed';
import HowItWorksV2 from '@/components/landing/HowItWorksV2';
import HabitTip from '@/components/landing/HabitTip';
import CommunityGrowth from '@/components/landing/CommunityGrowth';
import SocialProof from '@/components/landing/SocialProof';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="bg-ofira-bg">
      <Navbar />
      <HeroV2 />
      <div className="section-alt">
        <SocialStats />
      </div>
      <SocialEmbed />
      <HowItWorksV2 />
      <div className="section-alt">
        <HabitTip />
      </div>
      <CommunityGrowth />
      <SocialProof />
      <div className="section-alt">
        <Footer />
      </div>
    </main>
  );
}
