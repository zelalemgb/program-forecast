-- Allow unauthenticated (anon) users to read location metadata for registration
-- Drop existing policies if they exist and recreate them

DROP POLICY IF EXISTS "Public can view facilities (registration)" ON public.facility;
DROP POLICY IF EXISTS "Public can view woredas (registration)" ON public.woreda;
DROP POLICY IF EXISTS "Public can view zones (registration)" ON public.zone;
DROP POLICY IF EXISTS "Public can view regions (registration)" ON public.region;

-- Create new policies for anonymous access during registration
CREATE POLICY "Public can view facilities (registration)"
ON public.facility
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view woredas (registration)"
ON public.woreda
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view zones (registration)"
ON public.zone
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public can view regions (registration)"
ON public.region
FOR SELECT
TO anon
USING (true);