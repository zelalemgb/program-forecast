-- Add foreign key constraints after cleaning orphaned data
-- This migration adds proper referential integrity constraints

-- Add foreign keys for inventory system
ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_product 
FOREIGN KEY (product_id) REFERENCES product_reference(id) ON DELETE CASCADE;

ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_source_facility 
FOREIGN KEY (source_facility_id) REFERENCES facility(facility_id) ON DELETE SET NULL;

ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_dest_facility 
FOREIGN KEY (destination_facility_id) REFERENCES facility(facility_id) ON DELETE SET NULL;

ALTER TABLE inventory_transactions 
ADD CONSTRAINT fk_inventory_transactions_approved_by 
FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add foreign keys for inventory balances
ALTER TABLE inventory_balances 
ADD CONSTRAINT fk_inventory_balances_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

ALTER TABLE inventory_balances 
ADD CONSTRAINT fk_inventory_balances_product 
FOREIGN KEY (product_id) REFERENCES product_reference(id) ON DELETE CASCADE;

-- Add foreign keys for consumption analytics
ALTER TABLE consumption_analytics 
ADD CONSTRAINT fk_consumption_analytics_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

ALTER TABLE consumption_analytics 
ADD CONSTRAINT fk_consumption_analytics_product 
FOREIGN KEY (product_id) REFERENCES product_reference(id) ON DELETE CASCADE;

-- Add foreign keys for user facility memberships
ALTER TABLE user_facility_memberships 
ADD CONSTRAINT fk_user_facility_memberships_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

ALTER TABLE user_facility_memberships 
ADD CONSTRAINT fk_user_facility_memberships_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign keys for departments
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

ALTER TABLE departments 
ADD CONSTRAINT fk_departments_head 
FOREIGN KEY (head_of_department) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add foreign keys for storage locations
ALTER TABLE storage_locations 
ADD CONSTRAINT fk_storage_locations_facility 
FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE;

-- Add foreign keys for profiles
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_preferred_facility 
FOREIGN KEY (preferred_facility_id) REFERENCES facility(facility_id) ON DELETE SET NULL;

-- Add unique constraints to prevent duplicate relationships
ALTER TABLE user_facility_memberships 
ADD CONSTRAINT unique_user_facility_membership 
UNIQUE (user_id, facility_id);

ALTER TABLE inventory_balances 
ADD CONSTRAINT unique_facility_product_balance 
UNIQUE (facility_id, product_id);

-- Add check constraints for data integrity
ALTER TABLE inventory_transactions 
ADD CONSTRAINT check_inventory_transaction_quantity_positive 
CHECK (quantity > 0);

ALTER TABLE inventory_balances 
ADD CONSTRAINT check_inventory_balance_non_negative 
CHECK (current_stock >= 0);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_facility_id ON inventory_transactions(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id ON inventory_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_inventory_balances_facility_id ON inventory_balances(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventory_balances_product_id ON inventory_balances(product_id);

CREATE INDEX IF NOT EXISTS idx_consumption_analytics_facility_id ON consumption_analytics(facility_id);
CREATE INDEX IF NOT EXISTS idx_consumption_analytics_product_id ON consumption_analytics(product_id);

CREATE INDEX IF NOT EXISTS idx_user_facility_memberships_user_id ON user_facility_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facility_memberships_facility_id ON user_facility_memberships(facility_id);