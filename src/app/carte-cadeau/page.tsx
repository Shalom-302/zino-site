"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Phone, Mail, MessageCircle } from "lucide-react";
import FooterMain from "@/components/sections/footer-main";
import { sendGiftCardEmail } from "@/app/actions/send-email";

/* ─── PALETTE ─── */
const BG = "#F4EBD9";
const TEXT = "#1C1108";
const ACCENT = "#C4A87A";
const SECONDARY = "rgba(28,17,8,0.55)";
const BORDER = "rgba(28,17,8,0.1)";

/* ─── CATALOGUE ─── */
const CATALOGUE = [
  {
    category: "Soins Visage",
    soins: [
      "Soin Minéral Hydratant — Peaux Sèches (1H)",
      "Soin d'Équilibre Purifiant — Peaux Mixtes (1H)",
      "Soin Apaisant — Peaux Sensibles (1H)",
      "Soin Régénérant — Peaux Matures (1H)",
      "Soin Bio Éclat Ambre Bleue — Toutes Peaux (1H)",
      "Soin Éclat Diamant Masque Gel (1H15)",
      "Soin Lumière Perle & Diamant Éclaircissant (1H30)",
      "Soin Anti-Rides Écrin Diamant (1H30)",
      "Soin Diamant & Collagène — Masque Prestige (1H30)",
    ],
  },
  {
    category: "Soins Corps",
    soins: [
      "Hammam Origine (30min)",
      "Hammam Bien-Être (45min)",
      "Hammam Royal (60min)",
      "Gommage aux Sels et Huiles Précieuses (30min)",
      "Gommage Ayurvédique aux Noyaux d'Abricot (30min)",
      "Gommage Lulur — Rituel de Bali (30min)",
      "Gommage aux Sels de Péridot — Relaxant (45min)",
      "Gommage aux Sels de Rubis — Anti-Âge (45min)",
      "Gommage aux Sels de Saphir — Amincissant (45min)",
    ],
  },
  {
    category: "Massages",
    soins: [
      "Massage Balinais (50min)",
      "Massage Balinais (80min)",
      "Massage Ayurvédique (50min)",
      "Massage Ayurvédique (80min)",
      "Massage Oriental (50min)",
      "Massage Oriental (80min)",
      "Massage aux Pierres Précieuses — Quartz Rose & Jade (60min)",
      "Signature Détente à l'Orientale (90min)",
    ],
  },
  {
    category: "Forfaits & Rituels",
    soins: [
      "Journée Escale Balinaise (2H)",
      "Journée Voyage Ayurvédique (2H30)",
      "Journée Détente à l'Orientale (3H)",
      "Rituel Minéral du Volcan Rotorua (1H15)",
      "Rituel Détoxifiant Thé & Cacao (1H15)",
      "Rituel Minéral Anti-Âge Rose Grenat (1H15)",
      "Rituel Tonifiant Menthe & Prêle (1H15)",
    ],
  },
];

type FormState = {
  offrantPrenom: string;
  offrantNom: string;
  offrantPhone: string;
  offrantEmail: string;
  beneficiairePrenom: string;
  beneficiaireNom: string;
  beneficiairePhone: string;
  beneficiaireEmail: string;
  soins: string[];
  message: string;
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${BORDER}`,
  borderRadius: 0,
  padding: "12px 0",
  fontSize: "15px",
  fontFamily: "Georgia, serif",
  color: TEXT,
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.3em",
  color: ACCENT,
  marginBottom: "6px",
  fontFamily: "Georgia, serif",
};

export default function CarteCadeauPage() {
  const [form, setForm] = useState<FormState>({
    offrantPrenom: "",
    offrantNom: "",
    offrantPhone: "",
    offrantEmail: "",
    beneficiairePrenom: "",
    beneficiaireNom: "",
    beneficiairePhone: "",
    beneficiaireEmail: "",
    soins: [],
    message: "",
  });
  const [soinOpen, setSoinOpen] = useState(false);
  const soinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (soinRef.current && !soinRef.current.contains(e.target as Node)) {
        setSoinOpen(false);
      }
    };
    if (soinOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [soinOpen]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.offrantPrenom || !form.offrantNom || !form.offrantPhone || !form.beneficiairePrenom || !form.beneficiaireNom || !form.beneficiairePhone || !form.beneficiaireEmail || form.soins.length === 0) return;
    setSubmitting(true);
    setError(null);
    const result = await sendGiftCardEmail({
      offrantPrenom: form.offrantPrenom,
      offrantNom: form.offrantNom,
      offrantPhone: form.offrantPhone,
      offrantEmail: form.offrantEmail,
      beneficiairePrenom: form.beneficiairePrenom,
      beneficiaireNom: form.beneficiaireNom,
      beneficiairePhone: form.beneficiairePhone,
      beneficiaireEmail: form.beneficiaireEmail,
      soin: form.soins.join(' | '),
      message: form.message || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      const lenis = (window as any).lenis;
      if (lenis) lenis.scrollTo(0, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    else setError("Une erreur est survenue. Veuillez réessayer ou nous contacter directement.");
  };

  return (
    <main style={{ backgroundColor: BG, color: TEXT }} className="min-h-screen">

      {/* ─── HERO ─── */}
      <section className="px-8 md:px-20 pt-36 pb-14">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[10px] uppercase tracking-[0.35em] mb-5"
          style={{ color: ACCENT }}
        >
          Le Spa by Z Fit
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="font-light text-[52px] md:text-[80px] leading-none tracking-tight mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Carte
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
          className="font-light italic text-[52px] md:text-[80px] leading-none tracking-tight mb-10"
          style={{ fontFamily: "Georgia, serif", color: ACCENT }}
        >
          cadeaux
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="font-light text-[15px] leading-[1.9] max-w-[520px]"
          style={{ color: SECONDARY }}
        >
          Offrez une parenthèse de bien-être à travers une carte cadeaux personnalisée et raffinée au Spa by Z FIT.
          Choisissez la façon dont vous souhaitez nous contacter.
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ transformOrigin: "left", backgroundColor: ACCENT }}
          className="h-px w-16 mt-8"
        />
      </section>

      {/* ─── PAYMENT NOTICE ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mx-8 md:mx-20 mb-14 flex items-start gap-4 px-7 py-5"
        style={{ backgroundColor: "rgba(196,168,122,0.12)", borderLeft: `2px solid ${ACCENT}` }}
      >
        <span className="text-[18px] mt-0.5" style={{ color: ACCENT }}>✦</span>
        <p className="text-[12px] leading-[1.8] font-light" style={{ fontFamily: "Georgia, serif", color: SECONDARY }}>
          <span className="font-medium uppercase tracking-[0.15em] text-[10px]" style={{ color: ACCENT }}>Information importante —</span>
          {" "}La carte cadeaux ne sera valide qu&apos;une fois le paiement effectué sur place au Spa by Z Fit.
          Notre équipe vous contactera après réception de votre demande pour convenir des modalités.
        </p>
      </motion.div>

      {/* ─── TWO OPTIONS ─── */}
      <section className="px-8 md:px-20 pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="text-[10px] uppercase tracking-[0.35em] mb-10"
          style={{ color: "rgba(28,17,8,0.3)" }}
        >
          Comment souhaitez-vous procéder ?
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ borderTop: `1px solid ${BORDER}` }}>

          {/* ── OPTION 1 — Contacter le spa ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.85 }}
            className="pr-0 lg:pr-16 pt-12 pb-12"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Option 01</p>
            <h2
              className="text-[26px] md:text-[32px] font-light leading-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Contacter le spa
              <br />
              <em style={{ color: ACCENT }}>directement</em>
            </h2>
            <div className="w-8 h-px mb-8" style={{ backgroundColor: ACCENT }} />
            <p className="text-[13px] font-light leading-[1.85] mb-10 max-w-[360px]" style={{ color: SECONDARY }}>
              Appelez-nous ou envoyez-nous un message WhatsApp. Notre équipe vous guidera pour choisir le soin
              et établir votre carte cadeaux.
            </p>

            <div className="space-y-6">
              {/* Phone 1 */}
              <a
                href="tel:+2252722510835"
                className="group flex items-center gap-5"
              >
                <span
                  className="w-10 h-10 flex items-center justify-center border transition-all duration-300 group-hover:bg-[#C4A87A] group-hover:border-[#C4A87A] flex-shrink-0"
                  style={{ borderColor: BORDER, color: TEXT }}
                >
                  <Phone size={13} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: ACCENT }}>Téléphone</p>
                  <p className="text-[15px] font-light transition-colors duration-300 group-hover:text-[#C4A87A]"
                    style={{ fontFamily: "Georgia, serif" }}>
                    +225 27 22 51 08 35
                  </p>
                </div>
              </a>

              {/* Phone 2 / WhatsApp */}
              <a
                href="https://wa.me/2250709733020"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5"
              >
                <span
                  className="w-10 h-10 flex items-center justify-center border transition-all duration-300 group-hover:bg-[#C4A87A] group-hover:border-[#C4A87A] flex-shrink-0"
                  style={{ borderColor: BORDER, color: TEXT }}
                >
                  <MessageCircle size={13} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: ACCENT }}>WhatsApp</p>
                  <p className="text-[15px] font-light transition-colors duration-300 group-hover:text-[#C4A87A]"
                    style={{ fontFamily: "Georgia, serif" }}>
                    +225 07 09 73 30 20
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@zfitspa.ci"
                className="group flex items-center gap-5"
              >
                <span
                  className="w-10 h-10 flex items-center justify-center border transition-all duration-300 group-hover:bg-[#C4A87A] group-hover:border-[#C4A87A] flex-shrink-0"
                  style={{ borderColor: BORDER, color: TEXT }}
                >
                  <Mail size={13} />
                </span>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] mb-1" style={{ color: ACCENT }}>Email</p>
                  <p className="text-[15px] font-light transition-colors duration-300 group-hover:text-[#C4A87A]"
                    style={{ fontFamily: "Georgia, serif" }}>
                    info@zfitspa.ci
                  </p>
                </div>
              </a>
            </div>
          </motion.div>

          {/* ── OPTION 2 — Formulaire ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.95 }}
            className="pt-12 pb-12 lg:pl-16 border-t lg:border-t-0 lg:border-l"
            style={{ borderColor: BORDER }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Option 02</p>
            <h2
              className="text-[26px] md:text-[32px] font-light leading-tight mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Formulaire
              <br />
              <em style={{ color: ACCENT }}>en ligne</em>
            </h2>
            <div className="w-8 h-px mb-8" style={{ backgroundColor: ACCENT }} />
            <p className="text-[13px] font-light leading-[1.85] mb-10 max-w-[380px]" style={{ color: SECONDARY }}>
              Remplissez le formulaire ci-dessous. Le spa vous recontactera pour confirmer votre demande
              et organiser la remise de votre carte cadeaux.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="py-10"
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center mb-8"
                    style={{ border: `1px solid ${ACCENT}` }}
                  >
                    <Check size={20} style={{ color: ACCENT }} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: ACCENT }}>
                    Demande envoyée
                  </p>
                  <h3
                    className="text-[28px] md:text-[36px] font-light leading-tight mb-6"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Merci pour votre
                    <br />
                    <em style={{ color: ACCENT }}>belle attention</em>
                  </h3>
                  <p className="font-light text-[14px] leading-[1.9]" style={{ color: SECONDARY }}>
                    Nous avons bien reçu votre demande. Notre équipe vous contactera dans les meilleurs
                    délais pour finaliser votre carte cadeaux et vous la remettre après paiement sur place.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* ── Vos coordonnées ── */}
                  <div className="mb-10">
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-7" style={{ color: "rgba(28,17,8,0.4)" }}>
                      01 — Vos coordonnées
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                      <div>
                        <label style={LABEL_STYLE}>Prénom *</label>
                        <input style={INPUT_STYLE} value={form.offrantPrenom} onChange={set("offrantPrenom")} required placeholder="Votre prénom" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Nom *</label>
                        <input style={INPUT_STYLE} value={form.offrantNom} onChange={set("offrantNom")} required placeholder="Votre nom" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Téléphone / WhatsApp *</label>
                        <input style={INPUT_STYLE} type="tel" value={form.offrantPhone} onChange={set("offrantPhone")} required placeholder="+225 00 00 00 00" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Email (pour confirmation)</label>
                        <input style={INPUT_STYLE} type="email" value={form.offrantEmail} onChange={set("offrantEmail")} placeholder="votre@email.com" />
                      </div>
                    </div>
                  </div>

                  {/* ── Bénéficiaire ── */}
                  <div className="mb-10" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "40px" }}>
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-7" style={{ color: "rgba(28,17,8,0.4)" }}>
                      02 — À qui souhaitez-vous offrir ce soin ?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                      <div>
                        <label style={LABEL_STYLE}>Prénom du bénéficiaire *</label>
                        <input style={INPUT_STYLE} value={form.beneficiairePrenom} onChange={set("beneficiairePrenom")} required placeholder="Son prénom" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Nom du bénéficiaire *</label>
                        <input style={INPUT_STYLE} value={form.beneficiaireNom} onChange={set("beneficiaireNom")} required placeholder="Son nom" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Téléphone / WhatsApp *</label>
                        <input style={INPUT_STYLE} type="tel" value={form.beneficiairePhone} onChange={set("beneficiairePhone")} required placeholder="+225 00 00 00 00" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Email *</label>
                        <input style={INPUT_STYLE} type="email" value={form.beneficiaireEmail} onChange={set("beneficiaireEmail")} required placeholder="son@email.com" />
                      </div>
                    </div>
                  </div>

                  {/* ── Soins à offrir ── */}
                  <div className="mb-10" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "40px" }}>
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-7" style={{ color: "rgba(28,17,8,0.4)" }}>
                      03 — Soin(s) à offrir *
                    </p>

                    {/* Sélection affichée */}
                    {form.soins.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {form.soins.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-light"
                            style={{ backgroundColor: "rgba(196,168,122,0.12)", border: `1px solid ${ACCENT}`, color: TEXT, fontFamily: "Georgia, serif" }}
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, soins: f.soins.filter((x) => x !== s) }))}
                              className="opacity-50 hover:opacity-100 transition-opacity ml-1"
                              style={{ color: TEXT, lineHeight: 1 }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="relative" ref={soinRef}>
                      <button
                        type="button"
                        onClick={() => setSoinOpen((o) => !o)}
                        className="w-full flex items-center justify-between py-3 text-left"
                        style={{ borderBottom: `1px solid ${form.soins.length > 0 ? ACCENT : BORDER}` }}
                      >
                        <span className="font-light text-[15px]" style={{ fontFamily: "Georgia, serif", color: form.soins.length > 0 ? ACCENT : SECONDARY }}>
                          {form.soins.length > 0
                            ? `${form.soins.length} soin${form.soins.length > 1 ? 's' : ''} sélectionné${form.soins.length > 1 ? 's' : ''} — Ajouter d'autres…`
                            : "Choisir un ou plusieurs soins…"}
                        </span>
                        <ChevronDown
                          size={16}
                          style={{ color: ACCENT, transform: soinOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                        />
                      </button>
                      <AnimatePresence>
                        {soinOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 right-0 top-full z-50 overflow-y-auto"
                            style={{ backgroundColor: BG, border: `1px solid ${BORDER}`, borderTop: "none", maxHeight: "320px", boxShadow: "0 8px 32px rgba(28,17,8,0.08)" }}
                          >
                            {CATALOGUE.map((cat) => (
                              <div key={cat.category}>
                                <p className="px-5 py-2.5 text-[9px] uppercase tracking-[0.3em]" style={{ color: ACCENT, backgroundColor: "rgba(196,168,122,0.06)" }}>
                                  {cat.category}
                                </p>
                                {cat.soins.map((soin) => {
                                  const selected = form.soins.includes(soin);
                                  return (
                                    <button
                                      key={soin}
                                      type="button"
                                      className="w-full text-left px-5 py-3 text-[13px] font-light transition-colors flex items-center justify-between gap-3"
                                      style={{ fontFamily: "Georgia, serif", color: selected ? ACCENT : TEXT, backgroundColor: selected ? "rgba(196,168,122,0.08)" : "transparent", borderBottom: `1px solid ${BORDER}` }}
                                      onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(196,168,122,0.04)"; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = selected ? "rgba(196,168,122,0.08)" : "transparent"; }}
                                      onClick={() => {
                                        setForm((f) => ({
                                          ...f,
                                          soins: selected
                                            ? f.soins.filter((x) => x !== soin)
                                            : [...f.soins, soin],
                                        }));
                                      }}
                                    >
                                      <span>{soin}</span>
                                      {selected && <Check size={13} style={{ color: ACCENT, flexShrink: 0 }} />}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* ── Message ── */}
                  <div className="mb-10" style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "40px" }}>
                    <p className="text-[10px] uppercase tracking-[0.3em] mb-7" style={{ color: "rgba(28,17,8,0.4)" }}>
                      04 — Message personnalisé (optionnel)
                    </p>
                    <div>
                      <label style={LABEL_STYLE}>Votre message pour le bénéficiaire</label>
                      <textarea
                        style={{ ...INPUT_STYLE, resize: "none", minHeight: "80px" }}
                        value={form.message}
                        onChange={set("message")}
                        placeholder="Avec toute mon affection…"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* ── Error ── */}
                  {error && (
                    <p className="text-[12px] mb-6" style={{ color: "#E13027" }}>{error}</p>
                  )}

                  {/* ── Submit ── */}
                  <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "36px" }}>
                    <button
                      type="submit"
                      disabled={submitting || !form.offrantPrenom || !form.offrantNom || !form.offrantPhone || !form.beneficiairePrenom || !form.beneficiaireNom || !form.beneficiairePhone || !form.beneficiaireEmail || form.soins.length === 0}
                      className="group flex items-center gap-4 transition-opacity disabled:opacity-40"
                    >
                      <span className="text-[11px] uppercase tracking-[0.3em] font-medium" style={{ color: TEXT }}>
                        {submitting ? "Envoi en cours…" : "Envoyer ma demande"}
                      </span>
                      <span
                        className="w-10 h-10 flex items-center justify-center border transition-all duration-300 group-hover:bg-[#1C1108]"
                        style={{ borderColor: BORDER, color: TEXT }}
                      >
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                    <p className="mt-5 text-[11px] font-light" style={{ color: SECONDARY }}>
                      * Champs obligatoires. La carte cadeaux sera remise après paiement sur place.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

      </section>

      <FooterMain />
    </main>
  );
}
