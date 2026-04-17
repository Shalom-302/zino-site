"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const clubs = [
  { 
    id: 1, 
    name: "LE MANS", 
    count: "3 CLUBS", 
    image: "https://images.unsplash.com/photo-1549638441-b787d2e11f14?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    name: "BOBIGNY", 
    count: "2 CLUBS", 
    image: "https://images.unsplash.com/photo-1502602898657-3e917247a183?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    name: "BOURGES", 
    count: "2 CLUBS", 
    image: "https://images.unsplash.com/photo-1512412023212-f05044ac923f?q=80&w=800&auto=format&fit=crop" 
  },
  { 
    id: 4, 
    name: "PARIS", 
    count: "5 CLUBS", 
    image: "https://images.unsplash.com/photo-1502602898657-3e917247a183?q=80&w=800&auto=format&fit=crop" 
  },
];

const OurClubs = () => {
  return (
    <section className="py-10 md:py-20 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start gap-8 md:gap-16">
        
        {/* Vertical Outlined Title */}
        <div className="flex-none flex flex-col pt-8">
          <h2 className="text-[40px] md:text-[70px] font-display italic leading-[0.85] tracking-tight uppercase select-none"
              style={{ 
                WebkitTextStroke: '2px #0F0F0F', 
                color: 'transparent',
              }}>
            NOS<br />CLUBS
          </h2>
        </div>

        {/* Horizontal Cards Area */}
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {clubs.map((club) => (
              <motion.div
                key={club.id}
                className="flex-none w-[300px] md:w-[380px] snap-start"
                whileHover={{ scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative aspect-[3/4] rounded-[32px] overflow-hidden group">
                  <Image
                    src={club.image}
                    alt={club.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 300px, 380px"
                  />
                  
                  {/* Overlay text - Matching the style in the screenshot */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 p-8 flex flex-col justify-start pt-12">
                    <h3 className="text-white text-[48px] md:text-[64px] font-display italic leading-none drop-shadow-lg">
                      {club.name}
                    </h3>
                    <p className="text-white font-bold text-lg md:text-xl -mt-1 drop-shadow-md">
                      {club.count}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurClubs;
