-- Create commodity_issues table for tracking commodity issue data
CREATE TABLE public.commodity_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  program TEXT NOT NULL,
  item_description TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC DEFAULT 0,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.commodity_issues ENABLE ROW LEVEL SECURITY;

-- Create policies for commodity_issues
CREATE POLICY "Users can view their own commodity issues" 
ON public.commodity_issues 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own commodity issues" 
ON public.commodity_issues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commodity issues" 
ON public.commodity_issues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commodity issues" 
ON public.commodity_issues 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can manage all commodity issues
CREATE POLICY "Admins can manage all commodity issues" 
ON public.commodity_issues 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_commodity_issues_updated_at
BEFORE UPDATE ON public.commodity_issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();