import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import Footer from '@/components/landing/Footer';
import CursorGlow from '@/components/ui/CursorGlow';

export default function Home() {
  return (
    <main className="bg-ofira-bg">
      <CursorGlow />
      <div className="mx-auto max-w-6xl">
        <Hero />
        <HowItWorks />
        <SocialProof />
      </div>
      <Footer />
    </main>
  );
}
