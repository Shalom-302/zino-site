'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  addCoachAction,
  saveCoachAction,
  toggleCoachPublishedAction,
  deleteCoachAction,
  upsertSiteImageAction,
} from './coach-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, RefreshCcw, Save, User, UserPlus, Trash2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { proxyUrl } from '@/lib/supabase-url';

// ─── MediaCard — module-level so React never remounts it on parent re-render ───
function MediaCard({
  imageUrl, mediaType, label, acceptVideo, isUploading, disabled, onFile,
}: {
  imageUrl: string; mediaType?: string; label: string;
  acceptVideo?: boolean; isUploading: boolean; disabled: boolean;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const ACCEPT_IMAGE = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif';
  const ACCEPT_VIDEO = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime';

  return (
    <Card className="group overflow-hidden border border-black/8 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl bg-white">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {mediaType === 'video' && imageUrl
          ? <video src={proxyUrl(imageUrl)} className="w-full h-full object-cover" muted loop autoPlay playsInline />
          : imageUrl
            ? <div className="relative w-full h-full">
                <Image src={proxyUrl(imageUrl)} alt={label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              </div>
            : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 flex-col gap-2">
                <Upload className="w-8 h-8 opacity-30" />
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">{acceptVideo ? 'Photo ou Vidéo' : 'Photo'}</span>
              </div>
        }
        {mediaType === 'video' && imageUrl && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded z-10">Vidéo</div>
        )}
        {acceptVideo && mediaType !== 'video' && imageUrl && (
          <div className="absolute top-2 right-2 bg-white/80 text-black/50 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded z-10">Photo / Vidéo</div>
        )}
        {/* Hover overlay — button triggers hidden input via ref */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-[#E13027] hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" /> Changer
          </button>
        </div>
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30">
            <Loader2 className="w-8 h-8 animate-spin text-[#E13027] mb-2" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Upload en cours...</span>
          </div>
        )}
        {/* Hidden file input — triggered via ref */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptVideo ? ACCEPT_VIDEO : ACCEPT_IMAGE}
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) { e.target.value = ''; onFile(f); }
          }}
          disabled={disabled}
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-wider text-[#0F0F0F]">{label}</CardTitle>
        <CardDescription className="text-[10px]">
          {acceptVideo
            ? (mediaType === 'video' ? '▶ Vidéo active — remplacer par Photo ou Vidéo MP4/WEBM' : 'Photo JPG/PNG/WEBP ou Vidéo courte MP4/WEBM')
            : 'Image JPG/PNG/WEBP'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

interface EnvImage {
  id: string; environment: string; section: string; image_key: string; image_url: string; media_type?: 'image' | 'video';
}
interface SiteImage {
  id: string; section: string; image_key: string; image_url: string; media_type?: 'image' | 'video';
}
interface EntranceImage {
  image_key: 'entrance_fitness' | 'entrance_spa'; image_url: string; media_type?: 'image' | 'video';
}
interface CoachInfo {
  coach_key: string; name: string; title: string; description: string; published?: boolean;
}

const IMAGE_LABELS: Record<string, string> = {
  entrance_fitness: 'Panneau Fitness',
  entrance_spa: 'Panneau Spa',
  hero_main: 'Vidéo / Image principale',
  hero_col1: 'Colonne 1', hero_col2: 'Colonne 2', hero_col3: 'Colonne 3',
  main_hero: 'Fond Hero Principal',
  hero_bg: 'Fond Session Hero',
  cta_journey: 'Bannière CTA',
  healthy_mind_top: "Centre d'Excellence — Coaching Privé",
  healthy_mind_middle: "Centre d'Excellence — Reformer Pilates",
  healthy_mind_bottom: "Centre d'Excellence — Analyse InBody",
  art_body_top: 'Art & Performance — Haut',
  art_body_bottom: 'Art & Performance — Bas',
  coach_1: 'Coach 1', coach_2: 'Coach 2', coach_3: 'Coach 3',
  coach_4: 'Coach 4', coach_5: 'Coach 5', coach_6: 'Coach 6',
  coach_7: 'Coach 7', coach_8: 'Coach 8', coach_9: 'Coach 9',
  spa_coach_1: 'Coach Spa 1', spa_coach_2: 'Coach Spa 2', spa_coach_3: 'Coach Spa 3',
  spa_coach_4: 'Coach Spa 4', spa_coach_5: 'Coach Spa 5', spa_coach_6: 'Coach Spa 6',
  spa_coach_7: 'Coach Spa 7', spa_coach_8: 'Coach Spa 8', spa_coach_9: 'Coach Spa 9',
  space_reception: "L'Accueil", space_lockers: 'Les Vestiaires',
  space_muscu: 'Espace Musculation', space_cardio: 'Espace Cardio',
  space_abdos: 'Abdos & Mobilité', space_lesmills: 'Studio Les Mills™',
  space_hbx: 'Studio HBX', space_terasse: 'La Terrasse',
  space_consultation: 'Salle de Consultation', space_wellness: 'Le Wellness Bar',
  spa_vestiaires: 'Les Vestiaires', spa_salon_detente: 'Salle de Ressourcement',
  spa_espace_sensoriel: "L'Espace Sensoriel", spa_sauna: 'La Salle de Sauna',
  spa_hammam: 'La Salle de Hammam', spa_cabine_gommage: 'La Cabine de Gommage',
  spa_douche_4saison: 'La Douche 4 Saison', spa_cabines_soin: 'Les Cabines de Soin',
  soin_visage: 'Nos Soins — Visage', soin_corps: 'Nos Soins — Corps', soin_massages: 'Nos Soins — Massages',
  partner_sultane: 'La Sultane de Saba', partner_gemology: 'Gemology',
  gift_moment: "Offrez un moment d'exception",
  spa_sanctuaire_portrait: 'Sanctuaire — Portrait',
  abdo_flash: 'Abdo Flash', aqua_minceur: 'Aqua Minceur', body_attack: 'Body Attack',
  body_combat: 'Body Combat', body_flow: 'Bodyflow', body_pump: 'Bodypump', bodypump_force: 'Bodypump Force',
  boxing: 'Boxing', circuit_training: 'Circuit Training', cross_kids: 'Cross Kids',
  cross_training: 'Cross Training', dance_zum_zum: 'Dance Zum Zum', djembel: 'Djembel',
  fac: 'FAC', kids_boxing: 'Kids Boxing', kids_cross: 'Kids Cross', kids_hip_hop: 'Kids Hip Hop',
  pilates: 'Pilates', rpm: 'RPM', sprint: 'Sprint', stretching: 'Stretching',
  trx: 'TRX', zumba: 'Zumba',
};
const getLabel = (key: string) => IMAGE_LABELS[key] || key.replace(/_/g, ' ');

// Sections environnement — sans le hero (hero_main, col1/2/3 ne sont pas utilisés par le site)
const FITNESS_SECTIONS = [
  { key: 'hero_bg',               title: 'Hero Section — Fond (Photo ou Vidéo)', keys: ['main_hero'] },
  { key: 'club_presentation',     title: 'Club Présentation (3 visuels)', keys: ['healthy_mind_top', 'space_muscu', 'art_body_top'] },
  { key: 'cta',                   title: "Appel à l'action",          keys: ['cta_journey'] },
  { key: 'core_workout',          title: "Un Centre d'Excellence et Performance", keys: ['healthy_mind_top', 'healthy_mind_middle', 'healthy_mind_bottom'] },
  { key: 'spaces',                title: 'Nos Espaces (Fitness)',     keys: ['space_reception','space_lockers','space_muscu','space_cardio','space_abdos','space_lesmills','space_hbx','space_terasse','space_consultation','space_wellness'] },
  { key: 'activities',            title: 'Activités',                 keys: ['abdo_flash','aqua_minceur','body_attack','body_combat','body_flow','body_pump','bodypump_force','boxing','circuit_training','cross_kids','cross_training','dance_zum_zum','djembel','fac','kids_boxing','kids_cross','kids_hip_hop','pilates','rpm','sprint','stretching','trx','zumba'] },
];

const SPA_SECTIONS = [
  { key: 'hero_bg',               title: 'Hero Section — Fond (Photo ou Vidéo)', keys: ['main_hero'] },
  { key: 'spa_presentation',      title: 'Sanctuaire de Bien-être',   keys: ['spa_sanctuaire_portrait'] },
  { key: 'spa_spaces',            title: 'Nos Espaces (Spa)',         keys: ['spa_vestiaires','spa_salon_detente','spa_espace_sensoriel','spa_sauna','spa_hammam','spa_cabine_gommage','spa_douche_4saison','spa_cabines_soin'] },
  { key: 'soins',                 title: 'Nos Soins (Spa)',           keys: ['soin_visage','soin_corps','soin_massages'] },
  { key: 'partenaires',           title: 'Maisons Partenaires (Spa)', keys: ['partner_sultane','partner_gemology'] },
  { key: 'gift',                  title: "Moment d'Exception (Spa)",  keys: ['gift_moment'] },
];

export default function TdChefPage() {
  const [envImages, setEnvImages] = useState<EnvImage[]>([]);
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [entranceImages, setEntranceImages] = useState<Record<string, EntranceImage>>({});
  const [coachesInfo, setCoachesInfo] = useState<CoachInfo[]>([]);
  const [savingCoach, setSavingCoach] = useState<string | null>(null);
  const [deletingCoach, setDeletingCoach] = useState<string | null>(null);
  const [addingCoach, setAddingCoach] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeEnv, setActiveEnv] = useState<'fitness' | 'spa'>('fitness');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['entrance']));
  const toggleSection = (key: string) => setOpenSections(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });
  const router = useRouter();

  useEffect(() => { checkUser(); }, []);

  useEffect(() => {
    if (!loading) fetchCoachesInfo(activeEnv);
  }, [activeEnv]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/td-chef/login'); setLoading(false); return; }
    try {
      await Promise.all([fetchEnvImages(), fetchSiteImages(), fetchEntranceImages(), fetchCoachesInfo('fitness')]);
    } catch { /* non-blocking */ }
    finally { setLoading(false); }
  };

  const fetchEnvImages = async () => {
    try {
      const { data, error } = await supabase.from('environment_images').select('*');
      if (error) throw error;
      const imgs: EnvImage[] = (data || []).map(r => ({ id: r.id, environment: r.environment, section: r.section, image_key: r.image_key, image_url: `${(r.image_url||'').split('?')[0]}?t=${Date.now()}`, media_type: r.media_type }));
      setEnvImages(imgs);
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
  };

  const fetchEntranceImages = async () => {
    try {
      const { data } = await supabase.from('site_images').select('id, image_url, media_type').in('id', ['entrance_fitness', 'entrance_spa']);
      const map: Record<string, EntranceImage> = {};
      (data || []).forEach(r => {
        const key = r.id as 'entrance_fitness' | 'entrance_spa';
        map[key] = { image_key: key, image_url: `${(r.image_url||'').split('?')[0]}?t=${Date.now()}`, media_type: r.media_type || 'image' };
      });
      setEntranceImages(map);
    } catch { /* no-op */ }
  };

  const fetchSiteImages = async () => {
    try {
      const { data, error } = await supabase.from('site_images').select('*');
      if (error) throw error;
      const imgs: SiteImage[] = (data || []).map(r => ({ id: r.id, section: r.section, image_key: r.id, image_url: `${(r.image_url||'').split('?')[0]}?t=${Date.now()}`, media_type: r.media_type }));
      setSiteImages(imgs);
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
  };

  const fetchCoachesInfo = async (env: 'fitness' | 'spa' = 'fitness') => {
    try {
      const prefix = env === 'spa' ? 'spa_coach_' : 'coach_';
      const { data: allData } = await supabase
        .from('coaches_info')
        .select('*')
        .order('coach_key', { ascending: true });
      const data = (allData || []).filter((r: any) => r.coach_key.startsWith(prefix));
      setCoachesInfo((data || []) as CoachInfo[]);
    } catch { /* no-op */ }
  };

  const handleCoachInfoChange = (coach_key: string, field: keyof CoachInfo, value: string | boolean) => {
    setCoachesInfo(prev => prev.map(c => c.coach_key === coach_key ? { ...c, [field]: value } : c));
  };

  const toggleCoachPublished = async (coach_key: string, newValue: boolean) => {
    setCoachesInfo(prev => prev.map(c => c.coach_key === coach_key ? { ...c, published: newValue } : c));
    try {
      await toggleCoachPublishedAction(coach_key, newValue);
      toast.success(newValue ? 'Coach publié' : 'Coach mis en brouillon');
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
  };

  const saveCoachInfo = async (coach_key: string) => {
    const info = coachesInfo.find(c => c.coach_key === coach_key);
    if (!info) return;
    setSavingCoach(coach_key);
    try {
      await saveCoachAction(info);
      toast.success('Coach sauvegardé');
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
    finally { setSavingCoach(null); }
  };

  const uploadFile = async (file: File, uploadId: string): Promise<string> => {
    const isVideo = file.type.startsWith('video/') || ['mp4','webm','ogg','mov'].includes(file.name.split('.').pop()?.toLowerCase() || '');
    const fileExt = file.name.split('.').pop();
    const filePath = `${isVideo ? 'videos' : 'images'}/${uploadId}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: { session } } = await supabase.auth.getSession();
    const authHeaders: HeadersInit = session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {};

    // Step 1: get a signed upload URL (tiny request to our API)
    const urlRes = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ path: filePath, mimeType: file.type }),
    });
    if (!urlRes.ok) {
      const text = await urlRes.text();
      let msg = 'Upload failed';
      try { msg = JSON.parse(text).error || msg; } catch { msg = text.slice(0, 120) || msg; }
      throw new Error(msg);
    }
    const { signedUrl, publicUrl } = await urlRes.json();

    // Step 2: PUT directly from browser to Supabase HTTPS — no Vercel in the path, no size limit
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type, 'x-upsert': 'true' },
    });
    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      let msg = `Upload échoué (${uploadRes.status})`;
      try { msg = JSON.parse(text).error || msg; } catch { msg = text.slice(0, 120) || msg; }
      throw new Error(msg);
    }
    return publicUrl;
  };

  // Tous les uploads passent par environment_images
  const doUploadEnv = async (file: File, uploadId: string, env: string, imageKey: string) => {
    try {
      setUploading(uploadId);
      const isVideo = file.type.startsWith('video/') || ['mp4','webm','ogg','mov'].includes(file.name.split('.').pop()?.toLowerCase() || '');
      const publicUrl = await uploadFile(file, uploadId);
      await supabase.from('environment_images').upsert({
        id: `${env}_${imageKey}`,
        environment: env, image_key: imageKey, section: imageKey,
        image_url: publicUrl, media_type: isVideo ? 'video' : 'image',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      const busted = publicUrl.includes('?') ? `${publicUrl}&t=${Date.now()}` : `${publicUrl}?t=${Date.now()}`;
      setEnvImages(prev => {
        const exists = prev.some(img => img.environment === env && img.image_key === imageKey);
        if (exists) return prev.map(img => img.environment === env && img.image_key === imageKey ? { ...img, image_url: busted, media_type: isVideo ? 'video' : 'image' } : img);
        return [...prev, { id: `${env}_${imageKey}`, environment: env, section: imageKey, image_key: imageKey, image_url: busted, media_type: isVideo ? 'video' : 'image' }];
      });
      toast.success(`${isVideo ? 'Vidéo' : 'Image'} mise à jour`);
    } catch (e: any) { toast.error('Erreur upload: ' + e.message); }
    finally { setUploading(null); }
  };

  // Upload images/vidéos page d'accueil
  const doUploadEntrance = async (file: File, imageKey: 'entrance_fitness' | 'entrance_spa') => {
    const uploadId = imageKey;
    try {
      setUploading(uploadId);
      const isVideo = file.type.startsWith('video/') || ['mp4','webm','ogg','mov'].includes(file.name.split('.').pop()?.toLowerCase() || '');
      const publicUrl = await uploadFile(file, imageKey);
      await supabase.from('site_images').upsert({
        id: imageKey,
        image_url: publicUrl, media_type: isVideo ? 'video' : 'image',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      const busted = publicUrl.includes('?') ? `${publicUrl}&t=${Date.now()}` : `${publicUrl}?t=${Date.now()}`;
      setEntranceImages(prev => ({ ...prev, [imageKey]: { image_key: imageKey, image_url: busted, media_type: isVideo ? 'video' : 'image' } }));
      toast.success(`${isVideo ? 'Vidéo' : 'Image'} mise à jour`);
    } catch (e: any) { toast.error('Erreur upload: ' + e.message); }
    finally { setUploading(null); }
  };

  const addCoach = async () => {
    const prefix = activeEnv === 'spa' ? 'spa_coach_' : 'coach_';
    setAddingCoach(true);
    try {
      const existingKeys = coachesInfo.map(c => c.coach_key);
      const newKey = await addCoachAction(prefix, coachesInfo.length, existingKeys);
      const newCoach: CoachInfo = { coach_key: newKey, name: 'NOUVEAU COACH', title: 'Coach', description: '' };
      setCoachesInfo(prev => [...prev, newCoach]);
      toast.success('Coach ajouté');
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
    finally { setAddingCoach(false); }
  };

  const deleteCoach = async (coachKey: string) => {
    try {
      await deleteCoachAction(coachKey);
      setCoachesInfo(prev => prev.filter(c => c.coach_key !== coachKey));
      toast.success('Coach supprimé');
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
    finally { setDeletingCoach(null); }
  };

  // Upload photo coach → site_images (upsert pour supporter fitness et spa)
  const doUploadCoach = async (file: File, uploadId: string, imageKey: string) => {
    try {
      setUploading(uploadId);
      const publicUrl = await uploadFile(file, uploadId);
      await upsertSiteImageAction(imageKey, publicUrl, 'image');
      const busted = publicUrl.includes('?') ? `${publicUrl}&t=${Date.now()}` : `${publicUrl}?t=${Date.now()}`;
      setSiteImages(prev => {
        const exists = prev.some(img => img.image_key === imageKey);
        if (exists) return prev.map(img => img.image_key === imageKey ? { ...img, image_url: busted, media_type: 'image' } : img);
        return [...prev, { id: imageKey, section: 'coaches', image_key: imageKey, image_url: busted, media_type: 'image' }];
      });
      toast.success('Photo mise à jour');
    } catch (e: any) { toast.error('Erreur upload: ' + e.message); }
    finally { setUploading(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
    </div>
  );

  // Lookup maps
  const envMap: Record<string, EnvImage> = {};
  envImages.forEach(img => { envMap[`${img.environment}__${img.image_key}`] = img; });
  const siteMap: Record<string, SiteImage> = {};
  siteImages.forEach(img => { siteMap[img.image_key] = img; });

  const CollapsibleSection = ({ sectionKey, title, count, children }: { sectionKey: string; title: string; count: number; children: React.ReactNode }) => {
    const isOpen = openSections.has(sectionKey);
    return (
      <div className="border border-black/8 rounded-xl overflow-hidden bg-white shadow-sm" id={`sec-${sectionKey}`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#0F0F0F]">{title}</span>
            <span className="text-[10px] font-bold text-black/30 bg-black/5 px-2 py-0.5 rounded-full">{count}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-black/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="px-5 pb-5 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEnvSection = (section: typeof FITNESS_SECTIONS[0], env: 'fitness' | 'spa') => {
    const cards = section.keys.map(key => {
      const img = envMap[`${env}__${key}`];
      const uploadId = `${env}_${key}`;
      const acceptVideo = ['hero_main', 'main_hero', 'healthy_mind_top', 'healthy_mind_middle', 'healthy_mind_bottom', 'art_body_top', 'art_body_bottom', 'space_muscu', 'cta_journey'].includes(key);
      const imageUrl = img?.image_url || '';
      return (
        <MediaCard key={key}
          imageUrl={imageUrl}
          mediaType={img?.media_type || 'image'}
          label={getLabel(key)}
          acceptVideo={acceptVideo}
          isUploading={uploading === uploadId}
          disabled={!!uploading}
          onFile={f => doUploadEnv(f, uploadId, env, key)}
        />
      );
    });
    if (!cards.length) return null;
    const sectionKey = `${env}-${section.key}`;
    return (
      <CollapsibleSection key={sectionKey} sectionKey={sectionKey} title={section.title} count={cards.length}>
        {cards}
      </CollapsibleSection>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[#0F0F0F]">
            Gestion <span className="text-[#E13027]">Médias</span>
          </h1>
          <p className="text-xs text-black/40 mt-1 uppercase tracking-wider">Visuels et vidéos du site</p>
        </div>
          <Button variant="outline" size="sm" onClick={() => { fetchEnvImages(); fetchSiteImages(); fetchEntranceImages(); fetchCoachesInfo(activeEnv); }} className="gap-2 text-xs">
          <RefreshCcw className="w-3.5 h-3.5" /> Actualiser
        </Button>
      </div>

      {/* Page d'accueil — images de choix */}
      <div className="mb-6">
        <CollapsibleSection sectionKey="entrance" title="Page d'accueil — Choix Fitness / Spa" count={2}>
          {(['entrance_fitness', 'entrance_spa'] as const).map(key => {
            const img = entranceImages[key];
            return (
              <MediaCard key={key}
                imageUrl={img?.image_url || ''}
                mediaType={img?.media_type || 'image'}
                label={getLabel(key)}
                acceptVideo={true}
                isUploading={uploading === key}
                disabled={!!uploading}
                onFile={f => doUploadEntrance(f, key)}
              />
            );
          })}
        </CollapsibleSection>
      </div>

      {/* Toggle Fitness / Spa */}
      <div className="flex gap-1 mb-8 p-1 bg-black/5 rounded-lg w-fit">
        {(['fitness', 'spa'] as const).map(env => (
          <button key={env} onClick={() => setActiveEnv(env)}
            className={`flex items-center gap-2 px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 rounded-md
              ${activeEnv === env
                ? env === 'fitness' ? 'bg-[#E13027] text-white shadow-sm' : 'bg-[#4B7BEC] text-white shadow-sm'
                : 'text-black/40 hover:text-black/70'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeEnv === env ? 'bg-white' : env === 'fitness' ? 'bg-[#E13027]' : 'bg-[#4B7BEC]'}`} />
            {env === 'fitness' ? 'Fitness' : 'Spa'}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="space-y-3">
        {(activeEnv === 'fitness' ? FITNESS_SECTIONS : SPA_SECTIONS).map(s => renderEnvSection(s, activeEnv))}

        {/* Coachs — Fitness et Spa indépendants */}
        <div className="border border-black/8 rounded-xl overflow-hidden bg-white shadow-sm" id="sec-coaches">
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={() => toggleSection('coaches')} className="flex items-center gap-3 flex-1 text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0F0F0F]">
                {activeEnv === 'spa' ? 'Nos Praticiennes' : 'Coachs Experts'}
              </span>
              <span className="text-[10px] font-bold text-black/30 bg-black/5 px-2 py-0.5 rounded-full">{coachesInfo.length}</span>
              <ChevronDown className={`w-4 h-4 text-black/40 transition-transform duration-200 ${openSections.has('coaches') ? 'rotate-180' : ''}`} />
            </button>
            <Button size="sm" onClick={addCoach} disabled={addingCoach}
              className="shrink-0 gap-1.5 text-[10px] bg-[#0F0F0F] hover:bg-[#E13027] text-white uppercase tracking-widest font-bold">
              {addingCoach ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
              Ajouter
            </Button>
          </div>
          {openSections.has('coaches') && <div className="px-5 pb-5 pt-1">
          {coachesInfo.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-black/20 rounded-xl text-black/30">
              <User className="w-10 h-10 mb-3" />
              <p className="text-xs uppercase tracking-widest font-bold">Aucun coach</p>
              <p className="text-[11px] mt-1">Cliquez sur &quot;Ajouter&quot; pour créer un coach</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coachesInfo.map((coach, idx) => {
                const coachImgKey = coach.coach_key;
                const coachImg = siteMap[coachImgKey];
                const uploadId = `coach_photo_${coach.coach_key}`;
                const isDeleting = deletingCoach === coach.coach_key;
                return (
                  <Card key={coach.coach_key} className="border border-black/8 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col group/card transition-shadow hover:shadow-md">
                    {/* Photo portrait */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-black/5 to-black/10 group flex-shrink-0">
                      {coachImg ? (
                        <Image src={proxyUrl(coachImg.image_url)} alt={coach.name || `Coach ${idx+1}`} fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" unoptimized />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-black/20">
                          <User className="w-12 h-12" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Aucune photo</span>
                        </div>
                      )}

                      {/* Overlay upload */}
                      <label className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-6 z-10 ${uploading ? 'pointer-events-none' : 'cursor-pointer'}`}>
                        <span className="bg-white/95 text-black px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#E13027] hover:text-white transition-colors flex items-center gap-2 pointer-events-none shadow-sm">
                          <Upload className="w-3.5 h-3.5" /> Changer la photo
                        </span>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; doUploadCoach(f, uploadId, coachImgKey); } }}
                          disabled={!!uploading} />
                      </label>

                      {/* Upload progress */}
                      {uploading === uploadId && (
                        <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center z-20 gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest">Envoi en cours...</span>
                        </div>
                      )}

                      {/* Numéro d'ordre */}
                      <div className="absolute top-3 left-3">
                        <span className="w-7 h-7 bg-[#E13027] text-white flex items-center justify-center text-[11px] font-black rounded-lg shadow-sm">{idx + 1}</span>
                      </div>

                      {/* Badge statut en haut à droite */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-sm ${coach.published ? 'bg-emerald-500 text-white' : 'bg-black/50 text-white/80'}`}>
                          {coach.published ? '● Publié' : '○ Brouillon'}
                        </span>
                      </div>
                    </div>

                    {/* Contenu */}
                    <CardContent className="flex flex-col gap-3 p-5 flex-1">
                      {/* Nom en gros */}
                      <div>
                        <Label className="text-[9px] uppercase tracking-widest text-black/30 mb-1 block">Nom</Label>
                        <Input
                          value={coach.name}
                          onChange={e => handleCoachInfoChange(coach.coach_key, 'name', e.target.value)}
                          className="text-sm font-semibold text-black bg-white h-9"
                          placeholder="Prénom Nom"
                        />
                      </div>

                      {/* Titre */}
                      <div>
                        <Label className="text-[9px] uppercase tracking-widest text-black/30 mb-1 block">Titre / Spécialité</Label>
                        <Input
                          value={coach.title}
                          onChange={e => handleCoachInfoChange(coach.coach_key, 'title', e.target.value)}
                          className="text-sm text-black bg-white h-9"
                          placeholder="Ex : Coach Expert · Musculation"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex-1">
                        <Label className="text-[9px] uppercase tracking-widest text-black/30 mb-1 block">Bio</Label>
                        <Textarea
                          value={coach.description ?? ''}
                          onChange={e => handleCoachInfoChange(coach.coach_key, 'description', e.target.value)}
                          className="text-sm resize-none text-black bg-white leading-relaxed"
                          rows={4}
                          placeholder="Présentation courte du coach ou de la praticienne…"
                        />
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-black/6 mt-auto">

                        {/* Toggle publié */}
                        <button
                          type="button"
                          onClick={() => toggleCoachPublished(coach.coach_key, !coach.published)}
                          className={`flex items-center justify-center gap-2 w-full h-8 rounded-lg text-[10px] font-sans font-semibold not-italic uppercase tracking-widest transition-all ${
                            coach.published
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-black/5 text-black/35 hover:bg-black/8 hover:text-black/55'
                          }`}
                          role="switch"
                          aria-checked={coach.published ?? false}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${coach.published ? 'bg-emerald-500' : 'bg-black/25'}`} />
                          {coach.published ? 'Publié' : 'Brouillon'}
                        </button>

                        {/* Actions */}
                        {isDeleting ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => deleteCoach(coach.coach_key)}
                              className="flex-1 flex items-center justify-center h-9 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] font-sans font-semibold not-italic uppercase tracking-widest transition-all"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCoach(null)}
                              className="flex-1 flex items-center justify-center h-9 rounded-lg border border-black/12 bg-white hover:bg-black/4 text-black/45 hover:text-black/65 text-[10px] font-sans font-semibold not-italic uppercase tracking-widest transition-all"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveCoachInfo(coach.coach_key)}
                              disabled={savingCoach === coach.coach_key}
                              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#0F0F0F] hover:bg-[#E13027] active:scale-95 disabled:opacity-50 disabled:pointer-events-none text-white text-[10px] font-sans font-semibold not-italic uppercase tracking-widest transition-all"
                            >
                              {savingCoach === coach.coach_key
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><Save className="w-3 h-3" />Sauvegarder</>
                              }
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCoach(coach.coach_key)}
                              className="flex items-center justify-center h-9 w-9 rounded-lg border border-black/10 text-black/25 hover:border-red-200 hover:text-red-400 hover:bg-red-50 active:scale-95 flex-shrink-0 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          </div>}
        </div>
      </div>
    </div>
  );
}
