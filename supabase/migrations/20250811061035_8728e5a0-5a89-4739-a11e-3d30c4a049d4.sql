-- 1) Harden forecast_rows RLS and ownership
-- Add user_id for ownership if missing
ALTER TABLE public.forecast_rows
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- Drop overly-permissive policies
DROP POLICY IF EXISTS "Public can insert forecasts" ON public.forecast_rows;
DROP POLICY IF EXISTS "Public can read forecasts" ON public.forecast_rows;
DROP POLICY IF EXISTS "Public can delete forecasts" ON public.forecast_rows;

-- Helper function to stamp owner
CREATE OR REPLACE FUNCTION public.set_owner_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for forecast_rows
DROP TRIGGER IF EXISTS set_owner_user_id_forecast_rows ON public.forecast_rows;
CREATE TRIGGER set_owner_user_id_forecast_rows
BEFORE INSERT ON public.forecast_rows
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_user_id();

-- Owner/admin scoped policies
CREATE POLICY "Owners and admins can select own forecast rows"
ON public.forecast_rows
FOR SELECT
USING (
  (user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
  OR (user_id IS NULL AND has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owners can insert forecast rows"
ON public.forecast_rows
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can insert forecast rows"
ON public.forecast_rows
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners and admins can delete forecast rows"
ON public.forecast_rows
FOR DELETE
USING (
  (user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- Audit trigger for forecast_rows
DROP TRIGGER IF EXISTS audit_forecast_rows ON public.forecast_rows;
CREATE TRIGGER audit_forecast_rows
AFTER INSERT OR UPDATE OR DELETE ON public.forecast_rows
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger();


-- 2) Restrict profiles PII exposure
DROP POLICY IF EXISTS "Allow read access to profiles" ON public.profiles;

-- Ensure admins can view all profiles explicitly
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));


-- 3) Restrict procurement_data visibility and ensure ownership
DROP POLICY IF EXISTS "Users can view procurement data" ON public.procurement_data;
DROP POLICY IF EXISTS "Authenticated users can insert procurement data" ON public.procurement_data;

CREATE POLICY "Owner or admins/analysts can view procurement data"
ON public.procurement_data
FOR SELECT
USING (
  (user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'analyst')
);

CREATE POLICY "Users can insert their own procurement data"
ON public.procurement_data
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Reuse owner stamping trigger
DROP TRIGGER IF EXISTS set_owner_user_id_procurement_data ON public.procurement_data;
CREATE TRIGGER set_owner_user_id_procurement_data
BEFORE INSERT ON public.procurement_data
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_user_id();


-- 4) Limit ethiopia_2025_2026 modifications to admins/analysts
DROP POLICY IF EXISTS "Allow authenticated insert to ethiopia_2025_2026" ON public.ethiopia_2025_2026;
DROP POLICY IF EXISTS "Allow authenticated update to ethiopia_2025_2026" ON public.ethiopia_2025_2026;

CREATE POLICY "Only admins and analysts can insert ethiopia_2025_2026"
ON public.ethiopia_2025_2026
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analyst'));

CREATE POLICY "Only admins and analysts can update ethiopia_2025_2026"
ON public.ethiopia_2025_2026
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analyst'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'analyst'));


-- 5) audit_log: explicit admin-only read policy
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read audit log" ON public.audit_log;
CREATE POLICY "Admins can read audit log"
ON public.audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'));


-- 6) Harden SECURITY DEFINER functions with fixed search_path
-- update_fiscal_year
CREATE OR REPLACE FUNCTION public.update_fiscal_year()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
    -- Ethiopian fiscal year starts in July (Hamle)
    IF EXTRACT(MONTH FROM NEW.reporting_date) >= 7 THEN
        NEW.fiscal_year := EXTRACT(YEAR FROM NEW.reporting_date);
    ELSE
        NEW.fiscal_year := EXTRACT(YEAR FROM NEW.reporting_date) - 1;
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$function$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'analyst' THEN 2 
      WHEN 'viewer' THEN 3 
    END 
  LIMIT 1;
$function$;

-- audit_trigger
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$function$;

-- get_procurement_summary
CREATE OR REPLACE FUNCTION public.get_procurement_summary(
    p_fiscal_year integer DEFAULT NULL,
    p_region_name text DEFAULT NULL,
    p_procurement_source text DEFAULT NULL
)
RETURNS TABLE(
    total_records bigint,
    total_value numeric,
    avg_price numeric,
    total_facilities bigint,
    total_products bigint,
    epss_percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    WITH filtered_data AS (
        SELECT *
        FROM procurement_analytics
        WHERE 
            (p_fiscal_year IS NULL OR fiscal_year = p_fiscal_year)
            AND (p_region_name IS NULL OR region_name = p_region_name)
            AND (p_procurement_source IS NULL OR procurement_source = p_procurement_source)
    )
    SELECT 
        COUNT(*)::BIGINT as total_records,
        COALESCE(SUM(total_cost), 0) as total_value,
        COALESCE(AVG(price), 0) as avg_price,
        COUNT(DISTINCT facility_name)::BIGINT as total_facilities,
        COUNT(DISTINCT product_name)::BIGINT as total_products,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE procurement_source = 'EPSS') * 100.0 / COUNT(*))
            ELSE 0
        END as epss_percentage
    FROM filtered_data;
$function$;

-- refresh_procurement_summary
CREATE OR REPLACE FUNCTION public.refresh_procurement_summary()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
    REFRESH MATERIALIZED VIEW public.procurement_monthly_summary;
$function$;

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer');
    RETURN NEW;
END;
$function$;


-- 7) Revoke API access to materialized view if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews 
    WHERE schemaname = 'public' AND matviewname = 'procurement_monthly_summary'
  ) THEN
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.procurement_monthly_summary FROM anon, authenticated';
  END IF;
END$$;