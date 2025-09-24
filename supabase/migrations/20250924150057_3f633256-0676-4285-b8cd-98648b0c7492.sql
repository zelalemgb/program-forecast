-- Add inventory management fields to product_reference table
ALTER TABLE public.product_reference 
ADD COLUMN minimum_order_quantity numeric DEFAULT 0,
ADD COLUMN buffer_stock_level numeric DEFAULT 0,
ADD COLUMN maximum_stock_level numeric DEFAULT 0,
ADD COLUMN reorder_point numeric DEFAULT 0,
ADD COLUMN lead_time_days integer DEFAULT 0,
ADD COLUMN storage_temperature_min numeric,
ADD COLUMN storage_temperature_max numeric,
ADD COLUMN storage_humidity_min numeric,
ADD COLUMN storage_humidity_max numeric,
ADD COLUMN shelf_life_months integer,
ADD COLUMN abc_classification text CHECK (abc_classification IN ('A', 'B', 'C')),
ADD COLUMN criticality_level text CHECK (criticality_level IN ('Critical', 'Essential', 'Non-Essential')),
ADD COLUMN controlled_substance boolean DEFAULT false,
ADD COLUMN refrigeration_required boolean DEFAULT false,
ADD COLUMN narcotics_classification text;