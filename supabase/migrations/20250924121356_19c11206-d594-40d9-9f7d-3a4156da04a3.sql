-- Add VEN Classification column to product_reference table
ALTER TABLE public.product_reference 
ADD COLUMN ven_classification TEXT;

-- Add a check constraint to limit values to Vital, Essential, Nonessential
ALTER TABLE public.product_reference 
ADD CONSTRAINT ven_classification_check 
CHECK (ven_classification IN ('Vital', 'Essential', 'Nonessential'));

-- Set a default value for existing records
UPDATE public.product_reference 
SET ven_classification = 'Essential' 
WHERE ven_classification IS NULL;