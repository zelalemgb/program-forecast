-- Complete the hierarchical structure with foreign keys and RLS

-- Add foreign key constraints
ALTER TABLE public.region 
ADD CONSTRAINT fk_region_country 
FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE SET NULL;

ALTER TABLE public.zone 
ADD CONSTRAINT fk_zone_region 
FOREIGN KEY (region_id) REFERENCES public.region(region_id) ON DELETE SET NULL;

ALTER TABLE public.woreda 
ADD CONSTRAINT fk_woreda_country 
FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_woreda_region 
FOREIGN KEY (region_id) REFERENCES public.region(region_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_woreda_zone 
FOREIGN KEY (zone_id) REFERENCES public.zone(zone_id) ON DELETE SET NULL;

ALTER TABLE public.facility 
ADD CONSTRAINT fk_facility_country 
FOREIGN KEY (country_id) REFERENCES public.countries(country_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_facility_region 
FOREIGN KEY (region_id) REFERENCES public.region(region_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_facility_zone 
FOREIGN KEY (zone_id) REFERENCES public.zone(zone_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_facility_woreda 
FOREIGN KEY (woreda_id) REFERENCES public.woreda(woreda_id) ON DELETE SET NULL;

-- Enable RLS on countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for countries table
CREATE POLICY "Everyone can view countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage countries" ON public.countries FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Update region RLS to handle country relationship
UPDATE public.region SET region_id = region_id WHERE region_id IS NOT NULL;

-- Update woreda to have proper region relationships
DO $$
BEGIN
  -- Update woreda region_id based on zone relationships
  UPDATE public.woreda w 
  SET region_id = z.region_id 
  FROM public.zone z 
  WHERE w.zone_id = z.zone_id AND w.region_id IS NULL;
END $$;