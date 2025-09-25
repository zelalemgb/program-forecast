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
    'countries': ['country_name'],
    'region': ['region_name', 'country_id'],
    'zone': ['zone_name', 'region_id'],
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
    'countries': 'country_name',
    'region': 'region_name,country_id',
    'zone': 'zone_name,region_id',
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
    
    // Special handling for administrative tables - resolve hierarchy
    let processedRecords = records;
    if (tableName === 'facility') {
      const originalCount = records.length;
      processedRecords = await resolveFacilityHierarchy(records);
      const validCount = processedRecords.length;
      
      if (validCount < originalCount) {
        const skippedCount = originalCount - validCount;
        console.warn(`Facility import: ${validCount} valid facilities processed, ${skippedCount} skipped due to data quality issues or missing woreda assignments`);
      }
    } else if (tableName === 'region') {
      processedRecords = await resolveRegionHierarchy(records);
    } else if (tableName === 'zone') {
      processedRecords = await resolveZoneHierarchy(records);
    } else if (tableName === 'woreda') {
      processedRecords = await resolveWoredaHierarchy(records);
    }
    
    // Clean records - remove null values to prevent overwriting existing data
    let recordsWithTimestamp = processedRecords.map(record => {
      const cleanRecord = { ...record, updated_at: new Date().toISOString() };
      // For facility table, don't overwrite existing location data with nulls and strip removed columns
      if (tableName === 'facility') {
        Object.keys(cleanRecord).forEach(key => {
          if ([
            // columns not present on facility anymore
            'country_id', 'region_id', 'zone_id',
            // allowed but optional
            'woreda_id', 'latitude', 'longitude', 'regional_hub_id'
          ].includes(key) && 
              (cleanRecord[key] === null || cleanRecord[key] === undefined || cleanRecord[key] === '')) {
            delete cleanRecord[key];
          }
          // Always remove columns that no longer exist on facility
          if (['country_id', 'region_id', 'zone_id'].includes(key)) {
            delete cleanRecord[key];
          }
          // Remove hierarchy name fields as they're not database columns
          if (['country_name', 'region_name', 'zone_name', 'woreda_name'].includes(key)) {
            delete cleanRecord[key];
          }
        });
      }
      
      // Clean up fields for administrative tables
      if (tableName === 'countries') {
        // Countries table is simple - no cleanup needed
      } else if (tableName === 'region') {
        Object.keys(cleanRecord).forEach(key => {
          if (['country_name', 'region_id'].includes(key)) {
            delete cleanRecord[key];
          }
        });
      } else if (tableName === 'zone') {
        Object.keys(cleanRecord).forEach(key => {
          if (['country_name', 'region_name', 'zone_id'].includes(key)) {
            delete cleanRecord[key];
          }
        });
      } else if (tableName === 'woreda') {
        Object.keys(cleanRecord).forEach(key => {
          // Remove name/code fields and disallow passing woreda_id for inserts
          if (['country_name', 'country_code', 'region_name', 'region_code', 'zone_name', 'zone_code', 'woreda_id'].includes(key)) {
            delete cleanRecord[key];
          }
        });
      }
      
      return cleanRecord;
    });
    
    // If nothing valid remains after processing, stop early
    if (recordsWithTimestamp.length === 0) {
      result.skipped = records.length;
      result.errors.push('No valid rows to import after validation');
      return result;
    }
    
    // Handle duplicates within batch for various table types
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

    // Handle duplicates within batch for administrative areas
    if (['countries', 'region', 'zone', 'woreda'].includes(tableName)) {
      const conflictFields = getConflictField(tableName).split(',');
      const uniqueRecords = recordsWithTimestamp.reduce((acc, record) => {
        // Create a unique key based on conflict fields
        const key = conflictFields.map(field => record[field]).join('|');
        
        // Skip if we already have this combination
        if (acc.keys.has(key)) {
          return acc;
        }
        
        acc.keys.add(key);
        acc.records.push(record);
        return acc;
      }, { 
        keys: new Set<string>(), 
        records: [] as any[] 
      });

      const deduplicatedRecords = uniqueRecords.records;
      
      if (records.length > deduplicatedRecords.length) {
        console.log(`Removed ${records.length - deduplicatedRecords.length} duplicate records from batch for ${tableName}`);
      }
      
      let upsertConfig: any = { 
        ignoreDuplicates: false,
        count: 'exact'
      };

      const conflictField = getConflictField(tableName);
      if (conflictField) {
        upsertConfig.onConflict = conflictField;
      }
      
      console.log(`Attempting upsert for ${tableName} with config:`, upsertConfig);
      console.log(`Records to upsert:`, deduplicatedRecords.slice(0, 2)); // Log first 2 records for debugging
      
      const { data, error, count } = await supabase
        .from(tableName as any)
        .upsert(deduplicatedRecords, upsertConfig);
      
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
      
      console.log(`Upsert successful for ${tableName}:`, { count, recordCount: deduplicatedRecords.length });
      
      result.updated = deduplicatedRecords.length;
      if (records.length > deduplicatedRecords.length) {
        result.skipped = records.length - deduplicatedRecords.length;
      }
      
      console.log(`Upsert completed - reported ${result.updated} records as updated, ${result.skipped || 0} skipped for ${tableName}`);
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

  // Get all woredas with their zone and region info for matching
  const { data: allWoredas, error: woredaError } = await supabase
    .from('woreda')
    .select('woreda_id, woreda_name, zone_id');

  if (woredaError) {
    console.error('Failed to fetch woredas:', woredaError);
    throw new Error('Failed to load woreda data for facility import');
  }

  // Get zone information if needed for disambiguation
  const { data: allZones } = await supabase
    .from('zone')
    .select('zone_id, zone_name, region_id');

  // Get region information if needed for disambiguation  
  const { data: allRegions } = await supabase
    .from('region')
    .select('region_id, region_name');

  // Track facility codes to detect duplicates in the import batch
  const facilityCodesSeen = new Set<string>();
  const duplicateCodeWarnings = new Set<string>();

  const processedRecords = records.map((record) => {
    // Data quality check - validate required fields
    const facility_name = record.facility_name?.toString().trim();
    const facility_code = record.facility_code?.toString().trim();
    const woreda_name = record.woreda_name?.toString().trim();

    if (!facility_name || !facility_code || !woreda_name || 
        facility_name.length < 2 || facility_code.length < 2) {
      const missing = [];
      if (!facility_name || facility_name.length < 2) missing.push('facility_name (must be at least 2 characters)');
      if (!facility_code || facility_code.length < 2) missing.push('facility_code (must be at least 2 characters)'); 
      if (!woreda_name) missing.push('woreda_name');
      
      console.warn(`Facility skipped - invalid required fields: ${missing.join(', ')}. Row: ${facility_name || 'unnamed'} | ${facility_code || 'no-code'}`);
      return null;
    }

    // Check for duplicate facility codes in the import batch
    if (facilityCodesSeen.has(facility_code)) {
      if (!duplicateCodeWarnings.has(facility_code)) {
        console.warn(`Duplicate facility code found in import: ${facility_code}. Only the first occurrence will be processed.`);
        duplicateCodeWarnings.add(facility_code);
      }
      return null;
    }
    facilityCodesSeen.add(facility_code);

    let woreda_id = record.woreda_id ?? null;

    // If woreda_id not provided, try to resolve by names
    if (!woreda_id && record.woreda_name) {
      const woreda_name = record.woreda_name.trim();
      
      // Try exact match first
      let matchingWoredas = allWoredas?.filter(w => 
        w.woreda_name?.toLowerCase() === woreda_name.toLowerCase()
      ) || [];

      // If multiple matches and we have zone/region info, filter further
      if (matchingWoredas.length > 1 && (record.zone_name || record.region_name)) {
        if (record.zone_name && allZones) {
          const zone_name = record.zone_name.trim();
          const matchingZones = allZones.filter(z => 
            z.zone_name?.toLowerCase() === zone_name.toLowerCase()
          );
          const zoneIds = matchingZones.map(z => z.zone_id);
          matchingWoredas = matchingWoredas.filter(w => zoneIds.includes(w.zone_id));
        }
        
        if (matchingWoredas.length > 1 && record.region_name && allRegions && allZones) {
          const region_name = record.region_name.trim();
          const matchingRegions = allRegions.filter(r => 
            r.region_name?.toLowerCase() === region_name.toLowerCase()
          );
          const regionIds = matchingRegions.map(r => r.region_id);
          const validZoneIds = allZones.filter(z => regionIds.includes(z.region_id)).map(z => z.zone_id);
          matchingWoredas = matchingWoredas.filter(w => validZoneIds.includes(w.zone_id));
        }
      }

      if (matchingWoredas.length === 1) {
        woreda_id = matchingWoredas[0].woreda_id;
      } else if (matchingWoredas.length > 1) {
        console.warn(`Multiple woredas found for "${woreda_name}". Provide zone/region to disambiguate. Skipping facility: ${record.facility_name || 'Unknown'}`);
      } else {
        console.warn(`No woreda found for "${woreda_name}". Skipping facility: ${record.facility_name || 'Unknown'}`);
      }
    }

    // Only include facility if we have a valid woreda_id
    if (!woreda_id) {
      console.warn(`Facility "${record.facility_name || 'Unknown'}" skipped - no valid woreda assignment`);
      return null;
    }

    const out: any = { ...record };
    out.woreda_id = woreda_id;

    // Ensure we never pass removed columns
    delete out.country_id;
    delete out.region_id;
    delete out.zone_id;
    // Remove name fields that aren't database columns
    delete out.country_name;
    delete out.region_name;
    delete out.zone_name;
    delete out.woreda_name;

    return out;
  }).filter(record => record !== null); // Remove null records (facilities without valid woreda)

  const skippedCount = records.length - processedRecords.length;
  console.log(`Completed hierarchy resolution: ${processedRecords.length} valid facilities out of ${records.length} total${skippedCount > 0 ? ` (${skippedCount} skipped due to missing woreda)` : ''}`);
  return processedRecords;
};

// Resolve country for region imports
const resolveRegionHierarchy = async (records: any[]): Promise<any[]> => {
  console.log(`Resolving hierarchy for ${records.length} region records`);

  const locationNames = records.map(record => ({
    country_name: record.country_name || 'Ethiopia'
  }));

  const hierarchyResults = await bulkResolveHierarchy(locationNames);

  const processedRecords = records.map((record, index) => {
    const h = hierarchyResults[index] || {} as any;
    const merged = {
      ...record,
      country_id: h.country_id ?? record.country_id ?? null
    };
    if ('region_id' in merged) delete (merged as any).region_id;
    return merged;
  });

  console.log(`Completed resolving parents for region: ${processedRecords.length}`);
  return processedRecords;
};

// Resolve country/region for zone imports
const resolveZoneHierarchy = async (records: any[]): Promise<any[]> => {
  console.log(`Resolving hierarchy for ${records.length} zone records`);

  const locationNames = records.map(record => ({
    country_name: record.country_name || 'Ethiopia',
    region_name: record.region_name
  }));

  const hierarchyResults = await bulkResolveHierarchy(locationNames);

  const processedRecords = records.map((record, index) => {
    const h = hierarchyResults[index] || {} as any;
    const merged = {
      ...record,
      region_id: h.region_id ?? record.region_id ?? null
    };
    // Remove fields that shouldn't be in the zone table
    if ('country_id' in merged) delete (merged as any).country_id;
    if ('zone_id' in merged) delete (merged as any).zone_id;
    return merged;
  });

  console.log(`Completed resolving parents for zone: ${processedRecords.length}`);
  return processedRecords;
};
// Resolve parent hierarchy (country/region/zone) for woreda imports
const resolveWoredaHierarchy = async (records: any[]): Promise<any[]> => {
  console.log(`Resolving hierarchy for ${records.length} woreda records`);

  // Extract only parent location names; woreda_name is not needed for parent resolution
  const locationNames = records.map(record => ({
    country_name: record.country_name,
    region_name: record.region_name,
    zone_name: record.zone_name
  }));

  const hierarchyResults = await bulkResolveHierarchy(locationNames);

  const processedRecords = records.map((record, index) => {
    const h = hierarchyResults[index] || {} as any;
    const merged = {
      ...record,
      country_id: h.country_id ?? record.country_id ?? null,
      region_id: h.region_id ?? record.region_id ?? null,
      zone_id: h.zone_id ?? record.zone_id ?? null
    };
    // Never send woreda_id when inserting/upserting woreda rows
    if ('woreda_id' in merged) delete (merged as any).woreda_id;
    return merged;
  });

  console.log(`Completed resolving parents for woreda: ${processedRecords.length}`);
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
    parts.push(`${result.skipped} record${result.skipped !== 1 ? 's' : ''} skipped (invalid data or no changes)`);
  }
  
  if (parts.length === 0) {
    return "No changes made";
  }
  
  return parts.join(', ');
};