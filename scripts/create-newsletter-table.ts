import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createNewsletterTable() {
  const sql = `
    create table if not exists public.newsletter_subscribers (
      id uuid default gen_random_uuid() primary key,
      email text not null unique,
      created_at timestamptz default now() not null
    );

    alter table public.newsletter_subscribers enable row level security;

    do $$ begin
      if not exists (
        select 1 from pg_policies
        where tablename = 'newsletter_subscribers' and policyname = 'Allow public insert'
      ) then
        create policy "Allow public insert" on public.newsletter_subscribers
          for insert with check (true);
      end if;
    end $$;

    do $$ begin
      if not exists (
        select 1 from pg_policies
        where tablename = 'newsletter_subscribers' and policyname = 'Allow authenticated read'
      ) then
        create policy "Allow authenticated read" on public.newsletter_subscribers
          for select using (auth.role() = 'authenticated');
      end if;
    end $$;

    do $$ begin
      if not exists (
        select 1 from pg_policies
        where tablename = 'newsletter_subscribers' and policyname = 'Allow authenticated delete'
      ) then
        create policy "Allow authenticated delete" on public.newsletter_subscribers
          for delete using (auth.role() = 'authenticated');
      end if;
    end $$;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql }).single();
  if (error) {
    // Fallback: try direct table creation via insert test
    console.log('RPC not available, table may need to be created via Supabase SQL editor.');
    console.log('\nRun this SQL in your Supabase SQL editor:');
    console.log('https://supabase.com/dashboard/project/actcisklxhxzzgvygdfb/sql\n');
    console.log(sql);
  } else {
    console.log('newsletter_subscribers table created successfully!');
  }
}

createNewsletterTable();
