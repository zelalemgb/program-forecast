-- Create product_issues table
CREATE TABLE public.product_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  program TEXT NOT NULL,
  items_description TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_issues ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own product issues" 
ON public.product_issues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own product issues" 
ON public.product_issues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product issues" 
ON public.product_issues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product issues" 
ON public.product_issues 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all product issues" 
ON public.product_issues 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_issues_updated_at
BEFORE UPDATE ON public.product_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();