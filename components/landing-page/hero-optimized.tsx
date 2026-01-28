'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { motion } from 'framer-motion';

const circleConfigs = [
  {
    id: 1,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 0,
    content: '/images/8img/01.png',
  },
  {
    id: 2,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 45,
    content: '/images/8img/02.png',
  },
  {
    id: 3,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 90,
    content: '/images/8img/03.png',
  },
  {
    id: 4,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 135,
    content: '/images/8img/04.png',
  },
  {
    id: 5,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 180,
    content: '/images/8img/05.png',
  },
  {
    id: 6,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 225,
    content: '/images/8img/06.png',
  },
  {
    id: 7,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 270,
    content: '/images/8img/07.png',
  },
  {
    id: 8,
    size: 480,
    radius: 700,
    speed: 40,
    startAngle: 315,
    content: '/images/8img/08.png',
  }
];

export default function HeroOptimized() {
  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center py-20 sm:py-32 font-extralight">
      
      {/* Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f9fa] to-white z-0" />

      {/* DECORATIVE CIRCLES LAYER - ORBITAL SYSTEM (Desktop) */}
      <div className="absolute inset-0 pointer-events-none select-none hidden lg:flex items-center justify-center z-10 font-extralight">
        {circleConfigs.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute flex items-center justify-center font-extralight"
            style={{
              width: circle.radius * 2,
              height: circle.radius * 2,
            }}
            animate={{
              rotate: [circle.startAngle, circle.startAngle + 360],
            }}
            transition={{
              duration: circle.speed,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className="absolute flex items-center justify-center rounded-full overflow-hidden bg-white font-extralight"
              style={{
                width: circle.size,
                height: circle.size,
                left: '50%',
                top: 0,
                marginLeft: -circle.size / 2,
                marginTop: -circle.size / 2,
              }}
              animate={{
                rotate: [-(circle.startAngle), -(circle.startAngle + 360)],
              }}
              transition={{
                rotate: {
                  duration: circle.speed,
                  repeat: Infinity,
                  ease: "linear",
                }
              }}
            >
              <div className="relative w-full h-full font-extralight">
                <Image
                  src={circle.content}
                  alt={`HIPAA Compliance Feature ${circle.id}`}
                  fill
                  className="object-cover"
                  quality={95}
                  priority={circle.id <= 4}
                  sizes="480px"
                  unoptimized={false}
                />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* DECORATIVE CIRCLES LAYER - VERTICAL ORBITAL SYSTEM (Mobile) */}
      <div className="absolute inset-0 pointer-events-none select-none flex lg:hidden items-center justify-center z-10 font-extralight">
        {circleConfigs.slice(0, 4).map((circle, index) => {
          // Vertical orbit: circles move up and down, avoiding sides
          // Larger vertical radius to keep circles above and below content
          const verticalRadius = 400;
          const verticalSpeed = circle.speed;
          const baseDelay = index * 0.8; // Stagger the circles more
          
          return (
            <motion.div
              key={`mobile-${circle.id}`}
              className="absolute flex items-center justify-center rounded-full overflow-hidden bg-white font-extralight shadow-lg"
              style={{
                width: 180,
                height: 180,
                left: '50%',
                marginLeft: -90,
              }}
              animate={{
                y: [
                  -verticalRadius,
                  verticalRadius,
                  -verticalRadius,
                ],
                opacity: [0.4, 0.7, 0.4],
                scale: [0.9, 1, 0.9],
              }}
              transition={{
                duration: verticalSpeed,
                repeat: Infinity,
                ease: "easeInOut",
                delay: baseDelay,
              }}
            >
              <div className="relative w-full h-full font-extralight">
                <Image
                  src={circle.content}
                  alt={`HIPAA Compliance Feature ${circle.id}`}
                  fill
                  className="object-cover"
                  quality={85}
                  priority={index < 2}
                  sizes="180px"
                  unoptimized={false}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CONTENT SAFE ZONE */}
      <div className="relative z-30 w-full font-extralight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 font-extralight">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-10 font-extralight">
            
            {/* Headline - THE HOOK */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[1.75rem] sm:text-[2rem] md:text-[2.5rem] lg:text-[3.31rem] text-[#0d0d1f] leading-[1.2] sm:leading-[1.1] font-extralight px-4"
            >
              <span className="block">If an auditor asked you right now,</span>
              <span className="block">"Where's your documentation?"</span>
              <span className="block">could you answer in 5 minutes?</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-zinc-600 font-extralight max-w-3xl leading-relaxed px-4"
            >
              <span className="block sm:inline">Most clinics can't. That's why they fail audits.</span>
              <span className="block sm:inline mt-1 sm:mt-0"> </span>
              <span className="block sm:inline text-[#0d0d1f] font-normal">HIPAA Hub makes your compliance provable in 2 hours.</span>
            </motion.p>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-6 flex flex-col items-center gap-4 font-extralight"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1acb77] text-white hover:bg-[#1acb77]/90 rounded-full px-12 py-7 text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-extralight"
                >
                  Show Me How
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

    </section>
  );
}
