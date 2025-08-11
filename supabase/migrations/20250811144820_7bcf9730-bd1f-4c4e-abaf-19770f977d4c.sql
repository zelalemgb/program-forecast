-- Update has_admin_scope_for_woreda to grant global admins implicit national scope
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
  -- Global admins have national scope by default
  IF has_role(_user_id, 'admin') THEN
    RETURN TRUE;
  END IF;

  SELECT w.zone_id INTO v_zone_id FROM public.woreda w WHERE w.woreda_id = _woreda_id;
  IF v_zone_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT z.region_id INTO v_region_id FROM public.zone z WHERE z.zone_id = v_zone_id;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_assignments a
    WHERE a.user_id = _user_id
      AND (
        -- National scope (explicit record with all NULLs)
        (a.region_id IS NULL AND a.zone_id IS NULL AND a.woreda_id IS NULL)
        OR (a.woreda_id IS NOT NULL AND a.woreda_id = _woreda_id)
        OR (a.zone_id IS NOT NULL AND a.zone_id = v_zone_id)
        OR (a.region_id IS NOT NULL AND a.region_id = v_region_id)
      )
  );
END;
$$;