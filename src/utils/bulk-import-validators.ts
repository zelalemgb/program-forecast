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
  
  // Check for empty required fields - this is the primary validation
  if (fieldConfig.required && (!value || stringValue === '')) {
    issues.push({
      field: dbColumn,
      message: `Required field "${fieldConfig.label}" is missing. This field must have a value for successful import. Please provide the ${fieldConfig.label.toLowerCase()} information.`,
      severity: 'error'
    });
    return issues; // Return early for required field errors
  }

  // Skip all other validation for empty optional fields
  if (!value || stringValue === '') {
    return issues;
  }

  // For non-empty values, only validate basic format issues that would cause import to fail
  // We're removing most format validations as requested - focusing only on data capture
  return issues;

};

export const validateRowData = (
  rowData: { [key: string]: any },
  databaseFields: DatabaseField[]
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  
  // Check if row is completely empty (all mapped fields are empty)
  const hasData = Object.values(rowData).some(value => 
    value !== null && value !== undefined && String(value).trim() !== ''
  );
  
  if (!hasData) {
    issues.push({
      field: '_row',
      message: 'Empty record detected. All mapped fields are empty and this row will be skipped during import.',
      severity: 'error'
    });
    return issues;
  }
  
  // Check only required fields
  const requiredFields = databaseFields.filter(field => field.required);
  requiredFields.forEach(fieldConfig => {
    const value = rowData[fieldConfig.value];
    const fieldIssues = validateFieldValue(fieldConfig.value, value, fieldConfig);
    issues.push(...fieldIssues);
  });
  
  return issues;
};