import LandingHeader from '@/components/landing-page/landing-header';
import HeroSketchy from '@/components/landing-page/hero-sketchy';
// import HeroOptimized from '@/components/landing-page/hero-optimized'; // Preserved as hero-optimized-v1.tsx
import ProblemSectionOptimized from '@/components/landing-page/problem-section-optimized';
import FrustrationSection from '@/components/landing-page/frustration-section';
import OpportunitySection from '@/components/landing-page/opportunity-section';
import ProofSection from '@/components/landing-page/proof-section';
import HowItWorksOptimized from '@/components/landing-page/how-it-works-optimized';
import VideoSection from '@/components/landing-page/video-section';
import ObjectionHandlingSection from '@/components/landing-page/objection-handling-section';
import OfferSectionOptimized from '@/components/landing-page/offer-section-optimized';
import TestimonialsSection from '@/components/landing-page/testimonials-section';
import TrustedBySection from '@/components/landing-page/trusted-by-section';
import FAQ from '@/components/landing-page/faq';
import FinalCTAOptimized from '@/components/landing-page/final-cta-optimized';
import SocialProofSection from '@/components/landing-page/social-proof-section';
import CookieConsent from '@/components/landing-page/cookie-consent';
import ExitIntentPopup from '@/components/landing-page/exit-intent-popup';
import { AnimatedSection } from '@/components/landing-page/animated-section';

export default async function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-[#1acb77]/30">
      <LandingHeader />
      
      <main className="flex-1">
        {/* SECTION 1: HERO (Hook) - Russell Brunson Framework */}
        <HeroSketchy />

        {/* SECTION 2: PROBLEM (Faz o prospect se identificar) */}
        <AnimatedSection>
          <ProblemSectionOptimized />
        </AnimatedSection>

        {/* SECTION 3: FRUSTRATION (Mostra por que soluções existentes não funcionam) */}
        <AnimatedSection>
          <FrustrationSection />
        </AnimatedSection>

        {/* SECTION 4: OPPORTUNITY (Mostra que existe uma solução melhor) */}
        <AnimatedSection>
          <OpportunitySection />
        </AnimatedSection>

        {/* SECTION 5: PROOF (Mostra que a solução funciona) */}
        <AnimatedSection>
          <ProofSection />
        </AnimatedSection>

        {/* SECTION 6: HOW IT WORKS (Como funciona - 3 steps) */}
        <AnimatedSection>
          <HowItWorksOptimized />
        </AnimatedSection>

        {/* SECTION 6.5: VIDEO DEMO (Vídeo explicativo do software) */}
        <VideoSection
          videoId="Ir9bUDr4Op4"
          title="See How HIPAA Hub Works in 3 Minutes"
          description="Watch a quick demo to see how HIPAA Hub helps clinics achieve and maintain HIPAA compliance without the stress."
        />

        {/* SECTION 7: OBJECTION HANDLING (Responde objeções) */}
        <AnimatedSection>
          <ObjectionHandlingSection />
        </AnimatedSection>

        {/* SECTION 8: OFFER (Apresenta a oferta) */}
        <AnimatedSection>
          <OfferSectionOptimized />
        </AnimatedSection>

        {/* SECTION 9: TESTIMONIALS (Prova social) */}
        <AnimatedSection>
          <TestimonialsSection />
        </AnimatedSection>

        {/* SECTION 9.5: TRUSTED BY (Logos de empresas atendidas) */}
        <AnimatedSection>
          <TrustedBySection />
        </AnimatedSection>

        {/* SECTION 10: SOCIAL PROOF (G2 Awards) */}
        <AnimatedSection>
          <SocialProofSection />
        </AnimatedSection>

        {/* SECTION 11: FAQ (Responde perguntas remanescentes) */}
        <AnimatedSection>
          <FAQ />
        </AnimatedSection>

        {/* SECTION 12: FINAL CTA (Urgência + Ação) */}
        <AnimatedSection>
          <FinalCTAOptimized />
        </AnimatedSection>
      </main>
      
      {/* Cookie Consent Popup */}
      <CookieConsent />
      
      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}
