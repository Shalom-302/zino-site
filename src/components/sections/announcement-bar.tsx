"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

    const announcements = [
      {
        text: "Prêt pour un changement ? Pour un temps limité, rejoignez ZFitSpa et économisez.<sup>+</sup>",
      },
      {
        text: "Offre Spéciale : Économisez sur votre premier mois d&apos;abonnement.<sup>+</sup> Conditions applicables.",
      },
      {
        text: "Le Meilleur Studio de Fitness à Abidjan",
      },
      {
        text: "Coachs certifiés & Suivi personnalisé",
      }
    ];

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  if (!isVisible) return null;

  return (
    <div 
      id="announcements-section" 
      className="relative w-full bg-black text-[#FFFFFF] overflow-hidden z-[1001]"
      style={{ minHeight: "44px" }}
    >
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[44px]">
        {/* Slider Logic */}
        <div className="relative w-full max-w-[800px] text-center overflow-hidden h-[44px]">
          {announcements.map((announcement, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                index === activeSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <div 
                className="text-[14px] font-semibold tracking-wide leading-tight text-center px-4"
                dangerouslySetInnerHTML={{ __html: announcement.text }}
              />
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Close announcements"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-all duration-200 focus:outline-none"
        >
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/46df7e95-aa88-4028-8d8e-1e4e9c59c77d-orangetheory-com/assets/svgs/66308fd80e9d1a0d804596b7_close-announcement-1.svg"
              alt="Close announcement"
              width={16}
              height={16}
              className="invert"
            />
        </button>
      </div>

      {/* Pagination Decoration (Optional matching original style) */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {announcements.map((_, index) => (
          <span
            key={index}
            className={`block h-[2px] rounded-full transition-all duration-300 ${
              index === activeSlide ? "w-4 bg-[#E13027]" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>

      <style jsx global>{`
        #announcements-section sup {
          font-size: 0.6em;
          vertical-align: super;
          margin-left: 2px;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;