-- 1) Create helper to detect national scope (or admin role)
CREATE OR REPLACE FUNCTION public.has_admin_scope_for_national(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    public.has_role(_user_id, 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.admin_assignments a
      WHERE a.user_id = _user_id
        AND a.region_id IS NULL AND a.zone_id IS NULL AND a.woreda_id IS NULL
    );
$function$;

-- 2) Centralized authorization matrix for updating (approve/reject) requests
CREATE OR REPLACE FUNCTION public.can_update_registration_request(_user_id uuid, _request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  req RECORD;
  v_zone_id INT;
  v_region_id INT;
BEGIN
  SELECT * INTO req FROM public.registration_requests WHERE id = _request_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Prevent self-approval
  IF req.user_id = _user_id THEN
    RETURN FALSE;
  END IF;

  -- Resolve zone and region from woreda if needed
  IF req.woreda_id IS NOT NULL THEN
    SELECT w.zone_id INTO v_zone_id FROM public.woreda w WHERE w.woreda_id = req.woreda_id;
    IF v_zone_id IS NOT NULL THEN
      SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = v_zone_id;
    END IF;
  ELSIF req.zone_id IS NOT NULL THEN
    SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = req.zone_id;
  END IF;

  -- Super admin (global admin role) can always update
  IF public.has_role(_user_id, 'admin'::app_role) THEN
    RETURN TRUE;
  END IF;

  -- Approval matrix
  IF req.user_level = 'facility' THEN
    -- Any scoped approver at woreda/zone/region can act
    RETURN 
      (req.woreda_id IS NOT NULL AND public.has_admin_scope_for_woreda(_user_id, req.woreda_id)) OR
      (req.zone_id IS NOT NULL AND public.has_admin_scope_for_zone(_user_id, req.zone_id)) OR
      (req.region_id IS NOT NULL AND public.has_admin_scope_for_region(_user_id, req.region_id)) OR
      (v_zone_id IS NOT NULL AND public.has_admin_scope_for_zone(_user_id, v_zone_id)) OR
      (v_region_id IS NOT NULL AND public.has_admin_scope_for_region(_user_id, v_region_id));
  ELSIF req.user_level = 'woreda' THEN
    -- Must be zonal OR regional OR national
    RETURN 
      (v_zone_id IS NOT NULL AND public.has_admin_scope_for_zone(_user_id, v_zone_id)) OR
      (v_region_id IS NOT NULL AND public.has_admin_scope_for_region(_user_id, v_region_id)) OR
      public.has_admin_scope_for_national(_user_id);
  ELSIF req.user_level = 'zonal' THEN
    -- Must be regional OR national
    IF req.zone_id IS NOT NULL AND v_region_id IS NULL THEN
      SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = req.zone_id;
    END IF;
    RETURN 
      (v_region_id IS NOT NULL AND public.has_admin_scope_for_region(_user_id, v_region_id)) OR
      public.has_admin_scope_for_national(_user_id);
  ELSIF req.user_level = 'regional' THEN
    -- Must be national
    RETURN public.has_admin_scope_for_national(_user_id);
  ELSIF req.user_level = 'national' THEN
    -- Only super admin (global admin role)
    RETURN public.has_role(_user_id, 'admin'::app_role);
  END IF;

  RETURN FALSE;
END;
$function$;

-- 3) Tighten RLS policy on registration_requests UPDATE using the matrix
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'registration_requests' AND policyname = 'Approvers update by scope'
  ) THEN
    EXECUTE 'DROP POLICY "Approvers update by scope" ON public.registration_requests';
  END IF;
END $$;

CREATE POLICY "Approvers update by matrix"
ON public.registration_requests
FOR UPDATE
USING (public.can_update_registration_request(auth.uid(), id))
WITH CHECK (public.can_update_registration_request(auth.uid(), id));

-- 4) Update approval function to use the matrix check
CREATE OR REPLACE FUNCTION public.approve_registration_request(request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  req RECORD;
  new_facility_id INT;
  v_zone_id INT;
  v_region_id INT;
BEGIN
  SELECT * INTO req FROM public.registration_requests r WHERE r.id = request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration request not found';
  END IF;
  IF req.status <> 'pending' THEN
    RAISE EXCEPTION 'Request is not pending';
  END IF;

  -- Centralized authorization
  IF NOT public.can_update_registration_request(auth.uid(), request_id) THEN
    RAISE EXCEPTION 'Not authorized to approve this request';
  END IF;

  -- Handle approvals per level
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
    -- Ensure v_zone_id/region resolved
    IF req.woreda_id IS NOT NULL THEN
      SELECT w.zone_id INTO v_zone_id FROM public.woreda w WHERE w.woreda_id = req.woreda_id;
      IF v_zone_id IS NOT NULL THEN
        SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = v_zone_id;
      END IF;
    END IF;
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
$function$;