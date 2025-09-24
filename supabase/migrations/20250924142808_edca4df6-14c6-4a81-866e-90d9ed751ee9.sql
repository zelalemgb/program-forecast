-- Add phone_number column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Make justification optional in user_role_requests table  
ALTER TABLE public.user_role_requests ALTER COLUMN justification DROP NOT NULL;