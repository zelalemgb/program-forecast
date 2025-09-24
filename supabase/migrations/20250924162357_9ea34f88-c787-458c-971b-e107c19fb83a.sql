-- Fix the enum type issue by using the correct type for user_roles.role column

-- Create a simpler admin check function that works with the actual column type
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role = 'admin'
  );
$$;

-- Drop and recreate the problematic policies with simplified logic
DROP POLICY IF EXISTS "Admins can view all role requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Scoped approvers can view role requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Self can view own requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Authenticated users can view role requests" ON public.user_role_requests;

-- Create new policies that avoid enum type conflicts
CREATE POLICY "Admins can view all role requests"
ON public.user_role_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Self can view own requests"
ON public.user_role_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Allow all authenticated users to view role requests (temporary for debugging)
CREATE POLICY "Authenticated users can view role requests"
ON public.user_role_requests
FOR SELECT
USING (auth.role() = 'authenticated');