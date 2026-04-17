"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import FooterMain from "@/components/sections/footer-main";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const CATEGORIES = ["Les Mills", "HBX", "Aquagym", "RPM"];
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HEURES = ["07H00", "08H15", "09H15", "10H15", "11H15", "15H00", "16H00", "17H00", "18H00", "19H00", "20H00", "21H00"];

const ACT_COLORS: Record<string, { accent: string; light: string }> = {
  "Abdo Flash":       { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Aqua Minceur":     { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Body Attack":      { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Body Combat":      { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Bodyflow":         { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Bodypump":         { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Boxing":           { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Circuit Training": { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Cross Kids":       { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Cross Training":   { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Dance Zum Zum":    { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Djembel":          { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "FAC":              { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Kids Boxing":      { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Kids Cross":       { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Kids Hip Hop":     { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Pilates":          { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "RPM":              { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Sprint":           { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Stretching":       { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "TRX":              { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
  "Zumba":            { accent: "#E13027", light: "rgba(255,255,255,0.03)" },
};

const CAT_ACCENT: Record<string, string> = {
  "Les Mills": "#E13027",
  "HBX":        "#111111",
  "Aquagym":    "#1A6FB5",
  "RPM":        "#D4900A",
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 },
  }),
};

interface Slot {
  id: string;
  categorie: string;
  jour: string;
  heure: string;
  activite: string;
}

export default function ProgrammePage() {
  const [activeTab, setActiveTab] = useState("Les Mills");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const activeIndex = CATEGORIES.indexOf(activeTab);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, "programme"));
      setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as Slot)));
      setLoading(false);
    };
    fetchSlots();
  }, []);

  const getSlot = (jour: string, heure: string) =>
    slots.find((s) => s.categorie === activeTab && s.jour === jour && s.heure === heure);

  // Activités présentes dans l'onglet actif
  const activeActivities = Array.from(
    new Set(
      slots
        .filter((s) => s.categorie === activeTab && s.activite)
        .map((s) => s.activite)
    )
  );

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end justify-start overflow-hidden">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772375328074.png?width=8000&height=8000&resize=contain"
          alt="Programme"
          fill
          priority
          className="object-cover scale-105 grayscale"
          style={{ transformOrigin: "center" }}
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="relative z-10 px-8 md:px-20 pb-14 max-w-[900px]">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="text-white font-light text-[52px] md:text-[88px] leading-none tracking-tight"
          >
            Planning
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="text-[#E13027] font-light italic text-[52px] md:text-[88px] leading-none tracking-tight"
          >
            du mois
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={ready ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            style={{ transformOrigin: "left" }}
            className="h-px w-16 bg-[#E13027] mt-8"
          />
        </div>
      </section>

      {/* TABS */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="w-full px-8 md:px-20 pt-14 pb-10"
      >
        <div className="flex gap-8 md:gap-12 border-b border-white/8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className="relative pb-5 text-[10px] md:text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 whitespace-nowrap"
              style={{ color: activeTab === cat ? "#fff" : "rgba(255,255,255,0.3)" }}
            >
              {cat}
              {activeTab === cat && (
                <motion.div
                  layoutId="prog-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#E13027]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* GRILLE */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20 md:pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-[#E13027] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
                  <div className="overflow-x-auto pb-4 custom-scrollbar relative">
                    <table className="w-full border-collapse table-fixed">
                      <thead>
                        <tr className="bg-black/80">
                            <th className="w-[45px] md:w-[90px] py-4 pr-1 text-left sticky left-0 top-0 z-30 bg-black border-r border-white/5 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.3)]">
                              <span className="text-[8px] md:text-[10px] font-light uppercase tracking-[0.2em] text-[#E13027]">Heure</span>
                            </th>
                            {JOURS.map((jour, i) => (
                              <motion.th
                                key={jour}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                animate="show"
                                className="py-4 px-0.5 md:px-2 text-center sticky top-0 z-20 bg-black"
                              >
                                <span className="text-[9px] md:text-[11px] font-light uppercase tracking-[0.18em] block truncate text-white">
                                  {jour.substring(0, 3)}
                                  <span className="hidden sm:inline">{jour.substring(3)}</span>
                                </span>
                              </motion.th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {HEURES.map((heure, hi) => (
                            <tr key={heure} className="border-t border-white/5 group">
                              <td className="py-2 pr-1 whitespace-nowrap sticky left-0 z-10 bg-black border-r border-white/5 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.3)]">
                                    <span className="text-[8px] md:text-[10px] font-light uppercase tracking-[0.15em] text-[#E13027] group-hover:text-[#E13027] transition-colors">{heure}</span>
                              </td>
                            {JOURS.map((jour, ji) => {
                              const slot = getSlot(jour, heure);
                              const activite = slot?.activite || "";
                              const hasActivity = activite !== "";
                              const colors = ACT_COLORS[activite];
                              return (
                                <motion.td
                                  key={jour}
                                  custom={hi * JOURS.length + ji}
                                  variants={fadeUp}
                                  initial="hidden"
                                  animate="show"
                                  className="py-0.5 px-0 md:px-1"
                                >
                                      <motion.div
                                        whileHover={hasActivity ? { y: -2 } : {}}
                                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                          className="relative min-h-[40px] md:min-h-[56px] flex flex-col items-center justify-center text-center px-0.5 py-1 md:px-1.5 md:py-2.5 cursor-default overflow-hidden group/cell"
                                          style={{}}
                                      >
                                        {hasActivity ? (
                                          <>
                                            <span className="text-[6.5px] leading-[1.4] md:text-[11px] font-light tracking-wide break-words text-white group-hover/cell:text-white transition-colors duration-300">
                                              {activite}
                                            </span>
                                            {/* Soulignement rouge animé */}
                                            <span
                                              className="absolute bottom-0 left-0 h-px bg-[#E13027] w-0 group-hover/cell:w-full transition-all duration-500 ease-out"
                                            />
                                          </>
                                        ) : (
                                          <span className="text-[7px] text-white/0">—</span>
                                        )}
                                      </motion.div>
                                </motion.td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
            )}


          </motion.div>
        </AnimatePresence>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="px-8 md:px-20 py-24 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-t border-white/8"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027] mb-4">Envie de commencer ?</p>
          <h2 className="text-[36px] md:text-[52px] font-light leading-none tracking-tight">
            Prendre un<br /><em className="text-[#E13027] not-italic">rendez-vous</em>
          </h2>
        </div>
        <a
          href="/reservation"
          className="group relative inline-flex items-center justify-center h-[52px] px-12 overflow-hidden border border-white/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-[#E13027] shrink-0"
        >
          <motion.span className="absolute inset-0 bg-[#E13027] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          <span className="relative z-10 flex items-center gap-3">
            Réserver maintenant
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </span>
        </a>
      </motion.section>

      <FooterMain />
    </main>
  );
}
