import type { Metadata } from 'next';
import { blog } from '@/utils/source';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogCoverImage } from '@/components/blog/blog-cover-image';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'HIPAA Compliance Resources for Private Practices',
  description: 'Practical HIPAA compliance guides for therapists and small clinics. Risk assessments, audits, policies, and more.',
  openGraph: {
    title: 'HIPAA Compliance Resources for Private Practices',
    description: 'Practical HIPAA compliance guides for therapists and small clinics. Risk assessments, audits, policies, and more.',
    url: 'https://hipaahubhealth.com/blog',
    type: 'website',
  },
  alternates: {
    canonical: 'https://hipaahubhealth.com/blog',
  },
};

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? b.file.name).getTime() -
      new Date(a.data.date ?? a.file.name).getTime()
  );

  return (
    <main className="w-full pt-12 md:pt-16">
      {/* Hero header */}
      <div className="border-b border-gray-100 pb-12 mb-12">
        <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#00bceb] mb-3">
          Compliance Intelligence
        </p>
        <h1 className="text-4xl md:text-5xl font-thin text-[#0e274e] mb-4 leading-tight">
          HIPAA Compliance Resources<br className="hidden md:block" /> for Private Practices
        </h1>
        <p className="text-gray-500 font-thin text-lg max-w-2xl leading-relaxed">
          Practical HIPAA compliance guides for therapists and small clinics. Risk assessments, audits, policies, and more.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          const category = ((post.data as any).category as string | undefined) ?? 'HIPAA';
          const readTime = ((post.data as any).readTime as string | undefined) ?? '6 min read';
          const coverImage = (post.data as any).coverImage as string | undefined;
          const date = new Date(post.data.date ?? post.file.name);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <Link
              key={post.url}
              href={post.url}
              prefetch={true}
              className="group block bg-white overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#00bceb]/20 transition-all duration-300"
            >
              {/* Cover image */}
              <div className="relative h-52 bg-gray-100 overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={post.data.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <BlogCoverImage
                    title={post.data.title}
                    category={category}
                    className="w-full h-full"
                  />
                )}
                <div className="absolute top-0 left-0 bg-[#00bceb] px-3 py-1.5 text-[10px] font-thin tracking-wide text-white">
                  {category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-400 font-thin">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {readTime}
                  </span>
                </div>

                <h3 className="text-lg font-thin text-[#0e274e] leading-snug line-clamp-2 group-hover:text-[#00bceb] transition-colors">
                  {post.data.title}
                </h3>

                {post.data.description && (
                  <p className="text-sm text-gray-500 font-thin leading-relaxed line-clamp-3">
                    {post.data.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm font-thin text-[#00bceb] pt-1 group-hover:gap-3 transition-all">
                  <span>Read article</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-20 bg-[#0e274e] text-white p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#00bceb] mb-3">Audit Ready in 7 Days</p>
          <h2 className="text-2xl md:text-3xl font-thin leading-tight max-w-lg">
            Everything your private practice needs for HIPAA compliance, in one place.
          </h2>
        </div>
        <Link
          href="/signup"
          className="shrink-0 bg-[#00bceb] text-white px-8 py-4 text-sm font-thin hover:bg-white hover:text-[#0e274e] transition-all whitespace-nowrap"
        >
          Start Free 14-Day Trial
        </Link>
      </div>
    </main>
  );
}
