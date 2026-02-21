
export interface NavItem {
  label: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
  type: 'circle' | 'icon';
  percentage?: number;
  color?: string;
}

export interface CertCard {
  title: string;
  description: string;
  href: string;
}

export interface RoleCard {
  title: string;
  description: string;
  ctaText: string;
}

export interface Testimonial {
  quote: string;
  subQuote: string;
  author: string;
  role: string;
  credentials: string;
  image: string;
}
