'use client';

import { ReactNode } from 'react';

interface FAQSchemaProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQSchema({ questions }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image: image || 'https://hipaahub.com/images/og-default.jpg',
    datePublished,
    dateModified: dateModified || datePublished,
    author: author
      ? {
          '@type': 'Organization',
          name: author.name,
          url: author.url || 'https://hipaahub.com'
        }
      : {
          '@type': 'Organization',
          name: 'HIPAA Hub',
          url: 'https://hipaahub.com'
        },
    publisher: {
      '@type': 'Organization',
      name: 'HIPAA Hub',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hipaahub.com/images/logohipa.png'
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
  }>;
}

export function HowToSchema({ name, description, steps }: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  socialLinks?: string[];
}

export function OrganizationSchema({
  name = 'HIPAA Hub',
  url = 'https://hipaahub.com',
  logo = 'https://hipaahub.com/images/logohipa.png',
  description = 'HIPAA compliance software for small healthcare practices',
  socialLinks = []
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: socialLinks
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
