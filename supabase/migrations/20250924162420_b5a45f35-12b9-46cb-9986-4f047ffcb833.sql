-- Fix the enum issues by creating proper functions that work with user_role_type

-- Create a function to check if a user is an admin using user_role_type
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role = 'admin'::user_role_type
  );
$$;

-- Create a function to check user roles using user_role_type
CREATE OR REPLACE FUNCTION public.has_user_role(_user_id uuid, _role user_role_type)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all role requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Self can view own requests" ON public.user_role_requests;
DROP POLICY IF EXISTS "Authenticated users can view role requests" ON public.user_role_requests;

-- Create simple, working policies
CREATE POLICY "Admins can view all role requests"
ON public.user_role_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own requests"
ON public.user_role_requests
FOR SELECT
USING (auth.uid() = user_id);