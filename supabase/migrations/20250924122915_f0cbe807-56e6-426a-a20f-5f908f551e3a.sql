-- Create account_types table
CREATE TABLE public.account_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for account types and products (many-to-many)
CREATE TABLE public.account_type_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type_id UUID NOT NULL REFERENCES public.account_types(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.product_reference(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(account_type_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_type_products ENABLE ROW LEVEL SECURITY;

-- Create policies for account_types
CREATE POLICY "Allow read access to account_types"
ON public.account_types
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage account_types"
ON public.account_types
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for account_type_products
CREATE POLICY "Allow read access to account_type_products"
ON public.account_type_products
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage account_type_products"
ON public.account_type_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_account_types_updated_at
BEFORE UPDATE ON public.account_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();