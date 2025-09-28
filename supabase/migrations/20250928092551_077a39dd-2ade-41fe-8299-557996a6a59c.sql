-- Fix foreign key constraint that references wrong table
-- Drop the incorrect constraint and clean up duplicates

-- Drop the incorrect constraint that references 'products' table
ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_product_id_fkey;

-- Drop duplicate constraints to clean up
ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_approved_by_fkey;

ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_destination_facility_id_fkey;

ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_facility_id_fkey;

ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_received_by_fkey;

ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_source_facility_id_fkey;

ALTER TABLE inventory_transactions 
DROP CONSTRAINT IF EXISTS inventory_transactions_user_id_fkey;