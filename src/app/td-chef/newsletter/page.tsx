'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Download, RefreshCcw, Mail, Users, Trash2 } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function NewsletterPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/td-chef/login'); return; }
      fetchSubscribers();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push('/td-chef/login');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchSubscribers() {
    setLoading(true);
    try {
      const { data: snap, error } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setSubscribers((snap || []).map(r => ({ id: r.id, email: r.email as string, created_at: r.created_at as string })));
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await supabase.from('newsletter_subscribers').delete().eq('id', id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast.success('Abonné supprimé');
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setDeletingId(null);
    setConfirmDelete(null);
  }

  function exportCSV() {
    const rows = [
      ['Email', "Date d'inscription"],
      ...subscribers.map(s => [
        s.email,
        new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${subscribers.length} abonné${subscribers.length > 1 ? 's' : ''} exporté${subscribers.length > 1 ? 's' : ''}`);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#E13027]" />
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase text-[#0F0F0F]">
            News<span className="text-[#E13027]">letter</span>
          </h1>
          <p className="text-xs text-black/40 mt-1 uppercase tracking-wider">
            {subscribers.length} abonné{subscribers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {subscribers.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-green-600 text-green-700 text-[11px] font-bold uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          )}
          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 px-3 py-2 border border-black/15 text-[11px] font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="border border-black/8 bg-white p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-[#E13027]/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#E13027]" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#0F0F0F]">{subscribers.length}</p>
            <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Abonnés total</p>
          </div>
        </div>
        <div className="border border-black/8 bg-white p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-black/5 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-black/40" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#0F0F0F]">
              {subscribers.filter(s => {
                const d = new Date(s.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Ce mois-ci</p>
          </div>
        </div>
      </div>

      {/* Table */}
      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-black/15">
          <Mail className="w-10 h-10 text-black/20 mb-3" />
          <p className="text-xs uppercase tracking-widest font-bold text-black/30">Aucun abonné</p>
        </div>
      ) : (
        <div className="border border-black/8">
          {/* Header */}
          <div className="grid grid-cols-[1fr_200px_56px] border-b border-black/8 px-5 py-3 bg-black/[0.02]">
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/30 font-bold">Email</p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-black/30 font-bold">Inscrit le</p>
            <div />
          </div>
          {/* Rows */}
          {subscribers.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[1fr_200px_56px] items-center px-5 py-4 ${i < subscribers.length - 1 ? 'border-b border-black/5' : ''} hover:bg-black/[0.015] transition-colors`}
            >
              <p className="text-[13px] text-[#0F0F0F] font-medium truncate pr-4">{s.email}</p>
              <p className="text-[11px] text-black/40">{formatDate(s.created_at)}</p>
              <div className="flex justify-end">
                {confirmDelete === s.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="px-2 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider hover:bg-red-600 transition-colors"
                    >
                      {deletingId === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 py-1 border border-black/15 text-[9px] font-black uppercase tracking-wider text-black/40 hover:text-black transition-colors"
                    >
                      Non
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(s.id)}
                    className="p-1.5 text-black/20 hover:text-red-500 hover:bg-red-50 transition-colors rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
