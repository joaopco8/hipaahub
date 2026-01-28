import { readFile } from 'fs/promises';
import { join } from 'path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PageProps {
  params: {
    slug?: string[];
  };
}

async function getDocContent(slug: string[]) {
  try {
    const filePath = join(process.cwd(), 'content', 'docs', ...slug) + '.mdx';
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

function parseFrontmatter(content: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }

  const frontmatterText = match[1];
  const body = match[2];
  
  const frontmatter: Record<string, string> = {};
  frontmatterText.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });

  return { frontmatter, content: body };
}

const markdownComponents = {
  h1: ({ className, ...props }: any) => (
    <h1 className={cn("text-4xl font-medium text-[#0c0b1d] mb-6 mt-8", className)} {...props} />
  ),
  h2: ({ className, ...props }: any) => (
    <h2 className={cn("text-3xl font-medium text-[#0c0b1d] mt-12 mb-4", className)} {...props} />
  ),
  h3: ({ className, ...props }: any) => (
    <h3 className={cn("text-2xl font-medium text-[#0c0b1d] mt-8 mb-3", className)} {...props} />
  ),
  p: ({ className, ...props }: any) => (
    <p className={cn("text-zinc-700 font-light leading-relaxed mb-4", className)} {...props} />
  ),
  ul: ({ className, ...props }: any) => (
    <ul className={cn("list-disc list-inside space-y-2 mb-4 text-zinc-700 ml-4", className)} {...props} />
  ),
  ol: ({ className, ...props }: any) => (
    <ol className={cn("list-decimal list-inside space-y-2 mb-4 text-zinc-700 ml-4", className)} {...props} />
  ),
  li: ({ className, ...props }: any) => (
    <li className={cn("", className)} {...props} />
  ),
  code: ({ className, inline, ...props }: any) => {
    if (inline) {
      return <code className={cn("bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono", className)} {...props} />;
    }
    return <code className={cn("bg-[#0c0b1d] text-zinc-100 block p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm", className)} {...props} />;
  },
  pre: ({ className, ...props }: any) => (
    <pre className={cn("", className)} {...props} />
  ),
  a: ({ className, href, ...props }: any) => {
    if (href?.startsWith('/')) {
      return <Link href={href} className={cn("text-[#1ad07a] hover:underline", className)} {...props} />;
    }
    return <a href={href} className={cn("text-[#1ad07a] hover:underline", className)} target="_blank" rel="noopener noreferrer" {...props} />;
  },
  blockquote: ({ className, ...props }: any) => (
    <blockquote className={cn("border-l-4 border-[#1ad07a] pl-4 italic text-zinc-600 my-4", className)} {...props} />
  ),
};

export default async function DocPage({ params }: PageProps) {
  const slug = params.slug || [];
  const content = await getDocContent(slug);

  if (!content) {
    notFound();
  }

  const { frontmatter, content: body } = parseFrontmatter(content);

  return (
    <article className="max-w-none">
      {frontmatter.title && (
        <header className="mb-8 pb-6 border-b border-zinc-200">
          <h1 className="text-4xl font-medium text-[#0c0b1d] mb-2">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="text-lg text-zinc-600 font-light">
              {frontmatter.description}
            </p>
          )}
        </header>
      )}
      
      <div className="prose prose-zinc max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={markdownComponents as any}
        >
          {body}
        </ReactMarkdown>
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return [];
}
