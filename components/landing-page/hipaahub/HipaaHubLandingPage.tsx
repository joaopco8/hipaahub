'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Hero from './Hero';
import SolutionSection from './SolutionSection';
import StatsSection from './StatsSection';
import HowItWorks from './HowItWorks';
import VideoTutorial from './VideoTutorial';
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

type AppView =
  | 'home'
  | 'blog'
  | 'solutions'
  | 'platform'
  | 'research'
  | 'intelligence-reports'
  | 'regulatory-analysis'
  | 'methodology'
  | 'industries'
  | 'company'
  | 'assessment'
  | 'risk-assessment'
  | 'policy-generator'
  | 'gap-analysis'
  | 'breach-builder'
  | 'roadmap'
  | 'reporting'
  | 'independent-practices'
  | 'implementation-services'
  | 'compliance-assessment'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'security'
  | 'hipaa-baa';

const HipaaHubLandingPage: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useState<AppView>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const navigateTo = (newView: AppView, post?: any) => {
    if (post) setSelectedPost(post);
    setView(newView);
    window.scrollTo(0, 0);
  };

  const handleAssessmentClick = () => {
    router.push('/onboarding');
  };

  const isLegalView = ['privacy-policy', 'terms-of-service', 'security', 'hipaa-baa'].includes(view);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isLegalView && (
        <Navbar onNavigate={(v) => navigateTo(v as AppView)} />
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

            <Hero onAssessmentClick={handleAssessmentClick} />
            <SolutionSection />
            <StatsSection />
            <HowItWorks />
            <VideoTutorial />
            <WhatsIncluded />
            <SocialProof />
            <BlogSection onReadMore={(post) => navigateTo('blog', post)} />
            <AuditGuarantee />
            <PricingSection />
            <FAQSection />
            <BottomCTA onAssessmentClick={handleAssessmentClick} />
          </>
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

        {/* Other views coming soon */}
        {view !== 'home' && !isLegalView && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Coming Soon</h1>
              <button
                onClick={() => setView('home')}
                className="text-cisco-blue hover:underline"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </main>

      {!isLegalView && (
        <Footer onNavigateLegal={(v) => navigateTo(v)} />
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
    </div>
  );
};

export default HipaaHubLandingPage;
