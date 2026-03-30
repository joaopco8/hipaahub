import type { MetadataRoute } from 'next';
import { blog } from '@/utils/source';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = blog.getPages().map((page) => ({
    url: `https://hipaahubhealth.com/blog/${page.slugs[0]}`,
    lastModified: new Date(page.data.date ?? page.file.name),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://hipaahubhealth.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://hipaahubhealth.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogPosts,
  ];
}
