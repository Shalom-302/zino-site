"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useEnvironment } from '@/context/environment-context';

const FITNESS_SPACES = [
  { key: 'space_reception',      num: '01', label: 'Accueil' },
  { key: 'space_lockers',        num: '02', label: 'Vestiaires' },
  { key: 'space_muscu',          num: '03', label: 'Espace Musculation' },
  { key: 'space_cardio',         num: '04', label: 'Espace Cardio' },
  { key: 'space_abdos',          num: '05', label: 'Abdos & Mobilité' },
  { key: 'space_lesmills',       num: '06', label: 'Studio Les Mills™' },
  { key: 'space_hbx',            num: '07', label: 'Studio HBX' },
  { key: 'space_terasse',        num: '08', label: 'Terrasse' },
  { key: 'space_consultation',   num: '09', label: 'Salle de Consultation' },
  { key: 'space_wellness',       num: '10', label: 'Healthy Kitchen' },
];

const SPA_SPACES = [
  { key: 'spa_vestiaires',        num: '01', label: 'Les Vestiaires' },
  { key: 'spa_salon_detente',     num: '02', label: 'Salle de Ressourcement' },
  { key: 'spa_espace_sensoriel',  num: '03', label: "L'Espace Sensoriel" },
  { key: 'spa_sauna',             num: '04', label: 'La Salle de Sauna' },
  { key: 'spa_hammam',            num: '05', label: 'La Salle de Hammam' },
  { key: 'spa_cabine_gommage',    num: '06', label: 'La Cabine de Gommage' },
  { key: 'spa_douche_4saison',    num: '07', label: 'La Douche 4 Saison' },
  { key: 'spa_cabines_soin',      num: '08', label: 'Les Cabines de Soin' },
];

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3Crect fill="%23F4EBD9"%2F%3E%3C/svg%3E';

const AUTOPLAY_DURATION = 3000;

const OurSpaces = ({ envImages }: { envImages?: Record<string, { url: string; type: string }> }) => {
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';
  const SPACES = isSpa ? SPA_SPACES : FITNESS_SPACES;
  const fadeBg = isSpa ? '#F4EBD9' : '#000';
  const textColor = isSpa ? '#1C1108' : '#FFFFFF';
  const borderColor = isSpa ? 'rgba(28,17,8,0.15)' : 'rgba(255,255,255,0.1)';
  const barBg = isSpa ? 'rgba(28,17,8,0.15)' : 'rgba(255,255,255,0.2)';

  const [active, setActive] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  // progressKey forces the CSS animation to restart on each slide change
  const [progressKey, setProgressKey] = useState(0);

  // Reset to first space when environment changes
  useEffect(() => {
    setActive(0);
    setDisplayed(0);
    setProgressKey(k => k + 1);
  }, [isSpa]);

  useEffect(() => {
    if (envImages) {
      const map: Record<string, string> = {};
      SPACES.forEach(s => { if (envImages[s.key]?.url) map[s.key] = envImages[s.key].url; });
      if (Object.keys(map).length > 0) { setImages(map); return; }
    }

    const fetchImages = async () => {
      const keys = SPACES.map(s => s.key);
      const { data: envSnap } = await supabase.from('environment_images').select('*').in('image_key', keys);
      if (envSnap && envSnap.length > 0) {
        const map: Record<string, string> = {};
        envSnap.forEach((d: any) => { map[d.image_key] = d.image_url; });
        setImages(map);
        return;
      }
      const { data: snap } = await supabase.from('site_images').select('id, image_url').in('id', keys);
      const map: Record<string, string> = {};
      (snap || []).forEach((d: any) => { map[d.id] = d.image_url; });
      setImages(map);
    };
    fetchImages();
  }, [envImages, isSpa]);

  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % SPACES.length;
        setTransitioning(true);
        setProgressKey(k => k + 1);
        setTimeout(() => {
          setDisplayed(next);
          setTransitioning(false);
        }, 350);
        return next;
      });
    }, AUTOPLAY_DURATION);
    return () => clearInterval(timer);
  }, [paused, SPACES.length]);

  const handleSelect = (idx: number) => {
    if (idx === active || transitioning) return;
    setPaused(true);
    setTransitioning(true);
    setProgressKey(k => k + 1);
    setTimeout(() => {
      setDisplayed(idx);
      setActive(idx);
      setTransitioning(false);
    }, 350);
  };

  const handlePrev = () => handleSelect((active - 1 + SPACES.length) % SPACES.length);
  const handleNext = () => handleSelect((active + 1) % SPACES.length);

  const currentSpace = SPACES[displayed] || SPACES[0];
  const imgSrc = images[currentSpace.key] || FALLBACK;

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '82dvh', minHeight: 'min(480px, 90dvh)', maxHeight: '780px', backgroundColor: fadeBg }}>

      <style>{`
        @keyframes spaceProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        <Image
          key={currentSpace.key}
          src={imgSrc}
          alt={currentSpace.label}
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        {!isSpa && <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.20)' }} />}
      </div>

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-28 pointer-events-none z-10"
        style={{ background: `linear-gradient(to bottom, ${fadeBg}, transparent)` }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
        style={{ background: `linear-gradient(to top, ${fadeBg}, transparent)` }}
      />

      {/* Section title */}
      <div className="absolute top-10 left-8 md:left-16 z-20">
        <h2
          className="text-[34px] md:text-[44px] font-[900] uppercase leading-[0.95] tracking-[-0.03em]"
          style={{ fontFamily: 'Georgia, serif', color: textColor }}
        >
          NOS<br />ESPACES
        </h2>
      </div>

      {/* Current space name */}
      <div
        className="absolute left-8 md:left-16 z-20 transition-opacity duration-500"
        style={{ bottom: 'clamp(60px, 13dvh, 110px)', opacity: transitioning ? 0 : 1 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#E13027] mb-1">
          {currentSpace.num}
        </p>
        <h3
          className="text-[26px] md:text-[38px] font-[900] uppercase leading-none tracking-[-0.02em]"
          style={{ fontFamily: 'Georgia, serif', color: textColor }}
        >
          {currentSpace.label}
        </h3>
      </div>

      {/* Left arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 transition-opacity duration-200 hover:opacity-100 opacity-60"
        style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.5)'}`, background: isSpa ? 'rgba(244,235,217,0.5)' : 'rgba(0,0,0,0.3)' }}
        aria-label="Précédent"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke={isSpa ? '#1C1108' : '#fff'} strokeWidth="1.5">
          <polyline points="7,1 2,7 7,13" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 transition-opacity duration-200 hover:opacity-100 opacity-60"
        style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.5)'}`, background: isSpa ? 'rgba(244,235,217,0.5)' : 'rgba(0,0,0,0.3)' }}
        aria-label="Suivant"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke={isSpa ? '#1C1108' : '#fff'} strokeWidth="1.5">
          <polyline points="3,1 8,7 3,13" />
        </svg>
      </button>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">

        {/* Mobile: progress bars */}
        <div
          className="flex md:hidden gap-[3px] px-8 pb-5 pt-3"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          {SPACES.map((space, idx) => (
            <button
              key={space.key}
              onClick={() => handleSelect(idx)}
              className="flex-1 h-[2px] relative overflow-hidden"
              aria-label={space.label}
            >
              {/* Background track */}
              <div className="absolute inset-0" style={{ background: barBg }} />
              {/* Past slides: fully filled */}
              {idx < active && (
                <div className="absolute inset-0" style={{ background: textColor }} />
              )}
              {/* Active slide: animated fill */}
              {idx === active && (
                <div
                  key={progressKey}
                  className="absolute inset-0"
                  style={{
                    background: textColor,
                    transformOrigin: 'left center',
                    transform: paused ? 'scaleX(1)' : 'scaleX(0)',
                    animation: paused ? 'none' : `spaceProgress ${AUTOPLAY_DURATION}ms linear forwards`,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Desktop: text nav */}
        <div className="hidden md:block px-16 pb-5">
          <div
            className="flex items-end pt-3"
            style={{ borderTop: `1px solid ${borderColor}` }}
          >
            {SPACES.map((space, idx) => (
              <button
                key={space.key}
                onClick={() => handleSelect(idx)}
                className="flex flex-col items-start flex-1 px-2 py-2 transition-all duration-300 border-t-2 -mt-[1px] min-w-0"
                style={{
                  borderTopColor: active === idx ? textColor : 'transparent',
                  color: textColor,
                }}
              >
                <span className="text-[9px] font-medium tracking-widest mb-1">{space.num}</span>
                <span className="text-[11px] font-semibold uppercase leading-tight truncate w-full">{space.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
};

export default OurSpaces;
