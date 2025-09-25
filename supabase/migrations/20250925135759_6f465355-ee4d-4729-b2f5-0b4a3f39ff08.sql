-- Make facility_code a unique identifier for facility records

-- First, ensure facility_code is not null for existing records
UPDATE public.facility 
SET facility_code = 'FAC_' || facility_id::text 
WHERE facility_code IS NULL OR facility_code = '';

-- Add unique constraint to facility_code
ALTER TABLE public.facility 
ADD CONSTRAINT facility_code_unique UNIQUE (facility_code);

-- Make facility_code NOT NULL to enforce it as a required field
ALTER TABLE public.facility 
ALTER COLUMN facility_code SET NOT NULL;

-- Add index for better performance on facility_code lookups
CREATE INDEX IF NOT EXISTS idx_facility_code ON public.facility (facility_code);