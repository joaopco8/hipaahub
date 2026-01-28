import { map } from '@/.map';
import { createMDXSource, defaultSchemas } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
import { z } from 'zod';

export const blog = loader({
  baseUrl: '/blog',
  rootDir: 'blog',
  source: createMDXSource(map, {
    schema: {
      frontmatter: defaultSchemas.frontmatter.extend({
        author: z.string(),
        date: z.string().date().or(z.date()).optional()
      })
    }
  })
});

export type Page = InferPageType<typeof blog>;
export type Meta = InferMetaType<typeof blog>;
