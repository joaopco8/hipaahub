'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogPost {
  url: string;
  data: {
    title: string;
    description?: string;
    date?: string;
    category?: string;
    coverImage?: string;
  };
  file: {
    name: string;
  };
}

interface BlogPostsGridProps {
  posts: BlogPost[];
}

export default function BlogPostsGrid({ posts }: BlogPostsGridProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'TIPS': 'bg-[#1ad07a] text-white',
      'ARTICLES': 'bg-[#1ad07a] text-white',
      'RESOURCES': 'bg-[#1ad07a] text-white',
      'IDEAS': 'bg-[#1ad07a] text-white',
      'HIPAA': 'bg-[#1ad07a] text-white',
      'COMPLIANCE': 'bg-[#1ad07a] text-white',
      'FOUNDATIONS': 'bg-[#1ad07a] text-white',
      'TRAINING': 'bg-[#1ad07a] text-white',
      'RISK ANALYSIS': 'bg-[#1ad07a] text-white',
      'VENDORS': 'bg-[#1ad07a] text-white',
      'BREACH RESPONSE': 'bg-[#1ad07a] text-white',
      'AUDIT READINESS': 'bg-[#1ad07a] text-white',
    };
    return colors[category.toUpperCase()] || 'bg-[#1ad07a] text-white';
  };

  // Placeholder image URLs for different categories
  const getPlaceholderImage = (category: string) => {
    const placeholders: Record<string, string> = {
      'FOUNDATIONS': 'https://images.unsplash.com/photo-1580281658626-ee379f3cce93?auto=format&fit=crop&q=80&w=800',
      'TRAINING': 'https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&q=80&w=800',
      'RISK ANALYSIS': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
      'VENDORS': 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=800',
      'BREACH RESPONSE': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=800',
      'AUDIT READINESS': 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&q=80&w=800',
    };
    return placeholders[category.toUpperCase()] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {posts.map((post, index) => {
        const coverImage = (post.data as any).coverImage as string | undefined;
        const category = ((post.data as any).category as string | undefined) ?? 'HIPAA';
        const date = new Date(post.data.date ?? post.file.name);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }).toUpperCase();
        
        const imageUrl = coverImage || getPlaceholderImage(category);

        return (
          <motion.div
            key={post.url}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link
              href={post.url}
              className="group block bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-xl hover:border-[#1ad07a]/30 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 bg-zinc-200 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={post.data.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaceholderImage(category);
                  }}
                />
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b1d]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Category badge overlay */}
                <div className="absolute top-3 left-3">
                  <span className={`${getCategoryColor(category)} text-xs font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90`}>
                    {category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-extralight">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-extralight text-[#0c0b1d] leading-tight line-clamp-2 group-hover:text-[#1ad07a] transition-colors">
                  {post.data.title}
                </h3>

                {/* Description */}
                {post.data.description && (
                  <p className="text-sm text-zinc-600 font-extralight leading-relaxed line-clamp-3">
                    {post.data.description}
                  </p>
                )}

                {/* Read More */}
                <div className="flex items-center gap-2 text-sm font-extralight text-[#1ad07a] group-hover:gap-3 transition-all pt-2">
                  <span>Read More</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
