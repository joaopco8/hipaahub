import { blog } from '@/utils/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// Get pages from blog loader
const getBlogPages = () => {
  return blog.getPages();
};

export const { GET } = createSearchAPI('advanced', {
  indexes: [...getBlogPages()].map((page) => ({
    title: page.data.title,
    structuredData: page.data.exports.structuredData,
    id: page.url,
    url: page.url
  }))
});
