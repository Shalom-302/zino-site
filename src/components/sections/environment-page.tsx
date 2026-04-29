"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchDB } from "@/lib/fetchDB";
import { proxyUrl } from "@/lib/supabase-url";
import { useEnvironment } from "@/context/environment-context";
import HeroSection from "@/components/sections/hero";
import ClubPresentation from "@/components/sections/club-presentation";
import CoreWorkout from "@/components/sections/core-workout";
import OurCoaches from "@/components/sections/our-coaches";
import OurSpaces from "@/components/sections/our-spaces";
import Testimonials from "@/components/sections/testimonials";
import CTAJourney from "@/components/sections/cta-journey";
import FooterMain from "@/components/sections/footer-main";

interface EnvContent {
  [key: string]: string;
}

interface EnvImages {
  [key: string]: { url: string; type: string };
}

export default function EnvironmentPage({
  initialImages,
}: {
  initialImages: Record<string, { url: string; type: "image" | "video" }>;
}) {
  const { environment, hasChosen, resetChoice } = useEnvironment();
  const [content, setContent] = useState<EnvContent>({});
  const [envImages, setEnvImages] = useState<EnvImages>({});
  const [envImagesReady, setEnvImagesReady] = useState(false);
  const cacheRef = useRef<Record<string, { content: EnvContent; images: EnvImages }>>({});

  const preloadMedia = (imgMap: EnvImages) => {
    if (typeof window === "undefined") return;
    Object.values(imgMap).forEach(({ url, type }) => {
      if (!url) return;
      if (type === "image") {
        // Push image into browser HTTP cache
        const img = new window.Image();
        img.src = url;
      } else if (type === "video") {
        // Hint the browser to start fetching video bytes
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.as = "video";
        link.href = url;
        document.head.appendChild(link);
      }
    });
  };

  const fetchForEnv = async (env: string) => {
    const [contentRows, imgRows] = await Promise.all([
      fetchDB("environment_content", "*", [{ type: "eq", field: "environment", value: env }]),
      fetchDB("environment_images", "*", [{ type: "eq", field: "environment", value: env }]),
    ]);
    const contentMap: EnvContent = {};
    contentRows.forEach((r: any) => { contentMap[`${r.section}_${r.key}`] = r.value; });
    const imgMap: EnvImages = {};
    imgRows.forEach((r: any) => { imgMap[r.image_key] = { url: r.image_url, type: r.media_type }; });
    cacheRef.current[env] = { content: contentMap, images: imgMap };
    return { contentMap, imgMap };
  };

  useEffect(() => {
    if (!environment) return;

    // Reset ready flag on every environment switch to prevent wrong-image flash
    setEnvImagesReady(false);

    // Apply cached data immediately — no flash on repeated switches
    if (cacheRef.current[environment]) {
      setContent(cacheRef.current[environment].content);
      setEnvImages(cacheRef.current[environment].images);
      setEnvImagesReady(true);
    } else {
      // First load for this environment — fetch then apply
      fetchForEnv(environment).then(({ contentMap, imgMap }) => {
        setContent(contentMap);
        setEnvImages(imgMap);
        setEnvImagesReady(true);
      });
    }

    // Prefetch the other environment in background so next switch is instant.
    // Also preload its media into the browser cache to avoid visible loading.
    const other = environment === "spa" ? "fitness" : "spa";
    if (!cacheRef.current[other]) {
      fetchForEnv(other).then(({ imgMap }) => preloadMedia(imgMap)).catch(() => {});
    } else {
      // Already fetched — still preload in case browser evicted the images
      preloadMedia(cacheRef.current[other].images);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment]);

  if (!hasChosen) return null;

  return (
    <div id={`section-${environment}`}>
          <HeroSection
            initialImage={envImages["main_hero"]?.url || initialImages["main_hero"]?.url}
            initialMediaType={(envImages["main_hero"]?.type as "image" | "video") || initialImages["main_hero"]?.type || "image"}
            envContent={content}
            environment={environment}
          />
          <ClubPresentation envContent={content} environment={environment} envImages={envImages} />
          <OurSpaces envImages={envImages} />
          <Testimonials initialImages={initialImages} envImages={envImages} />
          <CoreWorkout
            initialTop={envImages["healthy_mind_top"]?.url || initialImages["healthy_mind_top"]?.url}
            initialMiddle={envImages["healthy_mind_middle"]?.url || initialImages["healthy_mind_middle"]?.url}
            initialBottom={envImages["healthy_mind_bottom"]?.url || initialImages["healthy_mind_bottom"]?.url}
            initialTopType={(envImages["healthy_mind_top"]?.type || initialImages["healthy_mind_top"]?.type || "image") as "image" | "video"}
            initialMiddleType={(envImages["healthy_mind_middle"]?.type || initialImages["healthy_mind_middle"]?.type || "image") as "image" | "video"}
            initialBottomType={(envImages["healthy_mind_bottom"]?.type || initialImages["healthy_mind_bottom"]?.type || "image") as "image" | "video"}
            envImages={envImages}
          />
          {/* OFFREZ UN MOMENT D'EXCEPTION — spa only */}
          {environment === 'spa' && (
            <section className="w-full flex flex-col md:flex-row" style={{ backgroundColor: '#F4EBD9' }}>
              {/* Image — left */}
              <motion.div
                className="w-full md:w-1/2 relative overflow-hidden"
                style={{ minHeight: '480px' }}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={proxyUrl(envImages['gift_moment']?.url || 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?q=80&w=900')}
                  alt="Offrez un moment d'exception"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </motion.div>

              {/* Text — right */}
              <motion.div
                className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 xl:px-24 py-16 md:py-0"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[10px] uppercase tracking-[0.35em] font-medium mb-6" style={{ color: '#C4A87A' }}>
                  Le Spa by Z Fit
                </p>
                <h2
                  className="text-[32px] md:text-[44px] xl:text-[52px] font-[900] uppercase leading-none tracking-[-0.03em] mb-8"
                  style={{ fontFamily: 'Georgia, serif', color: '#1C1108' }}
                >
                  OFFREZ UN<br />MOMENT<br />D'EXCEPTION
                </h2>
                <div className="w-10 h-px mb-8" style={{ backgroundColor: '#C4A87A' }} />
                <p
                  className="text-[14px] md:text-[15px] font-light leading-[1.9] mb-4 max-w-sm"
                  style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.7)' }}
                >
                  Offrez une parenthèse de bien-être à travers une carte cadeaux personnalisée et raffinée au Spa by Z FIT.
                </p>
                <p
                  className="text-[13px] font-light italic"
                  style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.45)' }}
                >
                  Un cadeau pensé pour chaque occasion.
                </p>
                <a
                  href="/carte-cadeau"
                  className="inline-flex items-center gap-3 mt-10 group w-fit"
                >
                  <span
                    className="text-[10px] uppercase tracking-[0.28em] font-medium transition-colors duration-300 group-hover:text-[#C4A87A]"
                    style={{ color: 'rgba(28,17,8,0.5)' }}
                  >
                    Offrir un soin
                  </span>
                  <span
                    className="w-8 h-8 flex items-center justify-center border transition-all duration-300 group-hover:border-[#C4A87A] group-hover:bg-[#C4A87A]"
                    style={{ borderColor: 'rgba(28,17,8,0.2)', color: '#1C1108' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </a>
              </motion.div>
            </section>
          )}

          <OurCoaches />
          <CTAJourney
            initialImage={initialImages["cta_journey"]?.url}
            envImage={envImages["cta_journey"]?.url}
          />
        <FooterMain />
    </div>
  );
}
