-- Clean all facility data - comprehensive cleanup
-- WARNING: This will permanently delete all facility records and ALL related data

-- First, clean up ALL tables that reference facilities
-- This includes user roles, registration requests, and other dependencies

-- 1. Clean up user roles that reference facilities
DELETE FROM public.user_roles WHERE facility_id IS NOT NULL;

-- 2. Clean up user role requests that reference facilities  
DELETE FROM public.user_role_requests WHERE facility_id IS NOT NULL;

-- 3. Clean up registration requests that reference facilities
DELETE FROM public.registration_requests WHERE facility_id IS NOT NULL;

-- 4. Clean up consumption analytics
DELETE FROM public.consumption_analytics WHERE facility_id IS NOT NULL;

-- 5. Clean up inventory transactions
DELETE FROM public.inventory_transactions WHERE facility_id IS NOT NULL;

-- 6. Clean up inventory balances
DELETE FROM public.inventory_balances WHERE facility_id IS NOT NULL;

-- 7. Clean up storage locations
DELETE FROM public.storage_locations WHERE facility_id IS NOT NULL;

-- 8. Clean up departments  
DELETE FROM public.departments WHERE facility_id IS NOT NULL;

-- 9. Clean up user facility memberships
DELETE FROM public.user_facility_memberships WHERE facility_id IS NOT NULL;

-- 10. Clean up procurement data 
DELETE FROM public.procurement WHERE facility_id IS NOT NULL;

-- 11. Clean up any admin assignments that might reference facilities indirectly
-- (This might not be necessary but being thorough)

-- 12. Finally, delete all facilities
DELETE FROM public.facility;

-- 13. Reset the sequence for facility_id to start from 1
SELECT setval('facility_facility_id_seq', 1, false);