"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchDBSingle } from '@/lib/fetchDB';
import { proxyUrl } from '@/lib/supabase-url';

interface PersonalizedTrainingProps {
  initialTop?: string;
  initialBottom?: string;
}

const PersonalizedTraining = ({ initialTop, initialBottom }: PersonalizedTrainingProps) => {
  const [imageTop, setImageTop] = useState(initialTop || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/art_body_top.jpg");
  const [imageBottom, setImageBottom] = useState(initialBottom || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/art_body_bottom.jpg");

  useEffect(() => {
    const fetchImages = async () => {
      const [topDoc, altDoc, botDoc] = await Promise.all([
        fetchDBSingle('site_images', 'image_url', [{ type: 'eq', field: 'id', value: 'art_body_top' }]),
        fetchDBSingle('site_images', 'image_url', [{ type: 'eq', field: 'id', value: 'art_body' }]),
        fetchDBSingle('site_images', 'image_url', [{ type: 'eq', field: 'id', value: 'art_body_bottom' }]),
      ]);
      if (topDoc?.image_url) setImageTop(topDoc.image_url);
      else if (altDoc?.image_url) setImageTop(altDoc.image_url);
      if (botDoc?.image_url) setImageBottom(botDoc.image_url);
    };

    fetchImages();
  }, []);

  return (
    <section className="w-full bg-black overflow-hidden relative">
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* Left: Images zone */}
        <div className="lg:w-1/2 relative flex items-center justify-center py-16 px-8 order-2 lg:order-1">

            {/* Grande image — avec marges, ne touche pas les bords */}
            <div className="relative w-[90%] h-[62vh] lg:h-[72vh] mt-8">
            <Image
              src={proxyUrl(imageTop)}
              alt="Séance de sport intense chez ZFitSpa"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

            {/* Petite image — superposée en haut à droite */}
            <div className="absolute top-8 right-8 w-[44%] aspect-[4/3] z-10 shadow-2xl">
            <Image
              src={proxyUrl(imageBottom)}
              alt="Membres participant à un cours chez ZFitSpa"
              fill
              className="object-cover"
              sizes="25vw"
              unoptimized
            />
          </div>

        </div>

        {/* Right: Text panel */}
          <div className="lg:w-1/2 flex flex-col justify-between px-10 md:px-16 lg:px-20 py-20 lg:py-28 bg-black order-1 lg:order-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#E13027] mb-16">
              Sculpt & Performance
            </p>
            <h2 className="text-[26px] md:text-[34px] lg:text-[40px] font-[900] leading-[0.95] tracking-[-0.04em] uppercase text-white mb-12">
              Ton <em className="text-[#E13027] italic">body</em>,<br />
                c&apos;est de<br />
                l&apos;<em className="text-[#E13027] italic">art</em>.
            </h2>
            <div className="w-12 h-[1px] bg-[#E13027] mb-12" />
          </div>

          <div className="space-y-6">
              <p className="text-secondary">
                Chaque séance est un coup de pinceau, chaque effort sculpte ta meilleure version. À Zfitspa, nous combinons entraînement stratégique et récupération premium pour façonner un corps fort et harmonieux.
              </p>
              <p className="text-secondary">
                  Renforcement musculaire, cardio ciblé, spa régénérant : l&apos;équilibre parfait entre puissance et élégance. Nos coachs travaillent avec précision pour révéler ton potentiel.
              </p>
            <p className="text-[15px] font-light leading-[1.9] text-white italic border-l border-[#E13027] pl-6">
              Résultat ? Une silhouette dessinée, une énergie renouvelée et un mental solide.
            </p>
          </div>
        </div>

      </div>

      {/* Top fade from previous section */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0A0A0A] to-transparent pointer-events-none z-0" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-[#0A0A0A] pointer-events-none z-0" />
    </section>
  );
};

export default PersonalizedTraining;
