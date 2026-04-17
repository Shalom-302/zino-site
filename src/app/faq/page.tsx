"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FooterMain from "@/components/sections/footer-main";
import { useEnvironment } from "@/context/environment-context";

const faqData = [
  {
    category: "Abonnements & Adhésion",
    questions: [
      {
        q: "Est-il possible de reporter mon absence sur mon abonnement ?",
        a: "Non. Les jours d'absence ne sont pas crédités, sauf si vous avez souscrit à l'assurance \"REPORT\" (72.000 FCFA/an) lors de votre inscription."
      },
      {
        q: "Ma carte de membre peut-elle être utilisée par un ami ?",
        a: "Non. La carte de membre est strictement personnelle. Elle ne peut être prêtée, partagée ou transférée à un tiers. Elle est obligatoire pour accéder au club."
      },
      {
        q: "Puis-je obtenir un remboursement si je ne fréquente pas le club ?",
        a: "Non. Les paiements sont non remboursables, même si les installations ne sont pas utilisées pendant la période d'abonnement."
      },
      {
        q: "Quelles sont les conditions pour les abonnements avec engagement ?",
        a: "Les tarifs réduits (ex: 55.000 FCFA/mois) nécessitent un engagement minimum de 12 mois avec prélèvement bancaire automatique."
      }
    ]
  },
  {
    category: "Installations & Services",
    questions: [
      {
        q: "Qui est responsable en cas de vol dans les vestiaires ?",
        a: "Le club décline toute responsabilité pour les objets laissés dans les casiers ou sans surveillance. Des casiers premium sécurisés sont disponibles à la location (60.000 FCFA/an)."
      },
      {
        q: "L'accès au Spa est-il inclus dans tous les abonnements ?",
        a: "L'accès illimité au Spa est inclus dans l'abonnement Premium. Pour les membres Club ou les non-abonnés, l'accès est disponible à la séance (tarifs spécifiques)."
      },
      {
        q: "Proposez-vous du coaching personnalisé ?",
        a: "Oui, nous proposons des séances de Personal Training à 30.000 FCFA la séance pour un accompagnement sur mesure."
      }
    ]
  },
  {
    category: "Horaires & Accès",
    questions: [
      {
        q: "Quels sont vos horaires d'ouverture ?",
        a: "Lundi au Vendredi : 06:00 – 22:00 | Samedi : 07:00 – 20:00 | Dimanche & Jours Fériés : 08:00 – 18:00."
      },
      {
        q: "Où se situe exactement le club ?",
        a: "Nous sommes situés à Cocody, 2 Plateaux Vallon, Rue de l'ambassade du Ghana (juste derrière l'ambassade), Abidjan."
      }
    ]
  }
];

const FAQItem = ({ question, answer, isOpen, onClick, index, isSpa }: {
  question: string; answer: string; isOpen: boolean; onClick: () => void; index: number; isSpa: boolean;
}) => {
  const accent = isSpa ? '#C4A87A' : '#E13027';
  const border = isSpa ? 'rgba(28,17,8,0.08)' : 'rgba(255,255,255,0.05)';
  const textOpen = isSpa ? '#1C1108' : '#fff';
  const textClosed = isSpa ? 'rgba(28,17,8,0.5)' : 'rgba(255,255,255,0.55)';
  const answerColor = isSpa ? 'rgba(28,17,8,0.65)' : 'rgba(255,255,255,0.55)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      style={{ borderBottom: `1px solid ${border}` }}
      className="last:border-0"
    >
      <button
        onClick={onClick}
        className="w-full py-8 flex items-center justify-between text-left group"
      >
        <span
          className="text-[15px] md:text-[17px] font-light leading-snug tracking-wide transition-colors duration-300"
          style={{ fontFamily: 'Georgia, serif', color: isOpen ? textOpen : textClosed }}
        >
          {question}
        </span>
        <div className="shrink-0 ml-8 flex items-center gap-2">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-5 h-5 relative"
          >
            <span className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ backgroundColor: isOpen ? accent : (isSpa ? 'rgba(28,17,8,0.25)' : 'rgba(255,255,255,0.4)') }} />
            <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ backgroundColor: isOpen ? accent : (isSpa ? 'rgba(28,17,8,0.25)' : 'rgba(255,255,255,0.4)') }} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-10 pr-16">
              <p className="text-[14px] font-light leading-[1.85]" style={{ fontFamily: 'Georgia, serif', color: answerColor }}>{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<string[]>(["0-0"]);
  const [ready, setReady] = useState(false);
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';

  const bg = isSpa ? '#F4EBD9' : '#000';
  const text = isSpa ? '#1C1108' : '#fff';
  const accent = isSpa ? '#C4A87A' : '#E13027';
  const divider = isSpa ? 'rgba(28,17,8,0.1)' : 'rgba(255,255,255,0.05)';
  const secondary = isSpa ? 'rgba(28,17,8,0.55)' : 'rgba(255,255,255,0.55)';

  useEffect(() => { setReady(true); }, []);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen" style={{ backgroundColor: bg, color: text }}>

      {/* HERO */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end justify-start overflow-hidden">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772375328074.png?width=8000&height=8000&resize=contain"
          alt="FAQ Background"
          fill
          priority
          className={`object-cover scale-105${isSpa ? '' : ' grayscale'}`}
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
            Questions
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
            className="font-light italic text-[52px] md:text-[88px] leading-none tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: accent }}
          >
            fréquentes
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

      {/* FAQ CONTENT */}
      <section className="max-w-[860px] mx-auto px-6 md:px-10 py-28">
        <div className="space-y-20">
          {faqData.map((category, catIdx) => (
            <div key={catIdx}>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-6 mb-2"
              >
                <span
                  className="text-[10px] uppercase tracking-[0.28em] whitespace-nowrap"
                  style={{ color: accent }}
                >
                  {category.category}
                </span>
                <div className="h-px flex-1" style={{ backgroundColor: divider }} />
              </motion.div>

              <div>
                {category.questions.map((item, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  return (
                    <FAQItem
                      key={id}
                      index={qIdx}
                      question={item.q}
                      answer={item.a}
                      isOpen={openItems.includes(id)}
                      onClick={() => toggleItem(id)}
                      isSpa={isSpa}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT STRIP */}
      <section className="py-24 px-6 md:px-10" style={{ borderTop: `1px solid ${divider}` }}>
        <div className="max-w-[860px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] mb-5" style={{ color: secondary }}>
                Besoin d&apos;aide supplémentaire
              </p>
              <h2
                className="font-light text-[36px] md:text-[52px] leading-tight tracking-tight mb-2"
                style={{ fontFamily: 'Georgia, serif', color: text }}
              >
                Contactez-nous
              </h2>
              <h2
                className="font-light italic text-[36px] md:text-[52px] leading-tight tracking-tight"
                style={{ fontFamily: 'Georgia, serif', color: accent }}
              >
                directement
              </h2>
            </div>

            <div className="space-y-6 md:text-right">
              <a
                href="https://maps.app.goo.gl/V5CxyqbtiTYJ7iXt7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 md:justify-end hover:opacity-70 transition-opacity"
                style={{ color: secondary }}
              >
                <span style={{ color: accent }}><MapPin className="w-4 h-4" /></span>
                2 Plateaux Vallon, Abidjan
              </a>
              <a
                href="https://wa.me/2250709733020"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 md:justify-end hover:opacity-70 transition-opacity"
                style={{ color: secondary }}
              >
                <span style={{ color: accent }}><Phone className="w-4 h-4" /></span>
                +225 07 09 73 30 20
              </a>
              <a
                href="mailto:info@zfitspa.ci"
                className="flex items-center gap-3 md:justify-end hover:opacity-70 transition-opacity"
                style={{ color: secondary }}
              >
                <span style={{ color: accent }}><Mail className="w-4 h-4" /></span>
                info@zfitspa.ci
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left", backgroundColor: divider }}
            className="h-px mt-16 mb-12"
          />

        </div>
      </section>

      <FooterMain />
    </main>
  );
};

export default FAQPage;
