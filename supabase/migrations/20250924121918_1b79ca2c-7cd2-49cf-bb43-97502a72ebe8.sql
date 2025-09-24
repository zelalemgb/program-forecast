-- Create saved_forecasts table to store custom forecast configurations
CREATE TABLE public.saved_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id INTEGER NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('all', 'program', 'ven_classification', 'custom')),
  filter_criteria JSONB,
  selected_products UUID[] DEFAULT '{}',
  forecast_parameters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_forecasts ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_forecasts
CREATE POLICY "Users can view saved forecasts for their facility"
ON public.saved_forecasts
FOR SELECT
USING (
  facility_id IN (
    SELECT ufm.facility_id
    FROM user_facility_memberships ufm
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role)
);

CREATE POLICY "Users can create saved forecasts for their facility"
ON public.saved_forecasts
FOR INSERT
WITH CHECK (
  facility_id IN (
    SELECT ufm.facility_id
    FROM user_facility_memberships ufm
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own saved forecasts"
ON public.saved_forecasts
FOR UPDATE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete their own saved forecasts"
ON public.saved_forecasts
FOR DELETE
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_forecasts_updated_at
BEFORE UPDATE ON public.saved_forecasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();