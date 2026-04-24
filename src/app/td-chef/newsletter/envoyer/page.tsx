'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'sonner';
import { sendNewsletter } from '@/app/actions/send-newsletter';
import {
  Loader2, Send, Eye, EyeOff, Users, CheckCircle2, AlertCircle,
} from 'lucide-react';

export default function EnvoyerNewsletterPage() {
  const router = useRouter();
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [preview, setPreview]           = useState(false);
  const [confirm, setConfirm]           = useState(false);
  const [subCount, setSubCount]         = useState<number | null>(null);
  const [result, setResult]             = useState<{ sent: number; failed: number } | null>(null);
  const [subject, setSubject]           = useState('');
  const [body, setBody]                 = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/td-chef/login'); return; }
      await fetchCount();
    });
    return () => unsub();
  }, []);

  async function fetchCount() {
    try {
      const snap = await getDocs(collection(db, 'newsletter_subscribers'));
      setSubCount(snap.size);
    } catch {
      setSubCount(0);
    }
    setLoading(false);
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      toast.error('Sujet et message requis.');
      return;
    }
    setSending(true);
    setConfirm(false);
    try {
      const res = await sendNewsletter(subject, body);
      if (res.success) {
        setResult({ sent: res.sent, failed: res.failed });
        toast.success(`Newsletter envoyée à ${res.sent} abonné${res.sent > 1 ? 's' : ''}`);
        if (res.failed > 0) toast.error(`${res.failed} envoi${res.failed > 1 ? 's' : ''} échoué${res.failed > 1 ? 's' : ''}`);
      } else {
        toast.error(res.error || 'Erreur lors de l\'envoi.');
      }
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setSending(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
    </div>
  );

  if (result) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 border border-black/8 bg-white">
          {result.failed === 0
            ? <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            : <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
          }
          <h2 className="text-xl font-black uppercase tracking-tight text-[#0F0F0F] mb-2">
            {result.failed === 0 ? 'Newsletter envoyée !' : 'Envoi partiel'}
          </h2>
          <p className="text-sm text-black/50 mb-1">
            <span className="font-bold text-green-600">{result.sent}</span> email{result.sent > 1 ? 's' : ''} envoyé{result.sent > 1 ? 's' : ''} avec succès
          </p>
          {result.failed > 0 && (
            <p className="text-sm text-red-500 mb-1">
              {result.failed} envoi{result.failed > 1 ? 's' : ''} échoué{result.failed > 1 ? 's' : ''}
            </p>
          )}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => { setResult(null); setSubject(''); setBody(''); }}
              className="px-5 py-2.5 bg-[#0F0F0F] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E13027] transition-colors"
            >
              Nouvelle newsletter
            </button>
            <button
              onClick={() => router.push('/td-chef/newsletter')}
              className="px-5 py-2.5 border border-black/15 text-[11px] font-black uppercase tracking-widest text-black/50 hover:text-black hover:border-black/40 transition-colors"
            >
              Voir les abonnés
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[#0F0F0F]">
            Envoyer une <span className="text-[#E13027]">Newsletter</span>
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Users className="w-3.5 h-3.5 text-black/40" />
            <p className="text-xs text-black/40 uppercase tracking-wider">
              {subCount !== null ? `${subCount} abonné${subCount > 1 ? 's' : ''}` : '—'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setPreview(v => !v)}
          className="flex items-center gap-2 px-3 py-2 border border-black/15 text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all"
        >
          {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {preview ? 'Éditer' : 'Aperçu'}
        </button>
      </div>

      {preview ? (
        /* ── PREVIEW ── */
        <div className="border border-black/10 rounded-none overflow-hidden">
          <div className="bg-black/5 border-b border-black/10 px-5 py-3 flex items-center gap-4">
            <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold shrink-0">Objet :</p>
            <p className="text-sm text-[#0F0F0F] font-medium truncate">{subject || <span className="text-black/30 italic">Sans objet</span>}</p>
          </div>
          <div className="bg-[#f4ebe1] p-8">
            <div className="max-w-[560px] mx-auto bg-white">
              <div className="bg-[#0F0F0F] px-8 py-5 flex items-center gap-3">
                <span className="w-7 h-7 bg-[#E13027] flex items-center justify-center text-white font-black italic text-sm">Z</span>
                <span className="text-white text-[10px] font-bold tracking-[0.25em] uppercase">Z FIT / SPA</span>
              </div>
              <div className="h-[3px] bg-[#C4A87A]" />
              <div className="px-8 pt-8 pb-2">
                <p className="text-[10px] text-[#C4A87A] tracking-[0.28em] uppercase mb-2">Z FIT SPA — Abidjan</p>
                <h2 className="text-[22px] font-light text-[#0F0F0F] leading-tight">{subject || <span className="text-black/30 italic">Objet de la newsletter</span>}</h2>
                <div className="w-10 h-px bg-[#C4A87A] mt-4" />
              </div>
              <div className="px-8 py-6 text-[14px] font-light text-[#1C1108] leading-relaxed whitespace-pre-wrap">
                {body || <span className="text-black/30 italic">Votre message apparaîtra ici...</span>}
              </div>
              <div className="px-8 pb-1"><div className="h-px bg-black/10" /></div>
              <div className="px-8 py-6 flex gap-3">
                <span className="px-5 py-3 border border-black/20 text-[10px] uppercase tracking-[0.28em] text-[#0F0F0F]">Visiter le site</span>
                <span className="px-5 py-3 bg-[#C4A87A] text-[10px] uppercase tracking-[0.28em] text-white">Réserver</span>
              </div>
              <div className="bg-[#0F0F0F] px-8 py-5">
                <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Z FIT SPA — 2 Plateaux Vallon, Abidjan</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── FORM ── */
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">
              Objet de l'email
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ex : Nouveautés printemps au Spa…"
              className="w-full border border-black/15 px-4 py-3 text-sm text-[#0F0F0F] bg-white focus:outline-none focus:border-black/40 placeholder:text-black/25 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-black/40 block mb-2">
              Contenu du message
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={14}
              placeholder={`Bonjour,\n\nNous sommes ravis de vous annoncer...\n\nÀ très bientôt au Z FIT / SPA.\nL'équipe Z FIT SPA`}
              className="w-full border border-black/15 px-4 py-3 text-sm text-[#0F0F0F] bg-white focus:outline-none focus:border-black/40 placeholder:text-black/25 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[10px] text-black/30 mt-1.5">
              Les sauts de ligne sont conservés. Les liens seront cliquables.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {confirm ? (
              <div className="flex items-center gap-3 p-4 border border-amber-200 bg-amber-50 flex-1">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-[12px] text-amber-700 font-medium flex-1">
                  Envoyer à <strong>{subCount}</strong> abonné{subCount !== 1 ? 's' : ''} ?
                </p>
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0F0F0F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#E13027] transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sending ? 'Envoi...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setConfirm(false)}
                  className="px-4 py-2 border border-black/15 text-[10px] font-bold uppercase tracking-widest text-black/50 hover:text-black transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!subject.trim() || !body.trim()) { toast.error('Sujet et message requis.'); return; }
                  setConfirm(true);
                }}
                disabled={sending || !subject.trim() || !body.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#0F0F0F] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E13027] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Envoyer la newsletter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
