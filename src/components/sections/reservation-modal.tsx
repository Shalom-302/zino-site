"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReservationModal } from "@/components/providers/reservation-modal-provider";
import { supabase } from "@/lib/supabase";

const ReservationModal = () => {
  const { isOpen, closeModal } = useReservationModal();
  const [backgroundImage, setBackgroundImage] = useState("https://actcisklxhxzzgvygdfb.supabase.co/storage/v1/object/public/site-assets/images/cta_journey-2ynz2kt96tk.png");
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    phone: "",
    type: "fitness",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchCTAImage = async () => {
      const { data: d } = await supabase.from('site_images').select('image_url').eq('id', 'cta_journey').single();
      if (d?.image_url) setBackgroundImage(d.image_url);
    };

    fetchCTAImage();
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset and close after 2 seconds
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ nom: "", prenom: "", phone: "", type: "fitness" });
      closeModal();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-hidden">
          {/* Backdrop Blur/Darkening */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content - Sliding from Top */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="relative w-full max-w-[1200px] h-[90vh] md:h-auto md:min-h-[600px] bg-background md:rounded-b-[40px] overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col md:flex-row h-full">
              {/* Left Side: Photo with Info (Home Style) */}
              <div className="relative w-full md:w-1/2 h-[300px] md:h-[auto] overflow-hidden flex items-center justify-center">
                <Image
                  src={backgroundImage}
                  alt="Reservation Background"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 px-8 text-center md:text-left">
                  <h2 className="text-white font-black text-[32px] md:text-[56px] leading-tight uppercase tracking-tighter">
                    Prêt pour <br />
                    <span className="text-[#E13027] text-outline-white">le changement ?</span>
                  </h2>
                  <p className="text-white text-[14px] md:text-[18px] mt-4 max-w-md uppercase font-bold tracking-widest">
                    VOTRE SÉANCE COMMENCE ICI. RÉSERVEZ VOTRE MOMENT CHEZ ZFITSPA.
                  </p>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 text-black/50 hover:text-[#E13027] transition-colors"
                >
                  <X size={32} />
                </button>

                {isSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black mb-2">Réservation Envoyée !</h3>
                    <p className="text-gray-600">Nous vous recontacterons très bientôt.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[14px] uppercase font-bold tracking-wider text-black/60">Nom</label>
                        <input
                          required
                          type="text"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          className="w-full h-[50px] border-2 border-gray-100 bg-gray-50 px-4 focus:border-[#E13027] focus:outline-none transition-all rounded-lg"
                          placeholder="Votre nom"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[14px] uppercase font-bold tracking-wider text-black/60">Prénom</label>
                        <input
                          required
                          type="text"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          className="w-full h-[50px] border-2 border-gray-100 bg-gray-50 px-4 focus:border-[#E13027] focus:outline-none transition-all rounded-lg"
                          placeholder="Votre prénom"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] uppercase font-bold tracking-wider text-black/60">Numéro / WhatsApp</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-[50px] border-2 border-gray-100 bg-gray-50 px-4 focus:border-[#E13027] focus:outline-none transition-all rounded-lg"
                        placeholder="+225 ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[14px] uppercase font-bold tracking-wider text-black/60">Type de service</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: "fitness" })}
                          className={`h-[50px] border-2 rounded-lg font-bold uppercase transition-all ${
                            formData.type === "fitness"
                              ? "border-[#E13027] bg-[#E13027] text-white"
                              : "border-gray-100 bg-gray-50 text-black/60 hover:border-gray-300"
                          }`}
                        >
                          Fitness
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: "spa" })}
                          className={`h-[50px] border-2 rounded-lg font-bold uppercase transition-all ${
                            formData.type === "spa"
                              ? "border-[#E13027] bg-[#E13027] text-white"
                              : "border-gray-100 bg-gray-50 text-black/60 hover:border-gray-300"
                          }`}
                        >
                          Spa
                        </button>
                      </div>
                    </div>

                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="btn-primary w-full h-[65px] text-[28px] mt-4 disabled:opacity-50"
                    >
                      {isSubmitting ? "Envoi en cours..." : "Réserver maintenant"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;
