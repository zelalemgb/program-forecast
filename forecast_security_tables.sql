DO CREATE FORECAST_RUNS TABLE (temporary mock table for demo)

CREATE TABLE IF NOT EXISTS public.forecast_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  algorithm TEXT NOT NULL DEFAULT 'consumption-based',
  time_horizon_months INTEGER NOT NULL DEFAULT 6,
  scope JSONB,
  template_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB,
  confidence_score NUMERIC,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS
ALTER TABLE public.forecast_runs ENABLE ROW LEVEL SECURITY;

-- Users can view their own forecasts and admins can view all
CREATE POLICY "Users can view their own forecasts" 
ON public.forecast_runs 
FOR SELECT 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Users can create forecasts
CREATE POLICY "Users can create forecasts" 
ON public.forecast_runs 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- Users can update their own forecasts, admins can update all
CREATE POLICY "Users can update their own forecasts" 
ON public.forecast_runs 
FOR UPDATE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_forecast_runs_updated_at
BEFORE UPDATE ON public.forecast_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create security events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'investigating')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events" 
ON public.security_events 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert security events
CREATE POLICY "System can create security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Admins can update security events
CREATE POLICY "Admins can update security events" 
ON public.security_events 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));