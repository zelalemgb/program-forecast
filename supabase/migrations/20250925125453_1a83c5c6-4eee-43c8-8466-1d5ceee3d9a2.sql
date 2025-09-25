-- Ensure unique indexes exist so ON CONFLICT works for upserts
CREATE UNIQUE INDEX IF NOT EXISTS product_reference_canonical_name_unique
ON public.product_reference (canonical_name);

CREATE UNIQUE INDEX IF NOT EXISTS product_reference_code_unique
ON public.product_reference (code) WHERE code IS NOT NULL;