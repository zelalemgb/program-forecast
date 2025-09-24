-- Allow unauthenticated users to insert profiles and role requests during registration
DROP POLICY IF EXISTS "Allow anon to insert profiles during registration" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to insert role requests during registration" ON public.user_role_requests;

CREATE POLICY "Allow anon to insert profiles during registration"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to insert role requests during registration"
ON public.user_role_requests
FOR INSERT
TO anon
WITH CHECK (true);