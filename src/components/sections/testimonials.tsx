"use client";
// v2

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEnvironment } from '@/context/environment-context';

type ActivityCategory = 'LES MILLS' | 'HBX' | 'SIGNATURE Z FIT' | 'CARDIO' | 'RENFORCEMENT' | 'COMBAT' | 'CYCLING' | 'HIIT' | 'DANSE' | 'MOBILITÉ' | 'KIDS';
type FilterKey = 'TOUS' | ActivityCategory;

const FILTER_LABELS: Array<{ key: FilterKey; label: string }> = [
  { key: 'TOUS', label: 'Tous' },
  { key: 'LES MILLS', label: 'Les Mills™' },
  { key: 'HBX', label: 'HBX' },
  { key: 'SIGNATURE Z FIT', label: 'Signature Z Fit' },
  { key: 'CARDIO', label: 'Cardio' },
  { key: 'RENFORCEMENT', label: 'Renforcement' },
  { key: 'COMBAT', label: 'Combat' },
  { key: 'CYCLING', label: 'Cycling' },
  { key: 'HIIT', label: 'HIIT' },
  { key: 'DANSE', label: 'Danse' },
  { key: 'MOBILITÉ', label: 'Mobilité' },
  { key: 'KIDS', label: 'Kids' },
];

const initialActivityData: Array<{ name: string; meta: string; categories: ActivityCategory[]; description: string; image: string; key: string }> = [
  { name: "BODYATTACK™", meta: "Cardio • Les Mills • 45min", categories: ["LES MILLS", "CARDIO"], description: "Un entraînement athlétique à haute énergie conçu pour développer votre endurance et votre explosivité. BODYATTACK combine course, sauts, fentes et renforcement musculaire sur un rythme intense et motivant. Accessible mais exigeant, il repousse vos limites tout en améliorant votre condition physique globale.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139791596.png", key: "body_attack" },
  { name: "BODYCOMBAT™", meta: "Cardio & Combat • Les Mills • 45min", categories: ["LES MILLS", "CARDIO", "COMBAT"], description: "Un entraînement inspiré des arts martiaux, sans contact, qui combine coups de poing, coups de pied et mouvements dynamiques pour un travail complet du corps. Intense, libérateur et puissant, BODYCOMBAT développe force, coordination et explosivité.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772145631612.png", key: "body_combat" },
  { name: "BODYPUMP FORCE™", meta: "Renforcement • Les Mills • 45min", categories: ["LES MILLS", "RENFORCEMENT"], description: "BODYPUMP FORCE est un entraînement de musculation basé sur le tempo, conçu pour activer le moteur métabolique et développer de la masse musculaire maigre comme aucun autre programme. Inspiré des techniques traditionnelles de musculation, ce cours puissant repousse les limites de la force, favorise le développement musculaire et génère des gains de performance mesurables.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139757611.png", key: "body_pump_force" },
  { name: "BODYPUMP™", meta: "Renforcement • Les Mills • 45min", categories: ["LES MILLS", "RENFORCEMENT"], description: "Le cours collectif de musculation de référence. BODYPUMP utilise barres et poids pour développer l'endurance musculaire et sculpter l'ensemble du corps. Un travail structuré, efficace et scientifiquement éprouvé.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139757611.png", key: "body_pump" },
  { name: "RPM™", meta: "Cycling • Les Mills • 45min", categories: ["LES MILLS", "CARDIO", "CYCLING"], description: "Un entraînement indoor cycling immersif qui simule montées, sprints et parcours plats. Vous contrôlez l'intensité pour progresser à votre rythme. Faible impact articulaire, résultats élevés.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139737107.png", key: "rpm" },
  { name: "LES MILLS SPRINT™", meta: "HIIT Cycling • Les Mills • 30min", categories: ["LES MILLS", "CARDIO", "CYCLING", "HIIT"], description: "30 minutes d'intervalles à haute intensité sur vélo. Court, explosif, redoutablement efficace. Un entraînement basé sur le HIIT pour des résultats rapides avec un minimum d'impact articulaire.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772144712757.png", key: "sprint" },
  { name: "BODYFLOW™ FORCE", meta: "Mobilité & Renforcement • Les Mills • 45min", categories: ["LES MILLS", "MOBILITÉ"], description: "Une version plus dynamique axée sur le renforcement musculaire. Inspiré du yoga et du pilates, BODYFLOW Force développe stabilité, gainage et contrôle. Puissance maîtrisée. Mouvement précis.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", key: "body_flow_force" },
  { name: "BODYFLOW™ FLEXIBILITÉ", meta: "Mobilité & Souplesse • Les Mills • 45min", categories: ["LES MILLS", "MOBILITÉ"], description: "Une approche fluide centrée sur l'amplitude et la respiration. Idéal pour améliorer la mobilité, relâcher les tensions et favoriser l'équilibre. Souplesse. Alignement. Fluidité.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", key: "body_flow_flex" },
  { name: "HBX TRX", meta: "Renforcement & Suspension • HBX • 30min", categories: ["HBX", "RENFORCEMENT"], description: "Un travail en suspension qui sollicite l'ensemble des chaînes musculaires en profondeur. Intensité contrôlée, stabilité renforcée.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772144495092.png", key: "trx" },
  { name: "HBX BOXING", meta: "HIIT & Combat • HBX • 30min", categories: ["HBX", "COMBAT", "HIIT"], description: "Un entraînement fonctionnel inspiré de la boxe et des arts martiaux. Explosif, intense et structuré en intervalles courts. Puissance, coordination et endurance sont au cœur de chaque session.", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop", key: "boxing" },
  { name: "HBX FUSION", meta: "HIIT & Renforcement • HBX • 30min", categories: ["HBX", "RENFORCEMENT", "HIIT"], description: "Un mélange dynamique de cardio et de renforcement musculaire en intervalles courts et intenses. Performance, explosivité et dépassement.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139851539.png", key: "circuit_training" },
  { name: "CROSS TRAINING", meta: "HIIT & Full Body • Signature • 30min", categories: ["SIGNATURE Z FIT", "RENFORCEMENT", "HIIT"], description: "Un enchaînement fonctionnel mêlant cardio et renforcement musculaire en circuits courts. Intensité élevée, travail complet du corps. Puissance, endurance et mental.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772139981101.png", key: "cross_training" },
  { name: "FAC", meta: "Renforcement ciblé • Signature • 45min", categories: ["SIGNATURE Z FIT", "RENFORCEMENT"], description: "Un cours centré sur le travail des fessiers, abdos et cuisses. Idéal pour sculpter, tonifier et renforcer le bas du corps. Précision. Fermeté. Résultats visibles.", image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800&auto=format&fit=crop", key: "fac" },
  { name: "ABDOS FLASH", meta: "Core Training • Signature • 30min", categories: ["SIGNATURE Z FIT", "RENFORCEMENT"], description: "Une séance courte et intense dédiée au renforcement de la sangle abdominale. Travail profond, efficace et ciblé. Gainage. Stabilité. Contrôle.", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop", key: "abdo_flash" },
  { name: "PILATES", meta: "Mobilité & Posture • Signature • 45min", categories: ["SIGNATURE Z FIT", "MOBILITÉ"], description: "Un travail des muscles profonds et posturaux axé sur le contrôle et la respiration. Améliore l'équilibre et renforce la sangle abdominale. Alignement. Maîtrise. Fluidité.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", key: "pilates" },
  { name: "REFORMER PILATES", meta: "Renforcement & Précision • Signature • 45min", categories: ["SIGNATURE Z FIT", "MOBILITÉ"], description: "Un travail personnalisé sur machine Reformer. Résistance contrôlée et activation musculaire en profondeur. Précision. Intensité maîtrisée. Transformation durable.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop", key: "reformer_pilates" },
  { name: "STRETCHING", meta: "Mobilité & Récupération • Signature • 45min", categories: ["SIGNATURE Z FIT", "MOBILITÉ"], description: "Une séance guidée dédiée à l'amplitude et à la détente musculaire. Idéal pour relâcher les tensions et améliorer la souplesse. Relâchement. Mobilité. Équilibre.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772144941053.png", key: "stretching" },
  { name: "AQUAMINCEUR", meta: "Cardio & Tonification • Aquatique • 45min", categories: ["SIGNATURE Z FIT", "CARDIO"], description: "Un entraînement en milieu aquatique combinant résistance naturelle de l'eau et mouvements dynamiques. Tonification douce. Circulation stimulée. Impact réduit.", image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=800&auto=format&fit=crop", key: "aqua_minceur" },
  { name: "DJEMBEL", meta: "Cardio & Danse • Signature • 45min", categories: ["SIGNATURE Z FIT", "CARDIO", "DANSE"], description: "Une fusion rythmée mêlant danse afro et travail cardiovasculaire. Énergie collective et coordination au rendez-vous. Expression. Endurance. Vitalité.", image: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=800&auto=format&fit=crop", key: "djembel" },
  { name: "ZUM ZUM", meta: "Danse & Cardio • Signature • 45min", categories: ["SIGNATURE Z FIT", "CARDIO", "DANSE"], description: "Un cours dynamique sur des rythmes entraînants qui transforme l'entraînement en expérience festive. Mouvement. Énergie. Dépense calorique.", image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=800&auto=format&fit=crop", key: "dance_zum_zum" },
  { name: "KIDS BOXING", meta: "Boxe éducative • Kids • 45min", categories: ["SIGNATURE Z FIT", "COMBAT", "KIDS"], description: "Un cours ludique et encadré pour développer coordination, discipline et confiance en soi. Respect. Agilité. Maîtrise.", image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=800&auto=format&fit=crop", key: "kids_boxing" },
  { name: "KIDS CROSS", meta: "Parcours & Agilité • Kids • 45min", categories: ["SIGNATURE Z FIT", "KIDS"], description: "Un entraînement adapté aux enfants combinant jeux, coordination et renforcement global. Énergie. Esprit d'équipe. Développement physique.", image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/46df7e95-aa88-4028-8d8e-1e4e9c59c77d/image-1772145364502.png", key: "cross_kids" },
  { name: "BOOTCAMP", meta: "Full Body & Cardio • Signature • 45min", categories: ["SIGNATURE Z FIT", "RENFORCEMENT", "CARDIO", "HIIT"], description: "Un entraînement dynamique et complet, conçu pour repousser vos limites dans une ambiance motivante et conviviale.\n\nLe Bootcamp combine cardio, renforcement musculaire, endurance et exercices fonctionnels pour travailler l'ensemble du corps. Il peut être pratiqué en salle ou en extérieur, avec ou sans équipement, selon les objectifs et l'intensité recherchée. Encadré par nos coachs, chaque séance s'adapte à votre niveau tout en vous aidant à améliorer votre condition physique, votre énergie et votre confiance en vous.\n\nIdéal pour celles et ceux qui recherchent un challenge sportif efficace, stimulant et accessible.", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop", key: "bootcamp" },
  { name: "RANDONNÉE", meta: "Nature & Endurance • Signature • Variable", categories: ["SIGNATURE Z FIT", "CARDIO"], description: "Une parenthèse de bien-être entre nature et mouvement.\n\nNos randonnées sont pensées comme une expérience alliant activité physique douce, découverte et déconnexion. Elles permettent de travailler l'endurance, la respiration et le tonus musculaire tout en profitant d'un cadre apaisant et ressourçant.\n\nAccessible à différents niveaux, la randonnée est également idéale pour créer une véritable communauté, favoriser les échanges et partager des moments authentiques en groupe, dans une atmosphère conviviale et inspirante.", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800&auto=format&fit=crop", key: "randonnee" },
];

const TestimonialsSection = ({ initialImages, envImages }: { initialImages?: Record<string, { url: string, type: string }>; envImages?: Record<string, { url: string; type: string }> }) => {
  const { environment } = useEnvironment();
  const isSpa = environment === 'spa';
  const spaBg = '#F4EBD9';
  const spaText = '#1C1108';
  const [activities, setActivities] = useState(() => {
    if (initialImages) {
      return initialActivityData.map(activity => {
        const update = initialImages[activity.key];
        if (update?.url) return { ...activity, image: update.url };
        return activity;
      });
    }
    return initialActivityData;
  });

  // Mise à jour depuis les images per-environnement
  useEffect(() => {
    if (!envImages) return;
    setActivities(prev => prev.map(activity => {
      const update = envImages[activity.key];
      return update?.url ? { ...activity, image: update.url } : activity;
    }));
  }, [envImages]);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('TOUS');
  const [current, setCurrent] = useState(0);

  const filteredActivities = activeFilter === 'TOUS'
    ? activities
    : activities.filter(a => a.categories.includes(activeFilter as ActivityCategory));

  const total = filteredActivities.length;

  // drag (desktop)
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const velX = useRef(0);
  const lastX = useRef(0);
  const rafRef = useRef<number | null>(null); // momentum RAF

  // auto-scroll
  const autoRafRef = useRef<number | null>(null);
  const interactionEndTime = useRef(0); // Date.now() — auto-scroll paused until this

  // Reset on filter change
  useEffect(() => {
    setCurrent(0);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [activeFilter]);

  // Auto-scroll — starts only once the track is in the viewport
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tick = () => {
      if (Date.now() >= interactionEndTime.current) {
        // Cancel any lingering momentum before taking control
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          el.scrollLeft = el.scrollLeft >= max - 1 ? 0 : el.scrollLeft + 0.5;
        }
      }
      autoRafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          autoRafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      const snap = await getDocs(query(collection(db, 'site_images'), where('section', '==', 'activities')));
      if (!snap.empty) {
        setActivities(prev => prev.map(activity => {
          const d = snap.docs.find(doc => doc.id === activity.key);
          return d ? { ...activity, image: d.data().image_url } : activity;
        }));
      }
    };
    fetchActivities();
  }, []);

  const prev = () => {
    const el = trackRef.current;
    if (!el) return;
    interactionEndTime.current = Date.now() + 2000;
    const cardW = el.scrollWidth / filteredActivities.length;
    const newIdx = Math.max(0, current - 1);
    setCurrent(newIdx);
    el.scrollTo({ left: newIdx * cardW, behavior: 'smooth' });
  };
  const next = () => {
    const el = trackRef.current;
    if (!el) return;
    interactionEndTime.current = Date.now() + 2000;
    const cardW = el.scrollWidth / filteredActivities.length;
    const newIdx = Math.min(total - 1, current + 1);
    setCurrent(newIdx);
    el.scrollTo({ left: newIdx * cardW, behavior: 'smooth' });
  };

  // Momentum scroll (desktop drag release)
  const applyMomentum = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    velX.current *= 0.88;
    if (Math.abs(velX.current) < 0.5) {
      // Momentum ended — resume auto-scroll after 2s
      interactionEndTime.current = Date.now() + 2000;
      return;
    }
    el.scrollLeft -= velX.current; // continue in same direction as drag
    rafRef.current = requestAnimationFrame(applyMomentum);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.pageX;
    velX.current = 0;
    interactionEndTime.current = Date.now() + 999999; // pause auto-scroll while dragging
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.pageX - lastX.current;
    el.scrollLeft -= dx;
    velX.current = dx; // per-frame delta for momentum
    lastX.current = e.pageX;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    // interactionEndTime is set when momentum ends (in applyMomentum)
    rafRef.current = requestAnimationFrame(applyMomentum);
  };

  // Touch: let native browser scroll handle horizontal swipe, just pause/resume auto-scroll
  const onTouchStart = () => {
    interactionEndTime.current = Date.now() + 999999; // pause while finger is down
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const onTouchEnd = () => {
    interactionEndTime.current = Date.now() + 2000; // resume 2s after lift
  };

  // ── SPA VERSION ─────────────────────────────────────────────────────────────
  if (isSpa) {
    const SOINS = [
      {
        num: '01',
        title: 'VISAGE',
        subtitle: 'Expertise et rituels du soin',
        description: "Des soins visage d'exception signés Gemology — formules haute performance aux actifs précieux pour régénérer, corriger et révéler l'éclat naturel de votre peau.",
        items: [
          { name: 'Soin éclat', desc: "Révèle la luminosité naturelle par des actifs gemmes précieuses." },
          { name: 'Soin anti-âge', desc: "Repulpe et lisse en profondeur avec des complexes régénérants d'exception." },
          { name: 'Soin purifiant', desc: "Détoxifie et resserre les pores pour un teint net et raffiné." },
          { name: 'Soin hydratation profonde', desc: "Restaure le capital hydrique et assouplit durablement l'épiderme." },
        ],
        href: '/carte-soins#visage',
        imgKey: 'soin_visage',
        imgDefault: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800',
      },
      {
        num: '02',
        title: 'CORPS',
        subtitle: 'Rituels & exfoliation',
        description: "Des rituels corps enveloppants, alliant gommages exfoliants, enveloppements minéraux et massages sculptants pour une peau régénérée et une silhouette sublimée.",
        items: [
          { name: 'Gommage signature', desc: "Exfolie en douceur et prépare la peau à absorber tous les bienfaits." },
          { name: 'Enveloppement', desc: "Un cocon minéral qui nourrit, draîne et restructure les tissus." },
          { name: 'Soin corps nourrissant', desc: "Fond dans la peau pour une souplesse soyeuse et durable." },
          { name: 'Rituel corps complet', desc: "Un parcours sensoriel de la tête aux pieds, corps et âme régénérés." },
        ],
        href: '/carte-soins#corps',
        imgKey: 'soin_corps',
        imgDefault: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800',
      },
      {
        num: '03',
        title: 'MASSAGES',
        subtitle: 'Détente & récupération',
        description: "Des massages d'excellence aux techniques du monde entier — de la détente profonde à la récupération musculaire — pour libérer les tensions et restaurer l'harmonie corps-esprit.",
        items: [
          { name: 'Massage relaxant', desc: "Libère les tensions par des effleurages profonds aux huiles essentielles rares." },
          { name: 'Massage aux pierres précieuses', desc: "Chaleur thérapeutique et énergie minérale pour une détente absolue." },
          { name: 'Massage duo', desc: "Une expérience partagée, synchronisée par deux praticiens d'excellence." },
          { name: 'Massage sur mesure', desc: "Protocole personnalisé selon vos besoins, entièrement dédié à votre bien-être." },
        ],
        href: '/carte-soins#massages',
        imgKey: 'soin_massages',
        imgDefault: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800',
      },
    ];

    return (
      <section id="nos-cours" className="relative overflow-hidden flex flex-col" style={{ backgroundColor: spaBg, minHeight: '100vh' }}>

        {/* Header */}
        <div className="px-6 md:px-16 pt-10 pb-6 flex items-end justify-between">
          <div>
            <motion.p
              className="text-[10px] uppercase tracking-[0.35em] font-medium mb-3"
              style={{ color: '#C4A87A' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Le Spa by Z Fit
            </motion.p>
            <motion.h2
              className="text-[36px] md:text-[48px] lg:text-[56px] font-[900] uppercase leading-none tracking-[-0.03em]"
              style={{ fontFamily: 'Georgia, serif', color: spaText }}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              NOS SOINS
            </motion.h2>
          </div>
          <motion.p
            className="hidden md:block text-[12px] font-light leading-[1.8] max-w-[280px] text-right"
            style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.5)' }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Expertise et rituels du soin
          </motion.p>
        </div>

        {/* Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 flex-1"
          style={{ borderTop: '1px solid rgba(28,17,8,0.1)' }}
        >
          {SOINS.map((cat, idx) => (
            <motion.a
              key={cat.num}
              href={cat.href}
              className="group flex flex-col px-8 md:px-10 py-8 md:py-10 transition-colors duration-500 cursor-pointer"
              style={{
                borderLeft: idx > 0 ? '1px solid rgba(28,17,8,0.1)' : 'none',
                borderBottom: '1px solid rgba(28,17,8,0.1)',
                textDecoration: 'none',
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Number */}
              <span
                className="text-[11px] font-bold tracking-[0.3em] mb-3 transition-colors duration-300 group-hover:text-[#C4A87A]"
                style={{ color: 'rgba(28,17,8,0.3)' }}
              >
                {cat.num}
              </span>

              {/* Title */}
              <h3
                className="text-[26px] md:text-[32px] font-[900] uppercase leading-none tracking-[-0.02em] mb-2 transition-colors duration-300"
                style={{ fontFamily: 'Georgia, serif', color: spaText }}
              >
                {cat.title}
              </h3>

              {/* Subtitle */}
              <p
                className="text-[11px] uppercase tracking-[0.22em] font-medium mb-3 transition-colors duration-300 group-hover:text-[#C4A87A]"
                style={{ color: '#C4A87A' }}
              >
                {cat.subtitle}
              </p>

              {/* Divider */}
              <div className="w-8 h-px mb-3 transition-all duration-500 group-hover:w-16" style={{ backgroundColor: '#C4A87A' }} />

              {/* Image */}
              <div className="relative w-full mb-4 overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <Image
                  src={envImages?.[cat.imgKey]?.url || cat.imgDefault}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="33vw"
                  unoptimized
                />
              </div>

              {/* Description */}
              <p
                className="text-[12px] font-light leading-[1.7] mb-4"
                style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.65)' }}
              >
                {cat.description}
              </p>

              {/* Inclut */}
              <div className="mt-auto">
                <p
                  className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-2"
                  style={{ color: 'rgba(28,17,8,0.4)' }}
                >
                  Inclut
                </p>
                <ul className="space-y-2">
                  {cat.items.map((item: { name: string; desc: string }) => (
                    <li key={item.name} className="flex items-start gap-3">
                      <span className="w-1 h-1 rounded-full flex-shrink-0 mt-[6px]" style={{ backgroundColor: '#C4A87A' }} />
                      <div>
                        <span
                          className="text-[12px] font-medium block"
                          style={{ fontFamily: 'Georgia, serif', color: 'rgba(28,17,8,0.85)' }}
                        >
                          {item.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA arrow */}
              <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(28,17,8,0.08)' }}>
                <span
                  className="text-[10px] uppercase tracking-[0.28em] font-medium transition-colors duration-300 group-hover:text-[#C4A87A]"
                  style={{ color: 'rgba(28,17,8,0.4)' }}
                >
                  Cartes des soins
                </span>
                <span
                  className="w-7 h-7 flex items-center justify-center border transition-all duration-300 group-hover:border-[#C4A87A] group-hover:bg-[#C4A87A]"
                  style={{ borderColor: 'rgba(28,17,8,0.15)', color: spaText }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    );
  }

  // ── FITNESS VERSION ──────────────────────────────────────────────────────────
  return (
    <section id="nos-cours" className="relative py-16 overflow-hidden" style={{ backgroundColor: '#000' }}>
      {/* Header */}
      <div className="px-6 md:px-16 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <motion.h2
            className="text-[28px] md:text-[42px] lg:text-[52px] font-[900] leading-none tracking-[-0.02em] uppercase mb-4"
            style={{ fontFamily: 'Georgia, serif', color: isSpa ? spaText : '#FFFFFF' }}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            NOS COURS<br />Z FIT
          </motion.h2>
          <motion.p
            className="text-[13px] md:text-[15px] font-light leading-[1.8] max-w-[520px]"
            style={{ color: isSpa ? 'rgba(28,17,8,0.65)' : '#FFFFFF' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            Pensés pour tous les niveaux, nos cours s&apos;adaptent à votre condition physique et à vos objectifs. Intensité modulable, accompagnement précis et énergie collective : chaque séance vous permet de progresser à votre rythme.
          </motion.p>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] tracking-[0.2em] font-light" style={{ fontFamily: 'Georgia, serif', color: isSpa ? spaText : '#FFFFFF' }}>
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            onClick={prev}
            disabled={current === 0}
            aria-label="Précédent"
            className="w-10 h-10 flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.2)' : 'rgba(255,255,255,0.2)'}`, color: isSpa ? spaText : '#FFFFFF' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            aria-label="Suivant"
            className="w-10 h-10 flex items-center justify-center transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ border: `1px solid ${isSpa ? 'rgba(28,17,8,0.2)' : 'rgba(255,255,255,0.2)'}`, color: isSpa ? spaText : '#FFFFFF' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <motion.div
        className="flex gap-0 overflow-x-auto px-6 md:px-16 mb-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {FILTER_LABELS.map(({ key, label }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className="relative flex-shrink-0 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium px-4 py-3 transition-colors duration-300 whitespace-nowrap"
              style={{
                color: isActive
                  ? '#E13027'
                  : isSpa ? 'rgba(28,17,8,0.45)' : 'rgba(255,255,255,0.45)',
                borderBottom: `1px solid ${isSpa ? 'rgba(28,17,8,0.1)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="filter-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E13027]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Cards track */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
      <div
        ref={trackRef}
        className="flex gap-4 md:gap-6 overflow-x-auto cursor-grab active:cursor-grabbing select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        {/* Left padding */}
        <div className="flex-shrink-0 w-6 md:w-16" />

        {filteredActivities.map((activity, i) => (
          <div
            key={`${activity.key}-${i}`}
            className="flex-shrink-0 group"
            style={{ width: 'clamp(220px, 24vw, 360px)', marginTop: i % 2 === 0 ? '0px' : '60px' }}
          >
            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image
                src={activity.image}
                alt={activity.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 220px, 360px"
                unoptimized
                draggable={false}
              />
              {!isSpa && <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.50) 0%, transparent 60%)' }} />}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'rgba(180,20,10,0.38)' }} />
              <div className="absolute top-5 left-5">
                <span className="text-white text-[11px] font-light tracking-[0.2em]" style={{ fontFamily: 'Georgia, serif' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="pt-5 pb-10 pr-6" style={{ borderTop: `1px solid ${isSpa ? 'rgba(28,17,8,0.1)' : 'rgba(255,255,255,0.1)'}` }}>
              <h3
                className="text-[14px] md:text-[16px] font-[700] uppercase tracking-[0.08em] leading-tight mb-1"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? spaText : '#FFFFFF' }}
              >
                {activity.name}
              </h3>
              <p
                className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] mb-3"
                style={{ color: '#E13027' }}
              >
                {activity.meta}
              </p>
              <p
                className="text-[12px] md:text-[13px] font-light leading-relaxed"
                style={{ fontFamily: 'Georgia, serif', color: isSpa ? 'rgba(28,17,8,0.65)' : '#FFFFFF' }}
              >
                {activity.description}
              </p>
            </div>
          </div>
        ))}

        {/* Right padding */}
        <div className="flex-shrink-0 w-6 md:w-16" />
      </div>
      </motion.div>

      {/* Progress bar + bouton planning */}
      <div className="px-6 md:px-16 mt-8 flex items-center justify-between gap-6">
        <div className="flex-1 h-px" style={{ backgroundColor: isSpa ? 'rgba(28,17,8,0.1)' : 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-px transition-all duration-500 ease-out"
            style={{ width: `${total > 0 ? ((current + 1) / total) * 100 : 0}%`, backgroundColor: isSpa ? 'rgba(28,17,8,0.4)' : 'rgba(255,255,255,0.5)' }}
          />
        </div>
        <a
          href="/programme"
          className="flex-shrink-0 flex items-center gap-3 group"
        >
          <span
            className="text-[10px] uppercase tracking-[0.28em] font-medium transition-colors duration-300 group-hover:text-[#E13027]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            Planning des cours
          </span>
          <span
            className="w-8 h-8 flex items-center justify-center border transition-all duration-300 group-hover:border-[#E13027] group-hover:bg-[#E13027]"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
};

export default TestimonialsSection;
