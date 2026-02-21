import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  image: string;
  category: string;
  title: string;
  date: string;
  author: string;
  content?: string;
}

const BlogCard: React.FC<{ 
  post: Post;
  onReadMore: (post: Post) => void;
}> = ({ post, onReadMore }) => (
  <div className="group cursor-pointer" onClick={() => onReadMore(post)}>
    <div className="relative h-64 w-full overflow-hidden mb-6 rounded-none">
      <img 
        src={post.image} 
        alt={post.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute top-0 left-0 bg-cisco-blue px-4 py-2 text-[10px] font-light tracking-tight text-white shadow-sm rounded-none">
        {post.category}
      </div>
    </div>
    <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4 font-light">
      <span className="flex items-center"><Calendar size={14} className="mr-1.5" /> {post.date}</span>
      <span className="flex items-center"><User size={14} className="mr-1.5" /> {post.author}</span>
    </div>
    <h3 className="text-2xl font-light text-cisco-navy mb-4 leading-tight group-hover:text-cisco-blue transition-colors tracking-tight">
      {post.title}
    </h3>
    <button 
      onClick={(e) => { e.stopPropagation(); onReadMore(post); }} 
      className="inline-flex items-center text-sm font-light text-cisco-blue group-hover:text-cisco-navy transition-colors"
    >
      Read full article <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
    </button>
  </div>
);

const BlogSection: React.FC<{ onReadMore: (post: Post) => void }> = ({ onReadMore }) => {
  const posts: Post[] = [
    {
      id: '1',
      category: "Regulatory",
      title: "OCR Audit Trends: What small clinics need to know for 2024",
      date: "May 15, 2024",
      author: "Dr. Sarah Mitchell",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: '2',
      category: "Cybersecurity",
      title: "The rising threat of ransomware in private medical practices",
      date: "May 10, 2024",
      author: "David Chen",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: '3',
      category: "Best Practices",
      title: "5 common documentation mistakes that lead to HIPAA fines",
      date: "May 03, 2024",
      author: "James Wilson",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section id="resources" className="py-24 bg-white border-t border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-[48px] font-light text-cisco-navy leading-tight tracking-tight">Compliance Insights</h2>
            <p className="text-gray-500 mt-4 text-lg font-light">Stay ahead of healthcare regulations with deep dives from our clinical security experts.</p>
          </div>
          <button className="text-sm font-light text-cisco-blue border-b border-cisco-blue pb-1 hover:text-cisco-navy hover:border-cisco-navy transition-all tracking-tight">
            View all resources
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {posts.map(post => (
            <BlogCard 
              key={post.id}
              post={post}
              onReadMore={onReadMore}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;