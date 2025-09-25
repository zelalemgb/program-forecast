-- Add region_id and zone_id columns to facility table for direct references
ALTER TABLE public.facility 
ADD COLUMN region_id INTEGER REFERENCES public.region(region_id),
ADD COLUMN zone_id INTEGER REFERENCES public.zone(zone_id);

-- Create indexes for better query performance
CREATE INDEX idx_facility_region_id ON public.facility(region_id);
CREATE INDEX idx_facility_zone_id ON public.facility(zone_id);

-- Update existing facilities to populate region_id and zone_id based on woreda relationships
UPDATE public.facility 
SET 
    zone_id = w.zone_id,
    region_id = z.region_id
FROM public.woreda w
JOIN public.zone z ON w.zone_id = z.zone_id
WHERE facility.woreda_id = w.woreda_id
AND facility.woreda_id IS NOT NULL;