'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const APP_STORE_URL = 'https://apps.apple.com/ci/app/heitzfit-4/id1570796326?l=en-GB';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.heitz.heitzfit4&pcampaignid=web_share';

const FooterMain = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const normalized = email.trim().toLowerCase();
      const docRef = doc(db, 'newsletter_subscribers', normalized);
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        setMessage('Vous êtes déjà inscrit à notre newsletter.');
      } else {
        await setDoc(docRef, { email: normalized, created_at: new Date().toISOString() });
        setMessage('Votre email a bien été enregistré. Merci !');
        setSubmitted(true);
        setEmail('');
      }
    } catch {
      setMessage('Une erreur est survenue. Veuillez réessayer.');
    }
    setSubmitting(false);
  };

  return (
    <>
      <footer className="w-full bg-[#DA0000] border-t border-[#DA0000]/80 text-[#FFFFFF] py-12 font-sans">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center gap-8">

          {/* Logo + Newsletter row */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
            <Image
              src="/logo.png"
              alt="ZFitSpa"
              width={120}
              height={40}
              className="object-contain opacity-90 brightness-0 invert"
              unoptimized
            />

            {/* Newsletter */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-light">
                Newsletter
              </p>
              {submitted ? (
                <p className="text-[11px] tracking-[0.15em] text-white font-light">{message}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <form onSubmit={handleSubscribe} className="flex items-end gap-4">
                    <div className="flex flex-col gap-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        required
                        disabled={submitting}
                        className="bg-transparent text-white placeholder-white/30 text-[12px] font-light py-1 outline-none w-52 transition-colors disabled:opacity-50"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.35)' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="text-white text-[10px] uppercase tracking-[0.3em] font-light pb-1 hover:text-white/70 transition-colors whitespace-nowrap disabled:opacity-50"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.35)' }}
                    >
                      {submitting ? '...' : "S\u2019abonner"}
                    </button>
                  </form>
                  {message && (
                    <p className="text-[10px] tracking-[0.15em] text-white/80 font-light">{message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 md:gap-10">
            <a href="/faq" className="text-[12px] font-semibold uppercase tracking-widest text-white hover:text-white/70 transition-colors">
              FAQ
            </a>
          </nav>

          {/* App Store links */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-light">
              Télécharger notre app
            </p>
            <div className="flex items-center gap-4">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 transition-opacity hover:opacity-75"
                style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '6px' }}
              >
                <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[9px] leading-none">Disponible sur</p>
                  <p className="text-white font-bold text-[12px] leading-tight">App Store</p>
                </div>
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 transition-opacity hover:opacity-75"
                style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '6px' }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512" fill="none">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" fill="#FBBC04"/>
                  <path d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256-255.9L47 0z" fill="#4285F4"/>
                  <path d="M473.9 256l-82.2 41-66.4-66.7 66.4-66.7 82.2 41c24.3 14.1 24.3 51.3 0 51.4z" fill="#EA4335"/>
                  <path d="M104.6 499l220.7-220.7 60.1 60.1L104.6 499z" fill="#34A853"/>
                </svg>
                <div>
                  <p className="text-white/50 text-[9px] leading-none">Disponible sur</p>
                  <p className="text-white font-bold text-[12px] leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/zfitspa_salle_de_sport/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-white/70 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://www.facebook.com/zfitspa" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white hover:text-white/70 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/20" />

          {/* Bottom row */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-3 text-[11px] text-white tracking-wide">
            <p>© 2026 ZFitSpa. Tous droits réservés.</p>
            <a href="https://todoustudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">
              by <span className="underline underline-offset-2">Todou Studio</span>
            </a>
          </div>

        </div>
      </footer>

    </>
  );
};

export default FooterMain;
