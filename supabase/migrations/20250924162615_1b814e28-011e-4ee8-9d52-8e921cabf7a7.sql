-- Fix profiles table RLS policies to use correct enum types

-- Drop the problematic admin policy that uses wrong enum type
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policy using the correct is_admin function we created
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));