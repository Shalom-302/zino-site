/**
 * Client-side DB helper — proxies through /api/db to avoid mixed-content issues
 * (app on HTTPS, self-hosted Supabase on HTTP).
 * Use this in all client components instead of `supabase.from(...)`.
 */

type Filter =
  | { type: 'eq'; field: string; value: unknown }
  | { type: 'in'; field: string; values: unknown[] };

async function dbPost(body: object): Promise<any> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDB(
  table: string,
  select = '*',
  filters: Filter[] = []
): Promise<any[]> {
  const json = await dbPost({ table, select, filters });
  return json?.data ?? [];
}

export async function fetchDBSingle(
  table: string,
  select = '*',
  filters: Filter[] = []
): Promise<any | null> {
  const json = await dbPost({ table, select, filters, single: true });
  return json?.data ?? null;
}
