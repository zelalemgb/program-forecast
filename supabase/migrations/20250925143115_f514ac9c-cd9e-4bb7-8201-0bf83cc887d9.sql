-- Clean all administrative area data
-- Delete in reverse hierarchical order to respect foreign key constraints

-- First delete all woredas (they reference zones)
DELETE FROM public.woreda;

-- Then delete all zones (they reference regions)
DELETE FROM public.zone;

-- Then delete all regions (they reference countries)
DELETE FROM public.region;

-- Finally delete all countries
DELETE FROM public.countries;

-- Reset all sequences to start from 1
ALTER SEQUENCE woreda_woreda_id_seq RESTART WITH 1;
ALTER SEQUENCE zone_zone_id_seq RESTART WITH 1; 
ALTER SEQUENCE region_region_id_seq RESTART WITH 1;
ALTER SEQUENCE countries_country_id_seq RESTART WITH 1;