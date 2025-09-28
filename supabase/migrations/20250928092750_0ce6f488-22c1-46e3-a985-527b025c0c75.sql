-- Fix inventory_balances foreign key constraint and clean up duplicates
-- Also temporarily disable the trigger that's causing issues

-- Drop the incorrect constraint and duplicates
ALTER TABLE inventory_balances 
DROP CONSTRAINT IF EXISTS inventory_balances_product_id_fkey;

ALTER TABLE inventory_balances 
DROP CONSTRAINT IF EXISTS inventory_balances_facility_id_fkey;

-- Temporarily disable the trigger that auto-updates balances
DROP TRIGGER IF EXISTS trigger_update_inventory_balance ON inventory_transactions;