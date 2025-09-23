-- Create inventory transactions table for tracking stock movements
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id INTEGER REFERENCES public.facility(facility_id), -- Reference the correct facility table
  product_id UUID REFERENCES public.products(id), -- Reference products table
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'loss', 'expired')),
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  batch_number TEXT,
  expiry_date DATE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory balances table for current stock levels
CREATE TABLE public.inventory_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id INTEGER REFERENCES public.facility(facility_id),
  product_id UUID REFERENCES public.products(id),
  current_stock NUMERIC NOT NULL DEFAULT 0,
  reorder_level NUMERIC NOT NULL DEFAULT 0,
  max_level NUMERIC NOT NULL DEFAULT 0,
  last_transaction_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(facility_id, product_id)
);

-- Create consumption analytics table for processed consumption data
CREATE TABLE public.consumption_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id INTEGER REFERENCES public.facility(facility_id),
  product_id UUID REFERENCES public.products(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  consumption_quantity NUMERIC NOT NULL DEFAULT 0,
  adjustments NUMERIC NOT NULL DEFAULT 0,
  wastage NUMERIC NOT NULL DEFAULT 0,
  stockout_days INTEGER NOT NULL DEFAULT 0,
  amc NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN (period_end - period_start + 1) > 0 
      THEN consumption_quantity / (period_end - period_start + 1) * 30
      ELSE 0 
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(facility_id, product_id, period_start, period_end)
);

-- Create forecast data sources table to link forecasts with their data sources
CREATE TABLE public.forecast_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_row_id UUID REFERENCES public.forecast_rows(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('inventory', 'manual', 'import')),
  source_reference_id UUID, -- references consumption_analytics.id for inventory sources
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_quality_flags JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_data_sources ENABLE ROW LEVEL SECURITY;

-- Add missing user_facility_memberships table if it doesn't exist with correct facility_id type
CREATE TABLE IF NOT EXISTS public.user_facility_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  facility_id INTEGER REFERENCES public.facility(facility_id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, facility_id)
);

ALTER TABLE public.user_facility_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_facility_memberships
CREATE POLICY "Users can view their own facility memberships" 
ON public.user_facility_memberships FOR SELECT 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage facility memberships" 
ON public.user_facility_memberships FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can view inventory transactions for their facility" 
ON public.inventory_transactions FOR SELECT 
USING (
  facility_id IN (
    SELECT ufm.facility_id FROM public.user_facility_memberships ufm 
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role)
);

CREATE POLICY "Users can create inventory transactions for their facility" 
ON public.inventory_transactions FOR INSERT 
WITH CHECK (
  facility_id IN (
    SELECT ufm.facility_id FROM public.user_facility_memberships ufm 
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) AND user_id = auth.uid()
);

CREATE POLICY "Admins can manage all inventory transactions" 
ON public.inventory_transactions FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for inventory_balances
CREATE POLICY "Users can view inventory balances for their facility" 
ON public.inventory_balances FOR SELECT 
USING (
  facility_id IN (
    SELECT ufm.facility_id FROM public.user_facility_memberships ufm 
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role)
);

CREATE POLICY "System can update inventory balances" 
ON public.inventory_balances FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

-- RLS Policies for consumption_analytics
CREATE POLICY "Users can view consumption analytics for their facility" 
ON public.consumption_analytics FOR SELECT 
USING (
  facility_id IN (
    SELECT ufm.facility_id FROM public.user_facility_memberships ufm 
    WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
  ) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role)
);

CREATE POLICY "System can manage consumption analytics" 
ON public.consumption_analytics FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

-- RLS Policies for forecast_data_sources
CREATE POLICY "Users can view forecast data sources" 
ON public.forecast_data_sources FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.forecast_rows fr 
    WHERE fr.id = forecast_row_id AND fr.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create indexes for performance
CREATE INDEX idx_inventory_transactions_facility_product ON public.inventory_transactions(facility_id, product_id);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_balances_facility ON public.inventory_balances(facility_id);
CREATE INDEX idx_consumption_analytics_facility_period ON public.consumption_analytics(facility_id, period_start, period_end);
CREATE INDEX idx_forecast_data_sources_forecast_row ON public.forecast_data_sources(forecast_row_id);

-- Create function to update inventory balances after transactions
CREATE OR REPLACE FUNCTION public.update_inventory_balance()
RETURNS TRIGGER AS $$
DECLARE
  balance_change NUMERIC;
BEGIN
  -- Calculate balance change based on transaction type
  CASE NEW.transaction_type
    WHEN 'receipt' THEN balance_change := NEW.quantity;
    WHEN 'issue' THEN balance_change := -NEW.quantity;
    WHEN 'adjustment' THEN balance_change := NEW.quantity;
    WHEN 'loss' THEN balance_change := -NEW.quantity;
    WHEN 'expired' THEN balance_change := -NEW.quantity;
    ELSE balance_change := 0;
  END CASE;

  -- Update or insert inventory balance
  INSERT INTO public.inventory_balances (facility_id, product_id, current_stock, last_transaction_date, last_updated)
  VALUES (NEW.facility_id, NEW.product_id, balance_change, NEW.transaction_date, now())
  ON CONFLICT (facility_id, product_id)
  DO UPDATE SET 
    current_stock = inventory_balances.current_stock + balance_change,
    last_transaction_date = NEW.transaction_date,
    last_updated = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for inventory balance updates
CREATE TRIGGER trigger_update_inventory_balance
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_balance();

-- Create function to calculate consumption analytics
CREATE OR REPLACE FUNCTION public.calculate_consumption_analytics(
  p_facility_id INTEGER,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS VOID AS $$
BEGIN
  -- Insert/update consumption analytics for the period
  INSERT INTO public.consumption_analytics (
    facility_id, 
    product_id, 
    period_start, 
    period_end, 
    consumption_quantity, 
    adjustments, 
    wastage
  )
  SELECT 
    p_facility_id,
    t.product_id,
    p_start_date,
    p_end_date,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'issue' THEN t.quantity ELSE 0 END), 0) as consumption,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'adjustment' THEN ABS(t.quantity) ELSE 0 END), 0) as adjustments,
    COALESCE(SUM(CASE WHEN t.transaction_type IN ('loss', 'expired') THEN t.quantity ELSE 0 END), 0) as wastage
  FROM public.inventory_transactions t
  WHERE t.facility_id = p_facility_id
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
  GROUP BY t.product_id
  ON CONFLICT (facility_id, product_id, period_start, period_end)
  DO UPDATE SET
    consumption_quantity = EXCLUDED.consumption_quantity,
    adjustments = EXCLUDED.adjustments,
    wastage = EXCLUDED.wastage,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create updated_at triggers
CREATE TRIGGER update_inventory_transactions_updated_at
  BEFORE UPDATE ON public.inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumption_analytics_updated_at
  BEFORE UPDATE ON public.consumption_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();