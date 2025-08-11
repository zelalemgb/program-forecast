-- Create table to store forecast rows
CREATE TABLE IF NOT EXISTS public.forecast_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program text NOT NULL,
  product_list text NOT NULL,
  unit text,
  year text,
  forecasted_quantity numeric,
  unit_price numeric,
  forecasted_total numeric,
  opian_total numeric,
  observed_difference numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and set permissive demo policies (public read/insert)
ALTER TABLE public.forecast_rows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'forecast_rows' AND policyname = 'Public can read forecasts'
  ) THEN
    CREATE POLICY "Public can read forecasts"
    ON public.forecast_rows
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'forecast_rows' AND policyname = 'Public can insert forecasts'
  ) THEN
    CREATE POLICY "Public can insert forecasts"
    ON public.forecast_rows
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_forecast_rows_updated_at'
  ) THEN
    CREATE TRIGGER update_forecast_rows_updated_at
    BEFORE UPDATE ON public.forecast_rows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_forecast_rows_program ON public.forecast_rows (program);
CREATE INDEX IF NOT EXISTS idx_forecast_rows_year ON public.forecast_rows (year);