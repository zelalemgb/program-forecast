-- Fix registration_requests check constraint to handle national users
-- The existing constraint requires facility_id for is_new_facility=false, but national users don't have facilities

-- Drop the existing constraint
ALTER TABLE public.registration_requests 
DROP CONSTRAINT IF EXISTS registration_requests_check;

-- Add a new constraint that allows non-facility user levels to not have facility_id
ALTER TABLE public.registration_requests 
ADD CONSTRAINT registration_requests_check CHECK (
  (user_level = 'facility' AND ((is_new_facility = true AND facility_id IS NULL) OR (is_new_facility = false AND facility_id IS NOT NULL)))
  OR (user_level IN ('woreda', 'zonal', 'regional', 'national') AND facility_id IS NULL)
);