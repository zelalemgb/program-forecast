-- Create enum for user roles
CREATE TYPE public.user_role_type AS ENUM (
  'facility_logistic_officer',
  'facility_admin', 
  'facility_manager',
  'woreda_user',
  'zone_user',
  'regional_user',
  'national_user',
  'program_officer',
  'admin',
  'analyst', 
  'viewer'
);

-- Create enum for administrative levels
CREATE TYPE public.admin_level AS ENUM (
  'facility',
  'woreda', 
  'zone',
  'regional',
  'national'
);

-- First, remove the default value from the role column
ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;

-- Update existing user_roles table to use the new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE user_role_type USING role::text::user_role_type;

-- Add admin level tracking to user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS admin_level admin_level;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS facility_id INTEGER REFERENCES public.facility(facility_id);
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS woreda_id INTEGER REFERENCES public.woreda(woreda_id);
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS zone_id INTEGER REFERENCES public.zone(zone_id);
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES public.region(region_id);

-- Create user role requests table for registration and approval workflow
CREATE TABLE public.user_role_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  requested_role user_role_type NOT NULL,
  admin_level admin_level NOT NULL,
  facility_id INTEGER REFERENCES public.facility(facility_id),
  woreda_id INTEGER REFERENCES public.woreda(woreda_id),
  zone_id INTEGER REFERENCES public.zone(zone_id),
  region_id INTEGER REFERENCES public.region(region_id),
  justification TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_role_requests
ALTER TABLE public.user_role_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_role_requests
CREATE POLICY "Users can create their own role requests"
ON public.user_role_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own role requests"
ON public.user_role_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Approvers can view requests in their scope
CREATE POLICY "Facility admins can view facility role requests"
ON public.user_role_requests
FOR SELECT
USING (
  admin_level = 'facility' AND
  facility_id IN (
    SELECT ur.facility_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'facility_admin'
  )
);

CREATE POLICY "Regional users can view woreda/zone requests"
ON public.user_role_requests
FOR SELECT
USING (
  admin_level IN ('woreda', 'zone') AND
  (
    woreda_id IN (
      SELECT w.woreda_id FROM public.woreda w
      JOIN public.zone z ON w.zone_id = z.zone_id
      WHERE z.region_id IN (
        SELECT ur.region_id 
        FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'regional_user'
      )
    ) OR
    zone_id IN (
      SELECT z.zone_id FROM public.zone z
      WHERE z.region_id IN (
        SELECT ur.region_id 
        FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'regional_user'
      )
    )
  )
);

CREATE POLICY "National users can view regional requests"
ON public.user_role_requests
FOR SELECT
USING (
  admin_level = 'regional' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'national_user'
  )
);

-- Global admins can view all requests
CREATE POLICY "Global admins can view all requests"
ON public.user_role_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Approval policies
CREATE POLICY "Facility admins can approve facility requests"
ON public.user_role_requests
FOR UPDATE
USING (
  admin_level = 'facility' AND
  facility_id IN (
    SELECT ur.facility_id 
    FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'facility_admin'
  )
);

CREATE POLICY "Regional users can approve woreda/zone requests"
ON public.user_role_requests
FOR UPDATE
USING (
  admin_level IN ('woreda', 'zone') AND
  (
    woreda_id IN (
      SELECT w.woreda_id FROM public.woreda w
      JOIN public.zone z ON w.zone_id = z.zone_id
      WHERE z.region_id IN (
        SELECT ur.region_id 
        FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'regional_user'
      )
    ) OR
    zone_id IN (
      SELECT z.zone_id FROM public.zone z
      WHERE z.region_id IN (
        SELECT ur.region_id 
        FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'regional_user'
      )
    )
  )
);

CREATE POLICY "National users can approve regional requests"
ON public.user_role_requests
FOR UPDATE
USING (
  admin_level = 'regional' AND
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'national_user'
  )
);

-- Global admins can approve all requests
CREATE POLICY "Global admins can approve all requests"
ON public.user_role_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Function to approve role requests and assign roles
CREATE OR REPLACE FUNCTION public.approve_role_request(
  request_id UUID,
  reviewer_notes TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req RECORD;
BEGIN
  -- Get the request
  SELECT * INTO req FROM public.user_role_requests 
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role request not found or already processed';
  END IF;
  
  -- Update the request status
  UPDATE public.user_role_requests
  SET 
    status = 'approved',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    reviewer_notes = approve_role_request.reviewer_notes,
    updated_at = now()
  WHERE id = request_id;
  
  -- Create the user role
  INSERT INTO public.user_roles (
    user_id, 
    role, 
    admin_level,
    facility_id,
    woreda_id,
    zone_id,
    region_id
  ) VALUES (
    req.user_id,
    req.requested_role,
    req.admin_level,
    req.facility_id,
    req.woreda_id,
    req.zone_id,
    req.region_id
  );
END;
$$;

-- Function to reject role requests
CREATE OR REPLACE FUNCTION public.reject_role_request(
  request_id UUID,
  reviewer_notes TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_role_requests
  SET 
    status = 'rejected',
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    reviewer_notes = reject_role_request.reviewer_notes,
    updated_at = now()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Role request not found or already processed';
  END IF;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_user_role_requests_updated_at
  BEFORE UPDATE ON public.user_role_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();