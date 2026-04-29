import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Returns time slots that are fully booked for a given date
// Only exposes time slot strings, no personal data
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('reservations')
    .select('heure')
    .eq('date_reservation', date)
    .eq('status', 'approved');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts: Record<string, number> = {};
  (data || []).forEach(r => {
    if (r.heure) counts[r.heure] = (counts[r.heure] || 0) + 1;
  });
  const taken = Object.keys(counts).filter(h => counts[h] >= 4);

  return NextResponse.json({ taken });
}
