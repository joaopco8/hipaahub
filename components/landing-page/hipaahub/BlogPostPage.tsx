import React from 'react';
import { ArrowLeft, Calendar, User, Share2, Printer, ChevronRight } from 'lucide-react';

interface Post {
  id: string;
  image: string;
  category: string;
  title: string;
  date: string;
  author: string;
}

const BlogPostPage: React.FC<{ post: Post; onBack: () => void }> = ({ post, onBack }) => {
  return (
    <div className="bg-white">
      {/* Breadcrumbs for Blog */}
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <button onClick={onBack} className="hover:text-cisco-blue">Home</button>
          <span>/</span>
          <button onClick={onBack} className="hover:text-cisco-blue">Blog</button>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-[200px]">{post.title}</span>
        </div>
      </div>

      <article className="pb-24">
        {/* Header Section */}
        <div className="bg-cisco-navy text-white py-20">
          <div className="max-w-4xl mx-auto px-4">
            <button 
              onClick={onBack}
              className="flex items-center text-cisco-blue text-sm font-bold mb-8 hover:text-white transition-colors group"
            >
              <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" /> BACK TO ALL ARTICLES
            </button>
            <div className="bg-cisco-blue inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-6">
              {post.category}
            </div>
            <h1 className="text-4xl md:text-6xl font-thin leading-tight mb-10">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 text-sm text-gray-400">
              <span className="flex items-center"><Calendar size={16} className="mr-2 text-cisco-blue" /> {post.date}</span>
              <span className="flex items-center"><User size={16} className="mr-2 text-cisco-blue" /> By {post.author}</span>
              <div className="flex items-center space-x-4 ml-auto">
                <button className="hover:text-white"><Share2 size={18} /></button>
                <button className="hover:text-white"><Printer size={18} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-5xl mx-auto px-4 -mt-12">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-[500px] object-cover shadow-2xl rounded-none border-b-8 border-gray-300"
          />
        </div>

        {/* Content Body */}
        <div className="max-w-3xl mx-auto px-4 mt-20">
          <div className="prose prose-lg prose-slate max-w-none text-gray-600 font-thin leading-relaxed">
            <p className="text-2xl font-thin text-slate-800 mb-10 leading-relaxed italic">
              Navigating the landscape of clinical compliance requires more than just checking boxes. 
              As we approach 2024, the Office for Civil Rights (OCR) has indicated a significant shift 
              in how they handle data breach investigations and HIPAA audits.
            </p>
            
            <h2 className="text-3xl font-thin text-cisco-navy mt-12 mb-6">The Shifting Regulatory Horizon</h2>
            <p className="mb-8">
              Recent data from federal regulators suggests that smaller medical practices are being targeted 
              more frequently, not due to malice, but because they often lack the robust technical safeguards 
              found in larger hospital networks. In 2024, we expect to see a 15% increase in "desk audits" 
              specifically focusing on the Security Risk Analysis (SRA).
            </p>

            <div className="bg-gray-50 border-l-4 border-gray-300 p-10 my-12">
              <h4 className="text-xl font-bold text-cisco-navy mb-4 uppercase tracking-wider">Expert Insight</h4>
              <p className="text-lg italic text-slate-700">
                "The most expensive HIPAA fine is the one you could have prevented with 30 minutes of documentation."
              </p>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mt-12 mb-4 uppercase tracking-tighter">Key Audit Focus Areas</h3>
            <ul className="list-none space-y-4 mb-12">
              {[
                "Comprehensive Risk Assessment (SRA) validity",
                "Proof of recurring staff training and awareness",
                "Business Associate Agreement (BAA) management",
                "Device encryption protocols and access logs"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <ChevronRight className="text-cisco-blue mt-1 mr-3 flex-shrink-0" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-3xl font-thin text-cisco-navy mt-12 mb-6">Actionable Steps for Clinics</h2>
            <p className="mb-8">
              Clinics must move beyond passive compliance. This means not only having the manual on the shelf 
              but actively logging access and reviewing technical safeguards quarterly. The HIPAA Fast 7-day 
              implementation process specifically targets these "red flag" areas that OCR auditors look for first.
            </p>
            
            <p className="mb-12">
              Stay tuned for our upcoming webinar where we'll dissect real-world audit response letters 
              and show you exactly how to build a defense file that stops investigations in their tracks.
            </p>
          </div>

          {/* Author Card */}
          <div className="border-t border-b border-gray-100 py-12 my-16 flex items-center space-x-8">
             <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=200" 
                  alt={post.author} 
                  className="w-full h-full object-cover"
                />
             </div>
             <div>
                <p className="text-xs font-bold text-cisco-blue uppercase tracking-widest mb-1">About the author</p>
                <h4 className="text-xl font-bold text-cisco-navy mb-2">{post.author}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Compliance specialist with over 15 years of experience in federal healthcare regulations 
                  and data privacy. Lead consultant at HIPAA Fast Track Systems.
                </p>
             </div>
          </div>

          {/* CTA Box */}
          <div className="bg-cisco-blue p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-3xl font-thin mb-4">Ready to secure your clinic?</h3>
              <p className="text-blue-50">Download our free 2024 Compliance Checklist and start your journey.</p>
            </div>
            <button className="bg-white text-cisco-blue px-10 py-4 font-bold text-sm hover:bg-cisco-navy hover:text-white transition-all rounded-none uppercase tracking-widest whitespace-nowrap">
              Download Checklist
            </button>
          </div>
        </div>
      </article>

      {/* Suggested Reading */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <h2 className="text-3xl font-thin text-cisco-navy mb-12">Recommended reading</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 p-8 flex group cursor-pointer hover:shadow-lg transition-shadow">
               <div className="flex-grow">
                  <p className="text-[10px] font-bold text-cisco-blue uppercase mb-2">Next article</p>
                  <h4 className="text-xl font-medium text-slate-800 group-hover:text-cisco-blue transition-colors">How encryption at rest saves you from OCR fines</h4>
               </div>
               <ChevronRight size={24} className="text-gray-300 group-hover:text-cisco-blue ml-4 mt-4" />
            </div>
            <div className="bg-white border border-gray-100 p-8 flex group cursor-pointer hover:shadow-lg transition-shadow">
               <div className="flex-grow">
                  <p className="text-[10px] font-bold text-cisco-blue uppercase mb-2">Previous article</p>
                  <h4 className="text-xl font-medium text-slate-800 group-hover:text-cisco-blue transition-colors">Telehealth security: Beyond the video call</h4>
               </div>
               <ChevronRight size={24} className="text-gray-300 group-hover:text-cisco-blue ml-4 mt-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPostPage;
