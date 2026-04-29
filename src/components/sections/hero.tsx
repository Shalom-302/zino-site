"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { proxyUrl } from '@/lib/supabase-url';

interface HeroSectionProps {
    initialImage?: string;
    initialMediaType?: 'image' | 'video';
    envContent?: Record<string, string>;
    environment?: 'fitness' | 'spa' | null;
}

const SPA_BG = '#F4EBD9';

const HeroSection = ({ initialImage, initialMediaType, envContent = {}, environment }: HeroSectionProps) => {
  const isSpa = environment === 'spa';
    const [heroMedia, setHeroMedia] = useState<string | null>(initialImage || null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>(initialMediaType || 'image');
    const [ready, setReady] = useState(false);
    // Start hidden — show only once the correct image URL is known (prevents flash on refresh)
    const [imgVisible, setImgVisible] = useState(false);
    // Track whether the current media has been decoded/loaded by the browser
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });

    // Parallax : image monte doucement pendant le scroll
    const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    // Overlay s'assombrit progressivement
    const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0.1, 0.55]);
    // Texte monte + disparaît
    const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-18%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 50);
        return () => clearTimeout(t);
    }, []);

    // Affiche l'image correcte dès qu'elle est connue, avec cross-fade si on en avait déjà une
    useEffect(() => {
        if (!initialImage) return;
        if (initialImage === heroMedia && imgVisible) return;

        if (!imgVisible) {
            // Première image disponible — l'afficher directement (fade in)
            setMediaLoaded(false);
            setHeroMedia(initialImage);
            setMediaType(initialMediaType || 'image');
            setImgVisible(true);
        } else {
            // Image déjà visible — cross-fade: hide first, swap URL, then show once loaded
            setImgVisible(false);
            setMediaLoaded(false);
            const t = setTimeout(() => {
                setHeroMedia(initialImage);
                setMediaType(initialMediaType || 'image');
                // imgVisible will be set to true once mediaLoaded fires (or for videos, immediately)
            }, 300);
            return () => clearTimeout(t);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialImage, initialMediaType]);

    return (
      <div ref={sectionRef} className="relative w-full h-[100dvh] overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.04 }}
          animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full"
          style={{ backgroundColor: isSpa ? SPA_BG : '#0F0F0F' }}
        >
          {/* Background Media — parallax */}
          <motion.div style={{ y: imageY }} className="absolute inset-0 z-0 overflow-hidden scale-[1.15] origin-top">
            <div className={`absolute inset-0 transition-opacity duration-500 ${imgVisible && mediaLoaded && heroMedia ? 'opacity-80' : 'opacity-0'}`}>
              {heroMedia && (mediaType === 'video' ? (
                <video
                  key={heroMedia}
                  src={proxyUrl(heroMedia)}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover"
                  onCanPlay={() => { setMediaLoaded(true); setImgVisible(true); }}
                />
              ) : (
                <Image
                  key={heroMedia}
                  src={proxyUrl(heroMedia)}
                  alt="Intense training at ZFitSpa"
                  fill
                  priority
                  className="object-cover object-center"
                  unoptimized
                  onLoad={() => { setMediaLoaded(true); setImgVisible(true); }}
                />
              ))}
            </div>
            {/* Overlay dynamique — sombre fitness uniquement */}
            {!isSpa && (
              <>
                <motion.div
                  style={{ opacity: overlayOpacity, backgroundColor: '#000' }}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-black/20" />
              </>
            )}
            {/* Bottom fade into next section */}
            <div
              className="absolute bottom-0 left-0 right-0 h-40 z-10"
              style={{ background: `linear-gradient(to top, ${isSpa ? SPA_BG : '#0F0F0F'}, transparent)` }}
            />
          </motion.div>
  
          {/* Content — monte + disparaît au scroll */}
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 flex flex-col items-center justify-center text-center p-6 lg:px-12 lg:pb-24 pt-24 md:pt-32 lg:pt-40 h-full">
          <div className="flex flex-col items-center justify-center text-[#FFFFFF] relative p-0">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-[#E13027] text-xs font-bold tracking-[0.3em] uppercase mb-4"
                >
                  {environment === 'spa'
                    ? (envContent['hero_badge'] && envContent['hero_badge'] !== 'BIEN-ÊTRE & SÉRÉNITÉ' ? envContent['hero_badge'] : 'Bien-être & Équilibre')
                    : (envContent['hero_badge'] || 'Performance et discipline')}
                </motion.p>
                  <motion.h1
                      initial={{ y: 40, opacity: 0 }}
                      animate={ready ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
                      transition={{ duration: 2.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[28px] sm:text-[38px] md:text-[48px] lg:text-[62px] xl:text-[76px] 2xl:text-[88px] font-[900] leading-[1.05] tracking-[-0.02em] max-w-[1100px] uppercase pt-8 lg:pt-0 text-center"
                      style={{ color: isSpa ? '#1C1108' : '#fff' }}
                    >
                      {envContent['hero_title'] || (environment === 'spa' ? 'UN SANCTUAIRE DÉDIÉ À L\u2019ART DU SOIN' : 'Vous méritez une salle à la hauteur de vos ambitions.')}
                  </motion.h1>
                </div>
            </motion.div>

          {/* Social Icons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="absolute bottom-10 right-6 lg:right-12 z-20 flex flex-col items-center gap-5"
          >
              <a href="https://www.instagram.com/zfitspa_salle_de_sport/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/zfitspa" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-white transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <div className="w-[1px] h-12 bg-white/30 mt-1" />
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
            onClick={() => {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo(window.innerHeight, {
                  duration: 1.8,
                  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
              } else {
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
              }
            }}
          >
            <span className="text-white text-[12px] uppercase tracking-[0.2em] mb-4 font-bold opacity-70">Découvrir</span>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-[2px] h-[60px] bg-gradient-to-b from-[#E13027] to-transparent"
            />
          </motion.div>
        </motion.div>
      </div>
    );
};

export default HeroSection;
