"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEnvironment } from "@/context/environment-context";
import { proxyUrl } from "@/lib/supabase-url";

interface EntranceHeroProps {
  fitnessImg: string;
  spaImg: string;
  fitnessMediaType?: 'image' | 'video';
  spaMediaType?: 'image' | 'video';
}

export default function EntranceHero({ fitnessImg, spaImg, fitnessMediaType = 'image', spaMediaType = 'image' }: EntranceHeroProps) {
  const { hasChosen, resolved, setEnvironment } = useEnvironment();
  const [chosen, setChosen] = useState<"fitness" | "spa" | null>(null);
  // null = waiting for context to resolve (prevents flash of chooser)
  const [phase, setPhase] = useState<"idle" | "expanding" | "sliding" | "done" | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoControls = useAnimation();

  // Once sessionStorage is resolved, decide whether to show chooser or skip it
  useEffect(() => {
    if (!resolved) return;
    if (hasChosen) {
      setPhase("done"); // Already chosen — never show chooser
    } else {
      setPhase("idle"); // New visitor — show chooser
    }
  }, [resolved, hasChosen]);

  // Reset quand le contexte est resetté (logo → chooser)
  useEffect(() => {
    if (resolved && !hasChosen) {
      setChosen(null);
      setPhase("idle");
      logoControls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
    }
  }, [hasChosen, resolved]);

  // Bloquer le scroll uniquement pendant le chooser (pas pendant le chargement initial)
  useEffect(() => {
    document.body.style.overflow = (phase === "idle" || phase === "expanding" || phase === "sliding") ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  // Passer à "done" après le slide
  useEffect(() => {
    if (phase === "sliding") {
      const t = setTimeout(() => setPhase("done"), 700);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleChoice = (env: "fitness" | "spa") => {
    if (phase !== "idle" || !resolved) return;
    setChosen(env);
    setPhase("expanding");

    // Après l'expansion, animer le logo vers la navbar
    setTimeout(async () => {
      if (logoRef.current) {
        const logoRect = logoRef.current.getBoundingClientRect();
        // Cible : coin supérieur gauche, taille réduite (navbar logo ~127px de haut)
        const targetX = 16 - logoRect.left; // px-4 = 16px depuis le bord gauche
        const targetY = 0 - logoRect.top;   // top-0
        const targetScale = 127 / logoRect.height; // logo navbar = 127px

        setPhase("sliding");
        await logoControls.start({
          x: targetX,
          y: targetY,
          scale: targetScale,
          opacity: 0,
          transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
        });
      }
      setEnvironment(env);
    }, 850);
  };

  // null = still loading, done = already chosen → don't render chooser
  if (phase === null || phase === "done") return null;

  const fitnessFlex = phase === "expanding" || phase === "sliding" ? (chosen === "fitness" ? 1 : 0) : 1;
  const spaFlex     = phase === "expanding" || phase === "sliding" ? (chosen === "spa"     ? 1 : 0) : 1;

  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex flex-col"
      animate={{ opacity: 1 }}
    >
      {/* Logo centré — glisse vers la navbar au choix */}
      <motion.div
        ref={logoRef}
        animate={logoControls}
        className="absolute top-0 left-0 right-0 flex justify-center pt-5 z-30 pointer-events-none"
        style={{ transformOrigin: "top left" }}
      >
        <Image
          src="/logo.png"
          alt="ZFitSpa"
          width={260}
          height={90}
          className="h-[70px] sm:h-[90px] md:h-[110px] w-auto object-contain"
          priority
          unoptimized
        />
      </motion.div>

      {/* Panneaux */}
      <div className="flex-1 flex flex-col sm:flex-row min-h-0">

        {/* FITNESS */}
        <motion.div
          className="relative overflow-hidden cursor-pointer group"
          initial={{ flexGrow: 1 }}
          animate={{ flexGrow: fitnessFlex }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          style={{ flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0 }}
          onClick={() => handleChoice("fitness")}
        >
          <div className="absolute inset-0">
             {fitnessImg ? (
               fitnessMediaType === 'video' ? (
                 <video
                   src={proxyUrl(fitnessImg)}
                   autoPlay loop muted playsInline preload="auto"
                   className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                 />
               ) : (
                 <Image
                   src={proxyUrl(fitnessImg)}
                   alt="Fitness"
                   fill
                   className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                   priority
                   unoptimized
                 />
               )
             ) : (
               <div className="absolute inset-0 bg-zinc-900" />
             )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80 group-hover:via-black/10 transition-all duration-500" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center pt-24 sm:pt-28 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <p className="text-[#E13027] text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-2 sm:mb-3">
                Performance &amp; Discipline
              </p>
              <h2
                className="text-white font-black uppercase leading-none tracking-tight mb-3 sm:mb-4"
                style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
              >
                FITNESS
              </h2>
              <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-[260px] mx-auto leading-relaxed mb-5 sm:mb-8">
                Préparation physique, entrainement structuré et coaching d&apos;excellence.
              </p>
              <div className="inline-flex items-center gap-2 border border-white/40 px-6 py-2.5 text-white text-[10px] sm:text-xs uppercase tracking-widest group-hover:bg-[#E13027] group-hover:border-[#E13027] transition-all duration-500">
                Fitness
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>

          {/* Séparateur OU */}
          <AnimatePresence>
            {phase === "idle" && (
              <motion.div
                key="separator"
                className="relative z-20 flex-shrink-0 flex items-center justify-center md:w-0 md:h-auto h-0 w-auto"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                {/* Ligne verticale desktop/landscape */}
                <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-px bg-white/20" />
                {/* Ligne horizontale mobile portrait */}
                <div className="sm:hidden absolute left-0 right-0 top-0 h-px bg-white/20" />
                {/* Cercle OU */}
                <div className="absolute w-10 h-10 rounded-full bg-black border border-white/25 flex items-center justify-center z-10">
                  <span className="text-white/60 text-[9px] font-bold tracking-widest">ET</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        {/* SPA */}
        <motion.div
          className="relative overflow-hidden cursor-pointer group"
          initial={{ flexGrow: 1 }}
          animate={{ flexGrow: spaFlex }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
          style={{ flexShrink: 1, flexBasis: 0, minWidth: 0, minHeight: 0 }}
          onClick={() => handleChoice("spa")}
        >
          <div className="absolute inset-0">
             {spaImg ? (
               spaMediaType === 'video' ? (
                 <video
                   src={proxyUrl(spaImg)}
                   autoPlay loop muted playsInline preload="auto"
                   className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                 />
               ) : (
                 <Image
                   src={proxyUrl(spaImg)}
                   alt="Spa"
                   fill
                   className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                   priority
                   unoptimized
                 />
               )
             ) : (
               <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #EDE0CA 0%, #C4A47C 45%, #7A5A38 100%)' }} />
             )}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                background: 'linear-gradient(to bottom, rgba(28,18,8,0.55) 0%, rgba(160,120,60,0.18) 50%, rgba(28,18,8,0.72) 100%)',
              }}
            />
            {/* Warm golden shimmer — luxe belge */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: 'linear-gradient(to bottom, rgba(212,168,100,0.12) 0%, rgba(240,210,150,0.06) 50%, rgba(140,100,50,0.18) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center pt-24 sm:pt-28 md:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              <p className="text-[#E13027] text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-2 sm:mb-3">
                Bien-être &amp; Équilibre
              </p>
              <h2
                className="text-white font-black uppercase leading-none tracking-tight mb-3 sm:mb-4"
                style={{ fontSize: "clamp(3rem, 10vw, 7rem)" }}
              >
                SPA
              </h2>
              <p className="text-white/70 text-xs sm:text-sm md:text-base max-w-[260px] mx-auto leading-relaxed mb-5 sm:mb-8">
                Soins experts, rituels corps et équilibre profond.
              </p>
              <div className="inline-flex items-center gap-2 border border-white/40 px-6 py-2.5 text-white text-[10px] sm:text-xs uppercase tracking-widest group-hover:bg-[#E13027] group-hover:border-[#E13027] transition-all duration-500">
                Spa
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
