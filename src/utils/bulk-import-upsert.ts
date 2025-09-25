// Upsert utilities for bulk import functionality

import { supabase } from "@/integrations/supabase/client";
import { DatabaseField } from "@/config/bulk-import-config";
import { resolveHierarchy, bulkResolveHierarchy } from "./hierarchy-resolver";

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

// Get conflict resolution field for upserts
const getConflictField = (tableName: string): string => {
  const conflictFieldMap: { [key: string]: string } = {
    'facility': 'facility_code',
    'product_reference': 'canonical_name',
    'epss_regional_hubs': 'hub_code',
    'profiles': 'email',
    'woreda': 'woreda_name,zone_id',
    'suppliers': 'name',
    'inventory_balances': 'facility_id,product_id'
  };
  return conflictFieldMap[tableName] || 'id';
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

  if (!records || records.length === 0) {
    return result;
  }

  try {
    const uniqueFields = getUniqueFields(tableName);
    
    // Special handling for facility table - resolve administrative hierarchy
    let processedRecords = records;
    if (tableName === 'facility') {
      processedRecords = await resolveFacilityHierarchy(records);
    }
    
    // Clean records - remove null values to prevent overwriting existing data
    const recordsWithTimestamp = processedRecords.map(record => {
      const cleanRecord = { ...record, updated_at: new Date().toISOString() };
      
      // For facility table, don't overwrite existing location data with nulls
      if (tableName === 'facility') {
        Object.keys(cleanRecord).forEach(key => {
          if (['region_id', 'zone_id', 'woreda_id', 'latitude', 'longitude', 'regional_hub_id'].includes(key) && 
              (cleanRecord[key] === null || cleanRecord[key] === undefined || cleanRecord[key] === '')) {
            delete cleanRecord[key];
          }
          // Remove hierarchy name fields as they're not database columns
          if (['country_name', 'region_name', 'zone_name', 'woreda_name'].includes(key)) {
            delete cleanRecord[key];
          }
        });
      }
      
      return cleanRecord;
    });
    
    // Special handling for product_reference - handle duplicates within batch
    if (tableName === 'product_reference') {
      try {
        // Remove duplicates within the batch based on canonical_name AND code
        const uniqueRecords = recordsWithTimestamp.reduce((acc, record) => {
          const canonicalKey = record.canonical_name;
          const codeKey = record.code;
          
          // Skip if we already have this canonical_name
          if (acc.canonicalNames.has(canonicalKey)) {
            return acc;
          }
          
          // Skip if we already have this code (and code is not null/empty)
          if (codeKey && codeKey.trim() && acc.codes.has(codeKey)) {
            return acc;
          }
          
          // Add to tracking sets
          acc.canonicalNames.add(canonicalKey);
          if (codeKey && codeKey.trim()) {
            acc.codes.add(codeKey);
          }
          
          acc.records.push(record);
          return acc;
        }, { 
          canonicalNames: new Set<string>(), 
          codes: new Set<string>(), 
          records: [] as any[] 
        });

        const deduplicatedRecords = uniqueRecords.records;
        
        const { error } = await supabase
          .from('product_reference')
          .upsert(deduplicatedRecords, { 
            onConflict: 'canonical_name', 
            ignoreDuplicates: false, 
            count: 'exact' 
          });
        
        if (error) {
          result.errors.push(`Upsert failed: ${error.message}`);
        } else {
          result.updated = deduplicatedRecords.length;
          if (records.length > deduplicatedRecords.length) {
            result.skipped = records.length - deduplicatedRecords.length;
          }
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
    const conflictField = getConflictField(tableName);
    if (conflictField) {
      upsertConfig.onConflict = conflictField;
    }
    
    console.log(`Attempting upsert for ${tableName} with config:`, upsertConfig);
    console.log(`Records to upsert:`, recordsWithTimestamp.slice(0, 2)); // Log first 2 records for debugging
    
    const { data, error, count } = await supabase
      .from(tableName as any)
      .upsert(recordsWithTimestamp, upsertConfig);
    
    if (error) {
      console.error(`Upsert failed for ${tableName}:`, {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      result.errors.push(`Upsert failed for ${tableName}: ${error.message}${error.hint ? ` (Hint: ${error.hint})` : ''}${error.details ? ` (Details: ${error.details})` : ''}`);
      return result;
    }
    
    console.log(`Upsert successful for ${tableName}:`, { count, recordCount: records.length });
    
    // Since we can't distinguish inserts from updates with upsert, report all as updated
    // In the future, we could implement a more sophisticated tracking mechanism
    result.updated = records.length;
    
    console.log(`Upsert completed - reported ${result.updated} records as updated for ${tableName}`);
    
  } catch (error: any) {
    result.errors.push(`Unexpected error: ${error.message}`);
  }
  
  return result;
};

// Resolve administrative hierarchy for facility records
const resolveFacilityHierarchy = async (records: any[]): Promise<any[]> => {
  console.log(`Starting hierarchy resolution for ${records.length} facility records`);
  
  // Extract location names from records
  const locationNames = records.map(record => ({
    country_name: record.country_name,
    region_name: record.region_name,
    zone_name: record.zone_name,
    woreda_name: record.woreda_name
  }));
  
  // Bulk resolve hierarchy to minimize database calls
  const hierarchyResults = await bulkResolveHierarchy(locationNames);
  
  // Merge hierarchy results with original records
  const processedRecords = records.map((record, index) => {
    const hierarchy = hierarchyResults[index];
    return {
      ...record,
      country_id: hierarchy.country_id,
      region_id: hierarchy.region_id,
      zone_id: hierarchy.zone_id,
      woreda_id: hierarchy.woreda_id
    };
  });
  
  console.log(`Completed hierarchy resolution for ${processedRecords.length} records`);
  return processedRecords;
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