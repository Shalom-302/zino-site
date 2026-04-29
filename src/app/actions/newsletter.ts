'use server';

import { supabaseServer } from '@/lib/supabase-server';

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Email invalide.' };
  }

  const normalized = email.trim().toLowerCase();

  try {
    const { data: existing } = await supabaseServer
      .from('newsletter_subscribers')
      .select('id')
      .eq('id', normalized)
      .single();

    if (existing) {
      return { success: true, message: 'Vous êtes déjà inscrit.' };
    }

    await supabaseServer.from('newsletter_subscribers').insert({
      id: normalized,
      email: normalized,
      created_at: new Date().toISOString(),
    });

    return { success: true, message: 'Merci pour votre inscription.' };
  } catch (error: any) {
    console.error('[Newsletter] Error:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}
