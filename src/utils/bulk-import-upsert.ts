// Upsert utilities for bulk import functionality

import { supabase } from "@/integrations/supabase/client";
import { DatabaseField } from "@/config/bulk-import-config";

interface UpsertResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Define unique field combinations for each table
const getUniqueFields = (tableName: string): string[] => {
  const uniqueFieldMap: { [key: string]: string[] } = {
    'facility': ['facility_code'],
    'product_reference': ['canonical_name'], // Use canonical_name as unique key
    'epss_regional_hubs': ['hub_code'],
    'profiles': ['email'],
    'woreda': ['woreda_name', 'zone_id'],
    'suppliers': ['name'],
    'inventory_balances': ['facility_id', 'product_id']
  };
  return uniqueFieldMap[tableName] || ['id'];
};

// Check if two records are equal (ignoring timestamps and auto-generated fields)
const recordsEqual = (existing: any, newRecord: any, tableName: string): boolean => {
  const ignoredFields = ['id', 'created_at', 'updated_at', 'last_updated'];
  
  // Get all fields from new record except ignored ones
  const fieldsToCompare = Object.keys(newRecord).filter(
    field => !ignoredFields.includes(field)
  );
  
  for (const field of fieldsToCompare) {
    const existingValue = existing[field];
    const newValue = newRecord[field];
    
    // Handle null/undefined comparison
    if ((existingValue === null || existingValue === undefined) && 
        (newValue === null || newValue === undefined)) {
      continue;
    }
    
    // Convert to strings for comparison to handle type differences
    if (String(existingValue) !== String(newValue)) {
      return false;
    }
  }
  
  return true;
};

// Simplified upsert using Supabase's built-in upsert
export const performUpsert = async (
  tableName: string,
  records: any[],
  databaseFields: DatabaseField[]
): Promise<UpsertResult> => {
  const result: UpsertResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    const uniqueFields = getUniqueFields(tableName);
    
    // Add updated_at to all records
    const recordsWithTimestamp = records.map(record => ({
      ...record,
      updated_at: new Date().toISOString()
    }));
    
    // Special handling for product_reference - use index name for onConflict
    if (tableName === 'product_reference') {
      // Since there are multiple unique indexes, we'll try upsert by canonical_name first
      // as it's the primary unique identifier for products
      try {
        const { error } = await supabase
          .from('product_reference')
          .upsert(recordsWithTimestamp, { 
            onConflict: 'canonical_name', 
            ignoreDuplicates: false, 
            count: 'exact' 
          });
        
        if (error) {
          result.errors.push(`Upsert failed: ${error.message}`);
        } else {
          result.updated = records.length;
        }
      } catch (error: any) {
        result.errors.push(`Upsert error: ${error.message}`);
      }
      
      return result;
    }

    // Generic upsert with onConflict parameter for other tables
    let upsertConfig: any = { 
      ignoreDuplicates: false,
      count: 'exact'
    };

    // Set onConflict based on table type for proper upsert behavior
    if (tableName === 'facility') {
      upsertConfig.onConflict = 'facility_code';
    } else if (tableName === 'epss_regional_hubs') {
      upsertConfig.onConflict = 'hub_code';
    } else if (tableName === 'profiles') {
      upsertConfig.onConflict = 'email';
    } else if (tableName === 'woreda') {
      upsertConfig.onConflict = 'woreda_name,zone_id';
    } else if (tableName === 'suppliers') {
      upsertConfig.onConflict = 'name';
    } else if (tableName === 'inventory_balances') {
      upsertConfig.onConflict = 'facility_id,product_id';
    }
    
    const { data, error, count } = await supabase
      .from(tableName as any)
      .upsert(recordsWithTimestamp, upsertConfig);
    
    if (error) {
      result.errors.push(`Upsert failed: ${error.message}`);
      return result;
    }
    
    // Report all as updated since we can't easily distinguish with upsert
    result.updated = records.length;
    
  } catch (error: any) {
    result.errors.push(`Unexpected error: ${error.message}`);
  }
  
  return result;
};

// Get readable description of upsert results
export const getUpsertSummary = (result: UpsertResult): string => {
  const parts: string[] = [];
  
  if (result.inserted > 0) {
    parts.push(`${result.inserted} new record${result.inserted !== 1 ? 's' : ''} added`);
  }
  
  if (result.updated > 0) {
    parts.push(`${result.updated} record${result.updated !== 1 ? 's' : ''} updated`);
  }
  
  if (result.skipped > 0) {
    parts.push(`${result.skipped} record${result.skipped !== 1 ? 's' : ''} skipped (no changes)`);
  }
  
  if (parts.length === 0) {
    return "No changes made";
  }
  
  return parts.join(', ');
};