-- Create table for forecast summaries
CREATE TABLE public.forecast_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  facility_name TEXT,
  account_type TEXT,
  forecast_duration INTEGER NOT NULL DEFAULT 3,
  total_line_items INTEGER NOT NULL DEFAULT 0,
  original_total_value NUMERIC NOT NULL DEFAULT 0,
  current_total_value NUMERIC NOT NULL DEFAULT 0,
  available_budget NUMERIC,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for forecast adjustments history
CREATE TABLE public.forecast_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_summary_id UUID NOT NULL,
  forecast_row_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL DEFAULT 'quantity', -- 'quantity', 'price', 'budget'
  old_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  reason TEXT,
  adjusted_by UUID NOT NULL,
  adjusted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to link forecast rows to summaries
CREATE TABLE public.forecast_summary_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_summary_id UUID NOT NULL,
  forecast_row_id UUID NOT NULL,
  current_quantity NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  current_total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.forecast_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_summary_items ENABLE ROW LEVEL SECURITY;

-- Create policies for forecast_summaries
CREATE POLICY "Users can view their own forecast summaries" 
ON public.forecast_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forecast summaries" 
ON public.forecast_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forecast summaries" 
ON public.forecast_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all forecast summaries" 
ON public.forecast_summaries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for forecast_adjustments
CREATE POLICY "Users can view adjustments for their forecasts" 
ON public.forecast_adjustments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.forecast_summaries fs 
  WHERE fs.id = forecast_adjustments.forecast_summary_id 
  AND fs.user_id = auth.uid()
));

CREATE POLICY "Users can create adjustments for their forecasts" 
ON public.forecast_adjustments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.forecast_summaries fs 
  WHERE fs.id = forecast_adjustments.forecast_summary_id 
  AND fs.user_id = auth.uid()
) AND auth.uid() = adjusted_by);

CREATE POLICY "Admins can view all adjustments" 
ON public.forecast_adjustments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for forecast_summary_items
CREATE POLICY "Users can view items for their forecasts" 
ON public.forecast_summary_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.forecast_summaries fs 
  WHERE fs.id = forecast_summary_items.forecast_summary_id 
  AND fs.user_id = auth.uid()
));

CREATE POLICY "Users can manage items for their forecasts" 
ON public.forecast_summary_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.forecast_summaries fs 
  WHERE fs.id = forecast_summary_items.forecast_summary_id 
  AND fs.user_id = auth.uid()
));

CREATE POLICY "Admins can view all forecast items" 
ON public.forecast_summary_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at column
CREATE TRIGGER update_forecast_summaries_updated_at
  BEFORE UPDATE ON public.forecast_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forecast_summary_items_updated_at
  BEFORE UPDATE ON public.forecast_summary_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();