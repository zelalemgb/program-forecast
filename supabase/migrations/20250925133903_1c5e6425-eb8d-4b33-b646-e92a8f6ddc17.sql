-- Fix enum type mismatch causing RLS errors during facility upserts
-- Update has_role to compare enums by text to avoid operator mismatch (user_role_type vs app_role)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role::text = _role::text
  );
$function$;

-- Ensure get_current_user_role returns app_role reliably even if stored enum is user_role_type
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT (role::text)::app_role FROM public.user_roles WHERE user_id = auth.uid() 
  ORDER BY CASE role::text WHEN 'admin' THEN 1 WHEN 'analyst' THEN 2 WHEN 'viewer' THEN 3 END 
  LIMIT 1;
$function$;
