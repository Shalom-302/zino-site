'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Loader2, Check, X, RefreshCcw, Calendar, Phone, Mail,
  MessageSquare, Scissors, Pencil, Trash2, FileSpreadsheet,
  Dumbbell, Sparkles, Gift, Clock, List, CalendarDays,
  ChevronLeft, ChevronRight, Plus, UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendRescheduleEmail, sendApprovalEmail, sendRefusalEmail, createAdminReservation, sendGiftCardEmail } from '@/app/actions/send-email';
import * as XLSX from 'xlsx';

interface Reservation {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type: string;
  soin: string;
  date_reservation: string;
  heure: string;
  message: string;
  status: 'pending' | 'approved' | 'refused';
  created_at: string;
}

const STATUS_CONFIG = {
  pending:  { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400' },
  approved: { label: 'Approuvée',  color: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500' },
  refused:  { label: 'Annulée',    color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-500'   },
};

const TYPE_CONFIG: Record<string, {
  label: string; shortLabel: string; color: string; bg: string; border: string; dot: string; icon: React.ReactNode;
}> = {
  fitness: {
    label: 'Fitness', shortLabel: 'FIT', color: 'text-[#E13027]', bg: 'bg-[#E13027]/8',
    border: 'border-[#E13027]', dot: 'bg-[#E13027]', icon: <Dumbbell className="w-3 h-3" />,
  },
  spa: {
    label: 'Spa', shortLabel: 'SPA', color: 'text-[#4B7BEC]', bg: 'bg-[#4B7BEC]/8',
    border: 'border-[#4B7BEC]', dot: 'bg-[#4B7BEC]', icon: <Sparkles className="w-3 h-3" />,
  },
  carte_cadeaux: {
    label: 'Carte Cadeau', shortLabel: 'GIFT', color: 'text-[#9B59B6]', bg: 'bg-[#9B59B6]/8',
    border: 'border-[#9B59B6]', dot: 'bg-[#9B59B6]', icon: <Gift className="w-3 h-3" />,
  },
};

const getType = (t: string) => TYPE_CONFIG[t] ?? {
  label: t, shortLabel: t.slice(0, 3).toUpperCase(),
  color: 'text-black/50', bg: 'bg-black/5', border: 'border-black/20', dot: 'bg-black/30', icon: null,
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente', approved: 'Approuvée', refused: 'Annulée',
};

const TYPE_FILTERS = [
  { key: 'all',           label: 'Tous' },
  { key: 'fitness',       label: 'Fitness',     icon: <Dumbbell className="w-3 h-3" /> },
  { key: 'spa',           label: 'Spa',          icon: <Sparkles className="w-3 h-3" /> },
  { key: 'carte_cadeaux', label: 'Carte Cadeau', icon: <Gift className="w-3 h-3" /> },
];

const STATUS_FILTERS = [
  { key: 'all',      label: 'Tous statuts' },
  { key: 'pending',  label: 'En attente' },
  { key: 'approved', label: 'Approuvées' },
  { key: 'refused',  label: 'Annulées' },
];

const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const SPA_SOINS: { group: string; items: string[] }[] = [
  { group: 'Soins Visage', items: [
    "Soin Minéral Hydratant — Peaux Sèches",
    "Soin d'Équilibre Purifiant — Peaux Mixtes",
    "Soin Apaisant — Peaux Sensibles",
    "Soin Régénérant — Peaux Matures",
    "Soin Bio Éclat Ambre Bleue — Toutes Peaux",
    "Soin Éclat Diamant Masque Gel",
    "Soin d'Équilibre Améthyste — Peaux Mixtes",
    "Soin Apaisant Smithsonite — Peaux Sensibles",
    "Soin Lumière Perle & Diamant Éclaircissant",
    "Soin Anti-Rides Écrin Diamant",
    "Soin Écrin Perle Blanche Anti-Tâches",
    "Soin Diamant & Collagène — Masque Prestige",
  ]},
  { group: 'Hammam', items: [
    "Hammam Origine", "Hammam Bien-Être", "Hammam Royal",
  ]},
  { group: 'Gommages', items: [
    "Gommage aux Sels et Huiles Précieuses",
    "Gommage Ayurvédique aux Noyaux d'Abricot",
    "Gommage Lulur — Rituel de Bali",
    "Gommage aux Sels de Péridot — Relaxant",
    "Gommage aux Sels de Rubis — Anti-Âge",
    "Gommage aux Sels de Saphir — Amincissant",
    "Gommage à la Perle — Adoucissant",
    "Gommage à l'Éclat de Mangue — Énergisant",
  ]},
  { group: 'Massages', items: [
    "Massage Balinais (50min)", "Massage Balinais (80min)",
    "Massage Ayurvédique (50min)", "Massage Ayurvédique (80min)",
    "Massage Oriental (50min)", "Massage Oriental (80min)",
    "Foot Massage Réflexologique", "Radiance Visage",
    "Massage du Dos", "Destress Massage des Jambes",
    "Massage Visage Énergétique — Cristal & Jade",
    "Massage Corps — Quartz Rose & Jade",
    "Signature Détente à l'Orientale",
  ]},
  { group: 'Épilation', items: [
    "Épilation Bras", "Épilation Demi Jambes / Cuisse",
    "Épilation Jambes Entières", "Épilation Maillot Intégral",
    "Épilation Maillot Brésilien", "Épilation Aisselles",
    "Épilation Visage Complet", "Épilation Sourcils",
    "Épilation Lèvres / Duvet / Menton", "Épilation Dos / Ventre",
    "Forfait Jambes + Maillot Brésilien + Aisselles",
  ]},
  { group: 'Forfaits & Rituels', items: [
    "Journée Escale Balinaise (2H)",
    "Journée Voyage Ayurvédique (2H30)",
    "Journée Détente à l'Orientale (3H)",
    "Rituel Minéral du Volcan Rotorua (1H15)",
    "Rituel Détoxifiant Thé & Cacao (1H15)",
    "Rituel Minéral Anti-Âge Rose Grenat (1H15)",
    "Rituel Tonifiant Menthe & Prêle (1H15)",
  ]},
];

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function ReservationsPage() {
  const [reservations, setReservations]   = useState<Reservation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [typeFilter, setTypeFilter]       = useState<string>('all');
  const [statusFilter, setStatusFilter]   = useState<string>('all');
  const [selected, setSelected]           = useState<Reservation | null>(null);
  const [updating, setUpdating]           = useState<string | null>(null);
  const [editMode, setEditMode]           = useState(false);
  const [editDate, setEditDate]           = useState('');
  const [editTime, setEditTime]           = useState('');
  const [rescheduling, setRescheduling]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [viewMode, setViewMode]           = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDay, setCalendarDay]     = useState<string | null>(null);
  const [showNewModal, setShowNewModal]   = useState(false);
  const [newForm, setNewForm]             = useState({
    prenom: '', nom: '', email: '', telephone: '', type: 'fitness',
    soin: '', date_reservation: '', heure: '', message: '', status: 'approved' as 'pending' | 'approved',
    beneficiairePrenom: '', beneficiaireNom: '',
  });
  const [creating, setCreating]           = useState(false);
  const [soinOpen, setSoinOpen]           = useState(false);
  const soinRef                           = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const todayStr = toDateStr(new Date());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/td-chef/login'); return; }
      fetchReservations();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/td-chef/login');
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data: snap, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReservations((snap || []) as Reservation[]);
    } catch (e: any) { toast.error('Erreur: ' + e.message); }
    setLoading(false);
  };

  useEffect(() => { setEditMode(false); setConfirmDelete(false); }, [selected?.id]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (soinRef.current && !soinRef.current.contains(e.target as Node)) setSoinOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleReschedule = async () => {
    if (!selected || !editDate || !editTime) return;
    setRescheduling(true);
    try {
      const { error: updErr } = await supabase.from('reservations').update({
        date_reservation: editDate,
        heure: editTime,
      });
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
      setRescheduling(false);
      return;
    }
    setReservations(prev => prev.map(r => r.id === selected.id ? { ...r, date_reservation: editDate, heure: editTime } : r));
    setSelected(prev => prev ? { ...prev, date_reservation: editDate, heure: editTime } : null);
    setEditMode(false);
    // Send notification email (best-effort — doesn't block the save)
    sendRescheduleEmail({
      id: selected.id, nom: selected.nom, prenom: selected.prenom, email: selected.email,
      soin: selected.soin, type: selected.type, newDate: editDate, newTime: editTime,
    }).then(result => {
      toast.success(result.success ? 'Créneau modifié — email envoyé au client' : 'Créneau modifié');
      if (!result.success) toast.error('Email non envoyé: ' + result.error);
    });
    setRescheduling(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'refused') => {
    setUpdating(id);
    try {
      await supabase.from('reservations').update({ status }).eq('id', id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
      const reservation = reservations.find(r => r.id === id);
      if (status === 'approved' && reservation?.email) {
        const res = await sendApprovalEmail({ nom: reservation.nom, prenom: reservation.prenom, email: reservation.email, soin: reservation.soin, type: reservation.type, date: reservation.date_reservation, heure: reservation.heure });
        toast.success(res.success ? 'Réservation approuvée — email envoyé' : 'Réservation approuvée');
        if (!res.success) toast.error('Email non envoyé: ' + res.error);
      } else if (status === 'refused' && reservation?.email) {
        const res = await sendRefusalEmail({ nom: reservation.nom, prenom: reservation.prenom, email: reservation.email, soin: reservation.soin, type: reservation.type });
        toast.success(res.success ? 'Réservation refusée — email envoyé' : 'Réservation refusée');
        if (!res.success) toast.error('Email non envoyé: ' + res.error);
      } else {
        toast.success(status === 'approved' ? 'Réservation approuvée' : 'Réservation refusée');
      }
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
    setUpdating(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await supabase.from('reservations').delete().eq('id', selected.id);
      toast.success('Réservation supprimée');
      setReservations(prev => prev.filter(r => r.id !== selected.id));
      setSelected(null);
    } catch (error: any) { toast.error('Erreur: ' + error.message); }
    setDeleting(false);
    setConfirmDelete(false);
  };

  const resetNewForm = () => setNewForm({
    prenom: '', nom: '', email: '', telephone: '', type: 'fitness',
    soin: '', date_reservation: '', heure: '', message: '', status: 'approved',
    beneficiairePrenom: '', beneficiaireNom: '',
  });

  const handleCreate = async () => {
    if (newForm.type === 'carte_cadeaux') {
      if (!newForm.prenom || !newForm.nom || !newForm.telephone) {
        toast.error("Prénom, Nom et Téléphone de l'offrant sont obligatoires");
        return;
      }
      if (!newForm.beneficiairePrenom || !newForm.beneficiaireNom) {
        toast.error('Prénom et Nom du bénéficiaire sont obligatoires');
        return;
      }
      setCreating(true);
      const res = await sendGiftCardEmail({
        offrantPrenom: newForm.prenom,
        offrantNom:    newForm.nom,
        offrantPhone:  newForm.telephone,
        offrantEmail:  newForm.email,
        beneficiairePrenom: newForm.beneficiairePrenom,
        beneficiaireNom:    newForm.beneficiaireNom,
        soin:    newForm.soin,
        message: newForm.message || undefined,
      });
      if (!res.success) {
        toast.error('Erreur: ' + res.error);
      } else {
        toast.success(newForm.email
          ? 'Carte cadeau créée — email de confirmation envoyé'
          : 'Carte cadeau créée');
        setShowNewModal(false);
        resetNewForm();
        fetchReservations();
      }
    } else {
      if (!newForm.prenom || !newForm.nom || !newForm.telephone) {
        toast.error('Prénom, Nom et Téléphone sont obligatoires');
        return;
      }
      setCreating(true);
      const res = await createAdminReservation({
        prenom: newForm.prenom, nom: newForm.nom, email: newForm.email,
        telephone: newForm.telephone, type: newForm.type, soin: newForm.soin,
        date_reservation: newForm.date_reservation, heure: newForm.heure,
        message: newForm.message, status: newForm.status,
      });
      if (!res.success) {
        toast.error('Erreur: ' + res.error);
      } else {
        toast.success(res.emailSent
          ? 'Réservation créée — email de confirmation envoyé au client'
          : 'Réservation créée');
        if (res.emailError) toast.error('Email non envoyé: ' + res.emailError);
        setShowNewModal(false);
        resetNewForm();
        fetchReservations();
      }
    }
    setCreating(false);
  };

  const exportToExcel = () => {
    const data = filtered.map(r => ({
      'Prénom': r.prenom, 'Nom': r.nom, 'Email': r.email || '—', 'Téléphone': r.telephone,
      'Type': getType(r.type).label, 'Soin': r.soin || '—',
      'Date souhaitée': r.date_reservation ? new Date(r.date_reservation).toLocaleDateString('fr-FR') : '—',
      'Heure': r.heure || '—', 'Statut': STATUS_LABELS[r.status] || r.status, 'Note': r.message || '',
      'Créé le': new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 14 },{ wch: 14 },{ wch: 28 },{ wch: 18 },{ wch: 14 },{ wch: 35 },{ wch: 15 },{ wch: 8 },{ wch: 12 },{ wch: 30 },{ wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Réservations');
    XLSX.writeFile(wb, `reservations-${typeFilter}-${statusFilter}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Export Excel téléchargé (${data.length} ligne${data.length > 1 ? 's' : ''})`);
  };

  const filtered = reservations
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => statusFilter === 'all' || r.status === statusFilter);

  const typeCounts = {
    all:           reservations.length,
    fitness:       reservations.filter(r => r.type === 'fitness').length,
    spa:           reservations.filter(r => r.type === 'spa').length,
    carte_cadeaux: reservations.filter(r => r.type === 'carte_cadeaux').length,
  };

  const statusCounts = {
    all:      filtered.length,
    pending:  filtered.filter(r => r.status === 'pending').length,
    approved: filtered.filter(r => r.status === 'approved').length,
    refused:  filtered.filter(r => r.status === 'refused').length,
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const formatDateTime = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const calendarReservations = useMemo(
    () => typeFilter === 'all' ? reservations : reservations.filter(r => r.type === typeFilter),
    [reservations, typeFilter],
  );

  const reservationsByDay = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    calendarReservations.forEach(r => {
      if (r.date_reservation) {
        const key = r.date_reservation.slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(r);
      }
    });
    return map;
  }, [calendarReservations]);

  const calendarDays = useMemo(() => {
    const year  = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1; // Monday = 0
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    const remaining = Math.max(0, 42 - days.length);
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
    return days;
  }, [calendarMonth]);

  const calendarRows = calendarDays.length / 7; // always 6

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
    </div>
  );

  // ── Detail panel (shared between list & calendar) ─────────────────────────
  const renderDetailPanel = (selected: Reservation) => {
    const tc = getType(selected.type);
    const sc = STATUS_CONFIG[selected.status];
    return (
      <motion.aside
        key={selected.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="w-72 shrink-0 border border-black/10 bg-white overflow-y-auto flex flex-col">

        <div className={`h-1 w-full ${tc.dot}`} />

        <div className="p-5 border-b border-black/8 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 border ${tc.bg} ${tc.color} ${tc.border}`}>
                {tc.icon} {tc.label}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 border ${sc.color}`}>
                {sc.label}
              </span>
            </div>
            <p className="text-sm font-black uppercase tracking-wide text-[#0F0F0F]">{selected.prenom} {selected.nom}</p>
            <p className="text-[10px] text-black/40 mt-0.5">{formatDateTime(selected.created_at)}</p>
          </div>
          <button onClick={() => setSelected(null)} className="text-black/30 hover:text-black transition-colors mt-0.5 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm flex-1">
          <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={selected.telephone} />
          <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selected.email || '—'} />
          {selected.soin && <InfoRow icon={<Scissors className="w-3.5 h-3.5" />} label="Soin demandé" value={selected.soin} />}

          {/* Créneau */}
          <div className="border border-black/8 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-black/30 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Créneau
              </p>
              {!editMode && (
                <button onClick={() => { setEditDate(selected.date_reservation?.slice(0, 10) || ''); setEditTime(selected.heure || ''); setEditMode(true); }}
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${tc.color} hover:opacity-70 transition-opacity`}>
                  <Pencil className="w-3 h-3" /> Modifier
                </button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-2">
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                  className="w-full border border-black/15 px-3 py-2 text-xs text-[#0F0F0F] focus:outline-none focus:border-black/40 bg-white" />
                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                  className="w-full border border-black/15 px-3 py-2 text-xs text-[#0F0F0F] focus:outline-none focus:border-black/40 bg-white" />
                <div className="flex gap-2 pt-1">
                  <button onClick={handleReschedule} disabled={rescheduling || !editDate || !editTime}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-white text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50 ${tc.dot} hover:opacity-90`}>
                    {rescheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    Enregistrer
                  </button>
                  <button onClick={() => setEditMode(false)}
                    className="px-3 py-2 border border-black/15 text-[10px] font-bold uppercase tracking-wider text-black/40 hover:text-black hover:border-black/40 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#0F0F0F] font-medium">
                {formatDate(selected.date_reservation)} à {selected.heure || '—'}
              </p>
            )}
          </div>

          {selected.message && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Note
              </p>
              <p className="text-xs text-black/60 bg-black/[0.03] p-3 border border-black/8 leading-relaxed">{selected.message}</p>
            </div>
          )}

          {/* Actions statut */}
          <div className="space-y-2 pt-1">
            {selected.status !== 'approved' && (
              <button onClick={() => updateStatus(selected.id, 'approved')} disabled={!!updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                {updating === selected.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Approuver
              </button>
            )}
            {selected.status !== 'refused' && (
              <button onClick={() => updateStatus(selected.id, 'refused')} disabled={!!updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-400 text-red-500 hover:bg-red-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                <X className="w-4 h-4" /> Annuler
              </button>
            )}
          </div>

          {/* Suppression */}
          <div className="pt-2 border-t border-black/8">
            {confirmDelete ? (
              <div className="space-y-2">
                <p className="text-[11px] text-black/50 text-center">Supprimer définitivement ?</p>
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50">
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Confirmer
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 border border-black/15 text-[10px] font-bold uppercase tracking-wider text-black/40 hover:text-black transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-black/10 text-black/30 hover:border-red-400 hover:text-red-500 text-[11px] font-bold uppercase tracking-widest transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    );
  };

  // ── Day reservations panel ────────────────────────────────────────────────
  const renderDayPanel = (day: string) => {
    const dayRes = reservationsByDay[day] || [];
    return (
      <motion.div
        key={`day-${day}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="w-72 shrink-0 border border-black/10 bg-white overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="p-4 border-b border-black/8 flex items-start justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-0.5">Réservations du</p>
            <p className="text-sm font-black text-[#0F0F0F]">{formatDate(day)}</p>
            <p className="text-[10px] text-black/40 mt-0.5">
              {dayRes.length} réservation{dayRes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setCalendarDay(null)} className="text-black/30 hover:text-black transition-colors mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {dayRes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-black/30">
              <Scissors className="w-6 h-6 mb-1.5" />
              <p className="text-xs font-medium">Aucune réservation</p>
            </div>
          ) : (
            dayRes.map(r => {
              const tc = getType(r.type);
              const sc = STATUS_CONFIG[r.status];
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="w-full text-left border-b border-black/8 hover:bg-black/[0.02] transition-colors flex items-stretch overflow-hidden">
                  <div className={`w-1 shrink-0 self-stretch ${tc.dot}`} />
                  <div className="flex-1 min-w-0 p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                      <p className="text-xs font-bold text-[#0F0F0F] truncate">{r.prenom} {r.nom}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${tc.color} flex items-center gap-0.5`}>
                        {tc.icon} {tc.label}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border ${sc.color}`}>
                        {sc.label}
                      </span>
                    </div>
                    {(r.heure || r.soin) && (
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-black/40">
                        {r.heure && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{r.heure}</span>}
                        {r.soin && <span className="truncate">{r.soin}</span>}
                      </div>
                    )}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex flex-col justify-center gap-1 px-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => updateStatus(r.id, 'approved')} disabled={!!updating}
                        className="w-6 h-6 bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors rounded">
                        {updating === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      </button>
                      <button onClick={() => updateStatus(r.id, 'refused')} disabled={!!updating}
                        className="w-6 h-6 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 md:p-8 h-full flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[#0F0F0F]">Réservations</h1>
          <p className="text-xs text-black/40 mt-0.5 uppercase tracking-wider">Gestion des demandes</p>
        </div>
        <div className="flex items-center gap-2">
          {/* New reservation */}
          <button onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0F0F0F] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black/70 transition-all">
            <Plus className="w-3.5 h-3.5" /> Nouvelle
          </button>
          {/* View toggle */}
          <div className="flex items-center border border-black/15 overflow-hidden">
            <button
              onClick={() => { setViewMode('list'); setCalendarDay(null); }}
              className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5
                ${viewMode === 'list' ? 'bg-[#0F0F0F] text-white' : 'text-black/40 hover:text-black'}`}>
              <List className="w-3.5 h-3.5" /> Liste
            </button>
            <button
              onClick={() => { setViewMode('calendar'); setSelected(null); }}
              className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-l border-black/15
                ${viewMode === 'calendar' ? 'bg-[#0F0F0F] text-white' : 'text-black/40 hover:text-black'}`}>
              <CalendarDays className="w-3.5 h-3.5" /> Calendrier
            </button>
          </div>
          <button onClick={exportToExcel} disabled={filtered.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-green-600 text-green-700 text-[11px] font-bold uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={fetchReservations}
            className="flex items-center gap-2 px-3 py-2 border border-black/15 text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all">
            <RefreshCcw className="w-3.5 h-3.5" /> Actualiser
          </button>
        </div>
      </div>

      {/* Stat cards par type */}
      <div className="grid grid-cols-4 gap-3">
        {TYPE_FILTERS.map(tf => {
          const tc = tf.key !== 'all' ? getType(tf.key) : null;
          const count = typeCounts[tf.key as keyof typeof typeCounts];
          const pending = tf.key === 'all'
            ? reservations.filter(r => r.status === 'pending').length
            : reservations.filter(r => r.type === tf.key && r.status === 'pending').length;
          const isActive = typeFilter === tf.key;
          return (
            <button key={tf.key} onClick={() => { setTypeFilter(tf.key); setStatusFilter('all'); }}
              className={`flex items-center gap-3 p-4 border transition-all text-left ${isActive ? 'border-[#0F0F0F] bg-[#0F0F0F] text-white' : 'border-black/10 bg-white hover:border-black/30'}`}>
              {tc ? (
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10' : tc.bg}`}>
                  <span className={isActive ? 'text-white' : tc.color}>{tc.icon}</span>
                </div>
              ) : (
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10' : 'bg-black/5'}`}>
                  <span className={`text-[9px] font-black ${isActive ? 'text-white' : 'text-black/40'}`}>ALL</span>
                </div>
              )}
              <div className="min-w-0">
                <p className={`text-lg font-black leading-none ${isActive ? 'text-white' : 'text-[#0F0F0F]'}`}>{count}</p>
                <p className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 truncate ${isActive ? 'text-white/60' : 'text-black/40'}`}>{tf.label}</p>
                {pending > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 inline-block ${isActive ? 'bg-amber-400/30 text-amber-200' : 'bg-amber-100 text-amber-600'}`}>
                    {pending} en attente
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-all
              ${statusFilter === f.key ? 'bg-[#0F0F0F] text-white border-[#0F0F0F]' : 'bg-white text-black/50 border-black/15 hover:border-black/40 hover:text-black'}`}>
            {f.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-black/8 text-black/50'}`}>
              {statusCounts[f.key as keyof typeof statusCounts]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 360px)' }}>

        {viewMode === 'list' ? (
          <>
            {/* Liste */}
            <div className="flex-1 overflow-y-auto space-y-1.5 min-w-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-black/30">
                  <Scissors className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">Aucune réservation</p>
                </div>
              ) : (
                filtered.map(r => {
                  const sc = STATUS_CONFIG[r.status];
                  const tc = getType(r.type);
                  const isSelected = selected?.id === r.id;
                  return (
                    <motion.div key={r.id} layout
                      onClick={() => setSelected(isSelected ? null : r)}
                      className={`flex items-center gap-0 cursor-pointer transition-all overflow-hidden border
                        ${isSelected ? 'border-[#0F0F0F] shadow-sm' : 'border-black/8 hover:border-black/20'}`}>
                      <div className={`w-1 self-stretch shrink-0 ${tc.dot}`} />
                      <div className="flex items-center gap-3 p-3.5 flex-1 min-w-0 bg-white">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#0F0F0F] truncate">{r.prenom} {r.nom}</p>
                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${tc.bg} ${tc.color} ${tc.border} shrink-0`}>
                              {tc.icon} {tc.label}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${sc.color} shrink-0`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-black/40 flex-wrap">
                            {r.soin && <span className="flex items-center gap-1 truncate max-w-[200px]"><Scissors className="w-3 h-3 shrink-0" />{r.soin}</span>}
                            {r.date_reservation && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 shrink-0" />{formatDate(r.date_reservation)}</span>}
                            {r.heure && <span className="flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" />{r.heure}</span>}
                          </div>
                        </div>
                        {r.status === 'pending' && (
                          <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button onClick={() => updateStatus(r.id, 'approved')} disabled={!!updating}
                              className="w-7 h-7 bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors rounded">
                              {updating === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateStatus(r.id, 'refused')} disabled={!!updating}
                              className="w-7 h-7 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Panneau détail — list mode */}
            <AnimatePresence>
              {selected && renderDetailPanel(selected)}
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* ── Calendar grid ─────────────────────────────────────────── */}
            <div className="flex-1 border border-black/10 bg-white overflow-hidden flex flex-col min-w-0">

              {/* Month navigation */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/8 shrink-0">
                <button
                  onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                  className="p-1.5 hover:bg-black/5 transition-colors rounded">
                  <ChevronLeft className="w-4 h-4 text-[#0F0F0F]" />
                </button>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-black uppercase tracking-widest text-[#0F0F0F] capitalize">
                    {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                  {toDateStr(calendarMonth).slice(0, 7) !== todayStr.slice(0, 7) && (
                    <button
                      onClick={() => setCalendarMonth(new Date())}
                      className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-black/15 text-black/40 hover:border-black/40 hover:text-black transition-colors">
                      Aujourd'hui
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setCalendarMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                  className="p-1.5 hover:bg-black/5 transition-colors rounded">
                  <ChevronRight className="w-4 h-4 text-[#0F0F0F]" />
                </button>
              </div>

              {/* Week day headers */}
              <div className="grid grid-cols-7 border-b border-black/8 shrink-0">
                {WEEK_DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-wider text-black/30">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div
                className="grid grid-cols-7 flex-1 overflow-hidden"
                style={{ gridTemplateRows: `repeat(${calendarRows}, minmax(0, 1fr))` }}>
                {calendarDays.map(({ date, isCurrentMonth }, i) => {
                  const dateStr = toDateStr(date);
                  const dayRes = reservationsByDay[dateStr] || [];
                  const isToday    = dateStr === todayStr;
                  const isSelected = calendarDay === dateStr;
                  const pendingCount  = dayRes.filter(r => r.status === 'pending').length;
                  const approvedCount = dayRes.filter(r => r.status === 'approved').length;
                  const refusedCount  = dayRes.filter(r => r.status === 'refused').length;
                  return (
                    <button key={i}
                      onClick={() => { setCalendarDay(dateStr); setSelected(null); }}
                      className={[
                        'p-1.5 border-r border-b border-black/8 text-left transition-all flex flex-col gap-0.5 overflow-hidden',
                        !isCurrentMonth ? 'bg-black/[0.02]' : 'bg-white hover:bg-black/[0.02]',
                        isSelected ? '!bg-[#0F0F0F]' : '',
                        isToday && !isSelected ? 'ring-1 ring-inset ring-[#E13027]/50' : '',
                      ].join(' ')}>
                      <span className={[
                        'text-[11px] font-black leading-none',
                        isSelected ? 'text-white' :
                          !isCurrentMonth ? 'text-black/20' :
                            isToday ? 'text-[#E13027]' : 'text-[#0F0F0F]',
                      ].join(' ')}>
                        {date.getDate()}
                      </span>
                      {dayRes.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5">
                          {pendingCount > 0 && (
                            <span className={`text-[7px] font-black px-1 py-0.5 rounded leading-none
                              ${isSelected ? 'bg-amber-400/40 text-amber-200' : 'bg-amber-100 text-amber-700'}`}>
                              {pendingCount} att
                            </span>
                          )}
                          {approvedCount > 0 && (
                            <span className={`text-[7px] font-black px-1 py-0.5 rounded leading-none
                              ${isSelected ? 'bg-green-400/40 text-green-200' : 'bg-green-100 text-green-700'}`}>
                              {approvedCount} conf
                            </span>
                          )}
                          {refusedCount > 0 && (
                            <span className={`text-[7px] font-black px-1 py-0.5 rounded leading-none
                              ${isSelected ? 'bg-red-400/40 text-red-200' : 'bg-red-100 text-red-600'}`}>
                              {refusedCount} ref
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right panel: detail OR day reservations */}
            <AnimatePresence mode="wait">
              {selected
                ? renderDetailPanel(selected)
                : calendarDay
                  ? renderDayPanel(calendarDay)
                  : null}
            </AnimatePresence>
          </>
        )}
      </div>
      {/* ── New Reservation Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) { setShowNewModal(false); resetNewForm(); } }}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#0F0F0F]" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#0F0F0F]">Nouvelle réservation</h2>
                </div>
                <button onClick={() => { setShowNewModal(false); resetNewForm(); }} className="text-black/30 hover:text-black transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4 flex-1">

                {/* Type */}
                <div>
                  <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Type *</label>
                  <div className="flex gap-2">
                    {[
                      { k: 'fitness',       label: 'Fitness',     icon: <Dumbbell className="w-3 h-3" />,  color: 'text-[#E13027] border-[#E13027] bg-[#E13027]/8' },
                      { k: 'spa',           label: 'Spa',          icon: <Sparkles className="w-3 h-3" />, color: 'text-[#4B7BEC] border-[#4B7BEC] bg-[#4B7BEC]/8' },
                      { k: 'carte_cadeaux', label: 'Carte',        icon: <Gift className="w-3 h-3" />,     color: 'text-[#9B59B6] border-[#9B59B6] bg-[#9B59B6]/8' },
                    ].map(t => (
                      <button key={t.k} type="button"
                        onClick={() => setNewForm(f => ({ ...f, type: t.k }))}
                        className={`flex items-center gap-1.5 px-3 py-2 border text-[11px] font-bold uppercase tracking-wider transition-all
                          ${newForm.type === t.k ? t.color : 'border-black/15 text-black/40 hover:border-black/30'}`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {newForm.type === 'carte_cadeaux' ? (
                  <>
                    {/* Offrant */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#9B59B6]/70 mb-2">Offrant</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Prénom *</label>
                          <input value={newForm.prenom} onChange={e => setNewForm(f => ({ ...f, prenom: e.target.value }))}
                            placeholder="Marie" className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Nom *</label>
                          <input value={newForm.nom} onChange={e => setNewForm(f => ({ ...f, nom: e.target.value }))}
                            placeholder="Dupont" className={INPUT_CLS} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Téléphone *</label>
                          <input value={newForm.telephone} onChange={e => setNewForm(f => ({ ...f, telephone: e.target.value }))}
                            placeholder="+225 07 00 00 00 00" className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Email</label>
                          <input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="marie@email.com" className={INPUT_CLS} />
                        </div>
                      </div>
                    </div>

                    {/* Bénéficiaire */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#9B59B6]/70 mb-2">Bénéficiaire</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Prénom *</label>
                          <input value={newForm.beneficiairePrenom} onChange={e => setNewForm(f => ({ ...f, beneficiairePrenom: e.target.value }))}
                            placeholder="Sophie" className={INPUT_CLS} />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Nom *</label>
                          <input value={newForm.beneficiaireNom} onChange={e => setNewForm(f => ({ ...f, beneficiaireNom: e.target.value }))}
                            placeholder="Martin" className={INPUT_CLS} />
                        </div>
                      </div>
                    </div>

                    {/* Soin offert */}
                    <div ref={soinRef} className="relative">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Soin offert</label>
                      <div className="relative">
                        <input
                          value={newForm.soin}
                          onChange={e => { setNewForm(f => ({ ...f, soin: e.target.value })); setSoinOpen(true); }}
                          onFocus={() => setSoinOpen(true)}
                          placeholder="Choisir un soin..."
                          className={INPUT_CLS + ' pr-8'}
                        />
                        <button type="button" onClick={() => setSoinOpen(o => !o)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${soinOpen ? 'rotate-90' : '-rotate-90'}`} />
                        </button>
                      </div>
                      {soinOpen && (() => {
                        const q = newForm.soin.toLowerCase();
                        const groups = SPA_SOINS.map(g => ({
                          group: g.group,
                          items: g.items.filter(s => !q || s.toLowerCase().includes(q)),
                        })).filter(g => g.items.length > 0);
                        if (groups.length === 0) return null;
                        return (
                          <div className="absolute z-30 top-full left-0 right-0 mt-0.5 border border-black/10 bg-white shadow-lg max-h-56 overflow-y-auto">
                            {groups.map(g => (
                              <div key={g.group}>
                                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-black/30 bg-black/[0.02] border-b border-black/5 sticky top-0">
                                  {g.group}
                                </div>
                                {g.items.map(s => (
                                  <button key={s} type="button"
                                    onMouseDown={e => { e.preventDefault(); setNewForm(f => ({ ...f, soin: s })); setSoinOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs border-b border-black/5 last:border-0 transition-colors
                                      ${newForm.soin === s ? 'bg-[#0F0F0F] text-white' : 'hover:bg-black/5 text-[#0F0F0F]'}`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Message personnel */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Message personnel</label>
                      <textarea value={newForm.message} onChange={e => setNewForm(f => ({ ...f, message: e.target.value }))}
                        rows={3} placeholder="Un message pour accompagner la carte cadeau..."
                        className={`${INPUT_CLS} resize-none`} />
                    </div>
                    {newForm.email && (
                      <p className="text-[10px] text-green-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Un email de confirmation sera envoyé à l'offrant
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Prénom + Nom */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Prénom *</label>
                        <input value={newForm.prenom} onChange={e => setNewForm(f => ({ ...f, prenom: e.target.value }))}
                          placeholder="Marie" className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Nom *</label>
                        <input value={newForm.nom} onChange={e => setNewForm(f => ({ ...f, nom: e.target.value }))}
                          placeholder="Dupont" className={INPUT_CLS} />
                      </div>
                    </div>

                    {/* Email + Téléphone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Email</label>
                        <input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="marie@email.com" className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Téléphone *</label>
                        <input value={newForm.telephone} onChange={e => setNewForm(f => ({ ...f, telephone: e.target.value }))}
                          placeholder="+225 07 00 00 00 00" className={INPUT_CLS} />
                      </div>
                    </div>

                    {/* Soin — combobox */}
                    <div ref={soinRef} className="relative">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">
                        Soin / Prestation
                      </label>
                      <div className="relative">
                        <input
                          value={newForm.soin}
                          onChange={e => { setNewForm(f => ({ ...f, soin: e.target.value })); setSoinOpen(true); }}
                          onFocus={() => setSoinOpen(true)}
                          placeholder={newForm.type === 'spa' ? 'Choisir ou saisir un soin...' : 'ex. Session Fitness, Abonnement...'}
                          className={INPUT_CLS + ' pr-8'}
                        />
                        {newForm.type === 'spa' && (
                          <button type="button" onClick={() => setSoinOpen(o => !o)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors">
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${soinOpen ? 'rotate-90' : '-rotate-90'}`} />
                          </button>
                        )}
                      </div>
                      {soinOpen && newForm.type === 'spa' && (() => {
                        const q = newForm.soin.toLowerCase();
                        const groups = SPA_SOINS.map(g => ({
                          group: g.group,
                          items: g.items.filter(s => !q || s.toLowerCase().includes(q)),
                        })).filter(g => g.items.length > 0);
                        if (groups.length === 0) return null;
                        return (
                          <div className="absolute z-30 top-full left-0 right-0 mt-0.5 border border-black/10 bg-white shadow-lg max-h-56 overflow-y-auto">
                            {groups.map(g => (
                              <div key={g.group}>
                                <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-black/30 bg-black/[0.02] border-b border-black/5 sticky top-0">
                                  {g.group}
                                </div>
                                {g.items.map(s => (
                                  <button key={s} type="button"
                                    onMouseDown={e => { e.preventDefault(); setNewForm(f => ({ ...f, soin: s })); setSoinOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs border-b border-black/5 last:border-0 transition-colors
                                      ${newForm.soin === s ? 'bg-[#0F0F0F] text-white' : 'hover:bg-black/5 text-[#0F0F0F]'}`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Date + Heure */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Date souhaitée</label>
                        <input type="date" value={newForm.date_reservation} onChange={e => setNewForm(f => ({ ...f, date_reservation: e.target.value }))}
                          className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Heure</label>
                        <input type="time" value={newForm.heure} onChange={e => setNewForm(f => ({ ...f, heure: e.target.value }))}
                          className={INPUT_CLS} />
                      </div>
                    </div>

                    {/* Statut initial */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Statut initial</label>
                      <div className="flex gap-2">
                        {[
                          { k: 'approved', label: 'Confirmée', cls: 'text-green-700 border-green-400 bg-green-50' },
                          { k: 'pending',  label: 'En attente', cls: 'text-amber-700 border-amber-400 bg-amber-50' },
                        ].map(s => (
                          <button key={s.k} type="button"
                            onClick={() => setNewForm(f => ({ ...f, status: s.k as 'pending' | 'approved' }))}
                            className={`px-3 py-2 border text-[11px] font-bold uppercase tracking-wider transition-all
                              ${newForm.status === s.k ? s.cls : 'border-black/15 text-black/40 hover:border-black/30'}`}>
                            {s.label}
                          </button>
                        ))}
                      </div>
                      {newForm.status === 'approved' && newForm.email && (
                        <p className="text-[10px] text-green-600 mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Un email de confirmation sera envoyé au client
                        </p>
                      )}
                      {newForm.status === 'approved' && !newForm.email && (
                        <p className="text-[10px] text-black/30 mt-1.5">Ajoutez un email pour envoyer la confirmation au client</p>
                      )}
                    </div>

                    {/* Note */}
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-black/40 mb-1.5">Note interne</label>
                      <textarea value={newForm.message} onChange={e => setNewForm(f => ({ ...f, message: e.target.value }))}
                        rows={3} placeholder="Informations complémentaires..."
                        className={`${INPUT_CLS} resize-none`} />
                    </div>
                  </>
                )}
              </div>

              {/* Footer actions */}
              <div className="px-6 pb-6 flex gap-3 shrink-0">
                <button onClick={handleCreate} disabled={creating || (newForm.type === 'carte_cadeaux'
                    ? !newForm.prenom || !newForm.nom || !newForm.telephone || !newForm.beneficiairePrenom || !newForm.beneficiaireNom
                    : !newForm.prenom || !newForm.nom || !newForm.telephone)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0F0F0F] text-white text-[11px] font-black uppercase tracking-widest transition-all hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Créer la réservation
                </button>
                <button onClick={() => { setShowNewModal(false); resetNewForm(); }}
                  className="px-4 py-3 border border-black/15 text-[11px] font-bold uppercase tracking-wider text-black/40 hover:text-black hover:border-black/40 transition-all">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const INPUT_CLS = 'w-full border border-black/15 px-3 py-2 text-xs text-[#0F0F0F] placeholder:text-black/25 focus:outline-none focus:border-black/40 bg-white';

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-black/30 mb-0.5 flex items-center gap-1.5">{icon} {label}</p>
      <p className="text-sm text-[#0F0F0F] font-medium">{value}</p>
    </div>
  );
}
