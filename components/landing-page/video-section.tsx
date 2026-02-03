'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface VideoSectionProps {
  videoId?: string; // YouTube video ID (e.g., "dQw4w9WgXcQ")
  thumbnailUrl?: string; // Custom thumbnail URL (optional)
  title?: string;
  description?: string;
}

export default function VideoSection({
  videoId = 'dQw4w9WgXcQ', // Default placeholder - replace with your video ID
  thumbnailUrl,
  title = 'See How HIPAA Hub Works',
  description = 'Watch a quick 3-minute demo to see how HIPAA Hub helps clinics achieve and maintain HIPAA compliance.',
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate thumbnail URL from YouTube video ID if not provided
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    // Pause video when closing
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = iframe.src; // Reset iframe to pause video
    }
  };

  // YouTube embed URL with autoplay
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-[#f3f5f9] to-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#0c0b1d] mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 font-light max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0c0b1d]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence mode="wait">
            {!isPlaying ? (
              // Thumbnail with Play Button Overlay
              <motion.div
                key="thumbnail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full cursor-pointer group"
                onClick={handlePlay}
              >
                {/* Thumbnail Image */}
                <div className="absolute inset-0">
                  <Image
                    src={thumbnail}
                    alt="Video thumbnail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    priority={false}
                    unoptimized={thumbnail.includes('youtube.com')}
                  />
                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-[#0c0b1d]/40 group-hover:bg-[#0c0b1d]/30 transition-colors duration-300" />
                </div>

                {/* Play Button - Pulsing Animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1ad07a] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {/* Pulsing Rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#1ad07a]"
                      animate={{
                        scale: [1, 1.5, 1.8],
                        opacity: [0.6, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#1ad07a]"
                      animate={{
                        scale: [1, 1.3, 1.6],
                        opacity: [0.6, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3,
                        ease: 'easeOut',
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#1ad07a]"
                      animate={{
                        scale: [1, 1.2, 1.4],
                        opacity: [0.6, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.6,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />

                    {/* Play Icon */}
                    <div className="relative z-10 flex items-center justify-center">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-[#0c0b1d] ml-1" fill="currentColor" />
                    </div>
                  </motion.button>
                </div>

                {/* Hover Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <p className="text-white font-light text-sm md:text-base px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full">
                    Click to play video
                  </p>
                </motion.div>
              </motion.div>
            ) : (
              // YouTube Embed
              <motion.div
                key="video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  title={title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
                
                {/* Close Button */}
                <motion.button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Button with Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 md:mt-12"
        >
          <Link
            href="/checkout"
            className="inline-flex flex-col items-center gap-3 group"
          >
            <motion.button
              className="px-8 py-4 bg-[#1ad07a] hover:bg-[#1ad07a]/90 text-[#0c0b1d] font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group-hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started with HIPAA Guard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            {/* Benefits List */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-2">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                <span>Full compliance suite</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                <span>AI-powered documents</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                <span>Audit-ready evidence</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <CheckCircle2 className="w-4 h-4 text-[#1ad07a]" />
                <span>Risk assessment included</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
