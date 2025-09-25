-- Add product_type column to product_reference table
ALTER TABLE public.product_reference 
ADD COLUMN product_type text;

-- Add a comment to document the column
COMMENT ON COLUMN public.product_reference.product_type IS 'Category or type classification for the product (e.g., Medicine, Equipment, Supply)';