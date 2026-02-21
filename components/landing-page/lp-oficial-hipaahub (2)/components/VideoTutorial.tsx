import React from 'react';
import { PlayCircle, ShieldCheck } from 'lucide-react';

const VideoTutorial: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 border-b overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid lg:grid-cols-5 gap-16 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-cisco-blue text-[10px] font-bold mb-6">
              <PlayCircle size={14} /> Platform walkthrough
            </div>
            <h2 className="text-4xl lg:text-[48px] font-light text-cisco-navy leading-tight mb-8">
              See HIPAA Hub <br /> in action.
            </h2>
            <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
              Take a guided tour of our compliance infrastructure. See how we automate risk assessments, generate policies, and prepare your organization for audits in real-time.
            </p>
            <div className="space-y-4">
              {[
                "Automated dashboard overview",
                "Policy customization workflow",
                "Audit evidence export process"
              ].map((item, i) => (
                <div key={i} className="flex items-center text-sm text-gray-600 font-normal">
                  <ShieldCheck size={18} className="text-cisco-blue mr-3 opacity-60" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="relative group">
              {/* Professional Video Container */}
              <div className="relative z-10 bg-cisco-navy p-2 shadow-2xl overflow-hidden border border-white/10">
                <div className="aspect-video w-full bg-slate-800 relative">
                  {/* Replace 'YOUR_YOUTUBE_ID' with the actual ID */}
                  <iframe 
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="HIPAA Hub Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-cisco-blue/5 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-full h-full border border-gray-200 -z-10 translate-x-4 translate-y-4"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoTutorial;