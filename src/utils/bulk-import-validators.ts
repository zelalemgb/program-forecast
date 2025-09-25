// Generic validation utilities for bulk import

import { DatabaseField } from "@/config/bulk-import-config";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export const validateFieldValue = (
  dbColumn: string,
  value: any,
  fieldConfig: DatabaseField | undefined
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  
  if (!fieldConfig) {
    return issues;
  }

  const stringValue = String(value).trim();
  
  // Check for empty required fields
  if (fieldConfig.required && (!value || stringValue === '')) {
    issues.push({
      field: dbColumn,
      message: `Required field "${fieldConfig.label}" is missing or empty. Please provide a value for this mandatory field.`,
      severity: 'error'
    });
    return issues;
  }

  // Skip validation for empty optional fields
  if (!value || stringValue === '') {
    return issues;
  }

  // Type-specific validation
  switch (fieldConfig.type) {
    case 'number':
      if (isNaN(Number(stringValue))) {
        issues.push({
          field: dbColumn,
          message: `Field "${fieldConfig.label}" must be a number, but found "${stringValue}". Please enter a valid numeric value (e.g., 10, 15.5, 0).`,
          severity: 'error'
        });
      }
      break;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        issues.push({
          field: dbColumn,
          message: `Field "${fieldConfig.label}" has invalid email format "${stringValue}". Please enter a valid email address (e.g., user@example.com).`,
          severity: 'error'
        });
      }
      break;
      
    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(stringValue)) {
        issues.push({
          field: dbColumn,
          message: `Field "${fieldConfig.label}" has invalid UUID format "${stringValue}". Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (e.g., 123e4567-e89b-12d3-a456-426614174000).`,
          severity: 'warning' // UUIDs are often auto-generated, so warning instead of error
        });
      }
      break;
      
    case 'enum':
      if (fieldConfig.enumValues && !fieldConfig.enumValues.some(
        enumValue => enumValue.toLowerCase() === stringValue.toLowerCase()
      )) {
        // Special handling for ownership_type
        if (dbColumn === 'ownership_type') {
          const lowerValue = stringValue.toLowerCase();
          if (!['public', 'private', 'ngo', 'government', 'non-profit'].includes(lowerValue)) {
            issues.push({
              field: dbColumn,
              message: `Field "${fieldConfig.label}" has invalid value "${stringValue}". Must be one of: Public, Private, NGO, Government, or Non-profit.`,
              severity: 'warning'
            });
          }
        } else {
          issues.push({
            field: dbColumn,
            message: `Field "${fieldConfig.label}" has invalid value "${stringValue}". Must be one of: ${fieldConfig.enumValues.join(', ')}.`,
            severity: 'warning'
          });
        }
      }
      break;
      
    case 'json':
      try {
        JSON.parse(stringValue);
      } catch {
        // Not valid JSON, but we'll handle it in transformation
        issues.push({
          field: dbColumn,
          message: `Invalid JSON format in ${fieldConfig.label}, will be converted to object`,
          severity: 'warning'
        });
      }
      break;
      
    case 'string':
    default:
      // Check string length limits
      if (fieldConfig.maxLength && stringValue.length > fieldConfig.maxLength) {
        issues.push({
          field: dbColumn,
          message: `Field "${fieldConfig.label}" is too long (${stringValue.length} characters). Maximum allowed is ${fieldConfig.maxLength} characters. Text will be truncated during import.`,
          severity: 'warning'
        });
      }
      break;
  }

  return issues;
};

export const validateRowData = (
  rowData: { [key: string]: any },
  databaseFields: DatabaseField[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  
  // Check if row is completely empty
  const hasData = Object.values(rowData).some(value => 
    value !== null && value !== undefined && String(value).trim() !== ''
  );
  
  if (!hasData) {
    issues.push({
      field: '_row',
      message: 'Empty record - will be skipped',
      severity: 'error'
    });
    return issues;
  }
  
  // Validate each field
  databaseFields.forEach(fieldConfig => {
    const value = rowData[fieldConfig.value];
    const fieldIssues = validateFieldValue(fieldConfig.value, value, fieldConfig);
    issues.push(...fieldIssues);
  });
  
  return issues;
};