-- Create hierarchical administrative structure step by step

-- 1. First ensure countries table exists with proper structure
DROP TABLE IF EXISTS public.countries CASCADE;
CREATE TABLE public.countries (
  country_id SERIAL PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL UNIQUE,
  country_code VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add country_id to existing region table
ALTER TABLE public.region ADD COLUMN IF NOT EXISTS country_id INTEGER;
ALTER TABLE public.region ADD COLUMN IF NOT EXISTS region_code VARCHAR(20);

-- 3. Add region_id to existing zone table (if not exists)
ALTER TABLE public.zone ADD COLUMN IF NOT EXISTS zone_code VARCHAR(20);

-- 4. Add missing columns to woreda table
ALTER TABLE public.woreda ADD COLUMN IF NOT EXISTS country_id INTEGER;
ALTER TABLE public.woreda ADD COLUMN IF NOT EXISTS region_id INTEGER;
ALTER TABLE public.woreda ADD COLUMN IF NOT EXISTS woreda_code VARCHAR(20);

-- 5. Add country_id to facility table
ALTER TABLE public.facility ADD COLUMN IF NOT EXISTS country_id INTEGER;

-- Insert Ethiopia as default country
INSERT INTO public.countries (country_name, country_code)
VALUES ('Ethiopia', 'ET');

-- Get Ethiopia's country_id for default values
DO $$
DECLARE
    ethiopia_id INTEGER;
BEGIN
    SELECT country_id INTO ethiopia_id FROM public.countries WHERE country_name = 'Ethiopia';
    
    -- Update existing regions to belong to Ethiopia
    UPDATE public.region SET country_id = ethiopia_id WHERE country_id IS NULL;
    
    -- Update existing woredas to belong to Ethiopia
    UPDATE public.woreda SET country_id = ethiopia_id WHERE country_id IS NULL;
    
    -- Update existing facilities to belong to Ethiopia
    UPDATE public.facility SET country_id = ethiopia_id WHERE country_id IS NULL;
END $$;