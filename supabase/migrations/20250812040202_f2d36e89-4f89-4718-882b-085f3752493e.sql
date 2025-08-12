-- Fix linter: set search_path for trigger function
CREATE OR REPLACE FUNCTION public.trg_after_pr_items_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.recompute_request_totals(CASE WHEN TG_OP = 'DELETE' THEN OLD.request_id ELSE NEW.request_id END);
  RETURN NULL;
END;
$$;