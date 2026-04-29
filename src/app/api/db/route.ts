import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Whitelisted tables for public read access
const PUBLIC_TABLES = new Set([
  'site_images',
  'environment_images',
  'environment_content',
  'coaches_info',
  'programme',
]);

type Filter =
  | { type: 'eq'; field: string; value: unknown }
  | { type: 'in'; field: string; values: unknown[] };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, select = '*', filters = [], single = false } = body as {
      table: string;
      select?: string;
      filters?: Filter[];
      single?: boolean;
    };

    if (!PUBLIC_TABLES.has(table)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    let query = supabaseServer.from(table).select(select);

    for (const f of filters) {
      if (f.type === 'eq') {
        query = (query as any).eq(f.field, f.value);
      } else if (f.type === 'in') {
        query = (query as any).in(f.field, f.values);
      }
    }

    if (single) {
      const { data, error } = await (query as any).single();
      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ data });
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
