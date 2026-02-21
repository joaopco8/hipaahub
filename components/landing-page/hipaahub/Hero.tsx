import React from 'react';

const Hero: React.FC<{ onAssessmentClick?: () => void }> = ({ onAssessmentClick }) => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] w-full bg-cisco-navy overflow-hidden flex items-center py-20 md:py-0">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/images/hero-background.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      {/* Background visual elements overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-cisco-blue/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto w-full px-4 md:pl-0 md:pr-12">
        <div className="text-white max-w-5xl">
          <div className="animate-reveal [animation-delay:200ms] opacity-0">
            <p className="text-sm md:text-lg font-thin mb-4 md:mb-6 text-cisco-blue">Proprietary Compliance SaaS</p>
          </div>
          <div className="animate-reveal [animation-delay:400ms] opacity-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin mb-6 md:mb-8 leading-[1.1]">
              HIPAA Compliance <br className="hidden md:block" /> Infrastructure. <br className="hidden md:block" /> Operationalized Continuously.
            </h1>
          </div>
          <div className="animate-reveal [animation-delay:600ms] opacity-0">
            <div className="max-w-2xl text-base md:text-lg text-gray-300 font-thin leading-relaxed mb-10 md:mb-12 space-y-6">
              <p className="text-white font-thin opacity-90">
                Enterprise-grade compliance platform for healthcare organizations. 
                Centralized policies, automated documentation, continuous audit readiness.
              </p>
            </div>
          </div>
          <div className="animate-reveal [animation-delay:800ms] opacity-0">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
              <button 
                onClick={onAssessmentClick}
                className="w-full sm:w-auto bg-cisco-blue text-white px-8 md:px-12 py-4 md:py-6 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all border-none rounded-none shadow-2xl shadow-cisco-blue/20"
              >
                Start Free Trial
              </button>
              <button className="w-full sm:w-auto border border-white/20 text-white px-8 md:px-12 py-4 md:py-6 text-sm font-thin hover:bg-white hover:text-cisco-navy transition-all rounded-none">
                Request Platform Demo
              </button>
            </div>
            <p className="mt-6 text-[10px] text-gray-500 font-thin">No credit card required. Cancel anytime.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
