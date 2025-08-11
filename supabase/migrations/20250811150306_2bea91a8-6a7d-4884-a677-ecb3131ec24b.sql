-- Extend registration_requests to capture user level and scope
ALTER TABLE public.registration_requests
  ADD COLUMN IF NOT EXISTS user_level TEXT NOT NULL DEFAULT 'facility',
  ADD COLUMN IF NOT EXISTS zone_id INT NULL,
  ADD COLUMN IF NOT EXISTS region_id INT NULL;

-- Allow non-facility requests without woreda_id
ALTER TABLE public.registration_requests
  ALTER COLUMN woreda_id DROP NOT NULL;

-- Helper scope functions for zone and region
CREATE OR REPLACE FUNCTION public.has_admin_scope_for_region(_user_id uuid, _region_id int)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF has_role(_user_id, 'admin') THEN
    RETURN TRUE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_assignments a
    WHERE a.user_id = _user_id
      AND (
        (a.region_id IS NULL AND a.zone_id IS NULL AND a.woreda_id IS NULL)
        OR (a.region_id = _region_id)
      )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_admin_scope_for_zone(_user_id uuid, _zone_id int)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_region_id INT;
BEGIN
  IF has_role(_user_id, 'admin') THEN
    RETURN TRUE;
  END IF;
  SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = _zone_id;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_assignments a
    WHERE a.user_id = _user_id
      AND (
        (a.region_id IS NULL AND a.zone_id IS NULL AND a.woreda_id IS NULL)
        OR (a.zone_id = _zone_id)
        OR (a.region_id = v_region_id)
      )
  );
END;
$$;

-- Update RLS policies on registration_requests to support region/zone/woreda scopes
DROP POLICY IF EXISTS "Users view own registration requests" ON public.registration_requests;
DROP POLICY IF EXISTS "Approvers update scoped registration requests" ON public.registration_requests;

CREATE POLICY "Users view own or approvers by scope"
ON public.registration_requests
FOR SELECT
USING (
  auth.uid() = user_id
  OR (woreda_id IS NOT NULL AND has_admin_scope_for_woreda(auth.uid(), woreda_id))
  OR (zone_id IS NOT NULL AND has_admin_scope_for_zone(auth.uid(), zone_id))
  OR (region_id IS NOT NULL AND has_admin_scope_for_region(auth.uid(), region_id))
);

CREATE POLICY "Approvers update by scope"
ON public.registration_requests
FOR UPDATE
USING (
  (woreda_id IS NOT NULL AND has_admin_scope_for_woreda(auth.uid(), woreda_id))
  OR (zone_id IS NOT NULL AND has_admin_scope_for_zone(auth.uid(), zone_id))
  OR (region_id IS NOT NULL AND has_admin_scope_for_region(auth.uid(), region_id))
)
WITH CHECK (
  (woreda_id IS NOT NULL AND has_admin_scope_for_woreda(auth.uid(), woreda_id))
  OR (zone_id IS NOT NULL AND has_admin_scope_for_zone(auth.uid(), zone_id))
  OR (region_id IS NOT NULL AND has_admin_scope_for_region(auth.uid(), region_id))
);

-- Update approval function to handle non-facility levels
CREATE OR REPLACE FUNCTION public.approve_registration_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  req RECORD;
  new_facility_id INT;
BEGIN
  SELECT * INTO req FROM public.registration_requests r WHERE r.id = request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found';
  END IF;
  IF req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Ensure approver has proper scope
  IF (req.woreda_id IS NOT NULL AND NOT has_admin_scope_for_woreda(auth.uid(), req.woreda_id))
     AND (req.zone_id IS NOT NULL AND NOT has_admin_scope_for_zone(auth.uid(), req.zone_id))
     AND (req.region_id IS NOT NULL AND NOT has_admin_scope_for_region(auth.uid(), req.region_id))
     AND NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized to approve this request';
  END IF;

  IF req.user_level = 'facility' THEN
    IF req.is_new_facility THEN
      INSERT INTO public.facility (woreda_id, facility_name, facility_code, facility_type)
      VALUES (req.woreda_id, COALESCE(req.facility_name, 'Unnamed Facility'), req.facility_code, req.facility_type)
      RETURNING facility_id INTO new_facility_id;
    ELSE
      new_facility_id := req.facility_id;
    END IF;

    INSERT INTO public.user_facility_memberships (user_id, facility_id, status)
    VALUES (req.user_id, new_facility_id, 'approved')
    ON CONFLICT (user_id, facility_id) DO NOTHING;
  ELSIF req.user_level = 'woreda' THEN
    INSERT INTO public.admin_assignments (user_id, woreda_id)
    VALUES (req.user_id, req.woreda_id)
    ON CONFLICT (user_id, region_id, zone_id, woreda_id) DO NOTHING;
  ELSIF req.user_level = 'zonal' THEN
    INSERT INTO public.admin_assignments (user_id, zone_id)
    VALUES (req.user_id, req.zone_id)
    ON CONFLICT (user_id, region_id, zone_id, woreda_id) DO NOTHING;
  ELSIF req.user_level = 'regional' THEN
    INSERT INTO public.admin_assignments (user_id, region_id)
    VALUES (req.user_id, req.region_id)
    ON CONFLICT (user_id, region_id, zone_id, woreda_id) DO NOTHING;
  ELSIF req.user_level = 'national' THEN
    INSERT INTO public.admin_assignments (user_id, region_id, zone_id, woreda_id)
    VALUES (req.user_id, NULL, NULL, NULL)
    ON CONFLICT (user_id, region_id, zone_id, woreda_id) DO NOTHING;
  END IF;

  UPDATE public.registration_requests
  SET status = 'approved', approver_id = auth.uid(), approved_at = now()
  WHERE id = request_id;
END;
$$;