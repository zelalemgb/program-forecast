-- 1) Admin scope assignments for hierarchical approvals
CREATE TABLE IF NOT EXISTS public.admin_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  -- When all three are NULL, it means national scope
  region_id INT NULL,
  zone_id INT NULL,
  woreda_id INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_admin_assignment UNIQUE (user_id, region_id, zone_id, woreda_id)
);

ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;

-- Policies: Only global admins manage assignments; users can read their own
CREATE POLICY "Admins manage admin_assignments"
ON public.admin_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own admin assignments"
ON public.admin_assignments
FOR SELECT
USING (user_id = auth.uid());

CREATE TRIGGER admin_assignments_updated_at
BEFORE UPDATE ON public.admin_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Registration requests (single table to handle both new and existing facilities)
CREATE TABLE IF NOT EXISTS public.registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  is_new_facility BOOLEAN NOT NULL DEFAULT false,
  -- When existing facility is chosen
  facility_id INT NULL,
  -- When new facility is proposed
  facility_name TEXT NULL,
  facility_code TEXT NULL,
  facility_type TEXT NULL, -- 'public' | 'private'
  woreda_id INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  approver_id UUID NULL,
  approved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((is_new_facility = true AND facility_id IS NULL) OR (is_new_facility = false AND facility_id IS NOT NULL))
);

ALTER TABLE public.registration_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER registration_requests_updated_at
BEFORE UPDATE ON public.registration_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Memberships linking approved users to facilities
CREATE TABLE IF NOT EXISTS public.user_facility_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  facility_id INT NOT NULL,
  role TEXT NOT NULL DEFAULT 'facility_user',
  status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_facility UNIQUE (user_id, facility_id)
);

ALTER TABLE public.user_facility_memberships ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER user_facility_memberships_updated_at
BEFORE UPDATE ON public.user_facility_memberships
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Helper function: determine if a user has admin scope for a given woreda
CREATE OR REPLACE FUNCTION public.has_admin_scope_for_woreda(_user_id uuid, _woreda_id int)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_zone_id INT;
  v_region_id INT;
BEGIN
  SELECT w.zone_id INTO v_zone_id FROM public.woreda w WHERE w.woreda_id = _woreda_id;
  IF v_zone_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = v_zone_id;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_assignments a
    WHERE a.user_id = _user_id
      AND (
        -- National scope
        (a.region_id IS NULL AND a.zone_id IS NULL AND a.woreda_id IS NULL)
        OR (a.woreda_id IS NOT NULL AND a.woreda_id = _woreda_id)
        OR (a.zone_id IS NOT NULL AND a.zone_id = v_zone_id)
        OR (a.region_id IS NOT NULL AND a.region_id = v_region_id)
      )
  );
END;
$$;

-- 5) RLS policies for registration_requests
-- Users can create their own requests
CREATE POLICY "Users can create own registration requests"
ON public.registration_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests; approvers can view in scope
CREATE POLICY "Users view own registration requests"
ON public.registration_requests
FOR SELECT
USING (auth.uid() = user_id OR has_admin_scope_for_woreda(auth.uid(), woreda_id));

-- Approvers can update requests in their scope (e.g., set status, approver_id)
CREATE POLICY "Approvers update scoped registration requests"
ON public.registration_requests
FOR UPDATE
USING (has_admin_scope_for_woreda(auth.uid(), woreda_id))
WITH CHECK (has_admin_scope_for_woreda(auth.uid(), woreda_id));

-- 6) RLS for user_facility_memberships
-- Users can read their own memberships
CREATE POLICY "Users read own memberships"
ON public.user_facility_memberships
FOR SELECT
USING (user_id = auth.uid());

-- Approvers can read memberships for facilities in their scope
CREATE POLICY "Approvers read scoped memberships"
ON public.user_facility_memberships
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.facility f
    JOIN public.woreda w ON w.woreda_id = f.woreda_id
    WHERE f.facility_id = user_facility_memberships.facility_id
      AND has_admin_scope_for_woreda(auth.uid(), w.woreda_id)
  )
);

-- Do not allow direct inserts/updates/deletes from clients for memberships (created via function)
-- No policies for INSERT/UPDATE/DELETE means they are blocked by RLS.

-- 7) Approval function that creates facility if needed and grants membership
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
  IF NOT has_admin_scope_for_woreda(auth.uid(), req.woreda_id) THEN
    RAISE EXCEPTION 'Not authorized to approve this request';
  END IF;

  IF req.is_new_facility THEN
    -- Create facility record
    INSERT INTO public.facility (woreda_id, facility_name, facility_code, facility_type)
    VALUES (req.woreda_id, COALESCE(req.facility_name, 'Unnamed Facility'), req.facility_code, req.facility_type)
    RETURNING facility_id INTO new_facility_id;
  ELSE
    new_facility_id := req.facility_id;
  END IF;

  -- Create membership for the user
  INSERT INTO public.user_facility_memberships (user_id, facility_id, status)
  VALUES (req.user_id, new_facility_id, 'approved')
  ON CONFLICT (user_id, facility_id) DO NOTHING;

  -- Mark request as approved
  UPDATE public.registration_requests
  SET status = 'approved', approver_id = auth.uid(), approved_at = now()
  WHERE id = request_id;
END;
$$;
