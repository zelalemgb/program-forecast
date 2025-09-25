-- Add preferred_facility_id to profiles to retain selected facility during registration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_facility_id integer;

-- Add a foreign key constraint to facility table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint 
    WHERE conname = 'profiles_preferred_facility_fk'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_preferred_facility_fk
    FOREIGN KEY (preferred_facility_id)
    REFERENCES public.facility(facility_id)
    ON DELETE SET NULL;
  END IF;
END $$;