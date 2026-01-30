import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { BlogCoverImage } from '@/components/blog/blog-cover-image';
import Image from 'next/image';
import type { InferPageType } from 'fumadocs-core/source';

interface BlogCardProps {
  post: InferPageType<typeof import('@/utils/source').blog>;
  getCategoryColor: (category: string) => string;
}

export function BlogCard({ post, getCategoryColor }: BlogCardProps) {
  const coverImage = (post.data as any).coverImage as string | undefined;
  const category = ((post.data as any).category as string | undefined) ?? 'HIPAA';
  const readTime = ((post.data as any).readTime as string | undefined) ?? '6 min read';
  const date = new Date(post.data.date ?? post.file.name);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  return (
    <Link
      href={post.url}
      prefetch={true}
      className="group block bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-56 bg-zinc-200 overflow-hidden">
        {coverImage && coverImage.startsWith('/images/blog/') ? (
          <Image
            src={coverImage}
            alt={post.data.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <BlogCoverImage
            title={post.data.title}
            category={category}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category & Date */}
        <div className="flex items-center justify-between gap-2">
          <span className={`${getCategoryColor(category)} text-xs font-medium px-3 py-1 rounded-full`}>
            {category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-extralight">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extralight text-[#0c0b1d] leading-tight line-clamp-2 group-hover:text-[#1ad07a] transition-colors">
          {post.data.title}
        </h3>

        {/* Description */}
        {post.data.description && (
          <p className="text-sm text-zinc-600 font-extralight leading-relaxed line-clamp-3">
            {post.data.description}
          </p>
        )}

        {/* Read Time & Read More */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-extralight">
            <Clock className="h-3.5 w-3.5" />
            <span>{readTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-extralight text-[#1ad07a] group-hover:gap-3 transition-all">
            <span>Read More</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
