"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEnvironment } from '@/context/environment-context';
import { proxyUrl } from '@/lib/supabase-url';

interface CoreWorkoutProps {
  initialTop?: string;
  initialMiddle?: string;
  initialBottom?: string;
  initialTopType?: 'image' | 'video';
  initialMiddleType?: 'image' | 'video';
  initialBottomType?: 'image' | 'video';
  envImages?: Record<string, { url: string; type: string }>;
}

const features = [
  {
    title: "Coaching Privé",
    intro: "L'excellence ne s'improvise pas.",
    description: "Nos coachs vous accompagnent à travers un programme entièrement personnalisé, construit selon votre morphologie, vos objectifs et votre niveau. Chaque séance est pensée pour optimiser votre progression et révéler votre plein potentiel.",
    bullets: ["Un cadre structuré.", "Un suivi attentif.", "Une exigence maîtrisée."],
    key: "healthy_mind_top",
  },
  {
    title: "Analyse InBody",
    intro: "La transformation commence par la précision.",
    description: "L'analyse InBody offre une lecture détaillée de votre composition corporelle afin d'orienter intelligemment votre entraînement. Elle permet de mesurer vos progrès et d'ajuster votre programme avec rigueur.",
    bullets: ["Des données concrètes.", "Des décisions éclairées.", "Des résultats mesurables."],
    key: "healthy_mind_bottom",
  },
  {
    title: "Reformer Pilates",
    intro: "",
    description: "Le Reformer Pilates est un travail personnalisé sur machine, conçu pour renforcer les muscles profonds, améliorer l'alignement et affiner la posture. Chaque mouvement est exécuté avec contrôle et rigueur, sous la supervision attentive de votre coach.",
    bullets: ["Résistance maîtrisée.", "Activation ciblée.", "Progression en profondeur."],
    key: "healthy_mind_middle",
  },
];

const PARTNERS = [
  {
    num: '01',
    name: 'LA SULTANE DE SABA',
    subtitle: 'Rituels & sensorialité',
    paragraphs: [
      "Maison parisienne inspirée des traditions orientales, La Sultane de Saba célèbre l'art du rituel à travers des textures enveloppantes et des fragrances signatures.",
      "Ses protocoles associent gestuelle experte et richesse sensorielle pour offrir une expérience immersive, élégante et maîtrisée.",
    ],
    tagline: 'Un voyage des sens, exécuté avec exigence.',
    imgKey: 'partner_sultane',
    imgDefault: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800',
  },
  {
    num: '02',
    name: 'GEMOLOGY',
    subtitle: 'Science & cosmétique minérale',
    paragraphs: [
      "Pionnière de la cosmétique aux oligo-éléments, Gemology associe recherche scientifique et minéraux précieux pour des soins ciblés et hautement performants.",
      "Chaque formule exploite les propriétés des pierres pour revitaliser, rééquilibrer et sublimer la peau avec précision.",
    ],
    tagline: "Une expertise innovante au service de l'efficacité.",
    imgKey: 'partner_gemology',
    imgDefault: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800',
  },
];

const CoreWorkout = ({ initialTop, initialMiddle, initialBottom, initialTopType, initialMiddleType, initialBottomType, envImages }: CoreWorkoutProps) => {
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';
  const spaBg = '#F4EBD9';
  const spaText = '#1C1108';
  const [images, setImages] = useState<Record<string, string>>({
    healthy_mind_top: initialTop || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/healthy_mind_top-15ztn1jhy77.jpg",
    healthy_mind_bottom: initialBottom || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/healthy_mind_bottom-fj1qoqqgnz.jpg",
    healthy_mind_middle: initialMiddle || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/healthy_mind_top-15ztn1jhy77.jpg",
  });
  const [mediaTypes, setMediaTypes] = useState<Record<string, 'image' | 'video'>>({
    healthy_mind_top: initialTopType || 'image',
    healthy_mind_bottom: initialBottomType || 'image',
    healthy_mind_middle: initialMiddleType || 'image',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Mettre à jour quand envImages change (changement d'environnement)
  useEffect(() => {
    if (envImages) {
      setImages({
        healthy_mind_top: envImages['healthy_mind_top']?.url || images.healthy_mind_top,
        healthy_mind_bottom: envImages['healthy_mind_bottom']?.url || images.healthy_mind_bottom,
        healthy_mind_middle: envImages['healthy_mind_middle']?.url || images.healthy_mind_middle,
      });
      setMediaTypes({
        healthy_mind_top: (envImages['healthy_mind_top']?.type as 'image' | 'video') || 'image',
        healthy_mind_bottom: (envImages['healthy_mind_bottom']?.type as 'image' | 'video') || 'image',
        healthy_mind_middle: (envImages['healthy_mind_middle']?.type as 'image' | 'video') || 'image',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envImages]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const sections = document.querySelectorAll('[data-feature-index]');
    sections.forEach((section) => {
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(Number(section.getAttribute('data-feature-index')));
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(section);
      observers.push(obs);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  // ── SPA VERSION ─────────────────────────────────────────────────────────────
  if (isSpa) {
    const partnerImages = {
      partner_sultane: envImages?.['partner_sultane']?.url || PARTNERS[0].imgDefault,
      partner_gemology: envImages?.['partner_gemology']?.url || PARTNERS[1].imgDefault,
    };

    return (
      <section id="nos-maisons" className="w-full" style={{ backgroundColor: spaBg }}>

        {/* Desktop */}
        <div className="hidden lg:flex relative">

          {/* LEFT — sticky */}
          <div className="w-1/2 sticky top-[72px] h-[calc(100dvh-72px)] flex flex-col justify-center px-20 xl:px-28">
            <div className="mb-12">
              <p className="text-[10px] uppercase tracking-[0.35em] font-medium mb-4" style={{ color: '#C4A87A' }}>
                Le Spa by Z Fit
              </p>
              <h2 className="text-[40px] xl:text-[52px] font-[900] uppercase leading-none tracking-[-0.03em]" style={{ fontFamily: 'Georgia, serif', color: spaText }}>
                NOS MAISONS<br />PARTENAIRES
              </h2>
            </div>

            <div className="relative h-80">
              {PARTNERS.map((p, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: activeIndex === i ? 1 : 0, y: activeIndex === i ? 0 : 20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute inset-0 flex flex-col ${activeIndex === i ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  <div className="w-8 h-px mb-6" style={{ backgroundColor: '#C4A87A' }} />
                  <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-2" style={{ color: '#C4A87A' }}>
                    {p.num}
                  </p>
                  <h3 className="text-[22px] font-[900] uppercase tracking-[-0.01em] mb-1" style={{ fontFamily: 'Georgia, serif', color: spaText }}>
                    {p.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] font-medium mb-6" style={{ color: '#C4A87A' }}>
                    {p.subtitle}
                  </p>
                  {p.paragraphs.map((para, j) => (
                    <p key={j} className="font-light leading-[1.85] text-[14px] max-w-sm mb-3" style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.65)' }}>
                      {para}
                    </p>
                  ))}
                  {p.tagline && (
                    <p className="text-[13px] italic mt-2" style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.45)' }}>
                      {p.tagline}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex gap-3 mt-10">
              {PARTNERS.map((_, j) => (
                <button
                  key={j}
                  onClick={() => document.querySelector(`[data-feature-index="${j}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="h-[1px] transition-all duration-500 cursor-pointer"
                  style={{
                    width: j === activeIndex ? 32 : 12,
                    background: j === activeIndex ? '#C4A87A' : 'rgba(28,17,8,0.15)',
                  }}
                  aria-label={`Aller au partenaire ${j + 1}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — scrollable images */}
          <div className="w-1/2">
            {PARTNERS.map((p, i) => (
              <div key={i} data-feature-index={i} className="h-[100dvh] flex items-center justify-center px-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-[75vh]"
                >
                  <Image
                    src={partnerImages[p.imgKey as keyof typeof partnerImages]}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="50vw"
                    unoptimized
                  />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#C4A87A' }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden flex flex-col">
          <div className="sticky top-[72px] z-10 px-8 pt-8 pb-6" style={{ backgroundColor: spaBg }}>
            <p className="text-[10px] uppercase tracking-[0.35em] font-medium mb-3" style={{ color: '#C4A87A' }}>Le Spa by Z Fit</p>
            <h2 className="text-[28px] font-[900] uppercase leading-none tracking-[-0.02em]" style={{ fontFamily: 'Georgia, serif', color: spaText }}>
              NOS MAISONS<br />PARTENAIRES
            </h2>
          </div>
          {PARTNERS.map((p, i) => (
            <div key={i} className="flex flex-col">
              <motion.div
                className="relative w-full overflow-hidden"
                style={{ height: '70vw' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={partnerImages[p.imgKey as keyof typeof partnerImages]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  css={{ backgroundColor: '#C4A87A' }}
                />
              </motion.div>
              <motion.div
                className="px-8 py-10"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-6 h-px mb-4" style={{ backgroundColor: '#C4A87A' }} />
                <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-1" style={{ color: '#C4A87A' }}>{p.num}</p>
                <h3 className="text-[20px] font-[900] uppercase tracking-[-0.01em] mb-1" style={{ fontFamily: 'Georgia, serif', color: spaText }}>{p.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-5" style={{ color: '#C4A87A' }}>{p.subtitle}</p>
                {p.paragraphs.map((para, j) => (
                  <p key={j} className="font-light leading-[1.9] text-[14px] mb-3" style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.65)' }}>{para}</p>
                ))}
                {p.tagline && (
                  <p className="text-[13px] italic mt-2" style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.45)' }}>{p.tagline}</p>
                )}
              </motion.div>
              {i < PARTNERS.length - 1 && (
                <div className="mx-8 h-[1px]" style={{ backgroundColor: 'rgba(28,17,8,0.08)' }} />
              )}
            </div>
          ))}
        </div>

      </section>
    );
  }

  // ── FITNESS VERSION ──────────────────────────────────────────────────────────
  return (
    <section ref={containerRef} className="w-full" style={{ backgroundColor: '#000' }}>

          {/* Desktop: sticky layout */}
        <div className="hidden lg:flex relative">

        {/* LEFT — sticky text panel */}
        <div className="w-1/2 sticky top-[72px] h-[calc(100dvh-72px)] flex flex-col justify-center px-20 xl:px-28">
          {/* Fixed title */}
          <div className="mb-12">

            <h2 className="text-[48px] xl:text-[60px] font-light leading-[1.05]" style={{ fontFamily: 'Georgia, serif', color: isSpa ? spaText : '#FFFFFF' }}>
              Accompagnement<br />sur mesure
            </h2>
          </div>

          {/* Animated description */}
          <div className="relative h-72">
          {features.map((f, i) => (
              <motion.div
                key={i}
                animate={{ opacity: activeIndex === i ? 1 : 0, y: activeIndex === i ? 0 : 20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`absolute inset-0 flex flex-col ${activeIndex === i ? 'pointer-events-auto' : 'pointer-events-none'}`}
              >
                <div className="w-8 h-[1px] bg-[#E13027] mb-6" />
                <p className="text-[13px] font-bold tracking-[0.2em] uppercase mb-4 text-[#E13027]">{f.title}</p>
                {f.intro && (
                  <p className="font-semibold leading-[1.5] text-[15px] max-w-sm mb-3" style={{ color: isSpa ? 'rgba(28,17,8,0.9)' : '#FFFFFF' }}>
                    {f.intro}
                  </p>
                )}
                <p className="font-light leading-[1.85] text-[15px] max-w-sm mb-4" style={{ color: isSpa ? 'rgba(28,17,8,0.7)' : '#FFFFFF' }}>
                  {f.description}
                </p>
                <ul className="flex flex-col gap-1">
                  {f.bullets.map((b) => (
                    <li key={b} className="text-[15px] font-light" style={{ color: isSpa ? 'rgba(28,17,8,0.55)' : 'rgba(255,255,255,0.6)' }}>{b}</li>
                  ))}
                </ul>
              </motion.div>
          ))}
          </div>

          {/* Progress dots */}
          <div className="flex gap-3 mt-10">
            {features.map((_, j) => (
              <button
                key={j}
                onClick={() => document.querySelector(`[data-feature-index="${j}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="h-[1px] transition-all duration-500 cursor-pointer"
                style={{
                  width: j === activeIndex ? 32 : 12,
                  background: j === activeIndex ? '#E13027' : (isSpa ? 'rgba(28,17,8,0.15)' : 'rgba(255,255,255,0.2)'),
                }}
                aria-label={`Aller à la section ${j + 1}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — scrollable images */}
        <div className="w-1/2">
          {features.map((f, i) => (
            <div
              key={i}
              data-feature-index={i}
              className="h-[100dvh] flex items-center justify-center px-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full h-[75vh]"
              >
                {mediaTypes[f.key] === 'video' ? (
                  <video
                    src={proxyUrl(images[f.key])}
                    autoPlay loop muted playsInline preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover${isSpa ? '' : ' grayscale'}`}
                  />
                ) : (
                  <Image
                    src={proxyUrl(images[f.key])}
                    alt={f.title}
                    fill
                    className={`object-cover${isSpa ? '' : ' grayscale'}`}
                    sizes="50vw"
                    unoptimized
                  />
                )}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
                />
              </motion.div>
            </div>
          ))}
        </div>

      </div>

          {/* Mobile: stacked layout */}
          <div className="lg:hidden flex flex-col">
            {/* Titre sticky sur mobile */}
            <div className="sticky top-[72px] z-10 px-8 pt-6 pb-6" style={{ backgroundColor: isSpa ? spaBg : '#000' }}>
              <h2 className="text-[30px] font-light leading-[1.1]" style={{ fontFamily: 'Georgia, serif', color: isSpa ? spaText : '#FFFFFF' }}>
                Accompagnement<br />sur mesure
              </h2>
            </div>

          {features.map((f, i) => (
            <div key={i} className="flex flex-col">
              {/* Image pleine largeur avec reveal */}
              <motion.div
                className="relative w-full overflow-hidden"
                style={{ height: '70vw' }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {mediaTypes[f.key] === 'video' ? (
                  <video
                    src={proxyUrl(images[f.key])}
                    autoPlay loop muted playsInline preload="auto"
                    className={`absolute inset-0 w-full h-full object-cover${isSpa ? '' : ' grayscale'}`}
                  />
                ) : (
                  <Image
                    src={proxyUrl(images[f.key])}
                    alt={f.title}
                    fill
                    className={`object-cover${isSpa ? '' : ' grayscale'}`}
                    sizes="100vw"
                    unoptimized
                  />
                )}
                {/* Barre rouge animée */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originX: 0 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
                />
                {/* Numéro de feature */}
                <div className="absolute top-4 right-4 text-[11px] text-white tracking-[0.2em]">
                  0{i + 1}
                </div>
              </motion.div>

              {/* Texte avec fade-up */}
              <motion.div
                className="px-8 py-10"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-6 h-[1px] bg-[#E13027] mb-4" />
                <p className="text-[#E13027] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">{f.title}</p>
                {f.intro && (
                  <p className="font-semibold leading-[1.5] text-[14px] mb-3" style={{ color: isSpa ? 'rgba(28,17,8,0.9)' : '#FFFFFF' }}>
                    {f.intro}
                  </p>
                )}
                <p className="font-light leading-[1.9] text-[14px] mb-4" style={{ color: isSpa ? 'rgba(28,17,8,0.7)' : '#FFFFFF' }}>
                  {f.description}
                </p>
                <ul className="flex flex-col gap-1">
                  {f.bullets.map((b) => (
                    <li key={b} className="text-[15px] font-light" style={{ color: isSpa ? 'rgba(28,17,8,0.55)' : 'rgba(255,255,255,0.6)' }}>{b}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Séparateur entre sections */}
              {i < features.length - 1 && (
                <div className="mx-8 h-[1px]" style={{ backgroundColor: isSpa ? 'rgba(28,17,8,0.08)' : 'rgba(255,255,255,0.05)' }} />
              )}
            </div>
          ))}
        </div>
    </section>
  );
};

export default CoreWorkout;
