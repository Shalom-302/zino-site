import { supabaseServer } from './supabase-server';

export async function getInitialImages() {
  try {
    const { data, error } = await supabaseServer
      .from('site_images')
      .select('id, image_url, media_type');
    if (error) throw error;
    const result: Record<string, { url: string; type: 'image' | 'video' }> = {};
    (data || []).forEach((row) => {
      result[row.id] = {
        url: row.image_url || '',
        type: (row.media_type as 'image' | 'video') || 'image',
      };
    });
    return result;
  } catch (error) {
    console.error('Error fetching initial images:', error);
    return {};
  }
}
