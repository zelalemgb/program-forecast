-- Fix audit trigger function to handle different primary key names
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    record_id_value TEXT;
BEGIN
    -- Determine the record ID based on table name and available columns
    IF TG_TABLE_NAME = 'facility' THEN
        record_id_value := CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.facility_id::TEXT
            ELSE NEW.facility_id::TEXT
        END;
    ELSE
        -- Default case for tables with 'id' column
        record_id_value := CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
            ELSE NEW.id::TEXT
        END;
    END IF;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, record_id_value, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, record_id_value, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, record_id_value, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Now insert sample facility data
INSERT INTO public.facility (
  facility_name, 
  facility_code, 
  facility_type, 
  woreda_id, 
  level, 
  ownership,
  latitude,
  longitude
) VALUES 
(
  'Addis Ababa General Hospital',
  'AAGH001',
  'Hospital',
  1,
  'Tertiary',
  'Government',
  9.0192,
  38.7525
),
(
  'Bole Health Center',
  'BHC002', 
  'Health Center',
  1,
  'Primary',
  'Government',
  8.9806,
  38.7578
);