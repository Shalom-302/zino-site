"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useEnvironment } from '@/context/environment-context';

/**
 * CTAJourney Section Component
 * 
 * This component renders a call-to-action banner with a darkened background image
 * of a group workout and a prominent brand orange button.
 */
interface CTAJourneyProps {
  initialImage?: string;
  envImage?: string;
}

export default function CTAJourney({ initialImage, envImage }: CTAJourneyProps) {
  const [backgroundImage, setBackgroundImage] = useState(envImage || initialImage || "https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/cta_journey-2ynz2kt96tk.png");
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';

  useEffect(() => {
    if (envImage) setBackgroundImage(envImage);
  }, [envImage]);

      return (
        <section id="cta-journey" className="relative w-full py-6 md:py-10 lg:py-16" style={{ backgroundColor: isSpa ? '#F4EBD9' : '#000' }}>
      {/* Top fade from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10" style={{ background: `linear-gradient(to bottom, ${isSpa ? '#F4EBD9' : '#000'}, transparent)` }} />
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[480px] rounded-[40px] overflow-hidden flex items-center justify-center bg-black">
              {/* Background Image with Darkened Overlay */}
              <div className="absolute inset-0 z-0">
                  {backgroundImage && (
                    <Image
                      src={backgroundImage}
                      alt="Group of people working out at ZFitSpa"
                      fill
                      className={`object-cover ${isSpa ? 'opacity-90' : 'opacity-70'}`}
                      priority
                      unoptimized
                      sizes="100vw"
                    />
                  )}
                {/* Overlay — sombre fitness uniquement */}
                {!isSpa && <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.40)' }} />}
              </div>

                  {/* Content Container */}
                  <div className="relative z-10 px-8 md:px-16 w-full max-w-4xl text-center flex flex-col items-center">
                    <h2 className="text-[#FFFFFF] font-black text-[1.45rem] md:text-[1.8rem] lg:text-[3rem] leading-[1.05] mb-8 tracking-[-0.03em] uppercase">
                      {isSpa ? (
                        <>Offrez-vous une parenthèse<br className="hidden md:block" /> de bien-être.</>
                      ) : (
                        <>Commencez votre <br className="hidden md:block" />aventure fitness dès aujourd&apos;hui.</>
                      )}
                    </h2>
                    
            <Link
              href="/reservation"
              className="btn-primary text-[16px] md:text-[18px] lg:text-[20px] h-[40px] md:h-[44px] lg:h-[50px] inline-flex items-center px-8"
            >
              {isSpa ? 'Prendre Rendez-Vous' : 'Réserver ma séance d\'essai'}
            </Link>

                    </div>
            </div>
          </div>
  
          <style jsx global>{`
          h2 {
            font-family: var(--font-display, Georgia, "Times New Roman", serif);
          }
        `}</style>
      </section>
    );
  }