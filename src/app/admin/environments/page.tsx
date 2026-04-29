"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { proxyUrl } from "@/lib/supabase-url";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Env = "fitness" | "spa";

interface ContentRow {
  id: string;
  environment: Env;
  section: string;
  key: string;
  value: string;
}

interface ImageRow {
  id: string;
  environment: Env;
  image_key: string;
  image_url: string;
  media_type: string;
  section: string;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  navbar: "Navigation",
  presentation: "Présentation",
};

export default function AdminEnvironmentsPage() {
  const router = useRouter();
  const [activeEnv, setActiveEnv] = useState<Env>("fitness");
  const [content, setContent] = useState<ContentRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<ContentRow | null>(null);
  const [editingImage, setEditingImage] = useState<ImageRow | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
    });
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [activeEnv]);

  async function fetchData() {
    setLoading(true);
    const [{ data: contentData }, { data: imgData }] = await Promise.all([
      supabase
        .from("environment_content")
        .select("*")
        .eq("environment", activeEnv)
        .order("section")
        .order("key"),
      supabase
        .from("environment_images")
        .select("*")
        .eq("environment", activeEnv)
        .order("section"),
    ]);
    setContent(contentData || []);
    setImages(imgData || []);
    setLoading(false);
  }

  async function saveContent(row: ContentRow, newValue: string) {
    setSaving(row.id);
    await supabase
      .from("environment_content")
      .update({ value: newValue, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    setSaving(null);
    setEditingContent(null);
    await fetchData();
  }

  async function saveImage(row: ImageRow, newUrl: string) {
    setSaving(row.id);
    await supabase
      .from("environment_images")
      .update({ image_url: newUrl, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    setSaving(null);
    setEditingImage(null);
    await fetchData();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const sections = [...new Set(content.map((c) => c.section))];
  const filteredContent = content.filter((c) => c.section === activeSection);
  const filteredImages = images.filter((i) => i.section === activeSection);

  const KEY_LABELS: Record<string, string> = {
    badge: "Badge / Sous-titre",
    title_line1: "Titre ligne 1",
    title_line2: "Titre ligne 2",
    title_line3: "Titre ligne 3",
    subtitle: "Sous-titre long",
    cta_primary: "Bouton principal",
    cta_secondary: "Bouton secondaire",
    link1_label: "Lien 1 — Nom",
    link1_href: "Lien 1 — URL",
    link2_label: "Lien 2 — Nom",
    link2_href: "Lien 2 — URL",
    link3_label: "Lien 3 — Nom",
    link3_href: "Lien 3 — URL",
    title: "Titre",
    description: "Description",
    stat1_value: "Stat 1 — Valeur",
    stat1_label: "Stat 1 — Label",
    stat2_value: "Stat 2 — Valeur",
    stat2_label: "Stat 2 — Label",
    stat3_value: "Stat 3 — Valeur",
    stat3_label: "Stat 3 — Label",
  };

  const IMAGE_KEY_LABELS: Record<string, string> = {
    hero_main: "Image / Vidéo principale",
    hero_col1: "Collage — Image 1",
    hero_col2: "Collage — Image 2",
    hero_col3: "Collage — Image 3",
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/8">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027]">Z Fit Spa</p>
            <span className="text-white/15">|</span>
            <p className="text-[11px] tracking-[0.22em] uppercase text-white/40">Environnements</p>
          </div>
          <div className="flex items-center gap-6">
            <a href="/admin/reservations" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">Réservations</a>
            <a href="/admin/programme" className="text-[10px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-colors duration-300">
              Programme
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
        <div className="mb-12">
          <h1 className="text-3xl font-light tracking-wide mb-2">Gestion des Environnements</h1>
          <p className="text-white/40 text-sm">Modifiez le contenu et les images pour chaque environnement.</p>
        </div>

        {/* Fitness / Spa tabs */}
        <div className="flex gap-1 mb-10 bg-white/5 p-1 w-fit">
          {(["fitness", "spa"] as Env[]).map((env) => (
            <button
              key={env}
              onClick={() => setActiveEnv(env)}
              className={`px-8 py-3 text-[11px] tracking-[0.22em] uppercase transition-all duration-300 ${
                activeEnv === env
                  ? "bg-[#E13027] text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {env === "fitness" ? "Fitness" : "Spa"}
            </button>
          ))}
        </div>

        {/* Section tabs */}
        <div className="flex gap-8 border-b border-white/8 mb-10">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`relative pb-5 text-[10px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                activeSection === sec ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {SECTION_LABELS[sec] || sec}
              {activeSection === sec && (
                <motion.span
                  layoutId="env-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-[#E13027]"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/20 text-[13px] tracking-widest uppercase">Chargement...</div>
        ) : (
          <div className="space-y-10">
            {/* Textes */}
            {filteredContent.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-6">Textes</p>
                <div className="space-y-px">
                  {filteredContent.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between py-4 border-b border-white/5 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">
                          {KEY_LABELS[row.key] || row.key}
                        </p>
                        <p className="text-[14px] font-light text-white truncate max-w-xl">
                          {row.value || <span className="text-white/20 italic">— vide —</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingContent(row);
                          setEditValue(row.value || "");
                        }}
                        className="ml-6 text-[10px] tracking-[0.22em] uppercase text-white/30 hover:text-white transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        Modifier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {filteredImages.length > 0 && (
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-6">Images & Médias</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {filteredImages.map((img) => (
                    <div key={img.id} className="group relative">
                      <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
                        {img.media_type === "video" ? (
                          <video
                            src={proxyUrl(img.image_url)}
                            className="w-full h-full object-cover opacity-70"
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={proxyUrl(img.image_url)}
                            alt={img.image_key}
                            fill
                            className="object-cover opacity-70"
                            unoptimized
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              setEditingImage(img);
                              setEditValue(img.image_url);
                            }}
                            className="text-[10px] tracking-[0.22em] uppercase text-white border border-white/40 px-4 py-2 hover:bg-white hover:text-black transition-all duration-200"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-white/30 mt-2">
                        {IMAGE_KEY_LABELS[img.image_key] || img.image_key}
                      </p>
                      <p className="text-[9px] text-white/20 uppercase">{img.media_type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal modifier texte */}
      <AnimatePresence>
        {editingContent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setEditingContent(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-black border border-white/10 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027] mb-1">
                    {activeEnv.toUpperCase()} — {SECTION_LABELS[editingContent.section] || editingContent.section}
                  </p>
                  <h2 className="text-xl font-light">{KEY_LABELS[editingContent.key] || editingContent.key}</h2>
                </div>
                <button onClick={() => setEditingContent(null)} className="text-white/30 hover:text-white text-xl">×</button>
              </div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={4}
                className="w-full bg-transparent border border-white/15 p-4 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300 resize-none"
              />
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => saveContent(editingContent, editValue)}
                  disabled={saving === editingContent.id}
                  className="flex-1 py-4 border border-white/15 text-[11px] tracking-[0.28em] uppercase text-white/70 hover:border-white/40 hover:text-white transition-all duration-300 disabled:opacity-40"
                >
                  {saving === editingContent.id ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setEditingContent(null)}
                  className="px-6 py-4 border border-white/8 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal modifier image */}
      <AnimatePresence>
        {editingImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setEditingImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-black border border-white/10 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.35em] uppercase text-[#E13027] mb-1">
                    {activeEnv.toUpperCase()} — Image
                  </p>
                  <h2 className="text-xl font-light">{IMAGE_KEY_LABELS[editingImage.image_key] || editingImage.image_key}</h2>
                </div>
                <button onClick={() => setEditingImage(null)} className="text-white/30 hover:text-white text-xl">×</button>
              </div>

              {/* Aperçu */}
              <div className="relative aspect-video bg-white/5 mb-6 overflow-hidden">
                {editingImage.media_type === "video" ? (
                  <video src={editValue} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  editValue && (
                    <Image src={editValue} alt="aperçu" fill className="object-cover" unoptimized />
                  )
                )}
              </div>

              <label className="block text-[10px] tracking-[0.28em] uppercase text-white/30 mb-2">URL de l&apos;image / vidéo</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-transparent border-b border-white/15 pb-3 text-white text-[14px] font-light outline-none focus:border-white/40 transition-colors duration-300"
                placeholder="https://..."
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => saveImage(editingImage, editValue)}
                  disabled={saving === editingImage.id}
                  className="flex-1 py-4 border border-white/15 text-[11px] tracking-[0.28em] uppercase text-white/70 hover:border-white/40 hover:text-white transition-all duration-300 disabled:opacity-40"
                >
                  {saving === editingImage.id ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  className="px-6 py-4 border border-white/8 text-[11px] tracking-[0.28em] uppercase text-white/30 hover:text-white/60 transition-all duration-300"
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
