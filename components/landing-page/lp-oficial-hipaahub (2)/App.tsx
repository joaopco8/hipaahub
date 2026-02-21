import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SolutionSection from './components/SolutionSection';
import StatsSection from './components/StatsSection';
import HowItWorks from './components/HowItWorks';
import VideoTutorial from './components/VideoTutorial';
import WhatsIncluded from './components/WhatsIncluded';
import SocialProof from './components/SocialProof';
import MeetOurTeam from './components/MeetOurTeam';
import BlogSection from './components/BlogSection';
import AuditGuarantee from './components/AuditGuarantee';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import BottomCTA from './components/BottomCTA';
import Footer from './components/Footer';
import BlogPostPage from './components/BlogPostPage';
import IndependentPracticesPage from './components/IndependentPracticesPage';
import ImplementationServicesPage from './components/ImplementationServicesPage';
import ComplianceAssessmentPage from './components/ComplianceAssessmentPage';
import PlatformPage from './components/PlatformPage';
import ResearchReportsPage from './components/ResearchReportsPage';
import IntelligenceReportsPage from './components/IntelligenceReportsPage';
import RegulatoryAnalysisPage from './components/RegulatoryAnalysisPage';
import MethodologyPage from './components/MethodologyPage';
import IndustriesPage from './components/IndustriesPage';
import CompanyPage from './components/CompanyPage';
import AssessmentPage from './components/AssessmentPage';
import RiskAssessmentPage from './components/RiskAssessmentPage';
import PolicyGeneratorPage from './components/PolicyGeneratorPage';
import GapAnalysisPage from './components/GapAnalysisPage';
import BreachBuilderPage from './components/BreachBuilderPage';
import RoadmapPage from './components/RoadmapPage';
import ReportingPage from './components/ReportingPage';
import CookieConsent from './components/CookieConsent';

type AppView = 'home' | 'blog' | 'solutions' | 'platform' | 'research' | 'intelligence-reports' | 'regulatory-analysis' | 'methodology' | 'industries' | 'company' | 'assessment' | 'risk-assessment' | 'policy-generator' | 'gap-analysis' | 'breach-builder' | 'roadmap' | 'reporting' | 'independent-practices' | 'implementation-services' | 'compliance-assessment';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const navigateTo = (newView: AppView, post?: any) => {
    if (post) setSelectedPost(post);
    setView(newView);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar 
        onNavigate={(v) => navigateTo(v as AppView)}
      />
      
      <main className="flex-grow">
        {view === 'home' && (
          <>
            <div className="bg-white border-b py-3 px-4 md:px-12 text-[10px] text-gray-400">
              <div className="max-w-7xl mx-auto flex items-center space-x-2 font-normal">
                <button onClick={() => setView('home')} className="hover:text-cisco-blue transition-colors">Healthcare administration</button>
                <span className="text-gray-200">/</span>
                <span>Clinical governance</span>
                <span className="text-gray-200">/</span>
                <span className="text-cisco-navy font-semibold">HIPAA continuous compliance framework</span>
              </div>
            </div>

            <Hero onAssessmentClick={() => navigateTo('assessment')} />
            <SolutionSection />
            <StatsSection />
            <HowItWorks />
            <VideoTutorial />
            <WhatsIncluded />
            <SocialProof />
            <MeetOurTeam />
            <BlogSection onReadMore={(post) => navigateTo('blog', post)} />
            <AuditGuarantee />
            <PricingSection />
            <FAQSection />
            <BottomCTA onAssessmentClick={() => navigateTo('assessment')} />
          </>
        )}

        {/* Specific Solution Pages */}
        {view === 'independent-practices' && <IndependentPracticesPage onBack={() => setView('home')} />}
        {view === 'implementation-services' && <ImplementationServicesPage onBack={() => setView('home')} />}
        {view === 'compliance-assessment' && <ComplianceAssessmentPage onBack={() => setView('home')} onStartForm={() => setView('assessment')} />}
        
        {/* Research Specific Pages */}
        {view === 'intelligence-reports' && <IntelligenceReportsPage onBack={() => setView('home')} />}
        {view === 'regulatory-analysis' && <RegulatoryAnalysisPage onBack={() => setView('home')} />}
        {view === 'research' && <ResearchReportsPage onBack={() => setView('home')} />}

        {/* General View Pages */}
        {view === 'solutions' && <ImplementationServicesPage onBack={() => setView('home')} />}
        {view === 'industries' && <IndependentPracticesPage onBack={() => setView('home')} />}
        {view === 'assessment' && <AssessmentPage onBack={() => setView('home')} />}
        
        {view === 'platform' && <PlatformPage onBack={() => setView('home')} />}
        {view === 'methodology' && <MethodologyPage onBack={() => setView('home')} />}
        {view === 'company' && <CompanyPage onBack={() => setView('home')} />}
        {view === 'blog' && <BlogPostPage post={selectedPost} onBack={() => setView('home')} />}
        
        {/* Platform Specific Capability Pages */}
        {view === 'risk-assessment' && <RiskAssessmentPage onBack={() => setView('home')} />}
        {view === 'policy-generator' && <PolicyGeneratorPage onBack={() => setView('home')} />}
        {view === 'gap-analysis' && <GapAnalysisPage onBack={() => setView('home')} />}
        {view === 'breach-builder' && <BreachBuilderPage onBack={() => setView('home')} />}
        {view === 'roadmap' && <RoadmapPage onBack={() => setView('home')} />}
        {view === 'reporting' && <ReportingPage onBack={() => setView('home')} />}
      </main>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default App;