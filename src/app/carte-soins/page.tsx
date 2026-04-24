"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import FooterMain from "@/components/sections/footer-main";

/* ─── PALETTE ─────────────────────────────────────────── */
const BG = "#F4EBD9";
const TEXT = "#1C1108";
const ACCENT = "#C4A87A";
const SECONDARY = "rgba(28,17,8,0.55)";
const BORDER = "rgba(28,17,8,0.1)";

/* ─── DATA ─────────────────────────────────────────────── */
type Soin = { name: string; duree?: string; prix: string; badge?: string; description?: string };
type SousSection = { title: string; subtitle?: string; brand?: string; soins: Soin[] };
type Categorie = { id: string; label: string; num: string; sections: SousSection[] };

const CATEGORIES: Categorie[] = [
  {
    id: "visage",
    label: "Soins Visage",
    num: "01",
    sections: [
      {
        title: "Soins Minéraux",
        subtitle: "Soins traitants en fonction du type de peau",
        brand: "GEMOLOGY",
        soins: [
          { name: "Soin Minéral Hydratant", badge: "Peaux Sèches", duree: "1H", prix: "55.000 / 60.000 fcfa", description: "Une infusion d'hydratation pour restaurer confort et éclat aux peaux déshydratées." },
          { name: "Soin d'Équilibre Purifiant", badge: "Peaux Mixtes à Grasses", duree: "1H", prix: "55.000 / 60.000 fcfa", description: "Une purification en profondeur pour une peau nette, fraîche et parfaitement équilibrée." },
          { name: "Soin Apaisant", badge: "Peaux Sensibles", duree: "1H", prix: "55.000 / 60.000 fcfa", description: "Une parenthèse de douceur pour calmer la peau et apaiser les sensibilités." },
          { name: "Soin Régénérant", badge: "Peaux Matures", duree: "1H", prix: "55.000 / 60.000 fcfa", description: "Une revitalisation profonde pour redonner souplesse et vitalité à la peau." },
          { name: "Soin Bio Éclat Ambre Bleue", badge: "Toutes Peaux", duree: "1H", prix: "55.000 / 60.000 fcfa", description: "Une lumière subtile qui ravive le teint et révèle sa fraîcheur naturelle." },
        ],
      },
      {
        title: "Soins Précieux",
        subtitle: "Soins anti-âge en fonction du type de peau",
        brand: "GEMOLOGY",
        soins: [
          { name: "Soin Éclat Diamant Masque Gel", duree: "1H15", prix: "75.000 / 80.000 fcfa", description: "La pureté du diamant pour illuminer le teint et révéler sa lumière naturelle." },
          { name: "Soin d'Équilibre Améthyste", badge: "Peaux Mixtes", duree: "1H15", prix: "75.000 / 80.000 fcfa", description: "L'équilibre retrouvé pour une peau apaisée, lumineuse et harmonieuse." },
          { name: "Soin Apaisant Smithsonite", badge: "Peaux Sensibles", duree: "1H15", prix: "75.000 / 80.000 fcfa", description: "Un apaisement immédiat pour réconforter et rééquilibrer les peaux sensibles." },
        ],
      },
      {
        title: "Les Écrins",
        subtitle: "Soins anti-âge selon le résultat souhaité",
        brand: "GEMOLOGY",
        soins: [
          { name: "Soin Lumière Perle & Diamant Éclaircissant", duree: "1H30", prix: "85.000 / 90.000 fcfa", description: "Un éclat précieux pour illuminer le teint et en révéler toute la finesse." },
          { name: "Soin Anti-Rides Écrin Diamant", duree: "1H30", prix: "85.000 / 90.000 fcfa", description: "Une action experte pour lisser les traits et redonner fermeté à la peau." },
          { name: "Soin Écrin Perle Blanche Anti-Tâches", duree: "1H30", prix: "85.000 / 90.000 fcfa", description: "Une correction délicate pour un teint plus uniforme et naturellement lumineux." },
        ],
      },
      {
        title: "Diamant & Collagène",
        subtitle: "Soin prestige ultime",
        brand: "GEMOLOGY",
        soins: [
          { name: "Soin Diamant & Collagène — Masque Prestige", duree: "1H30", prix: "95.000 / 100.000 fcfa", description: "Une régénération intensive pour raffermir la peau et raviver son éclat." },
        ],
      },
    ],
  },
  {
    id: "corps",
    label: "Soins Corps",
    num: "02",
    sections: [
      {
        title: "Rituels Hammam",
        subtitle: "Purification & chaleur ancestrale",
        brand: "SULTANE DE SABA",
        soins: [
          { name: "Hammam Origine", duree: "30min", prix: "25.000 / 30.000 fcfa", description: "Hammam et gommage pour purifier la peau et amorcer un profond relâchement." },
          { name: "Hammam Bien-Être", duree: "45min", prix: "40.000 / 45.000 fcfa", description: "Hammam, gommage et rassoul pour une purification en profondeur et une peau intensément douce." },
          { name: "Hammam Royal", duree: "60min", prix: "60.000 / 65.000 fcfa", description: "Hammam, gommage, rassoul et pureté du visage pour une expérience complète du corps et de l'esprit." },
        ],
      },
      {
        title: "Rituels Gommage",
        subtitle: "Exfoliation & douceur",
        brand: "SULTANE DE SABA",
        soins: [
          { name: "Gommage aux Sels et Huiles Précieuses", duree: "30min", prix: "35.000 / 40.000 fcfa", description: "Une exfoliation aux sels marins et huiles précieuses pour une peau douce, nourrie et lumineuse." },
          { name: "Gommage Ayurvédique aux Noyaux d'Abricot", duree: "30min", prix: "35.000 / 40.000 fcfa", description: "Une exfoliation inspirée des rituels indiens pour lisser la peau et stimuler la circulation." },
          { name: "Gommage Lulur — Rituel de Bali", duree: "30min", prix: "35.000 / 40.000 fcfa", description: "Un gommage délicat pour révéler une peau satinée et subtilement parfumée." },
        ],
      },
      {
        title: "Gommages Minéraux",
        subtitle: "Exfoliation haute performance aux pierres précieuses",
        brand: "GEMOLOGY",
        soins: [
          { name: "Gommage aux Sels de Péridot", badge: "Relaxant & Anti-Stress", duree: "45min", prix: "45.000 / 50.000 fcfa", description: "Une exfoliation relaxante pour lisser la peau et libérer les tensions." },
          { name: "Gommage aux Sels de Rubis", badge: "Anti-Âge & Lissant", duree: "45min", prix: "45.000 / 50.000 fcfa", description: "Une exfoliation stimulante pour raviver l'éclat et la vitalité de la peau." },
          { name: "Gommage aux Sels de Saphir", badge: "Amincissant & Raffermissant", duree: "45min", prix: "45.000 / 50.000 fcfa", description: "Une exfoliation tonifiante pour une peau plus ferme et harmonieuse." },
          { name: "Gommage à la Perle de Gommage", badge: "Adoucissant", duree: "45min", prix: "40.000 / 45.000 fcfa", description: "Une exfoliation délicate pour affiner le grain de peau et révéler sa douceur." },
          { name: "Gommage à l'Éclat de Mangue", badge: "Énergisant", duree: "45min", prix: "40.000 / 45.000 fcfa", description: "Une exfoliation fruitée pour redonner énergie et éclat à la peau." },
        ],
      },
    ],
  },
  {
    id: "massages",
    label: "Massages",
    num: "03",
    sections: [
      {
        title: "Massages Traditionnels",
        subtitle: "Aux huiles précieuses",
        brand: "SULTANE DE SABA",
        soins: [
          { name: "Massage Balinais", duree: "50min", prix: "45.000 / 50.000 fcfa", description: "Pressions profondes et étirements pour relâcher les tensions et rééquilibrer le corps." },
          { name: "Massage Balinais", duree: "80min", prix: "65.000 / 70.000 fcfa" },
          { name: "Massage Ayurvédique", duree: "50min", prix: "45.000 / 50.000 fcfa", description: "Des mouvements enveloppants aux huiles chaudes pour harmoniser le corps et l'esprit." },
          { name: "Massage Ayurvédique", duree: "80min", prix: "65.000 / 70.000 fcfa" },
          { name: "Massage Oriental", duree: "50min", prix: "45.000 / 50.000 fcfa", description: "Des gestes lents et enveloppants pour un lâcher-prise profond." },
          { name: "Massage Oriental", duree: "80min", prix: "65.000 / 70.000 fcfa" },
        ],
      },
      {
        title: "Détente Express",
        subtitle: "Soins ciblés en 30 minutes",
        soins: [
          { name: "Foot Massage Réflexologique", duree: "30min", prix: "25.000 / 30.000 fcfa", description: "Une stimulation ciblée des zones réflexes pour rééquilibrer le corps." },
          { name: "Radiance Visage", duree: "30min", prix: "25.000 / 30.000 fcfa", description: "Un éclat immédiat pour une peau fraîche et lumineuse." },
          { name: "Massage du Dos", duree: "30min", prix: "25.000 / 30.000 fcfa", description: "Un relâchement ciblé pour libérer les tensions du dos et des épaules." },
          { name: "Destress Massage des Jambes", duree: "30min", prix: "25.000 / 30.000 fcfa", description: "Des gestes drainants pour une sensation immédiate de légèreté." },
          { name: "Massage Visage Énergétique — Cristal de Roche, Quartz & Jade", duree: "30min", prix: "45.000 / 50.000 fcfa", description: "Des gestes précis aux pierres pour détendre les traits et raviver l'éclat." },
        ],
      },
      {
        title: "Massages aux Pierres Précieuses",
        subtitle: "Énergie minérale & profondeur",
        brand: "GEMOLOGY",
        soins: [
          { name: "Massage Corps Énergétique au Quartz Rose & Jade", duree: "60min", prix: "85.000 / 90.000 fcfa", description: "L'énergie des pierres pour rééquilibrer le corps et installer une profonde sérénité." },
        ],
      },
      {
        title: "Spa Signature",
        subtitle: "L'expérience ultime",
        soins: [
          { name: "Signature Détente à l'Orientale", duree: "90min", prix: "75.000 / 80.000 fcfa", description: "Hammam bien-être, pureté du visage et massage oriental pour une détente profonde du corps et de l'esprit." },
        ],
      },
    ],
  },
  {
    id: "epilations",
    label: "Épilations",
    num: "04",
    sections: [
      {
        title: "Épilations Corps",
        subtitle: "Douceur & précision",
        soins: [
          { name: "Bras", prix: "15.000 / 20.000 fcfa" },
          { name: "Demi Jambes / Cuisse", prix: "15.000 / 20.000 fcfa" },
          { name: "Jambes Entières", prix: "20.000 / 25.000 fcfa" },
          { name: "Maillot Intégral", prix: "25.000 / 30.000 fcfa" },
          { name: "Maillot Brésilien", prix: "15.000 / 20.000 fcfa" },
          { name: "Aisselles", prix: "15.000 / 20.000 fcfa" },
          { name: "Dos / Ventre", prix: "25.000 / 30.000 fcfa" },
        ],
      },
      {
        title: "Épilations Visage",
        subtitle: "Finesse & soin",
        soins: [
          { name: "Sourcils — Création", prix: "10.000 / 15.000 fcfa" },
          { name: "Lèvres — Duvet — Menton", prix: "10.000 / 15.000 fcfa" },
          { name: "Visage Complet", prix: "20.000 / 25.000 fcfa" },
        ],
      },
      {
        title: "Forfait Épilation",
        subtitle: "L'essentiel en une séance",
        soins: [
          { name: "Jambes Entières + Maillot Brésilien + Aisselles", badge: "Offre Complète", prix: "45.000 / 60.000 fcfa" },
        ],
      },
    ],
  },
  {
    id: "forfaits",
    label: "Rituels",
    num: "05",
    sections: [
      {
        title: "Journées Délices",
        subtitle: "Expériences immersives & voyages sensoriels",
        brand: "SULTANE DE SABA",
        soins: [
          { name: "Escale Balinaise", duree: "2H", prix: "90.000 / 95.000 fcfa", description: "Gommage aromatique, pureté du visage et massage balinais pour une évasion inspirée de Bali." },
          { name: "Voyage Ayurvédique", duree: "2H30", prix: "110.000 / 115.000 fcfa", description: "Gommage, enveloppement, pureté du visage et massage ayurvédique pour rééquilibrer le corps en profondeur." },
          { name: "Détente à l'Orientale", duree: "3H", prix: "150.000 / 155.000 fcfa" },
        ],
      },
      {
        title: "Rituels Corps — Gommage, Enveloppement & Massage",
        subtitle: "Protocoles complets haute performance",
        brand: "GEMOLOGY",
        soins: [
          { name: "Soin Relaxant Minéral du Volcan Rotorua", badge: "Nouvelle-Zélande", duree: "1H15", prix: "95.000 / 100.000 fcfa", description: "Une détente profonde inspirée des richesses volcaniques pour relâcher le corps et revitaliser la peau." },
          { name: "Soin Détoxifiant Feuilles de Thé & Fève de Cacao", duree: "1H15", prix: "95.000 / 100.000 fcfa", description: "Une purification du corps pour retrouver légèreté et vitalité." },
          { name: "Soin Minéral Anti-Âge Rose Grenat", duree: "1H15", prix: "95.000 / 100.000 fcfa", description: "Une action ciblée pour raffermir la peau et préserver son éclat." },
          { name: "Soin Tonifiant Menthe & Prêle des Champs", duree: "1H15", prix: "95.000 / 100.000 fcfa", description: "Une fraîcheur stimulante pour réveiller le corps et dynamiser la peau." },
        ],
      },
    ],
  },
];

/* ─── ANIMATIONS ────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1], delay: i * 0.06 },
  }),
};

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function CarteDesSoins() {
  const [activeId, setActiveId] = useState("visage");
  const [navStuck, setNavStuck] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* Read hash on mount to activate the right tab */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && CATEGORIES.some((c) => c.id === hash)) {
      setActiveId(hash);
    }
  }, []);

  /* Sticky nav detection */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    nav.parentElement?.insertBefore(sentinel, nav);
    const obs = new IntersectionObserver(([e]) => setNavStuck(!e.isIntersecting), { threshold: 1 });
    obs.observe(sentinel);
    return () => { obs.disconnect(); sentinel.remove(); };
  }, []);

  const switchTab = (id: string) => {
    setActiveId(id);
    setTimeout(() => {
      if (!contentRef.current) return;
      const navbarH = window.innerWidth >= 768 ? 120 : 80;
      const tabNavH = navRef.current?.offsetHeight ?? 55;
      const top = contentRef.current.getBoundingClientRect().top + window.scrollY - navbarH - tabNavH - 8;
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(top, { duration: 0.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      else window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  };

  const activeCat = CATEGORIES.find((c) => c.id === activeId)!;

  return (
    <main style={{ backgroundColor: BG, color: TEXT }} className="min-h-screen">

      {/* ─── HERO ─── */}
      <section className="relative h-[50vh] md:h-[60vh] flex items-end justify-start overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1800&q=80"
          alt="Carte des soins"
          fill
          className="object-cover"
          style={{ transformOrigin: "center" }}
          unoptimized
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(244,235,217,0.97) 0%, rgba(244,235,217,0.55) 55%, rgba(244,235,217,0.05) 100%)",
          }}
        />
        <div className="relative z-10 px-8 md:px-20 pb-16 max-w-[900px]">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[10px] uppercase tracking-[0.35em] mb-5"
            style={{ color: ACCENT }}
          >
            Le Spa by Z Fit
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="font-light text-[52px] md:text-[88px] leading-none tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: TEXT }}
          >
            Carte
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.42 }}
            className="font-light italic text-[52px] md:text-[88px] leading-none tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: ACCENT }}
          >
            des Soins
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            style={{ transformOrigin: "left", backgroundColor: ACCENT }}
            className="h-px w-16 mt-8"
          />
        </div>
      </section>

      {/* ─── STICKY NAV ─── */}
      <div
        ref={navRef}
        className="sticky top-[80px] md:top-[120px] z-50 overflow-x-auto transition-all duration-300"
        style={{
          backgroundColor: navStuck ? BG : "transparent",
          borderBottom: navStuck ? `1px solid ${BORDER}` : "none",
          boxShadow: navStuck ? "0 2px 24px rgba(28,17,8,0.06)" : "none",
        }}
      >
        <div className="flex items-center gap-0 px-8 md:px-20 min-w-max">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => switchTab(cat.id)}
              className="relative py-5 px-5 md:px-8 text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-200 whitespace-nowrap"
              style={{ color: activeId === cat.id ? ACCENT : SECONDARY }}
            >
              {cat.label}
              {activeId === cat.id && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: ACCENT }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── PRICING NOTE ─── */}
      <div className="px-8 md:px-20 pt-12 pb-2">
        <p className="text-[11px] font-light" style={{ color: SECONDARY }}>
          Tarifs indiqués : Abonné et Non Abonné
        </p>
      </div>

      {/* ─── SECTIONS ─── */}
      <div ref={contentRef} className="px-8 md:px-20 pt-8 pb-32 min-h-[60vh]">
        <AnimatePresence mode="wait">
          <motion.section
            key={activeId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Category header */}
            <div className="flex items-end gap-6 mb-14 pb-8" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span
                className="text-[80px] md:text-[120px] font-light leading-none select-none"
                style={{ color: ACCENT, opacity: 0.18, fontFamily: "Georgia, serif" }}
              >
                {activeCat.num}
              </span>
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Catégorie {activeCat.num}
                </p>
                <h2
                  className="font-light text-[36px] md:text-[56px] leading-tight tracking-tight"
                  style={{ fontFamily: "Georgia, serif", color: TEXT }}
                >
                  {activeCat.label}
                </h2>
              </div>
            </div>

            {/* Sub-sections */}
            <div className="space-y-16">
              {activeCat.sections.map((section, si) => (
                <motion.div
                  key={si}
                  custom={si}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                >
                  {/* Sub-section header */}
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-8">
                    <div>
                      <h3
                        className="text-[18px] md:text-[22px] font-light tracking-tight mb-1"
                        style={{ fontFamily: "Georgia, serif", color: TEXT }}
                      >
                        {section.title}
                      </h3>
                      {section.subtitle && (
                        <p className="text-[11px] uppercase tracking-[0.2em] font-light" style={{ color: SECONDARY }}>
                          {section.subtitle}
                        </p>
                      )}
                    </div>
                    {section.brand && (
                      <span
                        className="mt-2 md:mt-0 text-[9px] uppercase tracking-[0.35em] px-3 py-1.5 self-start md:self-auto"
                        style={{ color: ACCENT, border: `1px solid ${ACCENT}`, opacity: 0.8 }}
                      >
                        {section.brand}
                      </span>
                    )}
                  </div>

                  {/* Service rows */}
                  <div className="divide-y" style={{ borderTop: `1px solid ${BORDER}`, borderColor: BORDER }}>
                    {section.soins.map((soin, i) => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        className="flex items-start justify-between gap-4 py-4 group"
                        style={{ borderColor: BORDER }}
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <div
                            className="w-1 h-1 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-[2]"
                            style={{ backgroundColor: ACCENT }}
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span
                                className="text-[14px] md:text-[15px] font-light leading-snug"
                                style={{ color: TEXT }}
                              >
                                {soin.name}
                              </span>
                              {soin.badge && (
                                <span
                                  className="text-[10px] uppercase tracking-[0.15em]"
                                  style={{ color: ACCENT }}
                                >
                                  — {soin.badge}
                                </span>
                              )}
                            </div>
                            {soin.description && (
                              <p
                                className="text-[11px] font-light leading-relaxed mt-0.5 italic"
                                style={{ color: SECONDARY }}
                              >
                                {soin.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-6 flex-shrink-0 pt-0.5">
                          {soin.duree && (
                            <span
                              className="hidden sm:block text-[11px] uppercase tracking-[0.2em] font-light"
                              style={{ color: SECONDARY }}
                            >
                              {soin.duree}
                            </span>
                          )}
                          <span
                            className="text-[13px] md:text-[14px] font-light tabular-nums text-right"
                            style={{ color: TEXT }}
                          >
                            {soin.prix}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>

      {/* ─── CTA SECTION ─── */}
      <section
        className="mx-8 md:mx-20 mb-24 px-10 md:px-20 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8"
        style={{ backgroundColor: TEXT }}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
            Réservation
          </p>
          <h3
            className="font-light text-[28px] md:text-[38px] leading-tight tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: BG }}
          >
            Offrez-vous un moment
            <br />
            <em style={{ color: ACCENT }}>d&apos;exception</em>
          </h3>
        </div>
        <Link
          href="/reservation"
          className="group flex items-center gap-3 px-8 py-4 text-[11px] uppercase tracking-[0.3em] transition-all duration-300 flex-shrink-0"
          style={{
            color: BG,
            border: `1px solid rgba(244,235,217,0.3)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = ACCENT;
            (e.currentTarget as HTMLElement).style.borderColor = ACCENT;
            (e.currentTarget as HTMLElement).style.color = TEXT;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,235,217,0.3)";
            (e.currentTarget as HTMLElement).style.color = BG;
          }}
        >
          <span>Réserver un soin</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      <FooterMain />
    </main>
  );
}
