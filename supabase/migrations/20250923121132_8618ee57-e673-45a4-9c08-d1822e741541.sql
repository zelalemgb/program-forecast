-- Create countries table at the top of the hierarchy
CREATE TABLE public.countries (
  country_id SERIAL PRIMARY KEY,
  country_name VARCHAR(255) NOT NULL,
  country_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add country_id to regions table
ALTER TABLE public.region 
ADD COLUMN country_id INTEGER REFERENCES public.countries(country_id);

-- Insert Ethiopia as the default country (assuming this is an Ethiopian health system)
INSERT INTO public.countries (country_name, country_code) 
VALUES ('Ethiopia', 'ET');

-- Update existing regions to reference Ethiopia
UPDATE public.region 
SET country_id = (SELECT country_id FROM public.countries WHERE country_code = 'ET')
WHERE country_id IS NULL;

-- Make country_id NOT NULL after updating existing data
ALTER TABLE public.region 
ALTER COLUMN country_id SET NOT NULL;

-- Enable RLS on countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for countries
CREATE POLICY "All authenticated users can view countries" 
ON public.countries 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can modify countries" 
ON public.countries 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers for countries
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_region_country_id ON public.region(country_id);
CREATE INDEX idx_zone_region_id ON public.zone(region_id);
CREATE INDEX idx_woreda_zone_id ON public.woreda(zone_id);
CREATE INDEX idx_facility_woreda_id ON public.facility(woreda_id);

-- Add some useful constraints
ALTER TABLE public.region ADD CONSTRAINT region_name_country_unique UNIQUE(region_name, country_id);
ALTER TABLE public.zone ADD CONSTRAINT zone_name_region_unique UNIQUE(zone_name, region_id);
ALTER TABLE public.woreda ADD CONSTRAINT woreda_name_zone_unique UNIQUE(woreda_name, zone_id);
ALTER TABLE public.facility ADD CONSTRAINT facility_code_unique UNIQUE(facility_code) WHERE facility_code IS NOT NULL;