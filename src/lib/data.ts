import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getInitialImages() {
  try {
    const snap = await getDocs(collection(db, 'site_images'));
    const result: Record<string, { url: string; type: 'image' | 'video' }> = {};
    snap.forEach(docSnap => {
      const d = docSnap.data();
      result[docSnap.id] = {
        url:  d.image_url || '',
        type: (d.media_type as 'image' | 'video') || 'image',
      };
    });
    return result;
  } catch (error) {
    console.error('Error fetching initial images:', error);
    return {};
  }
}
