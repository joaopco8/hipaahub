import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';
import { blog } from '@/utils/source';
import { BlogCoverImage } from '@/components/blog/blog-cover-image';

interface Param {
  slug: string;
}

export const dynamicParams = false;
export const revalidate = 3600;

export default function Page({ params }: { params: Param }): React.ReactElement {
  const page = blog.getPage([params.slug]);
  if (!page) notFound();

  const coverImage = (page.data as any).coverImage as string | undefined;
  const category = ((page.data as any).category as string | undefined) ?? 'HIPAA';
  const readTime = ((page.data as any).readTime as string | undefined) ?? '6 min read';
  const relatedArticles = ((page.data as any).relatedArticles as Array<{ slug: string; title: string }> | undefined) ?? [];
  const date = new Date(page.data.date ?? page.file.name);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const slug = params.slug;
  const canonicalUrl = `https://hipaahubhealth.com/blog/${slug}`;
  const dateISO = date.toISOString();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.data.title,
    description: page.data.description ?? 'Practical HIPAA compliance guidance for therapists and small clinics.',
    author: { '@type': 'Organization', name: 'HIPAA Hub' },
    publisher: { '@type': 'Organization', name: 'HIPAA Hub', url: 'https://hipaahubhealth.com' },
    datePublished: dateISO,
    dateModified: dateISO,
    url: canonicalUrl,
  };

  return (
    <article className="w-full max-w-4xl mx-auto text-[#0e274e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-xs text-gray-400 font-thin">
        <Link href="/" className="hover:text-[#00bceb] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/blog" className="hover:text-[#00bceb] transition-colors">Blog</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[#0e274e] line-clamp-1">{category}</span>
      </nav>

      {/* Category + meta */}
      <div className="flex items-center gap-4 mb-6">
        <span className="bg-[#00bceb] text-white text-[10px] font-thin px-3 py-1.5 tracking-wide">
          {category}
        </span>
        <div className="flex items-center gap-4 text-sm text-gray-400 font-thin">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-thin text-[#0e274e] mb-5 leading-tight">
        {page.data.title}
      </h1>

      {page.data.description && (
        <p className="text-lg text-gray-500 font-thin leading-relaxed mb-10 border-b border-gray-100 pb-10">
          {page.data.description}
        </p>
      )}

      {/* Cover image */}
      <div className="relative w-full h-64 md:h-80 mb-12 overflow-hidden bg-gray-100">
        {coverImage ? (
          <img src={coverImage} alt={page.data.title} className="w-full h-full object-cover" />
        ) : (
          <BlogCoverImage title={page.data.title} category={category} className="w-full h-full" />
        )}
      </div>

      {/* Content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-12">
        {/* Article body */}
        <div className="prose prose-lg max-w-none
          [&_h2]:font-thin [&_h2]:text-[#0e274e] [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4
          [&_h3]:font-thin [&_h3]:text-[#0e274e] [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
          [&_p]:text-gray-600 [&_p]:font-thin [&_p]:leading-relaxed
          [&_li]:text-gray-600 [&_li]:font-thin
          [&_a]:text-[#00bceb] [&_a]:no-underline hover:[&_a]:underline
          [&_strong]:text-[#0e274e] [&_strong]:font-normal
          [&_hr]:border-gray-100
          [&_blockquote]:border-l-[#00bceb] [&_blockquote]:text-gray-500">
          <page.data.exports.default />
        </div>

        {/* Sticky sidebar */}
        <aside className="lg:sticky lg:top-[88px] h-fit space-y-6">
          <div className="border border-gray-100 p-6 space-y-5">
            <div>
              <p className="text-[10px] font-thin tracking-[0.15em] uppercase text-[#00bceb] mb-1.5">Written by</p>
              <p className="font-thin text-[#0e274e] text-sm">{page.data.author || 'HIPAA Hub Compliance Team'}</p>
            </div>
            <div>
              <p className="text-[10px] font-thin tracking-[0.15em] uppercase text-[#00bceb] mb-1.5">Published</p>
              <p className="font-thin text-[#0e274e] text-sm">{formattedDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-thin tracking-[0.15em] uppercase text-[#00bceb] mb-1.5">Reading time</p>
              <p className="font-thin text-[#0e274e] text-sm">{readTime}</p>
            </div>
          </div>

          <Link
            href="/signup"
            className="block w-full bg-[#0e274e] text-white text-center px-4 py-4 text-xs font-thin hover:bg-[#00bceb] transition-all"
          >
            Start Free 14-Day Trial
          </Link>
        </aside>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-100">
          <p className="text-xs font-thin tracking-[0.2em] uppercase text-[#00bceb] mb-4">Continue Reading</p>
          <h2 className="text-2xl font-thin text-[#0e274e] mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group block border border-gray-100 p-6 hover:border-[#00bceb]/30 hover:shadow-md transition-all duration-200"
              >
                <p className="font-thin text-[#0e274e] group-hover:text-[#00bceb] transition-colors leading-snug text-base">
                  {related.title}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-sm text-[#00bceb] font-thin">
                  <span>Read article</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back link */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-thin text-gray-500 hover:text-[#00bceb] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>
      </div>
    </article>
  );
}

export function generateMetadata({ params }: { params: Param }): Metadata {
  const page = blog.getPage([params.slug]);
  if (!page) notFound();

  const slug = params.slug;
  const canonicalUrl = `https://hipaahubhealth.com/blog/${slug}`;
  const date = new Date(page.data.date ?? page.file.name);

  return {
    title: page.data.title,
    description: page.data.description ?? 'Practical, audit-ready HIPAA guidance for clinic owners.',
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: page.data.title,
      description: page.data.description ?? 'Practical, audit-ready HIPAA guidance for clinic owners.',
      url: canonicalUrl,
      type: 'article',
      publishedTime: date.toISOString(),
      authors: ['HIPAA Hub Compliance Team'],
    },
  };
}

export async function generateStaticParams(): Promise<Param[]> {
  return blog.getPages().map<Param>((page) => ({ slug: page.slugs[0] }));
}
