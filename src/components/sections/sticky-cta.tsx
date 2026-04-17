"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling down 600px
      if (window.scrollY > 600) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Observer to hide when cta-journey or footer is visible
    const observer = new IntersectionObserver(
      (entries) => {
        const isAnyVisible = entries.some(entry => entry.isIntersecting);
        setIsEndReached(isAnyVisible);
      },
      {
        threshold: 0,
      }
    );

    const ctaSection = document.getElementById('cta-journey');
    const footerSection = document.querySelector('footer');
    
    if (ctaSection) observer.observe(ctaSection);
    if (footerSection) observer.observe(footerSection);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (ctaSection) observer.unobserve(ctaSection);
      if (footerSection) observer.unobserve(footerSection);
    };
  }, []);

  return (
    <AnimatePresence>
      {(isVisible && !isEndReached) && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-[#DCD5C5] py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
            >
              <div className="w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between">
                {/* Left Side: Logo & Links */}
                <div className="flex items-center gap-8">
                    <a href="/" className="flex items-center" aria-label="ZFitSpa Home">
                                <Image
                                    src="/logo.png"
                                    alt="ZFitSpa Logo"
                                    width={112}
                                    height={112}
                                    className="w-20 h-20 md:w-28 md:h-28 object-contain"
                                    unoptimized
                                  />
                  </a>
                </div>

      {/* Right Side: Primary CTA */}
            <div className="flex items-center">
                    <Link
                      href="/reservation"
                      className="btn-primary inline-flex items-center justify-center px-5 sm:px-6 md:px-8 h-[38px] sm:h-[42px] md:h-[46px] lg:h-[50px] text-[16px] sm:text-[17px] md:text-[18px] lg:text-[20px] whitespace-nowrap"
                    >
                    Faire ma réservation
                  </Link>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;