'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn } from './animated-section';
import { motion } from 'framer-motion';

const testimonials = [
  {
    title: 'Transformative Experience',
    text: 'Working with HIPAA Hub was a transformative experience for my business. The tailored solutions and friendly staff exceeded my expectation. I highly recommend them.',
    name: 'Akash Wilson',
    role: 'Small business owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    rating: 5.0
  },
  {
    title: 'Expert Support',
    text: 'Working with HIPAA Hub was a transformative experience for my business. The tailored solutions and friendly staff exceeded my expectation. I highly recommend them.',
    name: 'George Adams',
    role: 'Big business owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    rating: 5.0
  },
  {
    title: 'Smooth Process',
    text: 'Working with HIPAA Hub for my business. The tailored solutions exceeded my expectation. I highly recommend them.',
    name: 'Hassan Desai',
    role: 'Small business owner',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
    rating: 5.0
  },
  {
    title: 'Life Saver',
    text: 'HIPAA Hub saved us during our last audit. The evidence vault feature is incredible and the support team is always responsive.',
    name: 'Sarah Johnson',
    role: 'Medical Director',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    rating: 5.0
  },
  {
    title: 'Clear Guidance',
    text: 'Finally, a HIPAA platform that speaks plain English. The risk assessment questions are clear, and the generated documents are usable.',
    name: 'Michael Chen',
    role: 'IT Director',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    rating: 5.0
  }
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(testimonials.length - 3, prev + 1));
  };

  return (
    <section className="w-full bg-[#f3f5f9] py-24 md:py-32 font-extralight">
      <div className="max-w-7xl mx-auto px-6">
          
          {/* Header Section */}
          <FadeIn>
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-sm font-extralight text-zinc-600">
                  Empowering Communities
                </h2>
                <h3 className="text-4xl md:text-5xl font-extralight text-[#0c0b1d] leading-tight">
                  Our Positive <span className="text-[#1ad07a]">Social Impact</span>
                </h3>
                <p className="text-base text-zinc-600 font-extralight leading-relaxed">
                  Our compliance solutions are designed to help businesses achieve their goals and drive economic growth in their local area.
                </p>
              </div>
            
            {/* Trustpilot Section */}
            <div className="flex flex-col items-start lg:items-end gap-4 shrink-0">
              <div className="relative w-32 h-8">
                <Image
                  src="/images/Trustpilot_Logo_(2022).svg.png"
                  alt="Trustpilot"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#1ad07a] text-[#1ad07a]" />
                ))}
              </div>
              <p className="text-sm font-extralight text-zinc-600">
                Trust score 5.0 | 3,724 reviews
              </p>
            </div>
            </div>
          </FadeIn>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {visibleTestimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Title */}
                <h4 className="text-lg font-semibold text-[#0c0b1d] mb-3">
                  {testimonial.title}
                </h4>
                
                {/* Text */}
                <p className="text-sm text-zinc-600 font-extralight leading-relaxed mb-6">
                  {testimonial.text}
                </p>
                
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-200">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-[#0c0b1d] to-zinc-800 flex items-center justify-center text-white text-sm font-medium">${testimonial.name.split(' ').map(n => n[0]).join('')}</div>`;
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0c0b1d]">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-zinc-500 font-extralight">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-[#0c0b1d]">
                      {testimonial.rating} Rating
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            {/* Arrow Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= testimonials.length - 3}
                className="w-12 h-12 rounded-lg bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            {/* See All Button */}
            <Button
              variant="outline"
              className="border border-[#1ad07a] text-[#1ad07a] hover:bg-[#1ad07a] hover:text-white font-extralight rounded-lg px-6"
            >
              See all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
      </div>
    </section>
  );
}
