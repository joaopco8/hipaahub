import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, ArrowRight, Search } from 'lucide-react';

interface Post {
  id: string;
  image: string;
  category: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  readTime: string;
}

const CATEGORIES = ['All', 'Regulatory', 'Cybersecurity', 'Best Practices', 'Risk Management', 'Policy', 'Breach Response'];

const ALL_POSTS: Post[] = [
  {
    id: '1',
    category: 'Regulatory',
    title: 'OCR Audit Trends: What small clinics need to know for 2026',
    date: 'February 18, 2026',
    author: 'Dr. Sarah Mitchell',
    excerpt: 'The Office for Civil Rights has significantly expanded its audit program scope. Independent practices and solo practitioners are now among the primary targets. Here is what the data says and what you need to prepare.',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    category: 'Cybersecurity',
    title: 'The rising threat of ransomware in private medical practices',
    date: 'February 10, 2026',
    author: 'David Chen',
    excerpt: 'Ransomware incidents against healthcare organizations increased 43% year over year. Unlike hospital networks, private practices often lack the security infrastructure to detect, contain, and recover from these events.',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    category: 'Best Practices',
    title: '5 common documentation mistakes that lead to HIPAA fines',
    date: 'February 3, 2026',
    author: 'James Wilson',
    excerpt: 'OCR enforcement data consistently identifies the same five documentation failures across investigated organizations. Understanding these patterns is the fastest way to close your compliance gaps.',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    category: 'Risk Management',
    title: 'Security Risk Analysis: The single most important HIPAA document',
    date: 'January 27, 2026',
    author: 'Dr. Sarah Mitchell',
    excerpt: 'OCR has made clear: a current, documented Security Risk Analysis is the foundation of HIPAA compliance. Organizations without one face the highest exposure in any investigation. This is how to conduct one correctly.',
    readTime: '11 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    category: 'Policy',
    title: 'Business Associate Agreements: What your contracts must include',
    date: 'January 20, 2026',
    author: 'Alexandra Reed',
    excerpt: 'A BAA that does not meet the minimum statutory requirements is legally equivalent to having no BAA at all. We reviewed 200 BAAs from healthcare organizations and found seven recurring deficiencies.',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    category: 'Breach Response',
    title: 'The 72-hour breach notification requirement: A practical guide',
    date: 'January 13, 2026',
    author: 'Marcus Chen',
    excerpt: 'When a breach is confirmed, the clock starts immediately. The 72-hour window for notifying HHS of breaches affecting 500 or more individuals is one of the most commonly violated HIPAA provisions.',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '7',
    category: 'Cybersecurity',
    title: 'Multi-factor authentication in healthcare: Implementation without disruption',
    date: 'January 6, 2026',
    author: 'Jordan Vasquez',
    excerpt: "MFA is now effectively required under HIPAA's technical safeguards. The challenge for clinical environments is implementation that does not impede the speed clinicians need to access patient information.",
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '8',
    category: 'Regulatory',
    title: 'HIPAA enforcement in 2025: The 10 largest settlements and what they signal',
    date: 'December 30, 2025',
    author: 'Dr. Sarah Mitchell',
    excerpt: 'OCR resolved a record number of enforcement actions in 2025. An analysis of the ten largest settlements reveals consistent patterns: inadequate risk analysis, missing BAAs, and insufficient access controls.',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '9',
    category: 'Best Practices',
    title: 'Staff training that actually works: Moving beyond annual checkbox compliance',
    date: 'December 22, 2025',
    author: 'Priya Nair',
    excerpt: 'Annual training completions are recorded but rarely retained. Research consistently shows that episodic training fails to change behavior. Here is the evidence-based approach to building a compliance-aware workforce.',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800'
  }
];

const BlogPage: React.FC<{ onBack: () => void; onReadMore: (post: Post) => void }> = ({ onBack, onReadMore }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_POSTS.filter(post => {
    const matchCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const [featured, ...rest] = filtered;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-2 px-4 md:px-12 text-[10px] text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 font-thin">
          <button onClick={onBack} className="hover:text-[#0175a2] transition-colors">Home</button>
          <span className="text-gray-200">/</span>
          <span className="text-[#0e274e]">Blog</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[#0e274e] text-white py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-[#0175a2] text-sm font-thin mb-10 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-4">Compliance Intelligence</p>
          <h1 className="text-4xl md:text-5xl font-thin leading-tight max-w-3xl mb-6">
            HIPAA Hub Insights
          </h1>
          <p className="text-gray-300 font-thin text-lg max-w-xl leading-relaxed">
            Regulatory analysis, enforcement trends, and operational guidance from healthcare compliance professionals.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="border-b border-gray-100 bg-white px-4 md:px-12 py-6 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-thin transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0175a2] text-white'
                    : 'text-gray-500 border border-gray-200 hover:border-[#0175a2] hover:text-[#0175a2]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex-shrink-0 w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm font-thin border border-gray-200 focus:outline-none focus:border-[#0175a2] text-[#0e274e] placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-gray-400 font-thin text-lg">No articles found matching your criteria.</p>
            <button
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="mt-6 text-sm text-[#0175a2] font-thin hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <div
                className="group cursor-pointer grid md:grid-cols-2 gap-12 mb-20 pb-20 border-b border-gray-100"
                onClick={() => onReadMore(featured)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-72 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-0 left-0 bg-[#0175a2] px-4 py-2 text-[10px] font-thin tracking-wide text-white">
                    {featured.category}
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-thin text-[#0175a2] tracking-[0.15em] uppercase mb-4">Featured Article</p>
                  <h2 className="text-3xl md:text-4xl font-thin text-[#0e274e] leading-tight mb-6 group-hover:text-[#0175a2] transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-500 font-thin leading-relaxed mb-8 text-base">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-xs text-gray-400 font-thin mb-8">
                    <span className="flex items-center"><Calendar size={13} className="mr-1.5" />{featured.date}</span>
                    <span className="flex items-center"><User size={13} className="mr-1.5" />{featured.author}</span>
                    <span>{featured.readTime}</span>
                  </div>
                  <button className="self-start flex items-center text-sm font-thin text-[#0175a2] group-hover:text-[#0e274e] transition-colors">
                    Read article <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Article grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-3 gap-12">
                {rest.map(post => (
                  <div
                    key={post.id}
                    className="group cursor-pointer"
                    onClick={() => onReadMore(post)}
                  >
                    <div className="relative h-52 overflow-hidden mb-6">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-0 left-0 bg-[#0175a2] px-3 py-1.5 text-[10px] font-thin text-white">
                        {post.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-thin mb-4">
                      <span className="flex items-center"><Calendar size={12} className="mr-1.5" />{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-thin text-[#0e274e] mb-3 leading-tight group-hover:text-[#0175a2] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 font-thin text-sm leading-relaxed mb-5 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-thin flex items-center">
                        <User size={12} className="mr-1.5" />{post.author}
                      </span>
                      <button className="text-sm font-thin text-[#0175a2] flex items-center group-hover:text-[#0e274e] transition-colors">
                        Read <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Subscribe CTA */}
      <div className="bg-gray-50 border-t border-gray-100 py-20 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-lg">
            <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#0175a2] mb-3">Stay Informed</p>
            <h2 className="text-2xl md:text-3xl font-thin text-[#0e274e] leading-tight">
              Regulatory updates. Enforcement alerts. Compliance frameworks.
            </h2>
            <p className="text-gray-500 font-thin mt-4 text-sm leading-relaxed">
              Delivered to compliance officers and practice administrators every two weeks.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-0">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-5 py-4 text-sm font-thin border border-gray-200 border-r-0 focus:outline-none focus:border-[#0175a2] text-[#0e274e] placeholder:text-gray-400"
            />
            <button className="bg-[#0175a2] text-white px-8 py-4 text-sm font-thin hover:bg-[#0e274e] transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
