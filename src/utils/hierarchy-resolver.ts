// Utility functions for resolving administrative hierarchy during bulk imports

import { supabase } from "@/integrations/supabase/client";

export interface HierarchyResolutionResult {
  country_id: number | null;
  region_id: number | null;
  zone_id: number | null;
  woreda_id: number | null;
}

interface LocationNames {
  country_name?: string;
  region_name?: string;
  zone_name?: string;
  woreda_name?: string;
}

// Cache to avoid repeated database lookups during bulk operations
const hierarchyCache = new Map<string, HierarchyResolutionResult>();

// Default Ethiopia country ID
let ethiopiaCountryId: number | null = null;

// Get or create Ethiopia as default country
export const getEthiopiaCountryId = async (): Promise<number> => {
  if (ethiopiaCountryId !== null) {
    return ethiopiaCountryId;
  }

  const { data, error } = await supabase
    .from('countries')
    .select('country_id')
    .eq('country_name', 'Ethiopia')
    .single();

  if (error || !data) {
    // Create Ethiopia if it doesn't exist
    const { data: newCountry, error: insertError } = await supabase
      .from('countries')
      .insert({ country_name: 'Ethiopia', country_code: 'ET' })
      .select('country_id')
      .single();
    
    if (insertError || !newCountry) {
      throw new Error('Failed to create Ethiopia country record');
    }
    ethiopiaCountryId = newCountry.country_id;
  } else {
    ethiopiaCountryId = data.country_id;
  }

  return ethiopiaCountryId;
};

// Resolve administrative hierarchy from location names
export const resolveHierarchy = async (locationNames: LocationNames): Promise<HierarchyResolutionResult> => {
  const cacheKey = JSON.stringify(locationNames);
  
  // Check cache first
  if (hierarchyCache.has(cacheKey)) {
    return hierarchyCache.get(cacheKey)!;
  }

  const result: HierarchyResolutionResult = {
    country_id: null,
    region_id: null,
    zone_id: null,
    woreda_id: null
  };

  try {
    // Default to Ethiopia
    result.country_id = await getEthiopiaCountryId();

    // Resolve region
    if (locationNames.region_name) {
      const { data: regionData } = await supabase
        .from('region')
        .select('region_id')
        .eq('region_name', locationNames.region_name)
        .eq('country_id', result.country_id)
        .single();
      
      if (!regionData) {
        // Create new region
        const { data: newRegion } = await supabase
          .from('region')
          .insert({
            region_name: locationNames.region_name,
            country_id: result.country_id
          })
          .select('region_id')
          .single();
        
        if (newRegion) {
          result.region_id = newRegion.region_id;
        }
      } else {
        result.region_id = regionData.region_id;
      }
    }

    // Resolve zone
    if (locationNames.zone_name && result.region_id) {
      const { data: zoneData } = await supabase
        .from('zone')
        .select('zone_id')
        .eq('zone_name', locationNames.zone_name)
        .eq('region_id', result.region_id)
        .single();
      
      if (!zoneData) {
        // Create new zone
        const { data: newZone } = await supabase
          .from('zone')
          .insert({
            zone_name: locationNames.zone_name,
            region_id: result.region_id
          })
          .select('zone_id')
          .single();
        
        if (newZone) {
          result.zone_id = newZone.zone_id;
        }
      } else {
        result.zone_id = zoneData.zone_id;
      }
    }

    // Resolve woreda
    if (locationNames.woreda_name && result.zone_id) {
      const { data: woredaData } = await supabase
        .from('woreda')
        .select('woreda_id')
        .eq('woreda_name', locationNames.woreda_name)
        .eq('zone_id', result.zone_id)
        .single();
      
      if (!woredaData) {
        // Create new woreda
        const { data: newWoreda } = await supabase
          .from('woreda')
          .insert({
            woreda_name: locationNames.woreda_name,
            zone_id: result.zone_id,
            region_id: result.region_id,
            country_id: result.country_id
          })
          .select('woreda_id')
          .single();
        
        if (newWoreda) {
          result.woreda_id = newWoreda.woreda_id;
        }
      } else {
        result.woreda_id = woredaData.woreda_id;
      }
    }

    // Cache the result
    hierarchyCache.set(cacheKey, result);
    
  } catch (error) {
    console.error('Error resolving hierarchy:', error);
  }

  return result;
};

// Clear cache (useful for testing or when data changes)
export const clearHierarchyCache = () => {
  hierarchyCache.clear();
  ethiopiaCountryId = null;
};

// Bulk resolve hierarchy for multiple records
export const bulkResolveHierarchy = async (records: LocationNames[]): Promise<HierarchyResolutionResult[]> => {
  // Group records by unique location combinations to minimize database calls
  const uniqueLocations = new Map<string, LocationNames>();
  const recordToKeyMap = new Map<number, string>();

  records.forEach((record, index) => {
    const key = JSON.stringify(record);
    uniqueLocations.set(key, record);
    recordToKeyMap.set(index, key);
  });

  // Resolve unique location combinations
  const resolutions = new Map<string, HierarchyResolutionResult>();
  
  for (const [key, location] of uniqueLocations) {
    const resolution = await resolveHierarchy(location);
    resolutions.set(key, resolution);
  }

  // Map results back to original record order
  return records.map((_, index) => {
    const key = recordToKeyMap.get(index)!;
    return resolutions.get(key)!;
  });
};