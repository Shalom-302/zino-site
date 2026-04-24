"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Clock, Calendar, User, Phone, Scissors, Plus, List, ChevronLeft, ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Reservation {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  type: string;
  soin: string | null;
  date_reservation: string | null;
  heure: string | null;
  message: string | null;
  status: "pending" | "approved" | "refused";
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  refused: "Refusée",
};

const TYPE_LABELS: Record<string, string> = {
  fitness: "Fitness",
  spa: "Spa",
  carte_cadeaux: "Carte cadeaux",
};

const TYPE_COLORS: Record<string, string> = {
  fitness: "text-[#E13027]/70",
  spa: "text-[#C4A87A]/80",
  carte_cadeaux: "text-purple-400/80",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400/80",
  approved: "text-green-400/80",
  refused: "text-[#E13027]/80",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-400/60",
  approved: "bg-green-400/60",
  refused: "bg-[#E13027]/60",
};

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

export default function AdminReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "refused" | "carte_cadeaux">("pending");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ prenom: "", nom: "", telephone: "", type: "spa", soin: "", date_reservation: "", heure: "", message: "" });
  const [addSaving, setAddSaving] = useState(false);

  // Calendar state
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calDaySelected, setCalDaySelected] = useState<string | null>(null); // "YYYY-MM-DD"

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    fetchReservations();
    const channel = supabase
      .channel("reservations-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservations" }, () => fetchReservations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchReservations() {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    setReservations(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "refused") {
    setUpdating(id);
    await supabase.from("reservations").update({ status }).eq("id", id);
    await fetchReservations();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    setUpdating(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  async function createReservation(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.prenom || !addForm.nom || !addForm.telephone) return;
    setAddSaving(true);
    await supabase.from("reservations").insert({
      prenom: addForm.prenom,
      nom: addForm.nom,
      telephone: addForm.telephone,
      type: addForm.type,
      soin: addForm.soin || null,
      date_reservation: addForm.date_reservation || null,
      heure: addForm.heure || null,
      message: addForm.message || null,
      status: "approved",
    });
    setAddForm({ prenom: "", nom: "", telephone: "", type: "spa", soin: "", date_reservation: "", heure: "", message: "" });
    setShowAddForm(false);
    setAddSaving(false);
    await fetchReservations();
  }

  const filtered = filter === "all"
    ? reservations
    : filter === "carte_cadeaux"
      ? reservations.filter(r => r.type === "carte_cadeaux")
      : reservations.filter(r => r.status === filter);

  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === "pending").length,
    approved: reservations.filter(r => r.status === "approved").length,
    refused: reservations.filter(r => r.status === "refused").length,
    carte_cadeaux: reservations.filter(r => r.type === "carte_cadeaux").length,
  };

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  }

  // ── Calendar helpers ──────────────────────────────────
  function toDateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function buildCalGrid(year: number, month: number): (Date | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Mon=0 … Sun=6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  // Map dateKey → reservations
  const byDate: Record<string, Reservation[]> = {};
  reservations.forEach(r => {
    if (!r.date_reservation) return;
    const key = r.date_reservation.slice(0, 10);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(r);
  });

  const calGrid = buildCalGrid(calYear, calMonth);
  const todayKey = toDateKey(new Date());

  const calDayReservations = calDaySelected ? (byDate[calDaySelected] || []) : [];

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setCalDaySelected(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setCalDaySelected(null);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027]">Z Fit Spa</p>
            <span className="text-white/15">|</span>
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/40">Réservations</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin/programme" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Programme</a>
            <a href="/admin/environments" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Environnements</a>
            <a href="/admin/newsletter" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Newsletter</a>
            <button onClick={handleLogout} className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Déconnexion</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Titre + stats */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-wide mb-2">Réservations</h1>
            <p className="text-white/30 text-[13px]">Gérez les demandes reçues depuis le site.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 border border-white/15 text-[10px] uppercase tracking-[0.28em] text-white/60 hover:border-white/40 hover:text-white transition-all duration-300"
            >
              <Plus className="w-3 h-3" />
              Ajouter manuellement
            </button>
          </div>
          <div className="flex items-end gap-8">
            <div className="flex gap-6">
              {(["pending", "approved", "refused"] as const).map(s => (
                <div key={s} className="text-center">
                  <p className={`text-2xl font-light ${STATUS_COLORS[s]}`}>{counts[s]}</p>
                  <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mt-1">{STATUS_LABELS[s]}</p>
                </div>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex border border-white/10">
              <button
                onClick={() => setView("list")}
                className={`px-4 py-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${view === "list" ? "bg-white/8 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                <List className="w-3.5 h-3.5" />
                Liste
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] border-l border-white/10 transition-all duration-200 ${view === "calendar" ? "bg-white/8 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Calendrier
              </button>
            </div>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view === "list" && (
          <>
            {/* Filtres */}
            <div className="flex gap-8 border-b border-white/8 mb-10 overflow-x-auto">
              {(["pending", "all", "approved", "refused", "carte_cadeaux"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative pb-5 text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 whitespace-nowrap ${filter === f ? "text-white" : "text-white/30 hover:text-white/60"}`}
                >
                  {f === "all" ? "Toutes" : f === "carte_cadeaux" ? "Cartes cadeaux" : STATUS_LABELS[f]}
                  {counts[f] > 0 && (
                    <span className="ml-2 text-[9px] text-white/25">({counts[f]})</span>
                  )}
                  {filter === f && (
                    <motion.span layoutId="res-tab" className={`absolute bottom-0 left-0 right-0 h-px ${f === "carte_cadeaux" ? "bg-purple-400" : "bg-[#E13027]"}`} transition={{ type: "spring", stiffness: 400, damping: 35 }} />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center text-white/20 text-[13px] tracking-widest uppercase">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-white/20 text-[13px] tracking-widest uppercase">Aucune réservation</div>
            ) : (
              <div className="space-y-px">
                {filtered.map((r) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between py-5 border-b border-white/5 group cursor-pointer hover:bg-white/[0.02] px-3 -mx-3 transition-colors duration-200"
                    onClick={() => setSelected(r)}
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[r.status]}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-light text-white truncate">{r.prenom} {r.nom}</p>
                          {r.type === "carte_cadeaux" && (
                            <span className="text-[8px] tracking-[0.25em] uppercase px-1.5 py-0.5 border border-purple-400/30 text-purple-400/70 whitespace-nowrap">
                              Carte cadeaux
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30 mt-0.5">{r.telephone}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-10 shrink-0 ml-6">
                      {r.date_reservation && (
                        <div className="text-right">
                          <p className="text-[12px] text-white/50">{formatDate(r.date_reservation)}</p>
                          {r.heure && <p className="text-[11px] text-white/25">{r.heure}</p>}
                        </div>
                      )}
                      {r.soin && (
                        <p className="text-[12px] text-white/40 max-w-[160px] truncate">{r.soin}</p>
                      )}
                      <span className={`text-[9px] tracking-[0.28em] uppercase ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                      {r.status === "pending" && (
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
                          <button onClick={() => updateStatus(r.id, "approved")} disabled={updating === r.id} className="w-7 h-7 border border-green-400/30 hover:border-green-400/70 flex items-center justify-center transition-colors duration-200" title="Approuver">
                            <Check className="w-3 h-3 text-green-400/70" />
                          </button>
                          <button onClick={() => updateStatus(r.id, "refused")} disabled={updating === r.id} className="w-7 h-7 border border-[#E13027]/30 hover:border-[#E13027]/70 flex items-center justify-center transition-colors duration-200" title="Refuser">
                            <X className="w-3 h-3 text-[#E13027]/70" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── CALENDAR VIEW ── */}
        {view === "calendar" && (
          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Calendar grid */}
            <div className="flex-1">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-8">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors text-white/40 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-[13px] uppercase tracking-[0.35em] text-white/70">
                  {MONTHS_FR[calMonth]} {calYear}
                </p>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors text-white/40 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_FR.map(d => (
                  <div key={d} className="text-center py-2 text-[9px] uppercase tracking-[0.25em] text-white/25">{d}</div>
                ))}
              </div>

              {/* Cells */}
              <div className="grid grid-cols-7 gap-px bg-white/5">
                {calGrid.map((day, i) => {
                  if (!day) return <div key={i} className="bg-black aspect-square" />;
                  const key = toDateKey(day);
                  const dayRes = byDate[key] || [];
                  const isToday = key === todayKey;
                  const isSelected = key === calDaySelected;
                  const hasPending = dayRes.some(r => r.status === "pending");
                  const hasApproved = dayRes.some(r => r.status === "approved");
                  const hasRefused = dayRes.some(r => r.status === "refused");
                  const isPast = day < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                  return (
                    <button
                      key={key}
                      onClick={() => setCalDaySelected(isSelected ? null : key)}
                      className={`relative bg-black aspect-square flex flex-col items-center justify-start pt-2 px-1 transition-all duration-150 border ${
                        isSelected
                          ? "border-white/40 bg-white/[0.08]"
                          : dayRes.length > 0 && !isPast
                            ? "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                            : "border-transparent hover:border-white/8 hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Day number */}
                      <span className={`text-[12px] leading-none mb-1.5 z-10 ${
                        isToday ? "text-[#E13027] font-medium" :
                        isPast ? "text-white/20" :
                        dayRes.length > 0 ? "text-white/80" :
                        "text-white/45"
                      }`}>
                        {day.getDate()}
                      </span>

                      {/* Today ring */}
                      {isToday && (
                        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border border-[#E13027]/50 pointer-events-none z-10" />
                      )}

                      {/* Reservation dots */}
                      {dayRes.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 justify-center mt-auto mb-1.5 z-10">
                          {hasApproved && <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />}
                          {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/80" />}
                          {hasRefused && <span className="w-1.5 h-1.5 rounded-full bg-[#E13027]/70" />}
                          {dayRes.length > 1 && (
                            <span className="text-[8px] text-white/40 leading-none self-center ml-0.5 font-medium">{dayRes.length}</span>
                          )}
                        </div>
                      )}

                      {/* Cross-out line for past days with bookings */}
                      {isPast && dayRes.length > 0 && (
                        <span className="absolute inset-0 pointer-events-none overflow-hidden">
                          <span className="absolute top-0 right-0 w-full h-full" style={{
                            background: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,0.06) 4px, rgba(255,255,255,0.06) 5px)"
                          }} />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-[140%] h-px bg-white/25 rotate-[-45deg]" style={{ transformOrigin: "center" }} />
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 border-t border-white/5 pt-5">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400/70" /><span className="text-[9px] uppercase tracking-[0.2em] text-white/30">Approuvée</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400/70" /><span className="text-[9px] uppercase tracking-[0.2em] text-white/30">En attente</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E13027]/60" /><span className="text-[9px] uppercase tracking-[0.2em] text-white/30">Refusée</span></div>
              </div>
            </div>

            {/* Day detail panel */}
            <div className="lg:w-80 border border-white/8 p-6">
              {!calDaySelected ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <Calendar className="w-6 h-6 text-white/15 mb-3" />
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/20">Sélectionnez un jour</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">
                    {new Date(calDaySelected + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}
                  </p>
                  <p className="text-xl font-light mb-6">
                    {calDayReservations.length === 0 ? "Aucun RDV" : `${calDayReservations.length} RDV`}
                  </p>

                  {calDayReservations.length === 0 ? (
                    <p className="text-[12px] text-white/20">Aucune réservation ce jour.</p>
                  ) : (
                    <div className="space-y-4">
                      {calDayReservations
                        .sort((a, b) => (a.heure || "").localeCompare(b.heure || ""))
                        .map(r => (
                          <button
                            key={r.id}
                            onClick={() => setSelected(r)}
                            className="w-full text-left border border-white/8 p-4 hover:border-white/20 transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${STATUS_DOT[r.status]}`} />
                                <p className="text-[13px] font-light text-white">{r.prenom} {r.nom}</p>
                              </div>
                              {r.heure && <p className="text-[11px] text-white/40 shrink-0">{r.heure}</p>}
                            </div>
                            {r.soin && <p className="text-[11px] text-white/35 truncate pl-3.5">{r.soin}</p>}
                            {r.type === "carte_cadeaux" && (
                              <p className="text-[9px] uppercase tracking-[0.2em] text-purple-400/60 pl-3.5 mt-1">Carte cadeaux</p>
                            )}
                            <p className={`text-[9px] uppercase tracking-[0.2em] pl-3.5 mt-1 ${STATUS_COLORS[r.status]}`}>
                              {STATUS_LABELS[r.status]}
                            </p>
                          </button>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL AJOUT MANUEL ── */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setShowAddForm(false)} />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-16 bottom-8 md:w-[520px] z-50 bg-[#0a0a0a] border border-white/10 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] tracking-[0.35em] uppercase text-white/30 mb-1">Saisie manuelle</p>
                    <h2 className="text-xl font-light">Nouvelle réservation</h2>
                  </div>
                  <button onClick={() => setShowAddForm(false)} className="text-white/30 hover:text-white text-2xl leading-none transition-colors">×</button>
                </div>
                <form onSubmit={createReservation} className="space-y-6">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3">Type *</label>
                    <div className="flex gap-3">
                      {(["spa", "fitness", "carte_cadeaux"] as const).map(t => (
                        <button key={t} type="button" onClick={() => setAddForm(f => ({ ...f, type: t }))}
                          className={`flex-1 py-2.5 border text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${addForm.type === t ? "border-white/40 text-white" : "border-white/10 text-white/30 hover:border-white/25 hover:text-white/60"}`}>
                          {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Prénom *</label>
                      <input required value={addForm.prenom} onChange={e => setAddForm(f => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white placeholder-white/20 outline-none focus:border-white/40 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Nom *</label>
                      <input required value={addForm.nom} onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom" className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white placeholder-white/20 outline-none focus:border-white/40 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Téléphone *</label>
                    <input required type="tel" value={addForm.telephone} onChange={e => setAddForm(f => ({ ...f, telephone: e.target.value }))} placeholder="+225 00 00 00 00" className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white placeholder-white/20 outline-none focus:border-white/40 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Soin</label>
                    <input value={addForm.soin} onChange={e => setAddForm(f => ({ ...f, soin: e.target.value }))} placeholder="Ex: Massage Balinais 50min" className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white placeholder-white/20 outline-none focus:border-white/40 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Date</label>
                      <input type="date" value={addForm.date_reservation} onChange={e => setAddForm(f => ({ ...f, date_reservation: e.target.value }))} className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white/70 outline-none focus:border-white/40 transition-colors [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Heure</label>
                      <input type="time" value={addForm.heure} onChange={e => setAddForm(f => ({ ...f, heure: e.target.value }))} className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white/70 outline-none focus:border-white/40 transition-colors [color-scheme:dark]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.3em] text-white/30 mb-2">Note interne</label>
                    <textarea value={addForm.message} onChange={e => setAddForm(f => ({ ...f, message: e.target.value }))} placeholder="Informations complémentaires…" rows={3} className="w-full bg-transparent border-b border-white/15 py-2 text-[14px] font-light text-white placeholder-white/20 outline-none focus:border-white/40 transition-colors resize-none" />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="submit" disabled={addSaving || !addForm.prenom || !addForm.nom || !addForm.telephone}
                      className="flex-1 py-4 border border-white/15 text-[11px] tracking-[0.28em] uppercase text-white/70 hover:border-white/40 hover:text-white transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2">
                      <Check className="w-3.5 h-3.5" />
                      {addSaving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-4 border border-white/8 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300">Annuler</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Panneau détail */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#060606] border-l border-white/8 overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <p className={`text-[10px] tracking-[0.35em] uppercase mb-1 ${TYPE_COLORS[selected.type] || "text-[#E13027]/70"}`}>
                      {TYPE_LABELS[selected.type] || selected.type.toUpperCase()}
                    </p>
                    <h2 className="text-2xl font-light">{selected.prenom} {selected.nom}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selected.status]}`} />
                      <span className={`text-[11px] tracking-[0.2em] uppercase ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-2xl transition-colors leading-none">×</button>
                </div>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <Phone className="w-3.5 h-3.5 text-[#E13027] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Téléphone</p>
                      <p className="text-[14px] font-light text-white">{selected.telephone}</p>
                    </div>
                  </div>

                  {selected.type === "carte_cadeaux" && selected.message && (
                    <div className="flex items-start gap-4">
                      <User className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Bénéficiaire</p>
                        <p className="text-[14px] font-light text-white">
                          {selected.message.replace(/^Bénéficiaire:\s*/, "").split("|")[0].trim()}
                        </p>
                        {selected.message.includes("| Message:") && (
                          <p className="text-[12px] text-white/40 mt-1 italic">{selected.message.split("| Message:")[1].trim()}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selected.soin && (
                    <div className="flex items-start gap-4">
                      <Scissors className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${selected.type === "carte_cadeaux" ? "text-purple-400" : "text-[#E13027]"}`} />
                      <div>
                        <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Soin {selected.type === "carte_cadeaux" ? "offert" : "souhaité"}</p>
                        <p className="text-[14px] font-light text-white">{selected.soin}</p>
                      </div>
                    </div>
                  )}

                  {selected.date_reservation && (
                    <div className="flex items-start gap-4">
                      <Calendar className="w-3.5 h-3.5 text-[#E13027] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Date souhaitée</p>
                        <p className="text-[14px] font-light text-white">{formatDate(selected.date_reservation)}</p>
                      </div>
                    </div>
                  )}

                  {selected.heure && (
                    <div className="flex items-start gap-4">
                      <Clock className="w-3.5 h-3.5 text-[#E13027] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Heure souhaitée</p>
                        <p className="text-[14px] font-light text-white">{selected.heure}</p>
                      </div>
                    </div>
                  )}

                  {selected.message && selected.type !== "carte_cadeaux" && (
                    <div className="flex items-start gap-4">
                      <User className="w-3.5 h-3.5 text-[#E13027] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[9px] tracking-[0.28em] uppercase text-white/25 mb-1">Note</p>
                        <p className="text-[14px] font-light text-white/70 leading-relaxed">{selected.message}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-white/5 pt-6">
                    <p className="text-[9px] tracking-[0.28em] uppercase text-white/15">
                      Reçue le {new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {selected.status === "pending" && (
                  <div className="space-y-3">
                    <p className="text-[10px] tracking-[0.28em] uppercase text-white/25 mb-5">Actions</p>
                    <button onClick={() => updateStatus(selected.id, "approved")} disabled={updating === selected.id}
                      className="w-full py-4 border border-green-400/30 hover:border-green-400/60 text-[11px] tracking-[0.28em] uppercase text-green-400/70 hover:text-green-400 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40">
                      <Check className="w-3.5 h-3.5" />
                      {updating === selected.id ? "Traitement..." : selected.type === "carte_cadeaux" ? "Approuver la carte cadeaux" : "Approuver la réservation"}
                    </button>
                    <button onClick={() => updateStatus(selected.id, "refused")} disabled={updating === selected.id}
                      className="w-full py-4 border border-[#E13027]/20 hover:border-[#E13027]/50 text-[11px] tracking-[0.28em] uppercase text-[#E13027]/50 hover:text-[#E13027] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-40">
                      <X className="w-3.5 h-3.5" />
                      Refuser
                    </button>
                  </div>
                )}

                {selected.status !== "pending" && (
                  <button onClick={() => updateStatus(selected.id, selected.status === "approved" ? "refused" : "approved")} disabled={updating === selected.id}
                    className="w-full py-4 border border-white/10 hover:border-white/25 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300 disabled:opacity-40">
                    {updating === selected.id ? "Traitement..." : `Passer en "${selected.status === "approved" ? "Refusée" : "Approuvée"}"`}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
