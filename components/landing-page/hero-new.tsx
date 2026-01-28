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

export default function HeroNew() {
  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden flex items-center justify-center py-32 font-extralight">
      
      {/* Background Layer (z-0) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f8f9fa] to-white z-0" />

      {/* DECORATIVE CIRCLES LAYER - ORBITAL SYSTEM (z-10) */}
      <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center z-10 font-extralight">
        {circleConfigs.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute hidden lg:flex items-center justify-center font-extralight"
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
                  sizes="(max-width: 768px) 0px, 480px"
                  unoptimized={false}
                />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* CONTENT SAFE ZONE (z-30) */}
      <div className="relative z-30 w-full font-extralight">
        <div className="max-w-5xl mx-auto px-6 py-24 font-extralight">
          <div className="flex flex-col items-center text-center space-y-10 font-extralight">
            
            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[2.1rem] md:text-[3.15rem] lg:text-[4.2rem] text-[#0d0d1f] leading-[1.1] font-extralight"
            >
              HIPAA compliance you can actually prove.
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-600 font-extralight max-w-3xl leading-relaxed"
            >
              Centralize policies, evidence, roles, and documentation in one secure system, ready for audits, inspections, and peace of mind.
            </motion.p>

            {/* Bullets */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center gap-3 pt-4 font-extralight"
            >
              <div className="flex items-center gap-3 text-base md:text-lg text-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] flex-shrink-0" />
                <span className="font-extralight">All HIPAA documentation in one place</span>
              </div>
              <div className="flex items-center gap-3 text-base md:text-lg text-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] flex-shrink-0" />
                <span className="font-extralight">Clear roles, policies, and evidence tracking</span>
              </div>
              <div className="flex items-center gap-3 text-base md:text-lg text-zinc-700">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1ad07a] flex-shrink-0" />
                <span className="font-extralight">Built to reduce risk, confusion, and liability</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 flex flex-col items-center gap-4 font-extralight"
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1acb77] text-white hover:bg-[#1acb77]/90 rounded-full px-12 py-7 text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 font-extralight"
                >
                  Get HIPAA compliant - the right way
                </Button>
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

    </section>
  );
}
