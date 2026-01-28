import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blog } from '@/utils/source';
import BlogPostsGrid from './blog-posts-grid';

export default function BlogSection() {
  const rawPosts = [...blog.getPages()]
    .sort(
      (a, b) =>
        new Date(b.data.date ?? b.file.name).getTime() -
        new Date(a.data.date ?? a.file.name).getTime()
    )
    .slice(0, 4);

  // Serialize only the data we need (no functions)
  const posts = rawPosts.map((post) => ({
    url: post.url,
    data: {
      title: post.data.title,
      description: post.data.description,
      date: post.data.date ? (typeof post.data.date === 'string' ? post.data.date : post.data.date.toISOString()) : undefined,
      category: (post.data as any).category,
      coverImage: (post.data as any).coverImage,
    },
    file: {
      name: post.file.name,
    },
  }));

  return (
    <section className="w-full relative bg-gradient-to-b from-white to-[#f3f5f9] py-24 md:py-32 font-extralight overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-[#1ad07a]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-lg border border-zinc-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-extralight text-[#0c0b1d] mb-3">
                  Latest insight from HIPAA Hub
                </h2>
                <p className="text-zinc-600 font-extralight text-base md:text-lg">
                  Practical, audit-ready HIPAA guidance for clinic owners.
                </p>
              </div>
              <Link href="/blog">
                <Button
                  variant="outline"
                  className="border border-[#1ad07a] text-[#1ad07a] hover:bg-[#1ad07a] hover:text-white font-extralight rounded-lg px-6 py-2.5 transition-all"
                >
                  See all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <BlogPostsGrid posts={posts} />
        </div>
      </div>
    </section>
  );
}
