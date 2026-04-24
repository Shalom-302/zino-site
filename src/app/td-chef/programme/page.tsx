"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { Loader2, Save, RefreshCcw } from "lucide-react";

const CATEGORIES = ["Les Mills", "HBX", "Aquagym", "RPM"];
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const HEURES = ["07H00", "08H15", "09H15", "10H15", "11H15", "15H00", "16H00", "17H00", "18H00", "19H00", "20H00", "21H00"];
const ACTIVITES = [
  "Abdo Flash", "Aqua Minceur", "Body Attack", "Body Combat", "Bodyflow",
  "Bodypump", "Bodypump Force", "Bootcamp", "Boxing", "Circuit Training", "Cross Kids", "Cross Training",
  "Dance Zum Zum", "Djembel", "FAC", "Kids Boxing", "Kids Cross", "Kids Hip Hop",
  "Pilates", "Randonnée", "RPM", "Sprint", "Stretching", "TRX", "Zumba",
];

const ACT_COLORS: Record<string, string> = {
  "Abdo Flash":       "border-orange-400 bg-orange-50 text-orange-700",
  "Aqua Minceur":     "border-blue-400 bg-blue-50 text-blue-700",
  "Body Attack":      "border-red-500 bg-red-50 text-red-700",
  "Body Combat":      "border-red-700 bg-red-100 text-red-800",
  "Bodyflow":         "border-green-500 bg-green-50 text-green-700",
  "Bodypump":         "border-yellow-500 bg-yellow-50 text-yellow-700",
  "Bodypump Force":   "border-yellow-600 bg-yellow-100 text-yellow-800",
  "Bootcamp":         "border-orange-600 bg-orange-100 text-orange-800",
  "Boxing":           "border-gray-800 bg-gray-100 text-gray-800",
  "Circuit Training": "border-purple-500 bg-purple-50 text-purple-700",
  "Cross Kids":       "border-pink-400 bg-pink-50 text-pink-700",
  "Cross Training":   "border-indigo-500 bg-indigo-50 text-indigo-700",
  "Dance Zum Zum":    "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700",
  "Djembel":          "border-amber-600 bg-amber-50 text-amber-800",
  "FAC":              "border-teal-500 bg-teal-50 text-teal-700",
  "Kids Boxing":      "border-rose-400 bg-rose-50 text-rose-700",
  "Kids Cross":       "border-cyan-500 bg-cyan-50 text-cyan-700",
  "Kids Hip Hop":     "border-violet-500 bg-violet-50 text-violet-700",
  "Pilates":          "border-lime-500 bg-lime-50 text-lime-700",
  "Randonnée":        "border-green-700 bg-green-100 text-green-800",
  "RPM":              "border-amber-500 bg-amber-50 text-amber-700",
  "Sprint":           "border-[#E13027] bg-[#E13027]/5 text-[#E13027]",
  "Stretching":       "border-sky-400 bg-sky-50 text-sky-700",
  "TRX":              "border-stone-500 bg-stone-100 text-stone-700",
  "Zumba":            "border-emerald-500 bg-emerald-50 text-emerald-700",
  "":                 "border-gray-200 bg-gray-50 text-gray-400",
};

interface Slot {
  id: string;
  categorie: string;
  jour: string;
  heure: string;
  activite: string;
}

export default function TdChefProgrammePage() {
  const [activeTab, setActiveTab] = useState("Les Mills");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const activeIndex = CATEGORIES.indexOf(activeTab);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    onAuthStateChanged(auth, (user) => {
      if (!user) { router.push("/td-chef/login"); return; }
      fetchSlots();
    });
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "programme"));
      setSlots(snap.docs.map(d => ({ id: d.id, ...d.data() } as Slot)));
    } catch { /* no-op */ }
    setEdited({});
    setLoading(false);
  };

  const slotsForTab = slots.filter((s) => s.categorie === activeTab);

  const getSlot = (jour: string, heure: string) =>
    slotsForTab.find((s) => s.jour === jour && s.heure === heure);

  const getKey = (categorie: string, jour: string, heure: string) =>
    `${categorie}__${jour}__${heure}`;

  const getValue = (slot: Slot | undefined, jour: string, heure: string): string => {
    const key = getKey(activeTab, jour, heure);
    if (edited[key] !== undefined) return edited[key];
    return slot?.activite || "";
  };

  const handleChange = (jour: string, heure: string, value: string) => {
    const key = getKey(activeTab, jour, heure);
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const toSave = Object.entries(edited);
    if (toSave.length === 0) { toast.info("Aucune modification."); return; }
    setSaving(true);
    try {
      for (const [key, activite] of toSave) {
        const [categorie, jour, heure] = key.split("__");
        const existing = slots.find(
          (s) => s.categorie === categorie && s.jour === jour && s.heure === heure
        );
        if (existing) {
          await updateDoc(doc(db, "programme", existing.id), { activite });
        } else {
          await addDoc(collection(db, "programme"), { categorie, jour, heure, activite });
        }
      }
      toast.success(`${toSave.length} case(s) sauvegardée(s)`);
      fetchSlots();
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
      </div>
    );
  }

  const hasChanges = Object.keys(edited).length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <div className="bg-white border-b border-black/10 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[18px] font-black uppercase tracking-tight">
              Gestion <span className="text-[#E13027]">Programme</span>
            </h1>
            <p className="text-[11px] text-black/40 uppercase tracking-wider">Modifier les emplois du temps</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSlots}
              className="flex items-center gap-2 px-4 py-2 border border-black/20 text-[12px] font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition-all">
              <RefreshCcw className="w-3.5 h-3.5" /> Actualiser
            </button>
            <motion.button onClick={handleSave} disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-5 py-2 text-[12px] font-bold uppercase tracking-wider transition-all ${
                hasChanges ? "bg-[#E13027] text-white hover:bg-black" : "bg-black/10 text-black/30 cursor-not-allowed"
              }`}
              whileTap={hasChanges ? { scale: 0.97 } : {}}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Enregistrer {hasChanges ? `(${Object.keys(edited).length})` : ""}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="relative flex">
            <motion.div className="absolute top-0 bottom-0 bg-black"
              animate={{
                left: `calc(${activeIndex} * (100% / ${CATEGORIES.length}))`,
                width: `calc(100% / ${CATEGORIES.length})`,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveTab(cat)}
                className="relative flex-1 px-4 py-4 text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 z-10"
                style={{ color: activeTab === cat ? "#fff" : "rgba(0,0,0,0.4)" }}>
                {cat === "Les Mills" ? <>Les Mills<sup className="text-[7px] align-super">™</sup></> : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10">
        {hasChanges && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-300 px-4 py-3 text-[12px] font-semibold text-amber-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            {Object.keys(edited).length} modification(s) non sauvegardée(s) — cliquez sur Enregistrer
          </motion.div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 760 }}>
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-3 pr-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/40 w-[110px]">Horaire</th>
                {JOURS.map((jour) => (
                  <th key={jour} className="text-center py-3 px-1 text-[11px] md:text-[12px] font-black uppercase tracking-[0.12em] text-black">{jour}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEURES.map((heure) => (
                <tr key={heure} className="border-b border-black/5">
                  <td className="py-2 pr-4 text-[11px] font-semibold text-black/50 whitespace-nowrap">{heure}</td>
                  {JOURS.map((jour) => {
                    const slot = getSlot(jour, heure);
                    const value = getValue(slot, jour, heure);
                    const isEdited = edited[getKey(activeTab, jour, heure)] !== undefined;
                    return (
                      <td key={jour} className="py-1.5 px-1">
                        <div className={`relative border-2 ${ACT_COLORS[value] || ACT_COLORS[""]} ${isEdited ? "ring-2 ring-[#E13027]/40" : ""} transition-all`}>
                          <select value={value} onChange={(e) => handleChange(jour, heure, e.target.value)}
                            className="w-full py-2.5 px-1 text-[11px] font-bold uppercase tracking-wide bg-transparent cursor-pointer appearance-none text-center focus:outline-none">
                            <option value="">— Vide —</option>
                            {ACTIVITES.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-[9px] opacity-40">▼</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 items-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/40 w-full">Activités disponibles :</p>
          {ACTIVITES.map((a) => (
            <div key={a} className={`border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${ACT_COLORS[a] || ACT_COLORS[""]}`}>{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
