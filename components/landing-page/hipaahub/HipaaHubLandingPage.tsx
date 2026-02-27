'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Hero from './Hero';
import SolutionSection from './SolutionSection';
import StatsSection from './StatsSection';
import HowItWorks from './HowItWorks';
import HowItWorksSteps from './HowItWorksSteps';
import WhatsIncluded from './WhatsIncluded';
import SocialProof from './SocialProof';
import BlogSection from './BlogSection';
import AuditGuarantee from './AuditGuarantee';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import BottomCTA from './BottomCTA';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';
import SecurityPage from './SecurityPage';
import HipaaBAAPage from './HipaaBAAPage';
import DemoRequestModal from './DemoRequestModal';
import CompanyPage from './CompanyPage';
import BlogPage from './BlogPage';
import ResearchPage from './ResearchPage';
import PlatformPage from './PlatformPage';

type AppView =
  | 'home'
  | 'blog'
  | 'platform'
  | 'research'
  | 'company'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'security'
  | 'hipaa-baa';

const HipaaHubLandingPage: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useState<AppView>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const navigateTo = (newView: AppView, post?: any) => {
    if (post) setSelectedPost(post);
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleAssessmentClick = () => {
    router.push('/onboarding');
  };

  const isLegalView = ['privacy-policy', 'terms-of-service', 'security', 'hipaa-baa'].includes(view);
  const isContentView = ['blog', 'company', 'research', 'platform'].includes(view);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {(!isLegalView) && (
        <Navbar onNavigate={(v) => navigateTo(v as AppView)} onDemoClick={() => setIsDemoModalOpen(true)} />
      )}

      <main className="flex-grow">
        {view === 'home' && (
          <>
            <div className="bg-white border-b py-3 px-4 md:px-12 text-[10px] text-gray-400">
              <div className="max-w-7xl mx-auto flex items-center space-x-2 font-thin">
                <button onClick={() => setView('home')} className="hover:text-cisco-blue transition-colors">Healthcare administration</button>
                <span className="text-gray-200">/</span>
                <span>Clinical governance</span>
                <span className="text-gray-200">/</span>
                <span className="text-cisco-navy font-thin">HIPAA continuous compliance framework</span>
              </div>
            </div>

            <Hero onAssessmentClick={handleAssessmentClick} onDemoClick={() => setIsDemoModalOpen(true)} />
            <SolutionSection />
            <StatsSection />
            <HowItWorks />
            <HowItWorksSteps />
            <WhatsIncluded onDemoClick={() => setIsDemoModalOpen(true)} />
            <SocialProof />
            <BlogSection onReadMore={(post) => navigateTo('blog', post)} />
            <AuditGuarantee />
            <PricingSection onDemoClick={() => setIsDemoModalOpen(true)} />
            <FAQSection />
            <BottomCTA onAssessmentClick={handleAssessmentClick} onDemoClick={() => setIsDemoModalOpen(true)} />
          </>
        )}

        {view === 'blog' && (
          <BlogPage
            onBack={() => navigateTo('home')}
            onReadMore={(post) => navigateTo('blog', post)}
          />
        )}

        {view === 'company' && (
          <CompanyPage onBack={() => navigateTo('home')} />
        )}

        {view === 'research' && (
          <ResearchPage onBack={() => navigateTo('home')} />
        )}

        {view === 'platform' && (
          <PlatformPage onBack={() => navigateTo('home')} />
        )}

        {view === 'privacy-policy' && (
          <PrivacyPolicyPage onBack={() => navigateTo('home')} />
        )}

        {view === 'terms-of-service' && (
          <TermsOfServicePage onBack={() => navigateTo('home')} />
        )}

        {view === 'security' && (
          <SecurityPage onBack={() => navigateTo('home')} />
        )}

        {view === 'hipaa-baa' && (
          <HipaaBAAPage onBack={() => navigateTo('home')} />
        )}
      </main>

      {!isLegalView && !isContentView && (
        <Footer onNavigateLegal={(v) => navigateTo(v)} />
      )}
      {isContentView && (
        <footer className="bg-[#0e274e] py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Privacy Policy', view: 'privacy-policy' as AppView },
                { label: 'Terms of Service', view: 'terms-of-service' as AppView },
                { label: 'Security', view: 'security' as AppView },
                { label: 'HIPAA BAA', view: 'hipaa-baa' as AppView },
              ].map(({ label, view: v }) => (
                <button
                  key={v}
                  onClick={() => navigateTo(v)}
                  className="text-xs font-thin text-gray-400 hover:text-white transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      )}

      {isLegalView && (
        <footer className="bg-[#0e274e] py-8 px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400 font-thin">© 2026 HIPAA Hub Health, Inc. All rights reserved.</p>
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Privacy Policy', view: 'privacy-policy' as AppView },
                { label: 'Terms of Service', view: 'terms-of-service' as AppView },
                { label: 'Security', view: 'security' as AppView },
                { label: 'HIPAA BAA', view: 'hipaa-baa' as AppView },
              ].map(({ label, view: v }) => (
                <button
                  key={v}
                  onClick={() => navigateTo(v)}
                  className={`text-xs font-thin transition-colors ${view === v ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      )}

      <CookieConsent />
      <DemoRequestModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  );
};

export default HipaaHubLandingPage;
