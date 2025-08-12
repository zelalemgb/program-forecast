-- Retry: same schema, removing IF NOT EXISTS from CREATE POLICY statements

-- 1) Programs and Settings
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Programs are readable by authenticated" ON public.programs
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Analysts can modify programs" ON public.programs
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_programs_audit
AFTER INSERT OR UPDATE OR DELETE ON public.programs
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Program settings per year
CREATE TABLE IF NOT EXISTS public.program_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  psm_percent NUMERIC NOT NULL DEFAULT 0,
  budget_total NUMERIC NOT NULL DEFAULT 0,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_program_settings UNIQUE (program_id, year)
);
ALTER TABLE public.program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program settings readable by authenticated" ON public.program_settings
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Analysts can modify program settings" ON public.program_settings
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE TRIGGER trg_program_settings_updated_at
BEFORE UPDATE ON public.program_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_program_settings_audit
AFTER INSERT OR UPDATE OR DELETE ON public.program_settings
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Funding sources and allocations
CREATE TABLE IF NOT EXISTS public.funding_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funding_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funding sources readable by authenticated" ON public.funding_sources
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Analysts can modify funding sources" ON public.funding_sources
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE TRIGGER trg_funding_sources_updated_at
BEFORE UPDATE ON public.funding_sources
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_funding_sources_audit
AFTER INSERT OR UPDATE OR DELETE ON public.funding_sources
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TABLE IF NOT EXISTS public.program_funding_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  year TEXT NOT NULL,
  funding_source_id UUID NOT NULL REFERENCES public.funding_sources(id) ON DELETE CASCADE,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_funding_allocation UNIQUE (program_id, year, funding_source_id)
);
ALTER TABLE public.program_funding_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Funding allocations readable by authenticated" ON public.program_funding_allocations
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins/Analysts can modify funding allocations" ON public.program_funding_allocations
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE TRIGGER trg_program_funding_allocations_updated_at
BEFORE UPDATE ON public.program_funding_allocations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_program_funding_allocations_audit
AFTER INSERT OR UPDATE OR DELETE ON public.program_funding_allocations
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 2) Procurement Requests and Items
CREATE TABLE IF NOT EXISTS public.procurement_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  year TEXT NOT NULL,
  funding_source_id UUID REFERENCES public.funding_sources(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, returned, approved, in_procurement, completed
  current_stage TEXT NOT NULL DEFAULT 'draft',
  psm_percent NUMERIC NOT NULL DEFAULT 0,
  request_subtotal NUMERIC NOT NULL DEFAULT 0,
  psm_amount NUMERIC NOT NULL DEFAULT 0,
  request_total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);
ALTER TABLE public.procurement_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_procurement_requests_set_user
BEFORE INSERT ON public.procurement_requests
FOR EACH ROW EXECUTE FUNCTION public.set_owner_user_id();

CREATE TRIGGER trg_procurement_requests_updated_at
BEFORE UPDATE ON public.procurement_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_procurement_requests_audit
AFTER INSERT OR UPDATE OR DELETE ON public.procurement_requests
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE POLICY "Owners/Admins can select procurement_requests" ON public.procurement_requests
FOR SELECT USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE POLICY "Owners can insert their requests" ON public.procurement_requests
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can update draft or returned" ON public.procurement_requests
FOR UPDATE USING ((user_id = auth.uid()) AND (status IN ('draft','returned')))
WITH CHECK ((user_id = auth.uid()) AND (status IN ('draft','returned')));

CREATE POLICY "Admins can update any requests" ON public.procurement_requests
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_procurement_requests_program_year ON public.procurement_requests(program_id, year);

CREATE TABLE IF NOT EXISTS public.procurement_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  forecast_row_id UUID REFERENCES public.forecast_rows(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit TEXT,
  requested_quantity NUMERIC NOT NULL,
  updated_unit_price NUMERIC NOT NULL,
  line_subtotal NUMERIC NOT NULL,
  override BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.procurement_request_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_pr_items_updated_at
BEFORE UPDATE ON public.procurement_request_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_pr_items_audit
AFTER INSERT OR UPDATE OR DELETE ON public.procurement_request_items
FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE POLICY "Access items via parent request (select)" ON public.procurement_request_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_request_items.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
);

CREATE POLICY "Owners insert items for own request" ON public.procurement_request_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_request_items.request_id AND pr.user_id = auth.uid()
  )
);

CREATE POLICY "Owners update items for editable requests" ON public.procurement_request_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_request_items.request_id AND pr.user_id = auth.uid() AND pr.status IN ('draft','returned')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_request_items.request_id AND pr.user_id = auth.uid() AND pr.status IN ('draft','returned')
  )
);

CREATE POLICY "Admins manage items" ON public.procurement_request_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_pr_items_request_id ON public.procurement_request_items(request_id);

-- Function: recompute totals for a request
CREATE OR REPLACE FUNCTION public.recompute_request_totals(p_request_id UUID)
RETURNS VOID AS $$
DECLARE
  v_subtotal NUMERIC := 0;
  v_psm NUMERIC := 0;
  v_psm_percent NUMERIC := 0;
BEGIN
  SELECT COALESCE(SUM(line_subtotal), 0) INTO v_subtotal
  FROM public.procurement_request_items WHERE request_id = p_request_id;
  SELECT psm_percent INTO v_psm_percent FROM public.procurement_requests WHERE id = p_request_id;
  v_psm := (v_subtotal * v_psm_percent / 100.0);
  UPDATE public.procurement_requests
  SET request_subtotal = v_subtotal,
      psm_amount = v_psm,
      request_total = v_subtotal + v_psm
  WHERE id = p_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'pg_temp';

-- Trigger to recompute on items changes
CREATE OR REPLACE FUNCTION public.trg_after_pr_items_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.recompute_request_totals(CASE WHEN TG_OP = 'DELETE' THEN OLD.request_id ELSE NEW.request_id END);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recompute_totals_ins ON public.procurement_request_items;
DROP TRIGGER IF EXISTS trg_recompute_totals_upd ON public.procurement_request_items;
DROP TRIGGER IF EXISTS trg_recompute_totals_del ON public.procurement_request_items;

CREATE TRIGGER trg_recompute_totals_ins AFTER INSERT ON public.procurement_request_items
FOR EACH ROW EXECUTE FUNCTION public.trg_after_pr_items_change();
CREATE TRIGGER trg_recompute_totals_upd AFTER UPDATE ON public.procurement_request_items
FOR EACH ROW EXECUTE FUNCTION public.trg_after_pr_items_change();
CREATE TRIGGER trg_recompute_totals_del AFTER DELETE ON public.procurement_request_items
FOR EACH ROW EXECUTE FUNCTION public.trg_after_pr_items_change();

-- 3) Transitions and Procurement Events
CREATE TABLE IF NOT EXISTS public.request_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT,
  decision TEXT, -- Approve / Return / Submit / etc.
  comment TEXT,
  actor_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attachment_url TEXT
);
ALTER TABLE public.request_transitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read transitions if can read request" ON public.request_transitions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_transitions.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role) OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Insert transitions if owner/admin/analyst" ON public.request_transitions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_transitions.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
);

CREATE INDEX IF NOT EXISTS idx_request_transitions_request_id ON public.request_transitions(request_id);

CREATE TABLE IF NOT EXISTS public.procurement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  stage TEXT NOT NULL, -- tender, award, po, shipment, arrival, clearance, grv, payment
  tender_ref TEXT,
  tender_open_date DATE,
  tender_close_date DATE,
  supplier TEXT,
  award_value NUMERIC,
  award_date DATE,
  po_number TEXT,
  po_value NUMERIC,
  po_date DATE,
  shipment_date DATE,
  arrival_date DATE,
  clearance_date DATE,
  grv_number TEXT,
  grv_date DATE,
  received_quantity NUMERIC,
  invoice_date DATE,
  payment_date DATE,
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID NOT NULL DEFAULT auth.uid()
);
ALTER TABLE public.procurement_events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_procurement_events_updated_at
BEFORE UPDATE ON public.procurement_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Read events if can read request" ON public.procurement_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_events.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role) OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Insert/Update events by admin/analyst" ON public.procurement_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_events.request_id
      AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = procurement_events.request_id
      AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
);

CREATE INDEX IF NOT EXISTS idx_procurement_events_request_id ON public.procurement_events(request_id);

-- 4) Finance Status
CREATE TABLE IF NOT EXISTS public.finance_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  budget_approved BOOLEAN NOT NULL DEFAULT FALSE,
  budget_approved_date DATE,
  amount_transferred NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.finance_status ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_finance_status_updated_at
BEFORE UPDATE ON public.finance_status
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Read finance if can read request" ON public.finance_status
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = finance_status.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role) OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Admins can modify finance" ON public.finance_status
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5) Documents and Comments
CREATE TABLE IF NOT EXISTS public.request_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  stage TEXT,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL DEFAULT auth.uid(),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.request_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read documents if can read request" ON public.request_documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_documents.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role) OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Insert documents if owner/admin/analyst" ON public.request_documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_documents.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
);

CREATE TABLE IF NOT EXISTS public.request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.procurement_requests(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  mentions JSONB,
  created_by UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read comments if can read request" ON public.request_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_comments.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role) OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Insert comments if owner/admin/analyst" ON public.request_comments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.procurement_requests pr
    WHERE pr.id = request_comments.request_id
      AND ((pr.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role))
  )
);

-- 6) Storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('procurement-docs','procurement-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for procurement-docs (guarded)
DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow read own or admin procurement-docs';
  IF NOT FOUND THEN
    CREATE POLICY "Allow read own or admin procurement-docs" ON storage.objects
    FOR SELECT TO authenticated USING (
      bucket_id = 'procurement-docs' AND (
        (auth.uid()::text = (storage.foldername(name))[1]) OR
        has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow upload to own folder procurement-docs';
  IF NOT FOUND THEN
    CREATE POLICY "Allow upload to own folder procurement-docs" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
      bucket_id = 'procurement-docs' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow update/delete own or admin procurement-docs';
  IF NOT FOUND THEN
    CREATE POLICY "Allow update/delete own or admin procurement-docs" ON storage.objects
    FOR ALL TO authenticated USING (
      bucket_id = 'procurement-docs' AND (
        (auth.uid()::text = (storage.foldername(name))[1]) OR
        has_role(auth.uid(), 'admin'::app_role)
      )
    ) WITH CHECK (
      bucket_id = 'procurement-docs' AND (
        (auth.uid()::text = (storage.foldername(name))[1]) OR
        has_role(auth.uid(), 'admin'::app_role)
      )
    );
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_program_settings_program_year ON public.program_settings(program_id, year);
CREATE INDEX IF NOT EXISTS idx_program_funding_allocations_prog_year ON public.program_funding_allocations(program_id, year);
CREATE INDEX IF NOT EXISTS idx_request_documents_request_id ON public.request_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON public.request_comments(request_id);
