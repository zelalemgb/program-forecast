// Generic field transformation utilities for bulk import

import { DatabaseField } from "@/config/bulk-import-config";

export const transformFieldValue = (
  dbColumn: string, 
  value: any, 
  fieldConfig: DatabaseField | undefined
): any => {
  const stringValue = String(value).trim();
  
  if (!fieldConfig) {
    return stringValue;
  }

  // Handle empty values
  if (stringValue === '' || stringValue === 'null' || stringValue === 'undefined') {
    return null;
  }

  // Transform based on field type
  switch (fieldConfig.type) {
    case 'number':
      const numValue = Number(stringValue);
      return isNaN(numValue) ? null : numValue;
      
    case 'email':
      // Basic email validation and normalization
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(stringValue) ? stringValue.toLowerCase() : stringValue;
      
    case 'uuid':
      // UUID validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(stringValue) ? stringValue : null;
      
    case 'enum':
      // Enum value normalization
      if (fieldConfig.enumValues) {
        const lowerValue = stringValue.toLowerCase();
        
        // Handle ownership_type special cases
        if (dbColumn === 'ownership_type') {
          if (lowerValue === 'public' || lowerValue === 'government') return 'public';
          if (lowerValue === 'private') return 'private';
          if (lowerValue === 'ngo' || lowerValue === 'non-profit') return 'ngo';
          return 'public'; // default fallback
        }
        
        // Generic enum matching
        const matchedValue = fieldConfig.enumValues.find(
          enumValue => enumValue.toLowerCase() === lowerValue
        );
        return matchedValue || fieldConfig.enumValues[0]; // fallback to first value
      }
      return stringValue;
      
    case 'json':
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(stringValue);
      } catch {
        // If not valid JSON, treat as contact info object
        return { info: stringValue };
      }
      
    case 'string':
    default:
      // Handle string length limits
      if (fieldConfig.maxLength && stringValue.length > fieldConfig.maxLength) {
        return stringValue.slice(0, fieldConfig.maxLength);
      }
      return stringValue;
  }
};

export const getFieldConfig = (
  dbColumn: string, 
  databaseFields: DatabaseField[]
): DatabaseField | undefined => {
  return databaseFields.find(field => field.value === dbColumn);
};