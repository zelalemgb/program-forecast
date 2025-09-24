-- Fix RLS policies on user_role_requests to avoid enum mismatch errors and enable proper access

-- Ensure RLS is enabled
ALTER TABLE public.user_role_requests ENABLE ROW LEVEL SECURITY;

-- Drop problematic SELECT policies that compare mismatched enums
DROP POLICY IF EXISTS "Facility admins can view facility role requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Global admins can view all requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "National users can view regional requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Regional users can view woreda/zone requests" ON public.user_role_requests;

-- Drop problematic UPDATE policies that compare mismatched enums (approval actions are via SECURITY DEFINER RPC)
DROP POLICY IF EXISTS "Facility admins can approve facility requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Global admins can approve all requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "National users can approve regional requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Regional users can approve woreda/zone requests" ON public.user_role_requests;

-- Create safe, scope-aware SELECT policies
CREATE POLICY "Admins can view all role requests"
ON public.user_role_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Scoped approvers can view role requests"
ON public.user_role_requests
FOR SELECT
USING (
  -- Facility-level requests can be viewed by anyone with woreda/zone/region scope over the specified area
  (
    admin_level = 'facility'::admin_level AND (
      (woreda_id IS NOT NULL AND public.has_admin_scope_for_woreda(auth.uid(), woreda_id)) OR
      (zone_id   IS NOT NULL AND public.has_admin_scope_for_zone(auth.uid(), zone_id))   OR
      (region_id IS NOT NULL AND public.has_admin_scope_for_region(auth.uid(), region_id))
    )
  )
  OR (
    admin_level = 'woreda'::admin_level AND woreda_id IS NOT NULL AND public.has_admin_scope_for_woreda(auth.uid(), woreda_id)
  )
  OR (
    admin_level = 'zone'::admin_level   AND zone_id   IS NOT NULL AND public.has_admin_scope_for_zone(auth.uid(), zone_id)
  )
  OR (
    admin_level = 'regional'::admin_level AND region_id IS NOT NULL AND public.has_admin_scope_for_region(auth.uid(), region_id)
  )
  OR (
    admin_level = 'national'::admin_level AND public.has_admin_scope_for_national(auth.uid())
  )
);

-- Keep existing self-view and insert policies intact
-- (Users can view their own role requests, and can create their own)
