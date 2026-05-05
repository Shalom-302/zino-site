"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminNewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscribers(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  function exportCSV() {
    const rows = [
      ["Email", "Date d'inscription"],
      ...subscribers.map((s) => [
        s.email,
        new Date(s.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027]">Z Fit Spa</p>
            <span className="text-white/15">|</span>
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/40">Newsletter</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin/reservations" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Réservations</a>
            <a href="/admin/programme" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Programme</a>
            <a href="/admin/environments" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Environnements</a>
            <button onClick={handleLogout} className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Déconnexion</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Titre + actions */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Newsletter</h1>
            <p className="text-white/30 text-[13px]">
              {loading ? "Chargement…" : `${subscribers.length} abonné${subscribers.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-3 px-5 py-2.5 border border-white/15 text-[10px] uppercase tracking-[0.28em] text-white/60 hover:text-white hover:border-white/40 transition-colors duration-300"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 1v7M3 5l3 3 3-3M1 9v1a1 1 0 001 1h8a1 1 0 001-1V9" />
              </svg>
              Télécharger CSV
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-3 text-white/20 text-[11px] tracking-[0.2em] uppercase py-20">
            <span className="inline-block w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
            Chargement
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-white/20 text-[12px] uppercase tracking-[0.25em]">Aucun abonné pour le moment.</p>
          </div>
        ) : (
          <div className="border border-white/8">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_180px] border-b border-white/8 px-6 py-3">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">Email</p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/25 text-right">Inscrit le</p>
            </div>
            {/* Rows */}
            {subscribers.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-[1fr_180px] px-6 py-4 ${i < subscribers.length - 1 ? "border-b border-white/5" : ""} hover:bg-white/[0.02] transition-colors duration-150`}
              >
                <p className="text-[13px] font-light text-white/80">{s.email}</p>
                <p className="text-[11px] text-white/30 text-right">{formatDate(s.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
