-- 1) Ensure forecast_rows delete policy exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'forecast_rows' AND policyname = 'Public can delete forecasts'
  ) THEN
    CREATE POLICY "Public can delete forecasts"
    ON public.forecast_rows
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- 2) course_rules table
CREATE TABLE IF NOT EXISTS public.course_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  base_unit text NOT NULL,
  formula_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.course_rules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='course_rules' AND policyname='Allow read access to course_rules'
  ) THEN
    CREATE POLICY "Allow read access to course_rules" ON public.course_rules FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='course_rules' AND policyname='Allow authenticated insert course_rules'
  ) THEN
    CREATE POLICY "Allow authenticated insert course_rules" ON public.course_rules FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_course_rules_updated_at'
  ) THEN
    CREATE TRIGGER update_course_rules_updated_at BEFORE UPDATE ON public.course_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) product_reference table
CREATE TABLE IF NOT EXISTS public.product_reference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  program text,
  atc_code text,
  default_unit text,
  base_unit text NOT NULL,
  unit_to_base_factor numeric NOT NULL DEFAULT 1,
  course_rule_id uuid REFERENCES public.course_rules(id) ON DELETE SET NULL,
  recommended_formulation text,
  price_benchmark_low numeric,
  price_benchmark_high numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_reference ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reference' AND policyname='Allow read access to product_reference'
  ) THEN
    CREATE POLICY "Allow read access to product_reference" ON public.product_reference FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_reference' AND policyname='Allow authenticated insert product_reference'
  ) THEN
    CREATE POLICY "Allow authenticated insert product_reference" ON public.product_reference FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_reference_updated_at'
  ) THEN
    CREATE TRIGGER update_product_reference_updated_at BEFORE UPDATE ON public.product_reference FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) epi_assumptions table
CREATE TABLE IF NOT EXISTS public.epi_assumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year integer NOT NULL,
  indicator text NOT NULL,
  value numeric NOT NULL,
  unit text,
  program text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.epi_assumptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='epi_assumptions' AND policyname='Allow read access to epi_assumptions'
  ) THEN
    CREATE POLICY "Allow read access to epi_assumptions" ON public.epi_assumptions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='epi_assumptions' AND policyname='Allow authenticated insert epi_assumptions'
  ) THEN
    CREATE POLICY "Allow authenticated insert epi_assumptions" ON public.epi_assumptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_epi_assumptions_updated_at'
  ) THEN
    CREATE TRIGGER update_epi_assumptions_updated_at BEFORE UPDATE ON public.epi_assumptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5) product_mappings table
CREATE TABLE IF NOT EXISTS public.product_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_product_list text NOT NULL,
  product_reference_id uuid REFERENCES public.product_reference(id) ON DELETE SET NULL,
  confidence numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_mappings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_mappings' AND policyname='Allow read access to product_mappings'
  ) THEN
    CREATE POLICY "Allow read access to product_mappings" ON public.product_mappings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_mappings' AND policyname='Allow authenticated insert product_mappings'
  ) THEN
    CREATE POLICY "Allow authenticated insert product_mappings" ON public.product_mappings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_mappings_updated_at'
  ) THEN
    CREATE TRIGGER update_product_mappings_updated_at BEFORE UPDATE ON public.product_mappings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 6) validation_results table
CREATE TABLE IF NOT EXISTS public.validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_row_id uuid REFERENCES public.forecast_rows(id) ON DELETE CASCADE,
  checks_run text[],
  coverage_ratio numeric,
  price_zscore numeric,
  paired_ratio_check jsonb,
  duplication_adjustment jsonb,
  flags text[],
  computed_fields jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='validation_results' AND policyname='Allow read access to validation_results'
  ) THEN
    CREATE POLICY "Allow read access to validation_results" ON public.validation_results FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='validation_results' AND policyname='Allow authenticated insert validation_results'
  ) THEN
    CREATE POLICY "Allow authenticated insert validation_results" ON public.validation_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_validation_results_updated_at'
  ) THEN
    CREATE TRIGGER update_validation_results_updated_at BEFORE UPDATE ON public.validation_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 7) Minimal seed data for course_rules and product_reference (safe idempotent upserts)
INSERT INTO public.course_rules (id, rule_name, base_unit, formula_json)
VALUES 
  ('00000000-0000-0000-0000-000000000001','ORS course','sachet', '{"sachets_per_course":3}'),
  ('00000000-0000-0000-0000-000000000002','Zinc pediatric course','tablet', '{"tablets_per_course":10}'),
  ('00000000-0000-0000-0000-000000000003','Amoxicillin pediatric course','tablet', '{"tablets_per_course":10}')
ON CONFLICT (id) DO UPDATE SET rule_name=EXCLUDED.rule_name;

INSERT INTO public.product_reference (id, canonical_name, program, default_unit, base_unit, unit_to_base_factor, course_rule_id, recommended_formulation, price_benchmark_low, price_benchmark_high)
VALUES
  ('10000000-0000-0000-0000-000000000001','Oral Rehydration Salts (ORS) 20.5g','CH','sachet','sachet',1,'00000000-0000-0000-0000-000000000001','20.5g citrate sachet',0.05,0.1),
  ('10000000-0000-0000-0000-000000000002','Zinc 20mg dispersible tablet','CH','tablet','tablet',1,'00000000-0000-0000-0000-000000000002','20mg DT',0.01,0.03),
  ('10000000-0000-0000-0000-000000000003','Amoxicillin 250mg DT','CH','tablet','tablet',1,'00000000-0000-0000-0000-000000000003','250mg dispersible',0.02,0.05)
ON CONFLICT (id) DO UPDATE SET canonical_name=EXCLUDED.canonical_name;

-- Seed minimal epi assumptions (illustrative; analysts can update later)
INSERT INTO public.epi_assumptions (year, indicator, value, unit, program, source_url)
VALUES
  (2025,'u5_population', 16000000, 'children', 'CH', 'https://data.worldbank.org'),
  (2025,'diarrhea_incidence_per_child_year', 2.0, 'episodes/child/year', 'CH', 'https://who.int'),
  (2025,'pneumonia_incidence_per_child_year', 0.3, 'episodes/child/year', 'CH', 'https://who.int'),
  (2025,'target_coverage_ORS', 0.8, 'ratio', 'CH', 'https://unicef.org'),
  (2025,'target_coverage_Zinc', 0.8, 'ratio', 'CH', 'https://unicef.org')
ON CONFLICT DO NOTHING;