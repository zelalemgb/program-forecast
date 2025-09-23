-- Enhance products table for comprehensive health commodity management
ALTER TABLE public.products 
ADD COLUMN product_type TEXT CHECK (product_type IN ('medicine', 'test_kit', 'reagent', 'consumable', 'equipment', 'vaccine', 'supply')),
ADD COLUMN therapeutic_category TEXT,
ADD COLUMN dosage_form TEXT,
ADD COLUMN strength TEXT,
ADD COLUMN manufacturer TEXT,
ADD COLUMN manufacturer_code TEXT,
ADD COLUMN generic_name TEXT,
ADD COLUMN brand_name TEXT,
ADD COLUMN pack_size INTEGER,
ADD COLUMN storage_conditions TEXT,
ADD COLUMN cold_chain_required BOOLEAN DEFAULT false,
ADD COLUMN controlled_substance BOOLEAN DEFAULT false,
ADD COLUMN prescription_required BOOLEAN DEFAULT false,
ADD COLUMN expiry_tracking_required BOOLEAN DEFAULT true,
ADD COLUMN batch_tracking_required BOOLEAN DEFAULT true,
ADD COLUMN serial_tracking_required BOOLEAN DEFAULT false,
ADD COLUMN minimum_shelf_life_days INTEGER,
ADD COLUMN procurement_unit TEXT,
ADD COLUMN dispensing_unit TEXT,
ADD COLUMN conversion_factor NUMERIC DEFAULT 1,
ADD COLUMN standard_cost NUMERIC,
ADD COLUMN vat_rate NUMERIC DEFAULT 0,
ADD COLUMN registration_number TEXT,
ADD COLUMN regulatory_status TEXT,
ADD COLUMN who_prequalified BOOLEAN DEFAULT false,
ADD COLUMN essential_medicine BOOLEAN DEFAULT false,
ADD COLUMN pediatric_formulation BOOLEAN DEFAULT false,
ADD COLUMN description TEXT,
ADD COLUMN instructions_for_use TEXT,
ADD COLUMN contraindications TEXT,
ADD COLUMN side_effects TEXT,
ADD COLUMN active_status BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX idx_products_product_type ON public.products(product_type);
CREATE INDEX idx_products_therapeutic_category ON public.products(therapeutic_category);
CREATE INDEX idx_products_active_status ON public.products(active_status);
CREATE INDEX idx_products_cold_chain ON public.products(cold_chain_required);
CREATE INDEX idx_products_controlled ON public.products(controlled_substance);

-- Enhance inventory_transactions table for more comprehensive tracking
ALTER TABLE public.inventory_transactions
ADD COLUMN source_facility_id INTEGER REFERENCES public.facility(facility_id),
ADD COLUMN destination_facility_id INTEGER REFERENCES public.facility(facility_id),
ADD COLUMN department TEXT,
ADD COLUMN supplier_name TEXT,
ADD COLUMN supplier_batch_number TEXT,
ADD COLUMN manufacturer_batch_number TEXT,
ADD COLUMN serial_number TEXT,
ADD COLUMN grn_number TEXT,
ADD COLUMN invoice_number TEXT,
ADD COLUMN donation_source TEXT,
ADD COLUMN funding_source TEXT,
ADD COLUMN storage_location TEXT,
ADD COLUMN temperature_at_receipt NUMERIC,
ADD COLUMN condition_at_receipt TEXT,
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN received_by UUID REFERENCES auth.users(id);

-- Add more transaction types
ALTER TABLE public.inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_transaction_type_check;

ALTER TABLE public.inventory_transactions 
ADD CONSTRAINT inventory_transactions_transaction_type_check 
CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'loss', 'expired', 'transfer_out', 'transfer_in', 'loan_out', 'loan_in', 'return', 'disposal', 'damaged', 'recalled'));

-- Create departments table for internal facility departments
CREATE TABLE public.departments (
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

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
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

-- Create suppliers table for tracking supply sources
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_name TEXT NOT NULL,
  supplier_code TEXT UNIQUE,
  supplier_type TEXT CHECK (supplier_type IN ('manufacturer', 'distributor', 'wholesaler', 'donor', 'government', 'ngo')),
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  country TEXT,
  certification_status TEXT,
  prequalification_status TEXT,
  active_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "All authenticated users can view suppliers" 
ON public.suppliers 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins and analysts can modify suppliers" 
ON public.suppliers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'analyst'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage locations table for warehouse management
CREATE TABLE public.storage_locations (
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

-- Enable RLS on storage_locations
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for storage_locations
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

-- Add trigger for updated_at
CREATE TRIGGER update_storage_locations_updated_at
  BEFORE UPDATE ON public.storage_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enhance inventory_balances for more detailed tracking
ALTER TABLE public.inventory_balances
ADD COLUMN reserved_stock NUMERIC DEFAULT 0,
ADD COLUMN available_stock NUMERIC GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
ADD COLUMN minimum_stock_level NUMERIC DEFAULT 0,
ADD COLUMN maximum_stock_level NUMERIC DEFAULT 0,
ADD COLUMN safety_stock_level NUMERIC DEFAULT 0,
ADD COLUMN average_monthly_consumption NUMERIC DEFAULT 0,
ADD COLUMN last_consumption_date DATE,
ADD COLUMN last_receipt_date DATE,
ADD COLUMN months_of_stock NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN average_monthly_consumption > 0 THEN current_stock / average_monthly_consumption 
    ELSE NULL 
  END
) STORED,
ADD COLUMN stock_status TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN current_stock <= 0 THEN 'stock_out'
    WHEN current_stock <= minimum_stock_level THEN 'low_stock'
    WHEN current_stock >= maximum_stock_level THEN 'overstock'
    ELSE 'normal'
  END
) STORED;