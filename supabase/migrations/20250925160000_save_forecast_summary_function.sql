-- Create RPC function to save forecast summary and associated records atomically
CREATE SCHEMA IF NOT EXISTS rpc;

CREATE OR REPLACE FUNCTION rpc.save_forecast_summary(
  summary_data jsonb,
  items_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_summary_record public.forecast_summaries%ROWTYPE;
  v_total_value numeric := 0;
  v_result jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing authenticated user';
  END IF;

  IF items_data IS NULL OR jsonb_array_length(items_data) = 0 THEN
    RAISE EXCEPTION 'At least one forecast item is required';
  END IF;

  SELECT COALESCE(SUM(
    COALESCE((item ->> 'forecasted_quantity')::numeric, 0) *
    COALESCE((item ->> 'unit_price')::numeric, 0)
  ), 0)
  INTO v_total_value
  FROM jsonb_array_elements(items_data) AS item;

  INSERT INTO public.forecast_summaries (
    user_id,
    name,
    description,
    facility_name,
    account_type,
    forecast_duration,
    total_line_items,
    original_total_value,
    current_total_value,
    available_budget
  )
  VALUES (
    v_user_id,
    summary_data ->> 'name',
    summary_data ->> 'description',
    summary_data ->> 'facility_name',
    summary_data ->> 'account_type',
    COALESCE((summary_data ->> 'forecast_duration')::integer, 3),
    jsonb_array_length(items_data),
    v_total_value,
    v_total_value,
    (summary_data ->> 'available_budget')::numeric
  )
  RETURNING *
  INTO v_summary_record;

  WITH item_source AS (
    SELECT
      (item ->> 'product_name') AS product_name,
      COALESCE((item ->> 'forecasted_quantity')::numeric, 0) AS forecasted_quantity,
      COALESCE((item ->> 'unit_price')::numeric, 0) AS unit_price,
      COALESCE(item ->> 'program', summary_data ->> 'account_type', 'general') AS program,
      COALESCE(item ->> 'year', TO_CHAR(CURRENT_DATE, 'YYYY')) AS year
    FROM jsonb_array_elements(items_data) AS item
  ), inserted_rows AS (
    INSERT INTO public.forecast_rows (
      user_id,
      program,
      product_list,
      forecasted_quantity,
      unit_price,
      forecasted_total,
      year
    )
    SELECT
      v_user_id,
      program,
      product_name,
      forecasted_quantity,
      unit_price,
      forecasted_quantity * unit_price,
      year
    FROM item_source
    RETURNING *
  ), inserted_items AS (
    INSERT INTO public.forecast_summary_items (
      forecast_summary_id,
      forecast_row_id,
      current_quantity,
      current_price,
      current_total
    )
    SELECT
      v_summary_record.id,
      fr.id,
      COALESCE(fr.forecasted_quantity, 0),
      COALESCE(fr.unit_price, 0),
      COALESCE(fr.forecasted_total, 0)
    FROM inserted_rows fr
    RETURNING *
  ), rows_json AS (
    SELECT COALESCE(jsonb_agg(row_to_json(fr)), '[]'::jsonb) AS data
    FROM inserted_rows fr
  ), items_json AS (
    SELECT COALESCE(jsonb_agg(row_to_json(fi)), '[]'::jsonb) AS data
    FROM inserted_items fi
  )
  SELECT jsonb_build_object(
    'summary', row_to_json(v_summary_record),
    'forecast_rows', rows_json.data,
    'summary_items', items_json.data
  )
  INTO v_result
  FROM rows_json, items_json;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc.save_forecast_summary(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc.save_forecast_summary(jsonb, jsonb) TO service_role;
