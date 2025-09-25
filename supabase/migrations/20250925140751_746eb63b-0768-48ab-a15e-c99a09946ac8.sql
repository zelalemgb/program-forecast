-- Clean sample data from administrative areas and related tables
-- Need to handle foreign key constraints properly

-- First, delete facilities that reference woredas/regions
DELETE FROM public.facility;

-- Delete EPSS regional hubs that reference regions
DELETE FROM public.epss_regional_hubs;

-- Delete user facility memberships (these reference facilities)
DELETE FROM public.user_facility_memberships;

-- Delete admin assignments (these reference regions/zones/woredas)
DELETE FROM public.admin_assignments;

-- Now delete the administrative hierarchy in reverse order
DELETE FROM public.woreda;
DELETE FROM public.zone;
DELETE FROM public.region;

-- Reset all sequences
ALTER SEQUENCE facility_facility_id_seq RESTART WITH 1;
ALTER SEQUENCE woreda_woreda_id_seq RESTART WITH 1;
ALTER SEQUENCE zone_zone_id_seq RESTART WITH 1; 
ALTER SEQUENCE region_region_id_seq RESTART WITH 1;

-- Note: We keep countries table intact (Ethiopia should remain)