import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { blog } from '@/utils/source';
import { createMetadata } from '@/utils/metadata';
import { Button } from '@/components/ui/button';
import { BlogCoverImage } from '@/components/blog/blog-cover-image';
import Image from 'next/image';

interface Param {
  slug: string;
}

export const dynamicParams = false;
export const revalidate = 3600; // Revalidate every hour

export default function Page({
  params
}: {
  params: Param;
}): React.ReactElement {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  const coverImage = (page.data as any).coverImage as string | undefined;
  const category = ((page.data as any).category as string | undefined) ?? 'HIPAA';
  const readTime = ((page.data as any).readTime as string | undefined) ?? '6 min read';
  const date = new Date(page.data.date ?? page.file.name);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="w-full max-w-5xl mx-auto text-[#0c0b1d]">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/blog" prefetch={true}>
          <Button
            variant="outline"
            className="border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-extralight"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-[#1ad07a] text-white text-xs font-medium px-3 py-1 rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-4 text-sm text-zinc-600 font-extralight">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extralight text-[#0c0b1d] mb-4 leading-tight">
          {page.data.title}
        </h1>

        {page.data.description && (
          <p className="text-xl text-zinc-600 font-extralight leading-relaxed">
            {page.data.description}
          </p>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-96 mb-12 rounded-2xl overflow-hidden bg-zinc-200">
        {coverImage && coverImage.startsWith('/images/blog/') ? (
          <Image
            src={coverImage}
            alt={page.data.title}
            fill
            className="object-cover rounded-2xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <BlogCoverImage
            title={page.data.title}
            category={category}
            className="w-full h-full rounded-2xl"
          />
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
        <div className="prose prose-lg max-w-none prose-zinc [&_*]:text-[#0c0b1d] [&_h1]:text-[#0c0b1d] [&_h2]:text-[#0c0b1d] [&_h3]:text-[#0c0b1d] [&_h4]:text-[#0c0b1d] [&_h5]:text-[#0c0b1d] [&_h6]:text-[#0c0b1d] [&_h1]:font-extralight [&_h2]:font-extralight [&_h3]:font-extralight [&_h4]:font-extralight [&_h5]:font-extralight [&_h6]:font-extralight [&_p]:text-zinc-700 [&_p]:font-extralight [&_li]:text-zinc-700 [&_ul]:text-zinc-700 [&_ol]:text-zinc-700 [&_blockquote]:text-zinc-700 [&_a]:text-[#1ad07a] [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-[#0c0b1d] [&_strong]:font-medium [&_code]:text-[#0c0b1d] [&_code]:bg-[#f3f5f9] [&_pre]:text-[#0c0b1d] [&_pre]:bg-[#f3f5f9]">
          <div className="prose-headings:font-extralight prose-p:font-extralight">
            <page.data.exports.default />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-8 h-fit">
          <div className="bg-[#f3f5f9] rounded-2xl p-6 space-y-6 border border-zinc-200">
            <div>
              <p className="text-xs text-zinc-500 font-extralight mb-2">Written by</p>
              <p className="font-extralight text-[#0c0b1d]">{page.data.author || 'HIPAA Hub Team'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-extralight mb-2">Published</p>
              <p className="font-extralight text-[#0c0b1d]">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-extralight mb-2">Reading time</p>
              <p className="font-extralight text-[#0c0b1d]">{readTime}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function generateMetadata({ params }: { params: Param }): Metadata {
  const page = blog.getPage([params.slug]);

  if (!page) notFound();

  return createMetadata({
    title: page.data.title,
    description:
      page.data.description ?? 'Practical, audit-ready HIPAA guidance for clinic owners.'
  });
}

export async function generateStaticParams(): Promise<Param[]> {
  return blog.getPages().map<Param>((page) => ({
    slug: page.slugs[0]
  }));
}
