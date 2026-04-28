import { supabaseServer } from './supabase-server';

export async function getSiteImages() {
  try {
    const { data, error } = await supabaseServer
      .from('site_images')
      .select('id, image_url, section');
    if (error) throw error;
    return (data || []).map((row) => ({
      image_key: row.id,
      image_url: row.image_url || '',
      section: row.section || '',
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
