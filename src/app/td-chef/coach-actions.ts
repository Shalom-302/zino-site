"use server";

import { supabaseServer } from "@/lib/supabase-server";

export async function addCoachAction(prefix: string, _coachesCount: number, _existingKeys: string[]) {
  // Fetch all coaches and filter by prefix to avoid gte/lt encoding issues
  const { data: all } = await supabaseServer
    .from("coaches_info")
    .select("coach_key");

  const existing = (all || []).filter(row => row.coach_key.startsWith(prefix));

  const maxNum = existing.reduce((max, row) => {
    const num = parseInt(row.coach_key.slice(prefix.length), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  const newKey = `${prefix}${maxNum + 1}`;

  const { error } = await supabaseServer.from("coaches_info").insert({
    coach_key: newKey,
    name: "NOUVEAU COACH",
    title: "Coach",
    description: "",
    published: false,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  return newKey;
}

export async function saveCoachAction(coach: {
  coach_key: string;
  name: string;
  title: string;
  description: string;
  published?: boolean;
}) {
  const { error } = await supabaseServer.from("coaches_info").upsert(
    {
      coach_key: coach.coach_key,
      name: coach.name,
      title: coach.title,
      description: coach.description,
      published: coach.published ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "coach_key" }
  );
  if (error) throw new Error(error.message);
}

export async function toggleCoachPublishedAction(coach_key: string, published: boolean) {
  const { error } = await supabaseServer
    .from("coaches_info")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("coach_key", coach_key);
  if (error) throw new Error(error.message);
}

export async function deleteCoachAction(coach_key: string) {
  const { error: e1 } = await supabaseServer.from("coaches_info").delete().eq("coach_key", coach_key);
  const { error: e2 } = await supabaseServer.from("site_images").delete().eq("id", coach_key);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
}

export async function upsertSiteImageAction(imageKey: string, publicUrl: string, mediaType: "image" | "video") {
  const { error } = await supabaseServer.from("site_images").upsert(
    {
      id: imageKey,
      image_url: publicUrl,
      media_type: mediaType,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
  return publicUrl;
}
