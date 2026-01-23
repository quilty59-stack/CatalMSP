-- Add logo_url column to sites_conventionnes table
ALTER TABLE public.sites_conventionnes 
ADD COLUMN IF NOT EXISTS logo_url TEXT;