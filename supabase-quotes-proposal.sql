-- Proposal upgrades for quotes: customizable sections, cover image, optional add-ons
-- the client can choose, and online acceptance.
-- Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS sections JSONB,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS selected_addons JSONB,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_name TEXT,
  ADD COLUMN IF NOT EXISTS accepted_total NUMERIC;

-- Cover images: public bucket, each photographer writes only inside their own folder.
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-covers', 'quote-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "quote covers: owners upload" ON storage.objects;
CREATE POLICY "quote covers: owners upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quote-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "quote covers: owners update" ON storage.objects;
CREATE POLICY "quote covers: owners update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'quote-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "quote covers: owners delete" ON storage.objects;
CREATE POLICY "quote covers: owners delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'quote-covers' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Optional cleanup: the client proposal page (/q/[token]) now reads with the service
-- role, so any anon SELECT policy on quotes that existed only for that page can go.
-- Check Authentication → Policies → quotes, and remove a policy like
-- "Anyone can view shared quotes" if you see one.
