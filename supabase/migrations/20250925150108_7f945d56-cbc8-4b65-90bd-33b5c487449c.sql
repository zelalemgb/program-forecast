-- Remove unnecessary hierarchical fields from facility table
-- These are redundant since we can derive them from woreda relationship

ALTER TABLE public.facility 
DROP COLUMN IF EXISTS region_id,
DROP COLUMN IF EXISTS zone_id,
DROP COLUMN IF EXISTS country_id,
DROP COLUMN IF EXISTS ownership; -- Keep ownership_type enum, remove text ownership