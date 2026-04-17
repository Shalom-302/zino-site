import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getSiteImages() {
  try {
    const snap = await getDocs(collection(db, 'site_images'));
    return snap.docs.map(docSnap => ({
      image_key: docSnap.id,
      image_url: docSnap.data().image_url || '',
      section:   docSnap.data().section   || '',
    }));
  } catch (error) {
    console.error('Error fetching site images:', error);
    return [];
  }
}

export function getImageByKey(images: any[], key: string, fallback: string) {
  const img = images.find((i) => i.image_key === key);
  return img ? img.image_url : fallback;
}
