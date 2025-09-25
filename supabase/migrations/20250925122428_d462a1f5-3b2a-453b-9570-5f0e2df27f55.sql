-- Create product_prices table for historical price tracking
CREATE TABLE public.product_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.product_reference(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for efficient querying by product and date
CREATE INDEX idx_product_prices_product_date ON public.product_prices(product_id, effective_date DESC);
CREATE INDEX idx_product_prices_effective_date ON public.product_prices(effective_date DESC);

-- Enable Row Level Security
ALTER TABLE public.product_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "All authenticated users can view product prices" 
ON public.product_prices 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert product prices" 
ON public.product_prices 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

CREATE POLICY "Admins and analysts can update product prices" 
ON public.product_prices 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

CREATE POLICY "Admins can delete product prices" 
ON public.product_prices 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to validate new price dates
CREATE OR REPLACE FUNCTION public.validate_price_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's already a price with the same or later effective date
  IF EXISTS (
    SELECT 1 FROM public.product_prices 
    WHERE product_id = NEW.product_id 
    AND effective_date >= NEW.effective_date 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'New price effective date must be later than existing prices for this product';
  END IF;
  
  -- Set created_by to current user if not specified
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to validate price dates
CREATE TRIGGER validate_price_date_trigger
  BEFORE INSERT OR UPDATE ON public.product_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_price_date();

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_product_prices_updated_at
  BEFORE UPDATE ON public.product_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get current price for a product
CREATE OR REPLACE FUNCTION public.get_current_product_price(p_product_id UUID)
RETURNS TABLE(
  id UUID,
  price NUMERIC,
  effective_date DATE,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT pp.id, pp.price, pp.effective_date, pp.notes
  FROM public.product_prices pp
  WHERE pp.product_id = p_product_id
  AND pp.effective_date <= CURRENT_DATE
  ORDER BY pp.effective_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get price history for a product
CREATE OR REPLACE FUNCTION public.get_product_price_history(p_product_id UUID)
RETURNS TABLE(
  id UUID,
  price NUMERIC,
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT pp.id, pp.price, pp.effective_date, pp.notes, pp.created_at, pp.created_by
  FROM public.product_prices pp
  WHERE pp.product_id = p_product_id
  ORDER BY pp.effective_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Add comment to document the table
COMMENT ON TABLE public.product_prices IS 'Historical price tracking for products with date validation';