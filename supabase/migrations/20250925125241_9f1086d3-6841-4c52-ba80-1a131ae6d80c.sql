-- Allow authenticated users to update product_reference to support upsert operations during imports
DROP POLICY IF EXISTS "Allow authenticated update product_reference" ON public.product_reference;

CREATE POLICY "Allow authenticated update product_reference"
ON public.product_reference
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');