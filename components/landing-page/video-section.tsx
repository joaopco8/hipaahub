'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface VideoSectionProps {
  videoId?: string;
  title?: string;
  description?: string;
}

export default function VideoSection({
  videoId = 'Ir9bUDr4Op4',
  title = 'See How HIPAA Hub Works in 3 Minutes',
  description = 'Watch a quick demo to see how HIPAA Hub helps clinics achieve and maintain HIPAA compliance without the stress.',
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // YouTube embed URL
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

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

        {/* YouTube Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-[#0c0b1d]"
        >
          {!isPlaying ? (
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              {/* YouTube Thumbnail */}
              <img
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
            />
          )}
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
              Get Started with HIPAA Hub
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
