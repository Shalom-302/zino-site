"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, Clock, ArrowRight, Check, ChevronDown } from "lucide-react";
import FooterMain from "@/components/sections/footer-main";
import { sendReservationEmail } from "@/app/actions/send-email";
import { toast } from "sonner";
import { useEnvironment } from "@/context/environment-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: i * 0.15 },
  }),
};

const CATALOGUE = [
  {
    category: "Soins Visage",
    soins: [
      { id: "visage-hydratant", label: "Soin Minéral Hydratant — Peaux Sèches", duree: "1H" },
      { id: "visage-purifiant", label: "Soin d'Équilibre Purifiant — Peaux Mixtes", duree: "1H" },
      { id: "visage-apaisant", label: "Soin Apaisant — Peaux Sensibles", duree: "1H" },
      { id: "visage-regenerant", label: "Soin Régénérant — Peaux Matures", duree: "1H" },
      { id: "visage-eclat", label: "Soin Bio Éclat Ambre Bleue — Toutes Peaux", duree: "1H" },
      { id: "visage-diamant", label: "Soin Éclat Diamant Masque Gel", duree: "1H15" },
      { id: "visage-amethyste", label: "Soin d'Équilibre Améthyste — Peaux Mixtes", duree: "1H15" },
      { id: "visage-smithsonite", label: "Soin Apaisant Smithsonite — Peaux Sensibles", duree: "1H15" },
      { id: "visage-perle-diamant", label: "Soin Lumière Perle & Diamant Éclaircissant", duree: "1H30" },
      { id: "visage-anti-rides", label: "Soin Anti-Rides Écrin Diamant", duree: "1H30" },
      { id: "visage-perle-blanche", label: "Soin Écrin Perle Blanche Anti-Tâches", duree: "1H30" },
      { id: "visage-collagene", label: "Soin Diamant & Collagène — Masque Prestige", duree: "1H30" },
    ],
  },
  {
    category: "Soins Corps",
    soins: [
      { id: "hammam-origine", label: "Hammam Origine", duree: "30min" },
      { id: "hammam-bien-etre", label: "Hammam Bien-Être", duree: "45min" },
      { id: "hammam-royal", label: "Hammam Royal", duree: "60min" },
      { id: "gommage-sels-huiles", label: "Gommage aux Sels et Huiles Précieuses", duree: "30min" },
      { id: "gommage-ayurvedique", label: "Gommage Ayurvédique aux Noyaux d'Abricot", duree: "30min" },
      { id: "gommage-lulur", label: "Gommage Lulur — Rituel de Bali", duree: "30min" },
      { id: "gommage-peridot", label: "Gommage aux Sels de Péridot — Relaxant", duree: "45min" },
      { id: "gommage-rubis", label: "Gommage aux Sels de Rubis — Anti-Âge", duree: "45min" },
      { id: "gommage-saphir", label: "Gommage aux Sels de Saphir — Amincissant", duree: "45min" },
      { id: "gommage-perle", label: "Gommage à la Perle — Adoucissant", duree: "45min" },
      { id: "gommage-mangue", label: "Gommage à l'Éclat de Mangue — Énergisant", duree: "45min" },
    ],
  },
  {
    category: "Massages",
    soins: [
      { id: "massage-balinais-50", label: "Massage Balinais", duree: "50min" },
      { id: "massage-balinais-80", label: "Massage Balinais", duree: "80min" },
      { id: "massage-ayurvedique-50", label: "Massage Ayurvédique", duree: "50min" },
      { id: "massage-ayurvedique-80", label: "Massage Ayurvédique", duree: "80min" },
      { id: "massage-oriental-50", label: "Massage Oriental", duree: "50min" },
      { id: "massage-oriental-80", label: "Massage Oriental", duree: "80min" },
      { id: "foot-massage", label: "Foot Massage Réflexologique", duree: "30min" },
      { id: "radiance-visage", label: "Radiance Visage", duree: "30min" },
      { id: "massage-dos", label: "Massage du Dos", duree: "30min" },
      { id: "massage-jambes", label: "Destress Massage des Jambes", duree: "30min" },
      { id: "massage-cristal", label: "Massage Visage Énergétique — Cristal & Jade", duree: "30min" },
      { id: "massage-quartz-jade", label: "Massage Corps — Quartz Rose & Jade", duree: "60min" },
      { id: "signature-orientale", label: "Signature Détente à l'Orientale", duree: "90min" },
    ],
  },
  {
    category: "Épilations",
    soins: [
      { id: "epil-bras", label: "Épilation Bras" },
      { id: "epil-demi-jambes", label: "Épilation Demi Jambes / Cuisse" },
      { id: "epil-jambes", label: "Épilation Jambes Entières" },
      { id: "epil-maillot-integral", label: "Épilation Maillot Intégral" },
      { id: "epil-maillot-bresilien", label: "Épilation Maillot Brésilien" },
      { id: "epil-aisselles", label: "Épilation Aisselles" },
      { id: "epil-visage-complet", label: "Épilation Visage Complet" },
      { id: "epil-sourcils", label: "Épilation Sourcils" },
      { id: "epil-levres-menton", label: "Épilation Lèvres / Duvet / Menton" },
      { id: "epil-dos-ventre", label: "Épilation Dos / Ventre" },
      { id: "epil-forfait", label: "Forfait Jambes + Maillot Brésilien + Aisselles" },
    ],
  },
  {
    category: "Forfaits & Rituels",
    soins: [
      { id: "forfait-escale-balinaise", label: "Journée Escale Balinaise", duree: "2H" },
      { id: "forfait-voyage-ayurvedique", label: "Journée Voyage Ayurvédique", duree: "2H30" },
      { id: "forfait-orientale", label: "Journée Détente à l'Orientale", duree: "3H" },
      { id: "rituel-rotorua", label: "Rituel Minéral du Volcan Rotorua", duree: "1H15" },
      { id: "rituel-the-cacao", label: "Rituel Détoxifiant Thé & Cacao", duree: "1H15" },
      { id: "rituel-rose-grenat", label: "Rituel Minéral Anti-Âge Rose Grenat", duree: "1H15" },
      { id: "rituel-menthe-prele", label: "Rituel Tonifiant Menthe & Prêle", duree: "1H15" },
    ],
  },
];

const HEURES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

const ReservationPage = () => {
  const { environment } = useEnvironment();
  const isSpa = environment !== "fitness"; // defaults to spa when null

  // Default to spa styling when environment is null (avoids black flash on load)
  const isFitness = environment === 'fitness';
  const bg = isFitness ? '#000' : '#F4EBD9';
  const text = isFitness ? '#fff' : '#1C1108';
  const accent = isFitness ? '#E13027' : '#C4A87A';
  const borderColor = isFitness ? 'rgba(255,255,255,0.08)' : 'rgba(28,17,8,0.12)';
  const inputBorder = isFitness ? 'rgba(255,255,255,0.15)' : 'rgba(28,17,8,0.15)';
  const placeholderColor = isFitness ? 'rgba(255,255,255,0.4)' : 'rgba(28,17,8,0.35)';
  const secondary = isFitness ? 'rgba(255,255,255,0.5)' : 'rgba(28,17,8,0.55)';
  const dropdownBg = isFitness ? '#111' : '#EDE8E0';
  const dropdownBorder = isFitness ? 'rgba(255,255,255,0.1)' : 'rgba(28,17,8,0.12)';
  const dropdownHover = isFitness ? 'rgba(255,255,255,0.05)' : 'rgba(28,17,8,0.05)';

  const [formData, setFormData] = useState({
    civilite: "M.",
    nom: "",
    prenom: "",
    phone: "",
    email: "",
    type: environment || "fitness",
    note: "",
    soins: [] as string[],
    jour: "",
    heure: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [soinOpen, setSoinOpen] = useState(false);
  const [heureOpen, setHeureOpen] = useState(false);
  const [creneauxPris, setCreneauxPris] = useState<string[]>([]);

  const soinRef = useRef<HTMLDivElement>(null);
  const heureRef = useRef<HTMLDivElement>(null);

  // Flat lookup for label display
  const allSoins = CATALOGUE.flatMap((c) => c.soins);
  const toggleSoin = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      soins: prev.soins.includes(id)
        ? prev.soins.filter((s) => s !== id)
        : [...prev.soins, id],
    }));
  };

  const soinsTriggerLabel = () => {
    if (formData.soins.length === 0) return null;
    if (formData.soins.length === 1) {
      const found = allSoins.find((s) => s.id === formData.soins[0]);
      return found?.label || null;
    }
    return `${formData.soins.length} soins sélectionnés`;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (soinRef.current && !soinRef.current.contains(e.target as Node)) {
        setSoinOpen(false);
      }
      if (heureRef.current && !heureRef.current.contains(e.target as Node)) {
        setHeureOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!formData.jour) return;
    getDocs(query(
      collection(db, "reservations"),
      where("date_reservation", "==", formData.jour),
      where("status", "==", "approved")
    )).then((snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const h = d.data().heure;
        if (h) counts[h] = (counts[h] || 0) + 1;
      });
      setCreneauxPris(Object.keys(counts).filter(h => counts[h] >= 4));
    });
  }, [formData.jour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSpa && formData.soins.length === 0) {
      toast.error("Veuillez sélectionner au moins un soin.");
      return;
    }
    if (!formData.jour || !formData.heure) {
      toast.error("Veuillez renseigner le jour et l'heure.");
      return;
    }
    if (creneauxPris.includes(formData.heure)) {
      toast.error("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await sendReservationEmail(formData);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setFormData({ nom: "", prenom: "", phone: "", email: "", type: environment || "fitness", note: "", soins: [], jour: "", heure: "" });
        }, 6000);
      } else {
        toast.error("Une erreur est survenue lors de l'envoi de votre réservation.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Impossible de confirmer votre réservation pour le moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: bg, color: text }}>

      {/* HERO */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end justify-start overflow-hidden">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772375328074.png?width=8000&height=8000&resize=contain"
          alt="Reservation"
          fill
          className={`object-cover scale-105${isSpa ? '' : ' grayscale'}`}
          style={{ transformOrigin: "center" }}
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{
            background: isSpa
              ? 'linear-gradient(to top, rgba(244,235,217,0.92) 0%, rgba(244,235,217,0.5) 50%, rgba(244,235,217,0.1) 100%)'
              : 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div className="relative z-10 px-8 md:px-20 pb-14 max-w-[900px]">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="font-light text-[52px] md:text-[88px] leading-none tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: text }}
          >
            {isSpa ? "Faire ma" : "Planifier"}
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="font-light italic text-[52px] md:text-[88px] leading-none tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: accent }}
          >
            {isSpa ? "réservation" : "ma visite"}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            style={{ transformOrigin: "left", backgroundColor: accent }}
            className="h-px w-16 mt-8"
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-[1200px] mx-auto px-8 md:px-20 py-20 md:py-28">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

          {/* FORM */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex-1"
          >
            <div className="mb-14 pb-10" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <p className="text-[10px] uppercase tracking-[0.28em] mb-6" style={{ color: accent }}>
                {isSpa ? "Formulaire de réservation spa" : "Formulaire de réservation"}
              </p>
              <h2
                className="font-light text-[36px] md:text-[52px] leading-tight tracking-tight mb-2"
                style={{ fontFamily: 'Georgia, serif', color: text }}
              >
                {isSpa ? "Votre moment" : "Prêt pour"}
              </h2>
              <h2
                className="font-light italic text-[36px] md:text-[52px] leading-tight tracking-tight"
                style={{ fontFamily: 'Georgia, serif', color: accent }}
              >
                {isSpa ? "de détente" : "le changement ?"}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="min-h-[60vh] flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-14 h-14 flex items-center justify-center mx-auto mb-10"
                    style={{ border: `1px solid ${accent}` }}
                  >
                    <Check className="w-6 h-6" style={{ color: accent }} strokeWidth={1.5} />
                  </motion.div>
                  <h3
                    className="text-[22px] font-light tracking-tight mb-4"
                    style={{ fontFamily: 'Georgia, serif', color: text }}
                  >
                    Demande envoyée
                  </h3>
                  <p className="text-[14px] font-light max-w-[300px] mx-auto leading-relaxed mb-6" style={{ color: secondary }}>
                    Nous vous contacterons pour confirmer votre créneau dans les plus brefs délais.
                  </p>
                  <div className="h-px w-8 mx-auto" style={{ backgroundColor: accent, opacity: 0.4 }} />
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-10"
                >
                  {/* Civilité */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                      Civilité
                    </label>
                    <div className="flex gap-4">
                      {["M.", "Mme"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, civilite: c })}
                          className="text-[13px] font-light px-5 py-2 transition-all duration-300"
                          style={{
                            color: formData.civilite === c ? (isSpa ? '#1C1108' : '#fff') : (isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.4)'),
                            border: `1px solid ${formData.civilite === c ? (isSpa ? 'rgba(28,17,8,0.6)' : 'rgba(255,255,255,0.6)') : (isSpa ? 'rgba(28,17,8,0.15)' : 'rgba(255,255,255,0.15)')}`,
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nom / Prénom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { label: "Nom", key: "nom", placeholder: "Votre nom" },
                      { label: "Prénom", key: "prenom", placeholder: "Votre prénom" },
                    ].map((field) => (
                      <div key={field.key} className="group">
                        <label
                          className="text-[10px] uppercase tracking-[0.25em] block mb-3"
                          style={{ color: text }}
                        >
                          {field.label}
                        </label>
                        <input
                          required
                          type="text"
                          value={formData[field.key as "nom" | "prenom"]}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="w-full bg-transparent pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                          style={{
                            color: text,
                            borderBottom: `1px solid ${inputBorder}`,
                          }}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                      Numéro / WhatsApp
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-transparent pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                      style={{ color: text, borderBottom: `1px solid ${inputBorder}` }}
                      placeholder="+225 ..."
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                      Adresse email
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                      style={{ color: text, borderBottom: `1px solid ${inputBorder}` }}
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* SPA ONLY: Choix des soins (multi-select) */}
                  <AnimatePresence>
                    {isSpa && (
                      <motion.div
                        key="soin-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-visible"
                      >
                        <div ref={soinRef} className="relative">
                          <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                            Soins souhaités
                            {formData.soins.length > 0 && (
                              <span className="ml-2 normal-case tracking-normal font-light" style={{ color: accent }}>
                                — {formData.soins.length} sélectionné{formData.soins.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </label>
                          <button
                            type="button"
                            onClick={() => { setSoinOpen((v) => !v); setHeureOpen(false); }}
                            className="w-full flex items-center justify-between pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                            style={{
                              color: formData.soins.length > 0 ? text : placeholderColor,
                              borderBottom: `1px solid ${inputBorder}`,
                            }}
                          >
                            <span className="truncate pr-4 text-left">
                              {soinsTriggerLabel() || "Sélectionner des soins"}
                            </span>
                            <ChevronDown
                              className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300"
                              style={{ color: secondary, transform: soinOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                            />
                          </button>

                          {/* Selected tags */}
                          <AnimatePresence>
                            {formData.soins.length > 1 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-wrap gap-2 mt-3"
                              >
                                {formData.soins.map((id) => {
                                  const s = allSoins.find((x) => x.id === id);
                                  return (
                                    <button
                                      key={id}
                                      type="button"
                                      onClick={() => toggleSoin(id)}
                                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors duration-150"
                                      style={{
                                        color: accent,
                                        border: `1px solid ${accent}`,
                                        backgroundColor: `${accent}15`,
                                      }}
                                    >
                                      <span>{s?.label}</span>
                                      <span style={{ opacity: 0.6 }}>×</span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Dropdown */}
                          <AnimatePresence>
                            {soinOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 right-0 z-50 mt-1 shadow-2xl max-h-80 overflow-y-auto"
                                style={{ backgroundColor: dropdownBg, border: `1px solid ${dropdownBorder}` }}
                              >
                                {CATALOGUE.map((cat) => (
                                  <div key={cat.category}>
                                    {/* Category header */}
                                    <div
                                      className="px-5 py-2.5 text-[9px] uppercase tracking-[0.3em] sticky top-0"
                                      style={{
                                        color: accent,
                                        backgroundColor: dropdownBg,
                                        borderBottom: `1px solid ${dropdownBorder}`,
                                      }}
                                    >
                                      {cat.category}
                                    </div>
                                    {/* Soins */}
                                    {cat.soins.map((soin) => {
                                      const isSelected = formData.soins.includes(soin.id);
                                      return (
                                        <button
                                          key={soin.id}
                                          type="button"
                                          onClick={() => toggleSoin(soin.id)}
                                          className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors duration-150"
                                          style={{
                                            color: isSelected ? accent : secondary,
                                            borderBottom: `1px solid ${dropdownBorder}`,
                                            backgroundColor: isSelected ? `${accent}10` : 'transparent',
                                          }}
                                          onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = dropdownHover; }}
                                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSelected ? `${accent}10` : 'transparent'; }}
                                        >
                                          {/* Checkbox */}
                                          <span
                                            className="w-4 h-4 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                                            style={{
                                              border: `1px solid ${isSelected ? accent : dropdownBorder}`,
                                              backgroundColor: isSelected ? accent : 'transparent',
                                            }}
                                          >
                                            {isSelected && (
                                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                <path d="M1 3L3 5L7 1" stroke={dropdownBg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                              </svg>
                                            )}
                                          </span>
                                          <span className="flex-1 text-[13px] font-light">{soin.label}</span>
                                          {'duree' in soin && soin.duree && (
                                            <span className="text-[11px] flex-shrink-0" style={{ color: secondary }}>
                                              {soin.duree}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Jour + Heure */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Jour */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                        Jour souhaité
                      </label>
                      <input
                        type="date"
                        value={formData.jour}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => {
                          setFormData({ ...formData, jour: e.target.value, heure: "" });
                          setCreneauxPris([]);
                        }}
                        className="w-full bg-transparent pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                        style={{
                          color: text,
                          borderBottom: `1px solid ${inputBorder}`,
                          colorScheme: isSpa ? 'light' : 'dark',
                        }}
                      />
                    </div>

                    {/* Heure */}
                    <div ref={heureRef} className="relative">
                      <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                        Heure souhaitée
                        {formData.jour && creneauxPris.length > 0 && (
                          <span className="ml-2 normal-case tracking-normal font-light" style={{ color: secondary }}>
                            — {creneauxPris.length} indisponible{creneauxPris.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => { setHeureOpen((v) => !v); setSoinOpen(false); }}
                        className="w-full flex items-center justify-between pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300"
                        style={{
                          color: formData.heure ? text : placeholderColor,
                          borderBottom: `1px solid ${inputBorder}`,
                        }}
                      >
                        <span>{formData.heure || "Sélectionner une heure"}</span>
                        <ChevronDown
                          className="w-3.5 h-3.5 transition-transform duration-300"
                          style={{ color: secondary, transform: heureOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>
                      <AnimatePresence>
                        {heureOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 z-50 mt-1 shadow-2xl max-h-56 overflow-y-auto"
                            style={{ backgroundColor: dropdownBg, border: `1px solid ${dropdownBorder}` }}
                          >
                            {HEURES.map((h) => {
                              const isPris = creneauxPris.includes(h);
                              return (
                                <button
                                  key={h}
                                  type="button"
                                  disabled={isPris}
                                  onClick={() => {
                                    if (!isPris) {
                                      setFormData({ ...formData, heure: h });
                                      setHeureOpen(false);
                                    }
                                  }}
                                  className="w-full px-5 py-3 text-left transition-colors duration-150 text-[13px] font-light flex items-center justify-between"
                                  style={{
                                    color: isPris
                                      ? (isSpa ? 'rgba(28,17,8,0.25)' : 'rgba(255,255,255,0.2)')
                                      : formData.heure === h
                                      ? accent
                                      : secondary,
                                    borderBottom: `1px solid ${dropdownBorder}`,
                                    cursor: isPris ? "not-allowed" : "pointer",
                                  }}
                                  onMouseEnter={(e) => { if (!isPris) e.currentTarget.style.backgroundColor = dropdownHover; }}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <span style={{ textDecoration: isPris ? "line-through" : "none" }}>{h}</span>
                                  {isPris && (
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: isSpa ? 'rgba(28,17,8,0.25)' : 'rgba(255,255,255,0.2)' }}>Indisponible</span>
                                  )}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.25em] block mb-3" style={{ color: text }}>
                      Note <span className="normal-case tracking-normal font-light" style={{ color: secondary }}>(optionnel)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full bg-transparent pb-3 text-[15px] font-light focus:outline-none transition-colors duration-300 resize-none"
                      style={{
                        color: text,
                        borderBottom: `1px solid ${inputBorder}`,
                      }}
                      placeholder="Informations complémentaires, demandes spéciales..."
                    />
                  </div>

                  {/* Submit */}
                  <div className="space-y-4">
                    <motion.button
                      whileHover="hover"
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      type="submit"
                      className="group relative overflow-hidden px-10 py-4 text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 disabled:opacity-30"
                      style={{
                        color: text,
                        border: `1px solid ${isSpa ? 'rgba(28,17,8,0.25)' : 'rgba(255,255,255,0.2)'}`,
                      }}
                    >
                      <motion.span
                        className="absolute inset-0"
                        style={{ backgroundColor: accent }}
                        initial={{ x: "-100%" }}
                        variants={{ hidden: { x: "-100%" }, show: { x: "-100%" }, hover: { x: 0 } }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex items-center justify-center gap-3">
                            <span className="w-4 h-4 rounded-full animate-spin" style={{ border: `1px solid ${secondary}`, borderTopColor: text }} />
                            <span>Traitement...</span>
                          </motion.div>
                        ) : (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex items-center justify-center gap-3">
                            <span>Confirmer ma demande</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    {isSpa && (
                      <p className="text-[11px] font-light tracking-wide" style={{ color: secondary }}>
                        Nous vous contacterons pour confirmer votre créneau.
                      </p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* CONTACT INFO */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="w-full lg:w-[300px] h-fit"
          >
            <div className="mb-10 pb-8" style={{ borderBottom: `1px solid ${borderColor}` }}>
              <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: accent }}>Informations</p>
            </div>

            <div className="space-y-10">
              {[
                {
                  icon: <MapPin className="w-3.5 h-3.5" style={{ color: accent }} />,
                  label: "Localisation",
                  content: (
                    <div>
                      <p style={{ color: text }}>
                        2 Plateaux Vallon,<br />derrière l&apos;Ambassade du Ghana
                      </p>
                      <a
                        href="https://maps.app.goo.gl/V5CxyqbtiTYJ7iXt7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] uppercase tracking-[0.2em] mt-2 inline-block hover:opacity-80 transition-opacity"
                        style={{ color: accent }}
                      >
                        Voir sur Google Maps →
                      </a>
                    </div>
                  ),
                },
                {
                  icon: <Phone className="w-3.5 h-3.5" style={{ color: accent }} />,
                  label: "Téléphone",
                  content: (
                    <div className="space-y-1">
                      <p style={{ color: text }}>+225 27 22 51 08 35</p>
                      <a
                        href="https://wa.me/2250709733020"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                        style={{ color: text }}
                      >
                        +225 07 09 73 30 20
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#25D366' }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </div>
                  ),
                },
                {
                  icon: <Mail className="w-3.5 h-3.5" style={{ color: accent }} />,
                  label: "Email",
                  content: <p style={{ color: text }}>info@zfitspa.ci</p>,
                },
                {
                  icon: <Clock className="w-3.5 h-3.5" style={{ color: accent }} />,
                  label: "Horaires d'ouverture",
                  content: (
                    <div className="space-y-4 pt-1">
                      {[
                        { day: "Lun — Ven", hours: "06H — 22H", highlight: false },
                        { day: "Samedi", hours: "07H — 20H", highlight: false },
                        { day: "Dim & Fériés", hours: "08H — 18H", highlight: true },
                      ].map(({ day, hours, highlight }) => (
                        <div key={day} className="flex justify-between items-center pb-4 last:pb-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
                          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: highlight ? accent : text }}>{day}</span>
                          <span className="text-[13px] font-light" style={{ color: highlight ? accent : text }}>{hours}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ].map(({ icon, label, content }, i) => (
                <motion.div key={label} custom={i + 3} variants={fadeUp} initial="hidden" animate="show">
                  <div className="flex items-center gap-3 mb-3">
                    {icon}
                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: text }}>{label}</p>
                  </div>
                  <div className="pl-6 text-[14px] font-light" style={{ color: secondary }}>{content}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <FooterMain />
    </main>
  );
};

export default ReservationPage;
