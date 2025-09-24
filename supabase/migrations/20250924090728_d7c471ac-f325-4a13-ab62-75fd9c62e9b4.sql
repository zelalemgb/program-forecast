-- Fix consumption analytics function to use absolute values for consumption calculation
CREATE OR REPLACE FUNCTION public.calculate_consumption_analytics(p_facility_id integer, p_start_date date, p_end_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert/update consumption analytics for the period
  INSERT INTO public.consumption_analytics (
    facility_id, 
    product_id, 
    period_start, 
    period_end, 
    consumption_quantity, 
    adjustments, 
    wastage
  )
  SELECT 
    p_facility_id,
    t.product_id,
    p_start_date,
    p_end_date,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'issue' THEN ABS(t.quantity) ELSE 0 END), 0) as consumption,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'adjustment' THEN ABS(t.quantity) ELSE 0 END), 0) as adjustments,
    COALESCE(SUM(CASE WHEN t.transaction_type IN ('loss', 'expired') THEN ABS(t.quantity) ELSE 0 END), 0) as wastage
  FROM public.inventory_transactions t
  WHERE t.facility_id = p_facility_id
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
  GROUP BY t.product_id
  ON CONFLICT (facility_id, product_id, period_start, period_end)
  DO UPDATE SET
    consumption_quantity = EXCLUDED.consumption_quantity,
    adjustments = EXCLUDED.adjustments,
    wastage = EXCLUDED.wastage,
    updated_at = now();
END;
$function$;