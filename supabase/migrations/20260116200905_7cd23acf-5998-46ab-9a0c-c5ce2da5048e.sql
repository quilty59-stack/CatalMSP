-- Create MSP table
CREATE TABLE public.msp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'incendie',
  status TEXT NOT NULL DEFAULT 'brouillon',
  difficulty INTEGER NOT NULL DEFAULT 2,
  
  -- Site info
  site_name TEXT NOT NULL,
  site_type TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT,
  maps_link TEXT,
  site_notes TEXT,
  
  -- Pedagogical
  competences TEXT,
  objectives TEXT,
  situation TEXT,
  mission_reason TEXT,
  
  -- Difficulty levels
  difficulty_facilitator TEXT,
  difficulty_initial TEXT,
  difficulty_complex TEXT,
  
  -- Instructions
  instructions TEXT,
  expected_activities TEXT,
  cognitive_effects TEXT,
  
  -- Organization
  reservation_details TEXT,
  has_water_point BOOLEAN DEFAULT false,
  water_point_details TEXT,
  authorizations TEXT,
  constraints TEXT,
  safety_briefing TEXT,
  
  -- Equipment
  equipment TEXT[] DEFAULT '{}',
  other_equipment TEXT,
  
  -- URLs
  public_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE public.msp_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  msp_id UUID NOT NULL REFERENCES public.msp(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.msp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.msp_photos ENABLE ROW LEVEL SECURITY;

-- Public read access for MSP (via public_url)
CREATE POLICY "Public can view MSP" 
ON public.msp 
FOR SELECT 
USING (true);

-- Public can create MSP (no auth for now)
CREATE POLICY "Anyone can create MSP" 
ON public.msp 
FOR INSERT 
WITH CHECK (true);

-- Public can update MSP
CREATE POLICY "Anyone can update MSP" 
ON public.msp 
FOR UPDATE 
USING (true);

-- Photos policies
CREATE POLICY "Public can view photos" 
ON public.msp_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add photos" 
ON public.msp_photos 
FOR INSERT 
WITH CHECK (true);

-- Create storage bucket for MSP photos
INSERT INTO storage.buckets (id, name, public) VALUES ('msp-photos', 'msp-photos', true);

-- Storage policies
CREATE POLICY "Public can view MSP photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'msp-photos');

CREATE POLICY "Anyone can upload MSP photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'msp-photos');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_msp_updated_at
BEFORE UPDATE ON public.msp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate slug
CREATE OR REPLACE FUNCTION public.generate_msp_slug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.slug = 'msp-' || LPAD(EXTRACT(EPOCH FROM now())::bigint::text, 10, '0') || '-' || SUBSTR(gen_random_uuid()::text, 1, 4);
  NEW.public_url = '/public/' || NEW.slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_msp_slug_trigger
BEFORE INSERT ON public.msp
FOR EACH ROW
EXECUTE FUNCTION public.generate_msp_slug();