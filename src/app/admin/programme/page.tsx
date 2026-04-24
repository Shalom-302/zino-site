"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = ["Les Mills", "Cardio", "Fitness", "Aqua"];
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

interface Slot {
  id: string;
  categorie: string;
  jour: string;
  heure: string;
  activite: string;
}

const EMPTY_FORM = { categorie: "Les Mills", jour: "Lundi", heure: "", activite: "" };

export default function AdminProgrammePage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Les Mills");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    setLoading(true);
    const { data } = await supabase
      .from("programme")
      .select("*")
      .order("jour")
      .order("heure");
    setSlots(data || []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      await supabase.from("programme").update(form).eq("id", editId);
    } else {
      await supabase.from("programme").insert(form);
    }
    await fetchSlots();
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("programme").delete().eq("id", id);
    setDeleteId(null);
    await fetchSlots();
  }

  function startEdit(slot: Slot) {
    setForm({ categorie: slot.categorie, jour: slot.jour, heure: slot.heure, activite: slot.activite });
    setEditId(slot.id);
    setShowForm(true);
  }

  function startAdd() {
    setForm({ ...EMPTY_FORM, categorie: activeTab });
    setEditId(null);
    setShowForm(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const filtered = slots.filter(s => s.categorie === activeTab);

  // Group by jour
  const grouped: Record<string, Slot[]> = {};
  filtered.forEach(s => {
    if (!grouped[s.jour]) grouped[s.jour] = [];
    grouped[s.jour].push(s);
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027]">Z Fit Spa</p>
            <span className="text-white/15">|</span>
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/40">Programme</p>
          </div>
              <div className="flex items-center gap-6">
                <a href="/admin/reservations" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">
                  Réservations
                </a>
                <a href="/admin/environments" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">
                  Environnements
                </a>
                <a href="/admin/newsletter" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Newsletter</a>
              <button
                onClick={handleLogout}
                className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300"
              >
                Déconnexion
              </button>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Titre */}
        <div className="mb-12">
          <h1 className="text-3xl font-light tracking-wide mb-2">Gestion du Programme</h1>
          <p className="text-secondary">Ajoutez, modifiez ou supprimez les créneaux horaires.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/8 mb-10 relative">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat}
              onClick={() => { setActiveTab(cat); setActiveTabIndex(i); }}
              className={`relative pb-5 text-[10px] md:text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 whitespace-nowrap ${activeTab === cat ? "text-white" : "text-white/30 hover:text-white/60"}`}
            >
              {cat}
              {activeTab === cat && (
                <motion.span
                  layoutId="admin-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#E13027]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
          {/* Bouton ajouter */}
          <div className="ml-auto pb-5">
            <button
              onClick={startAdd}
              className="text-[10px] tracking-[0.28em] uppercase text-[#E13027] hover:text-white transition-colors duration-300 flex items-center gap-2"
            >
              <span className="text-base leading-none">+</span> Ajouter un créneau
            </button>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="py-20 text-center text-white/20 text-[13px] tracking-widest uppercase">Chargement...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="py-20 text-center text-white/20 text-[13px] tracking-widest uppercase">Aucun créneau pour cette catégorie</div>
        ) : (
          <div className="space-y-10">
            {JOURS.filter(j => grouped[j]).map(jour => (
              <div key={jour}>
                <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-4">{jour}</p>
                <div className="space-y-px">
                  {grouped[jour].map(slot => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between py-4 border-b border-white/5 group"
                    >
                      <div className="flex items-center gap-8">
                        <span className="text-[13px] font-light text-white/30 w-16 shrink-0">{slot.heure}</span>
                        <span className="text-[14px] font-light text-white">{slot.activite}</span>
                      </div>
                      <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(slot)}
                          className="text-[10px] tracking-[0.22em] uppercase text-white/30 hover:text-white transition-colors duration-200"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => setDeleteId(slot.id)}
                          className="text-[10px] tracking-[0.22em] uppercase text-[#E13027]/50 hover:text-[#E13027] transition-colors duration-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal formulaire */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-black border border-white/10 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027] mb-1">Programme</p>
                  <h2 className="text-xl font-light">{editId ? "Modifier le créneau" : "Nouveau créneau"}</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white text-xl transition-colors">×</button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] tracking-[0.28em] uppercase text-white/30 mb-2">Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/15 pb-3 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.28em] uppercase text-white/30 mb-2">Jour</label>
                  <select
                    value={form.jour}
                    onChange={e => setForm(f => ({ ...f, jour: e.target.value }))}
                    className="w-full bg-transparent border-b border-white/15 pb-3 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300"
                  >
                    {JOURS.map(j => <option key={j} value={j} className="bg-black">{j}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.28em] uppercase text-white/30 mb-2">Heure</label>
                  <input
                    type="text"
                    value={form.heure}
                    onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}
                    placeholder="07H00"
                    required
                    className="w-full bg-transparent border-b border-white/15 pb-3 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300 placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.28em] uppercase text-white/30 mb-2">Activité</label>
                  <input
                    type="text"
                    value={form.activite}
                    onChange={e => setForm(f => ({ ...f, activite: e.target.value }))}
                    placeholder="Body Attack"
                    required
                    className="w-full bg-transparent border-b border-white/15 pb-3 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300 placeholder:text-white/20"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 border border-white/15 text-[11px] tracking-[0.28em] uppercase text-white/70 hover:border-white/40 hover:text-white transition-all duration-300 disabled:opacity-40"
                  >
                    {saving ? "Enregistrement..." : editId ? "Modifier" : "Ajouter"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-4 border border-white/8 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal confirmation suppression */}
      <AnimatePresence>
        {deleteId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-black border border-white/10 p-8 text-center"
            >
              <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027] mb-4">Attention</p>
              <p className="text-[15px] font-light text-white mb-2">Supprimer ce créneau ?</p>
              <p className="text-secondary mb-8">Cette action est irréversible.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-4 border border-[#E13027]/30 text-[11px] tracking-[0.28em] uppercase text-[#E13027] hover:border-[#E13027] transition-all duration-300"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-4 border border-white/8 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
