-- Clean all zone data from the database
DELETE FROM public.zone;

-- Reset the zone sequence to start from 1
ALTER SEQUENCE zone_zone_id_seq RESTART WITH 1;