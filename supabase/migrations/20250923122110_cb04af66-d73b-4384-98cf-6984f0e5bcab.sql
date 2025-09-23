-- Enhance products table for comprehensive health commodity management
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT CHECK (product_type IN ('medicine', 'test_kit', 'reagent', 'consumable', 'equipment', 'vaccine', 'supply')),
ADD COLUMN IF NOT EXISTS therapeutic_category TEXT,
ADD COLUMN IF NOT EXISTS dosage_form TEXT,
ADD COLUMN IF NOT EXISTS strength TEXT,
ADD COLUMN IF NOT EXISTS manufacturer TEXT,
ADD COLUMN IF NOT EXISTS manufacturer_code TEXT,
ADD COLUMN IF NOT EXISTS generic_name TEXT,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS pack_size INTEGER,
ADD COLUMN IF NOT EXISTS storage_conditions TEXT,
ADD COLUMN IF NOT EXISTS cold_chain_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS controlled_substance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prescription_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expiry_tracking_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS batch_tracking_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS serial_tracking_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS minimum_shelf_life_days INTEGER,
ADD COLUMN IF NOT EXISTS procurement_unit TEXT,
ADD COLUMN IF NOT EXISTS dispensing_unit TEXT,
ADD COLUMN IF NOT EXISTS conversion_factor NUMERIC DEFAULT 1,
ADD COLUMN IF NOT EXISTS standard_cost NUMERIC,
ADD COLUMN IF NOT EXISTS vat_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS regulatory_status TEXT,
ADD COLUMN IF NOT EXISTS who_prequalified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS essential_medicine BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pediatric_formulation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS instructions_for_use TEXT,
ADD COLUMN IF NOT EXISTS contraindications TEXT,
ADD COLUMN IF NOT EXISTS side_effects TEXT,
ADD COLUMN IF NOT EXISTS active_status BOOLEAN DEFAULT true;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_therapeutic_category ON public.products(therapeutic_category);
CREATE INDEX IF NOT EXISTS idx_products_active_status ON public.products(active_status);
CREATE INDEX IF NOT EXISTS idx_products_cold_chain ON public.products(cold_chain_required);
CREATE INDEX IF NOT EXISTS idx_products_controlled ON public.products(controlled_substance);

-- Enhance inventory_transactions table for more comprehensive tracking
ALTER TABLE public.inventory_transactions
ADD COLUMN IF NOT EXISTS source_facility_id INTEGER REFERENCES public.facility(facility_id),
ADD COLUMN IF NOT EXISTS destination_facility_id INTEGER REFERENCES public.facility(facility_id),
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS supplier_batch_number TEXT,
ADD COLUMN IF NOT EXISTS manufacturer_batch_number TEXT,
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS grn_number TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS donation_source TEXT,
ADD COLUMN IF NOT EXISTS funding_source TEXT,
ADD COLUMN IF NOT EXISTS storage_location TEXT,
ADD COLUMN IF NOT EXISTS temperature_at_receipt NUMERIC,
ADD COLUMN IF NOT EXISTS condition_at_receipt TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS received_by UUID REFERENCES auth.users(id);

-- Update transaction types (drop existing constraint and add new one)
ALTER TABLE public.inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_transaction_type_check;

ALTER TABLE public.inventory_transactions 
ADD CONSTRAINT inventory_transactions_transaction_type_check 
CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'loss', 'expired', 'transfer_out', 'transfer_in', 'loan_out', 'loan_in', 'return', 'disposal', 'damaged', 'recalled'));

-- Create departments table for internal facility departments (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id INTEGER NOT NULL REFERENCES public.facility(facility_id),
  department_name TEXT NOT NULL,
  department_code TEXT,
  department_type TEXT CHECK (department_type IN ('clinical', 'laboratory', 'pharmacy', 'administrative', 'maintenance')),
  head_of_department UUID REFERENCES auth.users(id),
  active_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(facility_id, department_name)
);

-- Enable RLS on departments (only if table was created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'departments' 
    AND policyname = 'Users can view departments for their facility'
  ) THEN
    ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view departments for their facility" 
    ON public.departments 
    FOR SELECT 
    USING (
      facility_id IN (
        SELECT ufm.facility_id 
        FROM user_facility_memberships ufm 
        WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
      ) OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'analyst'::app_role)
    );

    CREATE POLICY "Facility users can manage departments" 
    ON public.departments 
    FOR ALL 
    USING (
      facility_id IN (
        SELECT ufm.facility_id 
        FROM user_facility_memberships ufm 
        WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
      ) OR 
      has_role(auth.uid(), 'admin'::app_role)
    );
  END IF;
END $$;

-- Create storage locations table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.storage_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id INTEGER NOT NULL REFERENCES public.facility(facility_id),
  location_name TEXT NOT NULL,
  location_code TEXT,
  location_type TEXT CHECK (location_type IN ('warehouse', 'cold_room', 'pharmacy', 'laboratory', 'department', 'quarantine')),
  temperature_controlled BOOLEAN DEFAULT false,
  min_temperature NUMERIC,
  max_temperature NUMERIC,
  humidity_controlled BOOLEAN DEFAULT false,
  min_humidity NUMERIC,
  max_humidity NUMERIC,
  capacity_cubic_meters NUMERIC,
  security_level TEXT CHECK (security_level IN ('low', 'medium', 'high', 'maximum')),
  active_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(facility_id, location_code)
);

-- Enable RLS on storage_locations (only if table was created)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'storage_locations' 
    AND policyname = 'Users can view storage locations for their facility'
  ) THEN
    ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view storage locations for their facility" 
    ON public.storage_locations 
    FOR SELECT 
    USING (
      facility_id IN (
        SELECT ufm.facility_id 
        FROM user_facility_memberships ufm 
        WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
      ) OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_role(auth.uid(), 'analyst'::app_role)
    );

    CREATE POLICY "Facility users can manage storage locations" 
    ON public.storage_locations 
    FOR ALL 
    USING (
      facility_id IN (
        SELECT ufm.facility_id 
        FROM user_facility_memberships ufm 
        WHERE ufm.user_id = auth.uid() AND ufm.status = 'approved'
      ) OR 
      has_role(auth.uid(), 'admin'::app_role)
    );
  END IF;
END $$;

-- Add triggers for updated_at (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_departments_updated_at'
  ) THEN
    CREATE TRIGGER update_departments_updated_at
      BEFORE UPDATE ON public.departments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_storage_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_storage_locations_updated_at
      BEFORE UPDATE ON public.storage_locations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enhance inventory_balances for more detailed tracking
ALTER TABLE public.inventory_balances
ADD COLUMN IF NOT EXISTS reserved_stock NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_stock_level NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS maximum_stock_level NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS safety_stock_level NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_monthly_consumption NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_consumption_date DATE,
ADD COLUMN IF NOT EXISTS last_receipt_date DATE;