-- 1) Facility table enhancements
ALTER TABLE public.facility
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS ownership text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'facility_latitude_check'
  ) THEN
    ALTER TABLE public.facility
    ADD CONSTRAINT facility_latitude_check CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'facility_longitude_check'
  ) THEN
    ALTER TABLE public.facility
    ADD CONSTRAINT facility_longitude_check CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;

-- 2) Product master upgrades
ALTER TABLE public.product_reference
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS strength text,
ADD COLUMN IF NOT EXISTS form text,
ADD COLUMN IF NOT EXISTS pack_size numeric,
ADD COLUMN IF NOT EXISTS uom text,
ADD COLUMN IF NOT EXISTS tracer_flag boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS gtin text,
ADD COLUMN IF NOT EXISTS barcode_type text,
ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS effective_from date,
ADD COLUMN IF NOT EXISTS effective_to date;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reference_code_unique ON public.product_reference (code) WHERE code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_reference_gtin_unique ON public.product_reference (gtin) WHERE gtin IS NOT NULL;

-- 3) RRF tables
CREATE TABLE IF NOT EXISTS public.rrf_headers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  facility_id integer NOT NULL,
  program_id uuid NOT NULL,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  submitted_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_rrf_facility FOREIGN KEY (facility_id) REFERENCES public.facility(facility_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS public.rrf_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rrf_id uuid NOT NULL,
  item_id uuid NOT NULL,
  soh numeric,
  amc numeric,
  pipeline numeric,
  suggested_order numeric,
  final_order numeric,
  comments text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_rrf_line_header FOREIGN KEY (rrf_id) REFERENCES public.rrf_headers(id) ON DELETE CASCADE,
  CONSTRAINT fk_rrf_line_item FOREIGN KEY (item_id) REFERENCES public.product_reference(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rrf_headers_facility_period ON public.rrf_headers (facility_id, period);
CREATE INDEX IF NOT EXISTS idx_rrf_lines_rrf_id ON public.rrf_lines (rrf_id);
CREATE INDEX IF NOT EXISTS idx_rrf_lines_item_id ON public.rrf_lines (item_id);

-- Enable RLS
ALTER TABLE public.rrf_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rrf_lines ENABLE ROW LEVEL SECURITY;

-- Policies for rrf_headers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_headers' AND policyname='Owners/Admins select rrf_headers') THEN
    CREATE POLICY "Owners/Admins select rrf_headers" ON public.rrf_headers
    FOR SELECT USING (
      user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_headers' AND policyname='Owners insert rrf_headers') THEN
    CREATE POLICY "Owners insert rrf_headers" ON public.rrf_headers
    FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_headers' AND policyname='Owners update editable rrf_headers') THEN
    CREATE POLICY "Owners update editable rrf_headers" ON public.rrf_headers
    FOR UPDATE USING ((user_id = auth.uid() AND status IN ('draft','returned')))
    WITH CHECK ((user_id = auth.uid() AND status IN ('draft','returned')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_headers' AND policyname='Admins update rrf_headers') THEN
    CREATE POLICY "Admins update rrf_headers" ON public.rrf_headers
    FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Policies for rrf_lines
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_lines' AND policyname='Select rrf_lines via parent') THEN
    CREATE POLICY "Select rrf_lines via parent" ON public.rrf_lines
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.rrf_headers h
        WHERE h.id = rrf_lines.rrf_id
          AND (h.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_lines' AND policyname='Insert rrf_lines via owner') THEN
    CREATE POLICY "Insert rrf_lines via owner" ON public.rrf_lines
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.rrf_headers h
        WHERE h.id = rrf_lines.rrf_id
          AND h.user_id = auth.uid()
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_lines' AND policyname='Update rrf_lines via owner editable') THEN
    CREATE POLICY "Update rrf_lines via owner editable" ON public.rrf_lines
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.rrf_headers h
        WHERE h.id = rrf_lines.rrf_id
          AND h.user_id = auth.uid()
          AND h.status IN ('draft','returned')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.rrf_headers h
        WHERE h.id = rrf_lines.rrf_id
          AND h.user_id = auth.uid()
          AND h.status IN ('draft','returned')
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rrf_lines' AND policyname='Admins manage rrf_lines') THEN
    CREATE POLICY "Admins manage rrf_lines" ON public.rrf_lines
    FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rrf_headers_updated_at') THEN
    CREATE TRIGGER update_rrf_headers_updated_at
    BEFORE UPDATE ON public.rrf_headers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rrf_lines_updated_at') THEN
    CREATE TRIGGER update_rrf_lines_updated_at
    BEFORE UPDATE ON public.rrf_lines
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;