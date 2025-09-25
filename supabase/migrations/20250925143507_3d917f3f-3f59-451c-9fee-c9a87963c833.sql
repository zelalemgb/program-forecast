-- Clean regional administrative data while preserving countries
-- Delete in reverse hierarchical order to respect foreign key constraints

-- First delete all woredas (they reference zones)
DELETE FROM public.woreda;

-- Then delete all zones (they reference regions)
DELETE FROM public.zone;

-- Finally delete all regions (they reference countries)
DELETE FROM public.region;

-- Reset sequences for the cleaned tables
ALTER SEQUENCE woreda_woreda_id_seq RESTART WITH 1;
ALTER SEQUENCE zone_zone_id_seq RESTART WITH 1; 
ALTER SEQUENCE region_region_id_seq RESTART WITH 1;

-- Note: Countries table and sequence remain intact