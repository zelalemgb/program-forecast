-- Clean up orphaned data before adding foreign key constraints
-- This migration fixes referential integrity issues by cleaning orphaned records

-- First, let's identify and fix orphaned records in inventory_transactions
-- Delete transactions that reference non-existent products
DELETE FROM inventory_transactions 
WHERE product_id IS NOT NULL 
  AND product_id NOT IN (SELECT id FROM product_reference);

-- Delete transactions that reference non-existent facilities
DELETE FROM inventory_transactions 
WHERE facility_id IS NOT NULL 
  AND facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up inventory_balances
DELETE FROM inventory_balances 
WHERE product_id IS NOT NULL 
  AND product_id NOT IN (SELECT id FROM product_reference);

DELETE FROM inventory_balances 
WHERE facility_id IS NOT NULL 
  AND facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up consumption_analytics
DELETE FROM consumption_analytics 
WHERE product_id IS NOT NULL 
  AND product_id NOT IN (SELECT id FROM product_reference);

DELETE FROM consumption_analytics 
WHERE facility_id IS NOT NULL 
  AND facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up user_facility_memberships
DELETE FROM user_facility_memberships 
WHERE facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up departments
DELETE FROM departments 
WHERE facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up storage_locations
DELETE FROM storage_locations 
WHERE facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up profiles
UPDATE profiles 
SET preferred_facility_id = NULL 
WHERE preferred_facility_id IS NOT NULL 
  AND preferred_facility_id NOT IN (SELECT facility_id FROM facility);

-- Clean up product_prices
DELETE FROM product_prices 
WHERE product_id NOT IN (SELECT id FROM product_reference);

-- Clean up product_mappings
DELETE FROM product_mappings 
WHERE product_reference_id IS NOT NULL 
  AND product_reference_id NOT IN (SELECT id FROM product_reference);

-- Clean up procurement_request_items that don't have valid requests
DELETE FROM procurement_request_items 
WHERE request_id NOT IN (SELECT id FROM procurement_requests);

-- Clean up request_comments that don't have valid requests
DELETE FROM request_comments 
WHERE request_id NOT IN (SELECT id FROM procurement_requests);

-- Clean up finance_status that don't have valid requests
DELETE FROM finance_status 
WHERE request_id NOT IN (SELECT id FROM procurement_requests);

-- Clean up forecast_data_sources that don't have valid forecast_rows
DELETE FROM forecast_data_sources 
WHERE forecast_row_id IS NOT NULL 
  AND forecast_row_id NOT IN (SELECT id FROM forecast_rows);