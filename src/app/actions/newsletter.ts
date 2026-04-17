'use server';

import { db } from '@/lib/firebase-db';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Email invalide.' };
  }

  const normalized = email.trim().toLowerCase();
  const docRef = doc(db, 'newsletter_subscribers', normalized);

  try {
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      return { success: true, message: 'Vous êtes déjà inscrit.' };
    }

    await setDoc(docRef, {
      email: normalized,
      created_at: new Date().toISOString(),
    });

    return { success: true, message: 'Merci pour votre inscription.' };
  } catch (error: any) {
    console.error('[Newsletter] Error:', error);
    return { success: false, message: 'Une erreur est survenue.' };
  }
}
