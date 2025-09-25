-- Add unique constraint to product_reference table for upsert functionality
-- This will prevent duplicate products based on canonical_name
ALTER TABLE public.product_reference 
ADD CONSTRAINT unique_product_canonical_name UNIQUE (canonical_name);

-- Also add unique constraint on code if not null
CREATE UNIQUE INDEX unique_product_code 
ON public.product_reference (code) 
WHERE code IS NOT NULL;