import { blog } from '@/utils/source';
import { BlogCard } from '@/components/blog/blog-card';

export const revalidate = 3600; // Revalidate every hour

export default function Page(): React.ReactElement {
  const posts = [...blog.getPages()].sort(
    (a, b) =>
      new Date(b.data.date ?? b.file.name).getTime() -
      new Date(a.data.date ?? a.file.name).getTime()
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'TIPS': 'bg-[#1ad07a] text-white',
      'ARTICLES': 'bg-[#1ad07a] text-white',
      'RESOURCES': 'bg-[#1ad07a] text-white',
      'IDEAS': 'bg-[#1ad07a] text-white',
      'HIPAA': 'bg-[#1ad07a] text-white',
      'COMPLIANCE': 'bg-[#1ad07a] text-white',
    };
    return colors[category.toUpperCase()] || 'bg-[#1ad07a] text-white';
  };

  return (
    <main className="w-full pt-28 md:pt-32">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extralight text-[#0c0b1d] mb-4">
          HIPAA Hub Blog
        </h1>
        <p className="text-lg text-zinc-600 font-extralight">
          Practical, audit-ready HIPAA guidance for clinic owners.
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.url} post={post} getCategoryColor={getCategoryColor} />
        ))}
      </div>
    </main>
  );
}
