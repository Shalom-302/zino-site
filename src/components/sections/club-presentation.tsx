"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const IMG_TOP = "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/healthy_mind_top-15ztn1jhy77.jpg";
const IMG_BOTTOM = "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/healthy_mind_bottom-fj1qoqqgnz.jpg";
const IMG_SPA = "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/art_body_top-yqmemry028.jpg";
const IMG_MUSCU = "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/space_muscu-armo5m5stye.jpg";

type MediaItem = { url: string; type: string };

const Media = ({ item, alt, className, sizes }: { item: MediaItem; alt: string; className?: string; sizes?: string }) => {
  if (item.type === 'video') {
    return <video src={item.url} className={`w-full h-full object-cover ${className || ''}`} autoPlay muted loop playsInline />;
  }
  return <Image src={item.url} alt={alt} fill className={`object-cover ${className || ''}`} sizes={sizes} unoptimized />;
};

const ClubPresentation = ({ envContent = {}, environment, envImages }: { envContent?: Record<string, string>; environment?: 'fitness' | 'spa' | null; envImages?: Record<string, { url: string; type: string }> }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [media, setMedia] = useState<{ top: MediaItem; bottom: MediaItem; spa: MediaItem; muscu: MediaItem; spaTop: MediaItem }>({
    top: { url: IMG_TOP, type: 'image' },
    bottom: { url: IMG_BOTTOM, type: 'image' },
    spa: { url: IMG_SPA, type: 'image' },
    muscu: { url: IMG_MUSCU, type: 'image' },
    spaTop: { url: IMG_SPA, type: 'image' },
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const y3 = useTransform(scrollYProgress, [0, 1], [-20, 30]);

  useEffect(() => {
    if (envImages) {
      setMedia({
        top:    { url: envImages['healthy_mind_top']?.url    || IMG_TOP,    type: envImages['healthy_mind_top']?.type    || 'image' },
        bottom: { url: envImages['healthy_mind_bottom']?.url || IMG_BOTTOM, type: envImages['healthy_mind_bottom']?.type || 'image' },
        spa:    { url: envImages['art_body_top']?.url        || IMG_SPA,    type: envImages['art_body_top']?.type        || 'image' },
        muscu:  { url: envImages['space_muscu']?.url         || IMG_MUSCU,  type: envImages['space_muscu']?.type         || 'image' },
        spaTop: { url: envImages['spa_sanctuaire_portrait']?.url || envImages['art_body_top']?.url || IMG_SPA, type: envImages['spa_sanctuaire_portrait']?.type || 'image' },
      });
      return;
    }

    const fetchImages = async () => {
      const keys = ['healthy_mind_top', 'healthy_mind_bottom', 'art_body_top', 'space_muscu', 'spa_sanctuaire_portrait'];
      const snap = await getDocs(query(collection(db, 'site_images'), where('__name__', 'in', keys)));
      const map: Record<string, { url: string; type: string }> = {};
      snap.forEach(d => { map[d.id] = { url: d.data().image_url || '', type: d.data().media_type || 'image' }; });
      setMedia({
        top:    map['healthy_mind_top']    || { url: IMG_TOP,    type: 'image' },
        bottom: map['healthy_mind_bottom'] || { url: IMG_BOTTOM, type: 'image' },
        spa:    map['art_body_top']        || { url: IMG_SPA,    type: 'image' },
        muscu:  map['space_muscu']         || { url: IMG_MUSCU,  type: 'image' },
        spaTop: map['spa_sanctuaire_portrait'] || map['art_body_top'] || { url: IMG_SPA, type: 'image' },
      });
    };
    fetchImages();
  }, [envImages]);

  const isSpa = environment === 'spa';

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={isSpa ? {
        background: 'linear-gradient(160deg, #F4EBD9 0%, #EAD8C0 40%, #F0E4CC 100%)',
      } : { background: '#000' }}
    >

      {/* ─── DESKTOP ─── */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

        {/* LEFT — text */}
        <div
          className="flex flex-col justify-center px-20 xl:px-28 py-32 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {!isSpa ? (
              <>
                <h2
                  className="text-[52px] xl:text-[64px] font-light leading-[1.02] mb-4"
                  style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}
                >
                  UN CENTRE D&apos;EXCELLENCE ET PERFORMANCE
                </h2>
                <p className="text-[#E13027] text-[13px] font-bold tracking-[0.25em] uppercase mb-8">
                  LE CLUB Z FIT
                </p>
                <div className="w-8 h-[1px] bg-[#E13027] mb-8" />
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-6" style={{ color: '#FFFFFF' }}>
                  Z FIT est bien plus qu&apos;une salle de sport. C&apos;est un centre de remise en forme moderne où l&apos;exigence rencontre l&apos;élégance. Ici, chaque séance est une étape vers une meilleure version de vous-même.
                </p>
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-6" style={{ color: '#FFFFFF' }}>
                  Club certifié Les Mills™, Z FIT s&apos;appuie sur des programmes de renommée internationale, un encadrement expert et des outils d&apos;analyse avancés comme le InBody pour garantir une progression maîtrisée. Le coaching personnalisé vient enrichir une expérience complète et structurée.
                </p>
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px]" style={{ color: '#FFFFFF' }}>
                  Notre ambition : vous offrir les outils, l&apos;encadrement et l&apos;environnement nécessaires pour transformer votre énergie en performance et votre discipline en résultats.
                </p>
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-12 mt-6" style={{ color: '#FFFFFF' }}>
                  Bienvenue au club.
                </p>
                <div className="flex gap-10 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {[
                    { value: '10+', label: 'Instructeurs certifiés' },
                    { value: '20+', label: 'Concepts et cours' },
                    { value: '500+', label: 'Progressions encadrées' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[32px] font-light leading-none mb-1" style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
                        {stat.value}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: '#FFFFFF' }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2
                  className="text-[52px] xl:text-[64px] font-light leading-[1.02] mb-4"
                  style={{ fontFamily: 'Georgia, serif', color: '#1C1108' }}
                >
                  UN SANCTUAIRE DE BIEN ETRE
                </h2>
                <p className="text-[#E13027] text-[13px] font-bold tracking-[0.25em] uppercase mb-8">
                  LE SPA BY Z FIT
                </p>
                <div className="w-8 h-[1px] bg-[#E13027] mb-8" />
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-6" style={{ color: 'rgba(28,17,8,0.75)' }}>
                  Pensé comme un institut de référence, le Spa by Z FIT propose des soins visage et corps alliant technicité et sensorialité.
                </p>
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-6" style={{ color: 'rgba(28,17,8,0.75)' }}>
                  Nous travaillons avec des maisons reconnues afin d&apos;offrir des protocoles experts, réalisés dans un cadre raffiné. Chaque protocole est exécuté avec précision et maîtrise.
                </p>
                <p className="font-light leading-[1.9] text-[15px] max-w-[380px] mb-12" style={{ color: 'rgba(28,17,8,0.75)' }}>
                  Un lieu dédié au soin, à la qualité du geste et à l&apos;excellence du détail.
                </p>
                <div className="flex gap-10 pt-10" style={{ borderTop: '1px solid rgba(28,17,8,0.12)' }}>
                  {[
                    { value: '20+', label: 'Soins disponibles' },
                    { value: '6+', label: 'Espaces dédiés' },
                    { value: '5+', label: 'Praticiennes formées' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-[32px] font-light leading-none mb-1" style={{ fontFamily: 'Georgia, serif', color: '#1C1108' }}>
                        {stat.value}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: 'rgba(28,17,8,0.6)' }}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* RIGHT — images */}
        <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>

          {isSpa ? (
            /* ── SPA disposition : deux portraits côte à côte, aérés ── */
            <>
              {/* Portrait unique centré */}
              <motion.div
                style={{ y: y1 }}
                className="absolute inset-[4%] z-20"
              >
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden w-full h-full"
                >
                  <Media item={media.spaTop} alt="Soin spa" sizes="50vw" />
                </motion.div>
              </motion.div>

              {/* Texte décoratif vertical */}
              <div
                className="absolute bottom-[30%] left-0 z-10 select-none pointer-events-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                <span className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: 'rgba(28,17,8,0.4)' }}>
                  Le Spa by Z Fit – Abidjan
                </span>
              </div>
            </>
          ) : (
            /* ── FITNESS disposition : collage original ── */
            <>
              {/* Top image — large, offset left */}
              <motion.div style={{ y: y1 }} className="absolute top-[8%] left-[5%] w-[55%] z-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '3/4' }}
                >
                  <Media item={media.top} alt="Fitness" className="grayscale" sizes="30vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 70%)' }} />
                </motion.div>
              </motion.div>

              {/* Bottom-right image — smaller */}
              <motion.div style={{ y: y2 }} className="absolute bottom-[6%] right-[4%] w-[48%] z-30">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '4/3' }}
                >
                  <Media item={media.muscu} alt="Espace muscu" sizes="25vw" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 70%)' }} />
                </motion.div>
              </motion.div>

              {/* Floating accent image — spa/art */}
              <motion.div style={{ y: y3 }} className="absolute top-[40%] right-[10%] w-[35%] z-20">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden"
                  style={{ aspectRatio: '2/3' }}
                >
                  <Media item={media.spa} alt="Spa & bien-être" sizes="18vw" />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ originX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
                  />
                </motion.div>
              </motion.div>

              {/* Decorative text overlay */}
              <div
                className="absolute bottom-[30%] left-0 z-10 select-none pointer-events-none"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                <span className="text-[10px] tracking-[0.4em] uppercase font-medium" style={{ color: 'rgba(255,255,255,1)' }}>
                  Le Club Z Fit – Abidjan
                </span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ─── MOBILE ─── */}
      <div className="lg:hidden flex flex-col">

        {/* Text block */}
        <motion.div
          className="px-8 pt-20 pb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {!isSpa ? (
            <>
              <h2 className="text-[36px] font-light leading-[1.05] mb-4" style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>
                UN CENTRE D&apos;EXCELLENCE ET PERFORMANCE
              </h2>
              <p className="text-[#E13027] text-[11px] font-bold tracking-[0.25em] uppercase mb-7">LE CLUB Z FIT</p>
              <div className="w-6 h-[1px] bg-[#E13027] mb-7" />
              <p className="font-light leading-[1.9] text-[14px] mb-5" style={{ color: '#FFFFFF' }}>
                Z FIT est bien plus qu&apos;une salle de sport. C&apos;est un centre de remise en forme moderne où l&apos;exigence rencontre l&apos;élégance. Ici, chaque séance est une étape vers une meilleure version de vous-même.
              </p>
              <p className="font-light leading-[1.9] text-[14px] mb-5" style={{ color: '#FFFFFF' }}>
                Club certifié Les Mills™, Z FIT s&apos;appuie sur des programmes de renommée internationale, un encadrement expert et des outils d&apos;analyse avancés comme le InBody pour garantir une progression maîtrisée.
              </p>
              <p className="font-light leading-[1.9] text-[14px]" style={{ color: '#FFFFFF' }}>
                Notre ambition : vous offrir les outils, l&apos;encadrement et l&apos;environnement nécessaires pour transformer votre énergie en performance et votre discipline en résultats.
              </p>
              <p className="font-light leading-[1.9] text-[14px] mt-5" style={{ color: '#FFFFFF' }}>
                Bienvenue au club.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[36px] font-light leading-[1.05] mb-4" style={{ fontFamily: 'Georgia, serif', color: '#1C1108' }}>
                UN SANCTUAIRE DE BIEN ETRE
              </h2>
              <p className="text-[#E13027] text-[11px] font-bold tracking-[0.25em] uppercase mb-7">LE SPA BY Z FIT</p>
              <div className="w-6 h-[1px] bg-[#E13027] mb-7" />
              <p className="font-light leading-[1.9] text-[14px] mb-5" style={{ color: 'rgba(28,17,8,0.75)' }}>
                Pensé comme un institut de référence, le Spa by Z FIT propose des soins visage et corps alliant technicité et sensorialité.
              </p>
              <p className="font-light leading-[1.9] text-[14px] mb-5" style={{ color: 'rgba(28,17,8,0.75)' }}>
                Nous travaillons avec des maisons reconnues afin d&apos;offrir des protocoles experts, réalisés dans un cadre raffiné. Chaque protocole est exécuté avec précision et maîtrise.
              </p>
              <p className="font-light leading-[1.9] text-[14px]" style={{ color: 'rgba(28,17,8,0.75)' }}>
                Un lieu dédié au soin, à la qualité du geste et à l&apos;excellence du détail.
              </p>
            </>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mx-8 mb-10 flex gap-8 pt-8"
          style={{ borderTop: `1px solid ${isSpa ? 'rgba(28,17,8,0.12)' : 'rgba(255,255,255,0.1)'}` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {(!isSpa ? [
            { value: '10+', label: 'Instructeurs' },
            { value: '20+', label: 'Cours' },
            { value: '500+', label: 'Progressions' },
          ] : [
            { value: '20+', label: 'Soins' },
            { value: '6+', label: 'Espaces' },
            { value: '5+', label: 'Praticiennes' },
          ]).map((stat) => (
            <div key={stat.label}>
              <p className="text-[28px] font-light leading-none mb-1" style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF' }}>
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: isSpa ? 'rgba(28,17,8,0.6)' : '#FFFFFF' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Collage mobile */}
        {isSpa ? (
          /* ── SPA mobile : une image centrée ── */
          <div className="px-6 pb-16 flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden w-full"
              style={{ aspectRatio: '3/4' }}
            >
              <Media item={media.spaTop} alt="Soin spa" sizes="90vw" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
              />
            </motion.div>
          </div>
        ) : (
          /* ── FITNESS mobile : collage original ── */
          <div className="relative w-full px-6 pb-16" style={{ height: '90vw' }}>

            {/* Large top-left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-6 overflow-hidden"
              style={{ width: '56%', height: '72%' }}
            >
              <Media item={media.top} alt="Fitness" className="grayscale" sizes="60vw" />
            </motion.div>

            {/* Small top-right */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-6 overflow-hidden"
              style={{ width: '38%', height: '45%' }}
            >
              <Media item={media.spa} alt="Spa" sizes="40vw" />
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
              />
            </motion.div>

            {/* Bottom-right larger */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 right-6 overflow-hidden"
              style={{ width: '55%', height: '46%' }}
            >
              <Media item={media.muscu} alt="Muscu" sizes="60vw" />
            </motion.div>

          </div>
        )}
      </div>

      {/* Bottom gradient blend into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${isSpa ? '#F4EBD9' : '#000'}, transparent)` }}
      />

    </section>
  );
};

export default ClubPresentation;
