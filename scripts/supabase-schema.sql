-- ═══════════════════════════════════════════════════════════════
-- ZFitSpa — Supabase Schema (migration depuis Firebase Firestore)
-- Exécuter dans le SQL Editor de ton Supabase Dashboard
-- ═══════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ─────────────────────────────────────────────────────

-- Images du site (id = image_key, ex: "entrance_fitness", "cta_journey")
CREATE TABLE IF NOT EXISTS public.site_images (
  id          TEXT PRIMARY KEY,
  image_url   TEXT NOT NULL DEFAULT '',
  media_type  TEXT NOT NULL DEFAULT 'image',
  section     TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Images par environnement (id = "{env}_{imageKey}", ex: "fitness_main_hero")
CREATE TABLE IF NOT EXISTS public.environment_images (
  id          TEXT PRIMARY KEY,
  environment TEXT NOT NULL,
  image_key   TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  media_type  TEXT NOT NULL DEFAULT 'image',
  section     TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Contenu éditables (textes navbar, hero, etc.)
CREATE TABLE IF NOT EXISTS public.environment_content (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment TEXT NOT NULL,
  section     TEXT NOT NULL,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL DEFAULT '',
  UNIQUE(environment, section, key)
);

-- Infos coachs et praticiens
CREATE TABLE IF NOT EXISTS public.coaches_info (
  coach_key   TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  title       TEXT DEFAULT '',
  description TEXT DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Planning des cours
CREATE TABLE IF NOT EXISTS public.programme (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categorie   TEXT NOT NULL,
  jour        TEXT NOT NULL,
  heure       TEXT NOT NULL,
  activite    TEXT NOT NULL DEFAULT ''
);

-- Réservations clients
CREATE TABLE IF NOT EXISTS public.reservations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom              TEXT,
  prenom           TEXT,
  email            TEXT,
  telephone        TEXT,
  civilite         TEXT DEFAULT 'M.',
  type             TEXT,
  soin             TEXT,
  soins            TEXT[],
  date_reservation TEXT,
  heure            TEXT,
  message          TEXT,
  note             TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Abonnés newsletter (id = email)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────

ALTER TABLE public.site_images            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_images     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environment_content    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches_info           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programme              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Lecture publique (site public)
CREATE POLICY "public_read_site_images"    ON public.site_images            FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_env_images"     ON public.environment_images     FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_env_content"    ON public.environment_content    FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_coaches_info"   ON public.coaches_info           FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_programme"      ON public.programme              FOR SELECT TO anon USING (true);

-- Insert public (formulaires visiteurs)
CREATE POLICY "public_insert_reservations" ON public.reservations           FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_insert_newsletter"   ON public.newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

-- Accès complet pour les utilisateurs authentifiés (admin)
CREATE POLICY "auth_all_site_images"    ON public.site_images            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_env_images"     ON public.environment_images     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_env_content"    ON public.environment_content    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_coaches_info"   ON public.coaches_info           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_programme"      ON public.programme              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_reservations"   ON public.reservations           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_newsletter"     ON public.newsletter_subscribers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ─── STORAGE ────────────────────────────────────────────────────

-- Créer le bucket public "site-assets"
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique du storage
CREATE POLICY "public_read_storage"  ON storage.objects FOR SELECT TO anon        USING (bucket_id = 'site-assets');
CREATE POLICY "auth_upload_storage"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "auth_update_storage"  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets');
CREATE POLICY "auth_delete_storage"  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets');

-- ─── ADMIN USER ─────────────────────────────────────────────────
-- Crée ton compte admin via Authentication > Users dans le dashboard Supabase
-- ou via: SELECT * FROM auth.users; pour vérifier
