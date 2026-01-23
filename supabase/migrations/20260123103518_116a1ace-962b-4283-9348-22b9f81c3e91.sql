-- Remove opening_hours column
ALTER TABLE public.sites_conventionnes DROP COLUMN IF EXISTS opening_hours;

-- Add new columns
ALTER TABLE public.sites_conventionnes 
  ADD COLUMN IF NOT EXISTS contact_phone_landline text,
  ADD COLUMN IF NOT EXISTS access_keys text,
  ADD COLUMN IF NOT EXISTS recurrence text,
  ADD COLUMN IF NOT EXISTS specific_modalities text;

-- Rename domains to authorized_maneuvers and add unauthorized_maneuvers
ALTER TABLE public.sites_conventionnes 
  RENAME COLUMN domains TO authorized_maneuvers;

ALTER TABLE public.sites_conventionnes 
  ADD COLUMN IF NOT EXISTS unauthorized_maneuvers text[] DEFAULT ARRAY['Pas de feu réel', 'Pas d''eau']::text[];