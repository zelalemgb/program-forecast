-- Create enum for facility ownership type
CREATE TYPE public.facility_ownership_type AS ENUM ('public', 'private', 'ngo');

-- Add ownership_type column to facility table
ALTER TABLE public.facility 
ADD COLUMN ownership_type facility_ownership_type DEFAULT 'public';

-- Add index for better query performance
CREATE INDEX idx_facility_ownership_type ON public.facility(ownership_type);

-- Update existing facilities with sample ownership types (with proper casting)
UPDATE public.facility 
SET ownership_type = CASE 
    WHEN facility_name ILIKE '%hospital%' THEN 'public'::facility_ownership_type
    WHEN facility_name ILIKE '%clinic%' AND facility_name ILIKE '%private%' THEN 'private'::facility_ownership_type
    WHEN facility_name ILIKE '%ngo%' OR facility_name ILIKE '%mission%' THEN 'ngo'::facility_ownership_type
    ELSE 'public'::facility_ownership_type
END;