-- Phase 3: RRF end-to-end helpers
-- 1) Snapshot table
CREATE TABLE IF NOT EXISTS public.rrf_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rrf_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  stage TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.rrf_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow reading snapshots if user can read the parent header
CREATE POLICY "Read rrf_snapshots via parent" ON public.rrf_snapshots
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.rrf_headers h
    WHERE h.id = rrf_snapshots.rrf_id
      AND (h.user_id = auth.uid() OR has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'analyst'::app_role))
  )
);

-- 2) Submission function: user-owned submit transitions to 'submitted' and creates snapshot
CREATE OR REPLACE FUNCTION public.submit_rrf(p_rrf_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  h RECORD;
  snap JSONB;
BEGIN
  SELECT * INTO h FROM public.rrf_headers WHERE id = p_rrf_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'RRF header not found';
  END IF;
  IF h.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to submit this RRF';
  END IF;
  IF h.status NOT IN ('draft','returned') THEN
    RAISE EXCEPTION 'RRF must be in draft or returned to submit';
  END IF;

  SELECT jsonb_build_object(
    'header', to_jsonb(h),
    'lines', (
      SELECT COALESCE(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
      FROM public.rrf_lines l WHERE l.rrf_id = h.id
    )
  ) INTO snap;

  INSERT INTO public.rrf_snapshots (rrf_id, snapshot, stage, created_by)
  VALUES (h.id, snap, 'submitted', auth.uid());

  UPDATE public.rrf_headers
  SET status = 'submitted', submitted_at = now(), submitted_by = auth.uid(), updated_at = now()
  WHERE id = h.id;
END;
$$;

-- 3) Approval function: admin approves or returns
CREATE OR REPLACE FUNCTION public.approve_rrf(p_rrf_id UUID, p_decision TEXT DEFAULT 'approved', p_comment TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  h RECORD;
  snap JSONB;
  role app_role;
BEGIN
  SELECT * INTO h FROM public.rrf_headers WHERE id = p_rrf_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'RRF header not found';
  END IF;

  -- Decision authorization
  IF p_decision = 'approved' THEN
    IF NOT has_role(auth.uid(),'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can approve';
    END IF;
  ELSIF p_decision = 'returned' THEN
    IF NOT (has_role(auth.uid(),'admin'::app_role) OR has_role(auth.uid(),'analyst'::app_role)) THEN
      RAISE EXCEPTION 'Only admins or analysts can return';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unsupported decision %', p_decision;
  END IF;

  SELECT jsonb_build_object(
    'header', to_jsonb(h),
    'lines', (
      SELECT COALESCE(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
      FROM public.rrf_lines l WHERE l.rrf_id = h.id
    )
  ) INTO snap;

  INSERT INTO public.rrf_snapshots (rrf_id, snapshot, stage, created_by)
  VALUES (h.id, snap, p_decision, auth.uid());

  UPDATE public.rrf_headers
  SET status = p_decision, updated_at = now()
  WHERE id = h.id;
END;
$$;
