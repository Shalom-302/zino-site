-- Créer la table des abonnés newsletter
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now() not null
);

-- Activer Row Level Security
alter table public.newsletter_subscribers enable row level security;

-- Permettre l'insertion anonyme (depuis le site public)
create policy "Allow public insert" on public.newsletter_subscribers
  for insert with check (true);

-- Permettre la lecture uniquement aux utilisateurs authentifiés (admins)
create policy "Allow authenticated read" on public.newsletter_subscribers
  for select using (auth.role() = 'authenticated');

-- Permettre la suppression aux utilisateurs authentifiés (admins)
create policy "Allow authenticated delete" on public.newsletter_subscribers
  for delete using (auth.role() = 'authenticated');