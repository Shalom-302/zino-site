"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fetchDB } from '@/lib/fetchDB';
import { proxyUrl } from '@/lib/supabase-url';
import { useEnvironment } from '@/context/environment-context';

type Coach = {
  id: number | string;
  name: string;
  title: string;
  certifications: string;
  description: string;
  specialites: string;
  signature: string;
  phone: string;
  image: string;
  key: string;
};

interface ModalState {
  coach: Coach;
  rect: DOMRect;
}

const OurCoaches = () => {
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';
  const spaBg = '#F4EBD9';
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [phase, setPhase] = useState<'enter' | 'open' | 'exit'>('open');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);

  // Horizontal scroll with wheel
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!isHovered.current) return;
      const scrollAmount = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      const atStart = el.scrollLeft <= 0 && scrollAmount < 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && scrollAmount > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += scrollAmount;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const prefix = isSpa ? 'spa_coach_' : 'coach_';
    const fetchCoaches = async () => {
      const [allInfo, allImgs] = await Promise.all([
        fetchDB('coaches_info', '*'),
        fetchDB('site_images', 'id, image_url'),
      ]);
      const infoData = allInfo.filter((d: any) => d.coach_key.startsWith(prefix));
      const imgData = allImgs
        .filter((d: any) => d.id.startsWith(prefix))
        .map((d: any) => ({ image_key: d.id, image_url: d.image_url }));

      const entries = infoData
        .filter((info) => info.published === true)
        .map((info) => {
          const img = imgData.find(i => i.image_key === info.coach_key);
          return {
            id: info.coach_key,
            key: info.coach_key,
            image: img?.image_url || '',
            name: info.name,
            title: info.title,
            certifications: info.certifications ?? '',
            description: info.description,
            specialites: info.specialites ?? '',
            signature: info.signature ?? '',
            phone: info.phone ?? '',
          };
        });
      setCoaches(entries);
    };
    fetchCoaches();
  }, [isSpa]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const openModal = useCallback((coach: Coach, rect: DOMRect) => {
    setModal({ coach, rect });
    setPhase('enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { setPhase('open'); });
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!modal) return;
    setPhase('exit');
    setTimeout(() => { setModal(null); setPhase('open'); }, 480);
  }, [modal]);

  const getModalStyle = (): React.CSSProperties => {
    if (!modal) return {};
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (phase === 'enter') {
      return { position: 'fixed', left: modal.rect.left, top: modal.rect.top, width: modal.rect.width, height: modal.rect.height, borderRadius: '0px', transition: 'none', zIndex: 200 };
    }
    if (phase === 'exit') {
      return { position: 'fixed', left: modal.rect.left, top: modal.rect.top, width: modal.rect.width, height: modal.rect.height, borderRadius: '0px', transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 200 };
    }
    const wideW = Math.min(vw * 0.92, 880);
    const wideH = Math.min(vh * 0.88, 540);
    return { position: 'fixed', left: (vw - wideW) / 2, top: (vh - wideH) / 2, width: wideW, height: wideH, borderRadius: '0px', transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 200 };
  };

  const backdropOpacity = phase === 'open' ? 1 : 0;

  return (
    <section id="nos-coachs" className="relative pt-24 md:pt-36 pb-8 md:pb-16 overflow-hidden" style={{ backgroundColor: isSpa ? spaBg : '#000000' }}>
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0" style={{ background: `linear-gradient(to bottom, ${isSpa ? spaBg : '#000'}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0" style={{ background: `linear-gradient(to top, ${isSpa ? spaBg : '#000'}, transparent)` }} />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 flex flex-col gap-8 md:gap-12">

        {/* Header */}
        <div className="flex items-end justify-between gap-8">
          <div className="flex-1">
            <motion.p
              className="text-[10px] tracking-[0.35em] uppercase mb-3 font-medium"
              style={{ color: '#E13027' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSpa ? 'Notre équipe' : 'Notre équipe'}
            </motion.p>
            <motion.h2
              className="text-[28px] md:text-[40px] lg:text-[52px] font-[900] leading-none tracking-[-0.02em] uppercase select-none"
              style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF' }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSpa ? 'Nos Expertes' : 'Nos Coachs'}
            </motion.h2>
            <motion.p
              className="text-[13px] md:text-[14px] font-light leading-[1.9] max-w-[500px] mt-4"
              style={{ color: isSpa ? 'rgba(28,17,8,0.55)' : 'rgba(255,255,255,0.55)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSpa
                ? 'Nos expertes exercent selon des standards rigoureux et une gestuelle parfaitement maîtrisée.'
                : 'Certifiés aux standards internationaux, nos coachs garantissent un encadrement précis et sécurisé.'}
            </motion.p>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2 flex-none pb-1">
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="flex items-center justify-center w-11 h-11 transition-all duration-200 hover:opacity-100 opacity-50 hover:border-[#E13027] hover:text-[#E13027]"
              style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.3)' : 'rgba(255,255,255,0.3)'}`, color: isSpa ? '#1C1108' : '#fff' }}
              aria-label="Précédent"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="7,1 2,7 7,13" />
              </svg>
            </button>
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="flex items-center justify-center w-11 h-11 transition-all duration-200 hover:opacity-100 opacity-50 hover:border-[#E13027] hover:text-[#E13027]"
              style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.3)' : 'rgba(255,255,255,0.3)'}`, color: isSpa ? '#1C1108' : '#fff' }}
              aria-label="Suivant"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3,1 8,7 3,13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards scroll */}
        <motion.div
          ref={scrollRef}
          className="flex gap-5 py-4 pb-24 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ overscrollBehaviorX: 'contain' }}
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => { isHovered.current = false; }}
        >
          {coaches.map((coach, i) => {
            const offsets = [0, 60, 24, 80, 12, 48, 72, 16, 52];
            return (
              <CoachCard
                key={coach.id}
                coach={coach}
                isSelected={modal?.coach.id === coach.id}
                onOpen={(rect) => openModal(coach, rect)}
                marginTop={offsets[i % offsets.length]}
                isSpa={isSpa}
                index={i}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Modal */}
      {modal && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: phase === 'open' ? 'blur(12px)' : 'blur(0px)',
              opacity: backdropOpacity,
              transition: 'opacity 0.4s ease, backdrop-filter 0.4s ease',
              zIndex: 9999,
            }}
            onClick={closeModal}
          />

          <div
            style={{ ...getModalStyle(), backgroundColor: isSpa ? '#F9F3E8' : '#0d0d0d', zIndex: 10000 }}
            className="overflow-hidden flex"
          >
            {/* LEFT — photo */}
            <div className="relative flex-none" style={{ width: '44%', height: '100%' }}>
              {modal.coach.image ? (
                <Image
                  src={proxyUrl(modal.coach.image)}
                  alt={modal.coach.name}
                  fill
                  className="object-cover object-top"
                  unoptimized
                  sizes="420px"
                />
              ) : (
                <div className="w-full h-full" style={{ background: isSpa ? '#E8DCC8' : '#1a1a1a' }} />
              )}
              {/* gradient overlay on photo */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 70%, rgba(0,0,0,0.15))' }} />
            </div>

            {/* RIGHT — content */}
            <div
              className="flex flex-col justify-center px-8 md:px-14 py-10 flex-1 overflow-y-auto"
              style={{
                opacity: phase === 'open' ? 1 : 0,
                transform: phase === 'open' ? 'translateY(0)' : 'translateY(18px)',
                transition: 'opacity 0.45s ease 0.2s, transform 0.45s ease 0.2s',
              }}
            >
              {/* Eyebrow */}
              <p className="text-[#E13027] text-[9px] tracking-[0.4em] uppercase mb-3 font-medium">
                {modal.coach.title || 'Expert Coach'}
              </p>

              {/* Name */}
              <h3
                className="text-[26px] md:text-[36px] font-[900] leading-none uppercase mb-1"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF', letterSpacing: '-0.02em' }}
              >
                {modal.coach.name}
              </h3>

              {/* Certifications */}
              {modal.coach.certifications && (
                <p className="text-[9px] tracking-[0.2em] uppercase mb-5 mt-1" style={{ color: isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.35)' }}>
                  {modal.coach.certifications}
                </p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#E13027]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#E13027]" />
              </div>

              {/* Description */}
              <p
                className="text-[12px] md:text-[13px] leading-[1.9] font-light mb-5"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? 'rgba(28,17,8,0.72)' : 'rgba(255,255,255,0.8)' }}
              >
                {modal.coach.description || 'Coach certifié, expert en entraînement personnalisé et accompagnement sportif.'}
              </p>

              {/* Spécialités */}
              {modal.coach.specialites && (
                <div className="mb-5 pl-4 border-l border-[#E13027]/30">
                  <p className="text-[9px] tracking-[0.3em] uppercase mb-1.5 text-[#E13027]">Spécialités</p>
                  <p className="text-[11px] md:text-[12px] font-light leading-relaxed" style={{ color: isSpa ? 'rgba(28,17,8,0.6)' : 'rgba(255,255,255,0.6)' }}>
                    {modal.coach.specialites}
                  </p>
                </div>
              )}

              {/* Citation */}
              {modal.coach.signature && (
                <p
                  className="text-[11px] italic leading-relaxed mb-6"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: isSpa ? 'rgba(28,17,8,0.42)' : 'rgba(255,255,255,0.38)',
                    borderLeft: '2px solid #E13027',
                    paddingLeft: '14px',
                  }}
                >
                  &ldquo;{modal.coach.signature}&rdquo;
                </p>
              )}

              {/* Contact */}
              {modal.coach.phone && (
                <a href={`tel:${modal.coach.phone}`} className="inline-flex items-center gap-3 mt-auto group">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E13027] group-hover:bg-[#c82219] transition-colors flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                      <path d="M10.5 8.5c0 .2-.04.39-.14.58-.09.18-.22.35-.38.49-.27.24-.56.36-.87.36-.22 0-.45-.05-.7-.16-.24-.1-.49-.26-.73-.46L5.2 7.3c-.23-.23-.44-.46-.62-.68-.18-.22-.33-.44-.45-.65-.12-.21-.21-.42-.27-.63C3.8 5.12 3.77 4.9 3.77 4.7c0-.22.04-.43.12-.63.08-.2.2-.38.36-.54.2-.2.41-.29.64-.29.09 0 .18.02.26.06.08.04.16.1.22.19l1.3 1.83c.06.08.1.16.13.24.03.07.05.14.05.2 0 .08-.02.16-.06.24-.04.08-.09.16-.16.24l-.22.23c-.03.03-.04.07-.04.11 0 .02 0 .04.01.06.02.04.05.1.1.16.06.08.13.17.22.27.1.1.2.2.3.3.11.1.2.18.28.24.07.05.12.08.16.09.02.01.04.01.06.01.05 0 .08-.01.12-.04l.22-.22c.08-.08.17-.13.25-.17.08-.03.15-.05.24-.05.06 0 .13.01.2.04.07.03.15.07.23.13l1.86 1.32c.09.06.15.14.19.23.04.09.06.18.06.28Z" fill="#fff"/>
                    </svg>
                  </span>
                  <span
                    className="text-[11px] tracking-[0.2em] uppercase font-medium group-hover:text-[#E13027] transition-colors"
                    style={{ color: isSpa ? '#1C1108' : '#FFFFFF' }}
                  >
                    {modal.coach.phone}
                  </span>
                </a>
              )}
            </div>

            {/* Close */}
            <button
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center transition-all hover:bg-[#E13027] hover:border-[#E13027]"
              style={{
                border: `1px solid ${isSpa ? 'rgba(28,17,8,0.2)' : 'rgba(255,255,255,0.2)'}`,
                color: isSpa ? '#1C1108' : '#FFFFFF',
                opacity: phase === 'open' ? 1 : 0,
                transition: 'opacity 0.3s ease 0.3s, background 0.2s, border-color 0.2s, color 0.2s',
              }}
              onClick={closeModal}
              aria-label="Fermer"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </>,
        document.body
      )}
    </section>
  );
};

const CoachCard = ({
  coach,
  isSelected,
  onOpen,
  marginTop = 0,
  isSpa = false,
  index = 0,
}: {
  coach: Coach;
  isSelected: boolean;
  onOpen: (rect: DOMRect) => void;
  marginTop?: number;
  isSpa?: boolean;
  index?: number;
}) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!cardRef.current) return;
    onOpen(cardRef.current.getBoundingClientRect());
  };

  return (
    <motion.div
      className="flex-none w-[190px] md:w-[240px] cursor-pointer"
      style={{ marginTop: `${marginTop}px` }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Photo */}
      <div
        ref={cardRef}
        className="relative aspect-[3/4] overflow-hidden"
        style={{
          outline: isSelected ? '2px solid #E13027' : '2px solid transparent',
          boxShadow: isSelected ? '0 0 20px 4px rgba(225,48,39,0.3)' : 'none',
          transition: 'outline 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
          opacity: isSelected ? 0.3 : 1,
        }}
      >
        {/* Image */}
        {coach.image ? (
          <Image
            src={proxyUrl(coach.image)}
            alt={coach.name}
            fill
            className="object-cover object-top"
            style={{
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            sizes="(max-width: 768px) 200px, 260px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full" style={{ background: isSpa ? '#E8DCC8' : '#1a1a1a' }} />
        )}

        {/* Gradient overlay — always visible at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 45%, transparent 70%)',
          }}
        />

        {/* Hover tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(225,48,39,0.18)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Name + title inside photo (bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8"
          style={{
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h3
            className="text-[13px] md:text-[15px] font-[800] leading-tight uppercase text-white"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.01em' }}
          >
            {coach.name}
          </h3>
          <p
            className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase mt-1 text-white/60"
          >
            {coach.title || 'Expert Coach'}
          </p>

          {/* Voir profil — apparaît au hover */}
          <div
            className="flex items-center gap-1.5 mt-3"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease 0.05s, transform 0.35s ease 0.05s',
            }}
          >
            <span className="text-[8px] tracking-[0.3em] uppercase text-[#E13027] font-bold">Voir profil</span>
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-[#E13027]">
              <path d="M1 4h8M6 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OurCoaches;
