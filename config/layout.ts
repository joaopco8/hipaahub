/**
 * Layout Configuration
 * 
 * Centralized layout settings for consistent max-width across all pages
 * This ensures all elements start and end at the same points
 */

export const LAYOUT_CONFIG = {
  // Main container max-width (matches Tailwind's container 2xl breakpoint)
  MAX_WIDTH: '1280px', // max-w-7xl
  
  // Content wrapper padding
  PADDING_X: '24px', // px-6
  
  // Section vertical spacing
  SECTION_PADDING_Y: {
    MOBILE: '96px', // py-24
    DESKTOP: '128px' // py-32
  }
} as const;

// Tailwind classes to use consistently
export const LAYOUT_CLASSES = {
  // Main container - use this for all sections
  CONTAINER: 'max-w-7xl mx-auto px-6',
  
  // Content wrapper - use this inside sections
  CONTENT_WRAPPER: 'max-w-7xl mx-auto',
  
  // Full width container (for backgrounds that extend edge-to-edge)
  FULL_WIDTH: 'w-full',
  
  // Section wrapper
  SECTION: 'w-full'
} as const;
