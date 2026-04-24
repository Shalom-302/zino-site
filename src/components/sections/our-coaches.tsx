"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

const TARGET_W = 420;
const TARGET_H = TARGET_W * (4 / 3);

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

  // Fetch coaches exclusively from Firestore (dashboard-managed)
  useEffect(() => {
    const prefix = isSpa ? 'spa_coach_' : 'coach_';

    const fetchCoaches = async () => {
      const [infoSnap, imgSnap] = await Promise.all([
        getDocs(query(collection(db, 'coaches_info'), where('coach_key', '>=', prefix), where('coach_key', '<', prefix + '\uf8ff'))),
        getDocs(query(collection(db, 'site_images'), where('__name__', '>=', prefix), where('__name__', '<', prefix + '\uf8ff'))),
      ]);
      const infoData = infoSnap.docs.map(d => d.data());
      const imgData = imgSnap.docs.map(d => ({ image_key: d.id, image_url: d.data().image_url }));

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

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const openModal = useCallback((coach: Coach, rect: DOMRect) => {
    setModal({ coach, rect });
    setPhase('enter');
    // Next frame: transition to open
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPhase('open');
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    if (!modal) return;
    setPhase('exit');
    setTimeout(() => {
      setModal(null);
      setPhase('open');
    }, 480);
  }, [modal]);

  // Compute transform: from card rect → center of screen
  const getModalStyle = (): React.CSSProperties => {
    if (!modal) return {};

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetW = Math.min(vw * 0.88, 420);
    const targetH = targetW * (4 / 3);
    const targetLeft = (vw - targetW) / 2;
    const targetTop = (vh - targetH) / 2;

    if (phase === 'enter') {
      // Start from card position
      return {
        position: 'fixed',
        left: modal.rect.left,
        top: modal.rect.top,
        width: modal.rect.width,
        height: modal.rect.height,
          borderRadius: '0px',
          transition: 'none',
        zIndex: 200,
      };
    }

    if (phase === 'exit') {
      // Animate back to card position
      return {
        position: 'fixed',
        left: modal.rect.left,
        top: modal.rect.top,
        width: modal.rect.width,
        height: modal.rect.height,
          borderRadius: '0px',
          transition: 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 200,
      };
    }

    // 'open' phase — full expanded state (wide: photo left + text right)
    const wideW = Math.min(vw * 0.92, 860);
    const wideH = Math.min(vh * 0.85, 520);
    const wideLeft = (vw - wideW) / 2;
    const wideTop = (vh - wideH) / 2;
    return {
      position: 'fixed',
      left: wideLeft,
      top: wideTop,
      width: wideW,
      height: wideH,
      borderRadius: '0px',
      transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
      zIndex: 200,
    };
  };

  const backdropOpacity = phase === 'open' ? 1 : 0;

  return (
    <section id="nos-coachs" className="relative pt-24 md:pt-36 pb-8 md:pb-12 overflow-hidden" style={{ backgroundColor: isSpa ? spaBg : '#000000' }}>
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-0" style={{ background: `linear-gradient(to bottom, ${isSpa ? spaBg : '#000'}, transparent)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0" style={{ background: `linear-gradient(to top, ${isSpa ? spaBg : '#000'}, transparent)` }} />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 flex flex-col gap-6 md:gap-8">
        <div className="flex items-start justify-between gap-8">
          {/* Left: title + description */}
          <div className="flex-1">
            <motion.h2
              className="text-[20px] md:text-[32px] lg:text-[40px] font-[900] leading-none tracking-[-0.02em] uppercase select-none mb-4"
              style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF' }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSpa ? 'NOS EXPERTES DU SOIN' : 'NOS COACHS'}
            </motion.h2>
            <motion.p
              className="text-[13px] md:text-[15px] font-light leading-[1.8] max-w-[560px]"
              style={{ color: isSpa ? 'rgba(28,17,8,0.65)' : 'rgba(255,255,255,0.7)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {isSpa
                ? 'Nos expertes du soin exercent selon des standards rigoureux et une gestuelle parfaitement maîtrisée. Formées aux protocoles de nos maisons partenaires, elles assurent un soin précis, structuré et exécuté avec une exigence constante.'
                : 'Nos coachs sont formés selon des standards internationaux exigeants et certifiés Les Mills™ pour les programmes concernés. Leur expertise est continuellement renforcée par des formations régulières, garantissant un encadrement précis, sécurisé et à la hauteur des plus hauts niveaux de performance.'}
            </motion.p>
          </div>

          {/* Right: arrow navigation */}
          <div className="flex items-center gap-3 flex-none pt-2">
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
              className="flex items-center justify-center w-10 h-10 transition-opacity duration-200 hover:opacity-100 opacity-60"
              style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.4)'}`, color: isSpa ? '#1C1108' : '#fff' }}
              aria-label="Précédent"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="7,1 2,7 7,13" />
              </svg>
            </button>
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
              className="flex items-center justify-center w-10 h-10 transition-opacity duration-200 hover:opacity-100 opacity-60"
              style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.4)'}`, color: isSpa ? '#1C1108' : '#fff' }}
              aria-label="Suivant"
            >
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="3,1 8,7 3,13" />
              </svg>
            </button>
          </div>
        </div>

        <motion.div
          ref={scrollRef}
          className="flex gap-6 py-4 pb-28 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          style={{ overscrollBehaviorX: 'contain' }}
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => { isHovered.current = false; }}
        >
    {coaches.map((coach, i) => {
              const offsets = [0, 70, 30, 90, 15, 55, 80, 20, 60];
              const mt = offsets[i % offsets.length];
              return (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  isSelected={modal?.coach.id === coach.id}
                  onOpen={(rect) => openModal(coach, rect)}
                  marginTop={mt}
                  isSpa={isSpa}
                />
              );
            })}
        </motion.div>
      </div>

      {modal && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: phase === 'open' ? 'blur(10px)' : 'blur(0px)',
              opacity: backdropOpacity,
              transition: 'opacity 0.4s ease, backdrop-filter 0.4s ease',
              zIndex: 9999,
            }}
            onClick={closeModal}
          />

          {/* Expanding card */}
          <div
            style={{ ...getModalStyle(), backgroundColor: isSpa ? '#F4EBD9' : '#0a0a0a', zIndex: 10000 }}
            className="overflow-hidden flex"
          >
            {/* LEFT — photo */}
            <div className="relative flex-none" style={{ width: '42%', height: '100%' }}>
              <Image
                src={modal.coach.image}
                alt={modal.coach.name}
                fill
                className="object-cover object-top"
                unoptimized
                sizes="420px"
              />
            </div>

            {/* RIGHT — text */}
            <div
              className="flex flex-col justify-center px-8 md:px-12 py-8 flex-1 overflow-y-auto"
              style={{
                opacity: phase === 'open' ? 1 : 0,
                transform: phase === 'open' ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s',
              }}
            >
              {/* Nom */}
              <h3
                className="text-[24px] md:text-[32px] font-[800] leading-none uppercase mb-2"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF' }}
              >
                {modal.coach.name}
              </h3>

              {/* Titre + certifications */}
              <p
                className="text-[#E13027] text-[10px] tracking-[0.35em] uppercase mb-1"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {modal.coach.title || 'EXPERT COACH'}
              </p>
              {modal.coach.certifications && (
                <p
                  className="text-[9px] tracking-[0.2em] uppercase mb-4"
                  style={{ color: isSpa ? 'rgba(28,17,8,0.45)' : 'rgba(255,255,255,0.45)' }}
                >
                  {modal.coach.certifications}
                </p>
              )}

              <div className="w-8 h-[1px] bg-[#E13027] mb-5" />

              {/* Description */}
              <p
                className="text-[12px] md:text-[13px] leading-relaxed font-light mb-5"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? 'rgba(28,17,8,0.75)' : 'rgba(255,255,255,0.85)' }}
              >
                {modal.coach.description || 'Coach certifié, expert en entraînement personnalisé et accompagnement sportif.'}
              </p>

              {/* Spécialités */}
              {modal.coach.specialites && (
                <div className="mb-5">
                  <p
                    className="text-[9px] tracking-[0.25em] uppercase mb-1.5"
                    style={{ color: '#E13027' }}
                  >
                    Spécialités
                  </p>
                  <p
                    className="text-[11px] md:text-[12px] font-light leading-relaxed"
                    style={{ color: isSpa ? 'rgba(28,17,8,0.65)' : 'rgba(255,255,255,0.65)' }}
                  >
                    {modal.coach.specialites}
                  </p>
                </div>
              )}

              {/* Signature */}
              {modal.coach.signature && (
                <p
                  className="text-[11px] italic leading-relaxed mb-5"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: isSpa ? 'rgba(28,17,8,0.45)' : 'rgba(255,255,255,0.4)',
                    borderLeft: '2px solid #E13027',
                    paddingLeft: '12px',
                  }}
                >
                  &ldquo;{modal.coach.signature}&rdquo;
                </p>
              )}

              {/* Contact */}
              {modal.coach.phone && (
                <a
                  href={`tel:${modal.coach.phone}`}
                  className="inline-flex items-center gap-3 group mt-auto"
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#E13027' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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

            {/* Close button */}
            <button
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center transition-all"
              style={{
                backgroundColor: isSpa ? 'rgba(28,17,8,0.12)' : 'rgba(0,0,0,0.6)',
                color: isSpa ? '#1C1108' : '#FFFFFF',
                opacity: phase === 'open' ? 1 : 0,
                transition: 'opacity 0.3s ease 0.3s',
              }}
              onClick={closeModal}
              aria-label="Fermer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
}: {
  coach: Coach;
  isSelected: boolean;
  onOpen: (rect: DOMRect) => void;
  marginTop?: number;
  isSpa?: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    onOpen(rect);
  };

    return (
    <div
      className="flex-none w-[160px] md:w-[210px] cursor-pointer"
      style={{
        marginTop: `${marginTop}px`,
        outline: isSelected ? '2px solid #E13027' : '2px solid transparent',
          boxShadow: isSelected ? '0 0 18px 3px rgba(225,48,39,0.35)' : 'none',
          transition: 'outline 0.3s ease, box-shadow 0.3s ease',
        }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      >
        <div
          ref={cardRef}
          className="relative aspect-[3/4] overflow-hidden"
          style={{
            transition: 'opacity 0.3s ease',
            opacity: isSelected ? 0.35 : 1,
          }}
        >
        <Image
          src={coach.image}
          alt={coach.name}
          fill
          className="object-cover"
          style={{
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          sizes="(max-width: 768px) 200px, 260px"
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(180, 20, 10, 0.35)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {!isSpa && (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)' }}
          />
        )}
      </div>

      {/* Name & title — below photo */}
      <div className="pt-3 pb-1">
        <h3
          className="text-[13px] md:text-[15px] font-[700] leading-tight uppercase"
          style={{ fontFamily: 'Georgia, serif', color: isSpa ? '#1C1108' : '#FFFFFF' }}
        >
          {coach.name}
        </h3>
        <p
          className="font-light text-[9px] md:text-[10px] tracking-[0.25em] uppercase mt-1"
          style={{ color: isSpa ? '#C4A87A' : 'rgba(255,255,255,0.55)' }}
        >
          {coach.title || 'EXPERT COACH'}
        </p>
      </div>
    </div>
  );
};

export default OurCoaches;
