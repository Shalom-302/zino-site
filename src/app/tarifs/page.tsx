"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FooterMain from "@/components/sections/footer-main";

const tabs = [
  { id: "engagement", label: "Avec Engagement" },
  { id: "sans-engagement", label: "Sans Engagement" },
  { id: "autres", label: "Autres Services" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 },
  }),
};

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState("engagement");

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772375328074.png?width=8000&height=8000&resize=contain"
          alt="Tarifs"
          fill
          priority
          className="object-cover grayscale"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        <div className="relative z-10 px-8 md:px-16 pb-14 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="text-white font-light text-[52px] md:text-[96px] leading-none tracking-tight"
          >
            Nos <em className="text-[#E13027] not-italic">Tarifs</em>
          </motion.h1>
        </div>
      </section>

      {/* TAB NAV */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="flex justify-center px-4 pt-16 pb-14"
      >
        <div className="flex gap-12 md:gap-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center gap-3 pb-3 group"
            >
              <span
                className="text-[10px] uppercase tracking-[0.25em] transition-colors duration-500"
                style={{ color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.3)" }}
              >
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#E13027]"
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* TAB CONTENT */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-10 pb-32">
        <AnimatePresence mode="wait">

          {/* AVEC ENGAGEMENT */}
          {activeTab === "engagement" && (
            <motion.div
              key="engagement"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-20"
            >
              <motion.p custom={0} variants={fadeUp} initial="hidden" animate="show"
                className="text-center text-secondary tracking-widest">
                Engagement minimum 12 mois — Prélèvement mensuel
              </motion.p>

              {/* Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/5">
                {/* CLUB */}
                <motion.div
                  custom={1} variants={fadeUp} initial="hidden" animate="show"
                  className="bg-black flex flex-col p-12 md:p-16 border border-white/8"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027] mb-8">Mensuel</p>
                  <h2 className="text-[64px] md:text-[80px] font-light uppercase leading-none mb-2">Club</h2>
                  <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-[42px] font-light tracking-tight">55 000</span>
                    <span className="text-secondary text-[12px] tracking-widest">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-white/8 mb-10" />
                  <ul className="space-y-5 flex-1">
                    {[
                      "Accès illimité plateau cardio & musculation",
                      "Accès aux cours collectifs",
                      "1 bilan InBody mensuel",
                      "1 soin de 30mn annuel",
                      "1 accès découverte espace sensoriel (annuel)",
                      "2 invitations journée découverte fitness (annuel)",
                    ].map((f, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-1 h-1 rounded-full bg-[#E13027] mt-2 shrink-0" />
                        <span className="text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-14">
                    <Link href="/reservation"
                      className="group relative inline-flex items-center justify-center w-full h-[52px] overflow-hidden border border-white/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-[#E13027]">
                      <motion.span className="absolute inset-0 bg-[#E13027] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                      <span className="relative z-10 flex items-center gap-3">Rejoindre <ArrowRight className="w-3.5 h-3.5" /></span>
                    </Link>
                  </div>
                </motion.div>

                {/* PREMIUM */}
                <motion.div
                  custom={2} variants={fadeUp} initial="hidden" animate="show"
                  className="bg-black flex flex-col p-12 md:p-16 border border-white/8 relative"
                >
                  <span className="absolute top-0 right-0 text-[9px] uppercase tracking-[0.3em] bg-[#E13027] text-white px-5 py-2">
                    Recommandé
                  </span>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027] mb-8">Mensuel</p>
                  <h2 className="text-[64px] md:text-[80px] font-light uppercase leading-none mb-2">Premium</h2>
                  <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-[42px] font-light tracking-tight">110 000</span>
                    <span className="text-secondary text-[12px] tracking-widest">FCFA / mois</span>
                  </div>
                  <div className="h-px bg-white/8 mb-10" />
                  <ul className="space-y-5 flex-1">
                    {[
                      "Tout le Club +",
                      "2 accès mensuels à l'espace sensoriel",
                      "Accès illimité à l'aquagym",
                      "1 séance mensuelle de coaching privé",
                      "1 soin de 30mn mensuel",
                      "6 invitations fitness + espace sensoriel (annuel)",
                      "Kit linge + bouteille d'eau à la séance",
                    ].map((f, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-1 h-1 rounded-full bg-[#E13027] mt-2 shrink-0" />
                        <span className="text-secondary">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-14">
                    <Link href="/reservation"
                      className="group relative inline-flex items-center justify-center w-full h-[52px] overflow-hidden bg-[#E13027] text-[10px] uppercase tracking-[0.3em] text-white transition-all duration-500">
                      <motion.span className="absolute inset-0 bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                      <span className="relative z-10 flex items-center gap-3 group-hover:text-black transition-colors duration-500">Rejoindre <ArrowRight className="w-3.5 h-3.5" /></span>
                    </Link>
                  </div>
                </motion.div>
              </div>

            </motion.div>
          )}

          {/* SANS ENGAGEMENT */}
          {activeTab === "sans-engagement" && (
            <motion.div
              key="sans-engagement"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-20"
            >
              <motion.p custom={0} variants={fadeUp} initial="hidden" animate="show"
                className="text-center text-secondary tracking-widest">
                Accès libre
              </motion.p>

              <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="space-y-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8">
                  {[
                    { title: "1 Accès Fitness", price: "10 000 F" },
                    { title: "1 Semaine", price: "30 000 F" },
                    { title: "1 Mois", price: "90 000 F" },
                    { title: "2 Mois", price: "150 000 F" },
                    { title: "3 Mois", price: "195 000 F" },
                    { title: "6 Mois", price: "360 000 F" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-black px-10 py-12 border border-white/8 hover:border-[#E13027]/30 transition-colors duration-500"
                    >
                      <p className="text-secondary text-[11px] uppercase tracking-[0.25em] mb-6">{item.title}</p>
                      <p className="text-[36px] md:text-[42px] font-light text-white tracking-tight leading-none">{item.price}</p>
                    </div>
                  ))}
                </div>
                <Link href="/reservation"
                  className="group/btn relative inline-flex items-center justify-center w-full h-[52px] overflow-hidden border border-white/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-[#E13027]">
                  <motion.span className="absolute inset-0 bg-[#E13027] origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 flex items-center gap-3">Rejoindre <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              </motion.div>

              {/* Annuels */}
              <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show" className="space-y-0">
                <div className="flex items-center gap-8 mb-6">
                  <div className="h-px flex-1 bg-white/8" />
                  <p className="text-secondary text-[10px] uppercase tracking-[0.3em]">Paiement annuel unique</p>
                  <div className="h-px flex-1 bg-white/8" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/8">
                  {[
                    { name: "12 Mois Club", price: "660 000 F" },
                    { name: "12 Mois Premium", price: "1 320 000 F" },
                  ].map((item, i) => (
                    <div
                      key={item.name}
                      className="bg-black flex justify-between items-center px-12 py-10 border border-white/8 hover:border-[#E13027]/30 transition-colors duration-500"
                    >
                      <h4 className="text-[22px] md:text-[28px] font-light uppercase tracking-tight">{item.name}</h4>
                      <div className="text-right">
                        <p className="text-[22px] font-light text-[#E13027] tracking-tight">{item.price}</p>
                        <p className="text-secondary text-[10px] tracking-widest mt-1">paiement unique</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/reservation"
                  className="group/btn relative inline-flex items-center justify-center w-full h-[52px] overflow-hidden border border-white/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-[#E13027]">
                  <motion.span className="absolute inset-0 bg-[#E13027] origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 flex items-center gap-3">Rejoindre <ArrowRight className="w-3.5 h-3.5" /></span>
                </Link>
              </motion.div>

              {/* Coupon */}
              <motion.div
                custom={10} variants={fadeUp} initial="hidden" animate="show"
                className="border border-[#E13027]/30 px-12 md:px-16 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027] mb-4">Offre Coupons</p>
                  <h4 className="text-[36px] md:text-[52px] font-light uppercase leading-none">50 Coupons Fitness</h4>
                  <p className="text-secondary mt-3">Validité 12 mois</p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-6 shrink-0">
                  <p className="text-[48px] md:text-[56px] font-light text-[#E13027] tracking-tight leading-none">350 000 F</p>
                  <Link href="/reservation"
                    className="group/btn relative inline-flex items-center justify-center h-[52px] px-10 overflow-hidden border border-white/20 text-[10px] uppercase tracking-[0.3em] transition-all duration-500 hover:border-[#E13027]">
                    <motion.span className="absolute inset-0 bg-[#E13027] origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    <span className="relative z-10 flex items-center gap-3">Rejoindre <ArrowRight className="w-3.5 h-3.5" /></span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AUTRES SERVICES */}
          {activeTab === "autres" && (
            <motion.div
              key="autres"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-20"
            >
              <motion.p custom={0} variants={fadeUp} initial="hidden" animate="show"
                className="text-center text-secondary tracking-widest">
                Services à la carte &amp; Tarifs spéciaux
              </motion.p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Espace Sensoriel */}
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show" className="space-y-0">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-4 h-px bg-[#E13027]" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027]">Espace Sensoriel</p>
                  </div>
                  {[
                    { title: "1 accès espace sensoriel + fitness", price: "25 000 F" },
                    { title: "1 accès espace sensoriel (abonné)", price: "10 000 F" },
                    { title: "1 accès espace sensoriel (non abonné)", price: "20 000 F" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-6 border-b border-white/8 group hover:border-[#E13027]/20 transition-colors duration-500 cursor-default">
                      <span className="text-secondary">{item.title}</span>
                      <span className="text-[18px] font-light text-[#E13027] shrink-0 ml-8">{item.price}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Extras */}
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show" className="space-y-0">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-4 h-px bg-[#E13027]" />
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#E13027]">Extras &amp; Services</p>
                  </div>
                  {[
                    { title: "Bilan InBody Non-Abonnés", price: "20 000 F" },
                    { title: "Personal Training", price: "30 000 F" },
                    { title: `Assurance "report"`, price: "72 000 F / an" },
                    { title: "Casier premium", price: "60 000 F / an" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-6 border-b border-white/8 group hover:border-[#E13027]/20 transition-colors duration-500 cursor-default">
                      <span className="text-secondary">{item.title}</span>
                      <span className="text-[18px] font-light text-[#E13027] shrink-0 ml-8">{item.price}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Note info */}
              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show"
                className="flex gap-5 items-start border-t border-white/8 pt-10 max-w-[800px]">
                <div className="w-4 h-px bg-[#E13027] mt-[10px] shrink-0" />
                <p className="text-secondary whitespace-nowrap">
                  Pour toute information complémentaire sur nos services premium ou entreprises, appelez-nous :{" "}
                  <a href="tel:+22527225108 35" className="text-white hover:text-[#E13027] transition-colors">+225 27 22 51 08 35</a>
                  {" "}/ {" "}
                  <a href="tel:+22507097330 20" className="text-white hover:text-[#E13027] transition-colors">+225 07 09 73 30 20</a>
                </p>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </section>

      <FooterMain />
    </main>
  );
};

export default PricingPage;
