import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  FileSpreadsheet,
  Database
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import DataPreviewTable from "@/components/bulk-import/DataPreviewTable";
import { PageLayout } from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { 
  IMPORT_TYPES, 
  DATABASE_FIELD_CONFIG, 
  getImportTypeConfig,
  getDatabaseFields,
  type DatabaseField 
} from "@/config/bulk-import-config";
import { transformFieldValue, getFieldConfig } from "@/utils/bulk-import-transformers";
import { validateRowData, type ValidationIssue } from "@/utils/bulk-import-validators";
import { performUpsert, getUpsertSummary } from "@/utils/bulk-import-upsert";

interface ImportJob {
  id: string;
  type: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errors: string[];
  createdAt: string;
}

interface ColumnMapping {
  dbColumn: string;
  csvColumn: string;
  required: boolean;
  label: string;
}

interface SheetData {
  headers: string[];
  rows: any[][];
}

interface FileData {
  sheets: { [key: string]: SheetData };
  selectedSheet: string;
}

interface DataQualityIssue {
  rowIndex: number;
  issues: string[];
  severity: 'error' | 'warning';
}

const BulkImport: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'sheet' | 'mapping'>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [dataQualityIssues, setDataQualityIssues] = useState<DataQualityIssue[]>([]);

  // Auto-detect import type from URL params and open modal
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && IMPORT_TYPES.some(type => type.value === typeParam)) {
      setSelectedType(typeParam);
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const openImportModal = () => {
    setIsModalOpen(true);
    setCurrentStep('upload');
    setSelectedType("");
    setUploadedFile(null);
    setFileData(null);
    setColumnMappings([]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep('upload');
    setSelectedType("");
    setUploadedFile(null);
    setFileData(null);
    setColumnMappings([]);
    setDataQualityIssues([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // Handle CSV files - parse and create sections that user can select from
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const allData = results.data as any[][];
            const sheets: { [key: string]: SheetData } = {};
            
            // Create default "Full Dataset" sheet with all data
            const headers = allData[0] as string[];
            const rows = allData.slice(1) as any[][];
            sheets['Full Dataset'] = { headers, rows };
            
            // Try to detect potential sections based on empty rows or header patterns
            let currentSection: any[] = [];
            let sectionIndex = 1;
            let lastWasEmpty = false;
            
            for (let i = 0; i < allData.length; i++) {
              const row = allData[i];
              const isEmpty = !row || row.every(cell => !cell || cell.toString().trim() === '');
              
              if (isEmpty) {
                // Empty row detected
                if (!lastWasEmpty && currentSection.length > 1) {
                  // End current section if it has content
                  const sectionHeaders = currentSection[0] as string[];
                  const sectionRows = currentSection.slice(1);
                  if (sectionRows.length > 0) {
                    sheets[`Section ${sectionIndex}`] = { 
                      headers: sectionHeaders, 
                      rows: sectionRows 
                    };
                    sectionIndex++;
                  }
                  currentSection = [];
                }
                lastWasEmpty = true;
              } else {
                // Non-empty row
                if (lastWasEmpty && currentSection.length === 0) {
                  // Starting a new section after empty rows
                  currentSection = [row];
                } else {
                  currentSection.push(row);
                }
                lastWasEmpty = false;
              }
            }
            
            // Handle remaining section
            if (currentSection.length > 1) {
              const sectionHeaders = currentSection[0] as string[];
              const sectionRows = currentSection.slice(1);
              if (sectionRows.length > 0) {
                sheets[`Section ${sectionIndex}`] = { 
                  headers: sectionHeaders, 
                  rows: sectionRows 
                };
              }
            }
            
            const firstSheet = Object.keys(sheets)[0];
            setFileData({
              sheets,
              selectedSheet: firstSheet
            });
            
            console.log(`Found ${Object.keys(sheets).length} potential sections in CSV:`, Object.keys(sheets));
            
            // Always show sheet selection for CSV to let users choose their preferred section
            if (Object.keys(sheets).length > 1) {
              console.log('Multiple sections detected, showing sheet selection');
              setCurrentStep('sheet');
            } else {
              console.log('Single section detected, going to mapping');
              initializeColumnMappings(sheets[firstSheet].headers);
              setCurrentStep('mapping');
            }
          }
        },
        header: false,
        skipEmptyLines: false // Keep empty lines for section detection
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const sheets: { [key: string]: SheetData } = {};
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Include all sheets, even if they appear empty (they might have headers only)
            const headers = jsonData.length > 0 ? (jsonData[0] as string[]) : [];
            const rows = jsonData.length > 1 ? (jsonData.slice(1) as any[][]) : [];
            sheets[sheetName] = { headers, rows };
          });
          
          const firstSheet = Object.keys(sheets)[0];
          setFileData({
            sheets,
            selectedSheet: firstSheet
          });
          
          // If multiple sheets, show sheet selection, otherwise go to mapping
          console.log(`Found ${Object.keys(sheets).length} sheets:`, Object.keys(sheets));
          if (Object.keys(sheets).length > 1) {
            console.log('Multiple sheets detected, showing sheet selection');
            setCurrentStep('sheet');
          } else {
            console.log('Single sheet detected, going to mapping');
            initializeColumnMappings(sheets[firstSheet].headers);
            setCurrentStep('mapping');
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to read Excel file. Please ensure it's a valid Excel format.",
            variant: "destructive"
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive"
      });
    }
  };

  const handleSheetSelection = (sheetName: string) => {
    if (!fileData) return;
    
    const updatedData = { ...fileData, selectedSheet: sheetName };
    setFileData(updatedData);
    
    const selectedSheetData = fileData.sheets[sheetName];
    initializeColumnMappings(selectedSheetData.headers);
    setCurrentStep('mapping');
  };

  const autoMatchColumns = (csvHeaders: string[], dbFields: DatabaseField[]) => {
    return dbFields.map(dbField => {
      const normalizedDbField = dbField.value.toLowerCase().replace(/[_\s-]/g, '');
      const normalizedDbLabel = dbField.label.toLowerCase().replace(/[_\s-]/g, '');
      
      // Try exact match first
      let bestMatch = csvHeaders.find(csvHeader => {
        if (!csvHeader || typeof csvHeader !== 'string') return false;
        const normalizedCsvHeader = csvHeader.toLowerCase().replace(/[_\s-]/g, '');
        return normalizedCsvHeader === normalizedDbField || 
               normalizedCsvHeader === normalizedDbLabel;
      });
      
      // Try partial/similarity match if no exact match
      if (!bestMatch) {
        bestMatch = csvHeaders.find(csvHeader => {
          if (!csvHeader || typeof csvHeader !== 'string') return false;
          const normalizedCsvHeader = csvHeader.toLowerCase().replace(/[_\s-]/g, '');
          return normalizedDbField.includes(normalizedCsvHeader) || 
                 normalizedCsvHeader.includes(normalizedDbField) ||
                 normalizedDbLabel.includes(normalizedCsvHeader) ||
                 normalizedCsvHeader.includes(normalizedDbLabel);
        });
      }
      
      return {
        dbColumn: dbField.value,
        csvColumn: bestMatch || "",
        required: dbField.required,
        label: dbField.label
      };
    });
  };

  const initializeColumnMappings = (headers: string[]) => {
    const dbFields = selectedType ? getDatabaseFields(selectedType) : [];
    // Filter out undefined/null headers and ensure they're strings
    const validHeaders = headers.filter(header => header && typeof header === 'string');
    const mappings = autoMatchColumns(validHeaders, dbFields);
    setColumnMappings(mappings);
    setDataQualityIssues([]);
  };

  // Helper function to get column index from header or special column key
  const getColumnIndex = (csvColumn: string, headers: string[]): number => {
    if (csvColumn.startsWith('__column_')) {
      // Extract index from special column key like "__column_0"
      const index = parseInt(csvColumn.replace('__column_', ''), 10);
      return isNaN(index) ? -1 : index;
    }
    // Regular header lookup
    return headers.indexOf(csvColumn);
  };

  const handleMappingChange = (dbColumn: string, csvColumn: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.dbColumn === dbColumn 
          ? { ...mapping, csvColumn } 
          : mapping
      )
    );
    // Trigger data quality check when mappings change
    if (fileData && selectedType) {
      checkDataQuality();
    }
  };

  const computeDataQualityIssues = (): DataQualityIssue[] => {
    if (!fileData || !selectedType) return [];

    const issues: DataQualityIssue[] = [];
    const selectedSheetData = fileData.sheets[fileData.selectedSheet];
    const databaseFields = getDatabaseFields(selectedType);
    const mappedColumns = columnMappings.filter(m => m.csvColumn && m.csvColumn !== "__skip__");

    selectedSheetData.rows.forEach((row, rowIndex) => {
      const rowData: { [key: string]: any } = {};
      let hasData = false;

      // Build row data object for mapped columns only
      mappedColumns.forEach(mapping => {
        if (mapping.csvColumn && mapping.csvColumn !== "__skip__") {
          const columnIndex = getColumnIndex(mapping.csvColumn, selectedSheetData.headers);
          const cellValue = row[columnIndex];
          rowData[mapping.dbColumn] = cellValue;
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            hasData = true;
          }
        }
      });

      // Skip completely empty rows
      if (!hasData && mappedColumns.length > 0) {
        issues.push({
          rowIndex,
          issues: ["Empty record - will be skipped"],
          severity: 'error'
        });
        return;
      }

      // Use generic validation
      const validationIssues = validateRowData(rowData, databaseFields.filter(field => 
        mappedColumns.some(mapping => mapping.dbColumn === field.value)
      ));

      if (validationIssues.length > 0) {
        const rowIssues = validationIssues.map(issue => issue.message);
        const severity = validationIssues.some(issue => issue.severity === 'error') ? 'error' : 'warning';
        
        issues.push({
          rowIndex,
          issues: rowIssues,
          severity
        });
      }
    });

    return issues;
  };

  const checkDataQuality = () => {
    const result = computeDataQualityIssues();
    setDataQualityIssues(result);
  };

  const handleImport = async () => {
    if (!selectedType || !fileData) return;

    const mappedColumns = columnMappings.filter(m => m.csvColumn && m.csvColumn !== "__skip__");
    if (mappedColumns.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please map at least one column",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      const selectedSheetData = fileData.sheets[fileData.selectedSheet];
      const databaseFields = getDatabaseFields(selectedType);

      // Transform data according to mappings, skipping problematic rows
      const validRowIndices = new Set();
      // Recompute issues now to avoid stale state and validate only mapped columns
      const issues = computeDataQualityIssues();
      setDataQualityIssues(issues);
      const errorRows = issues.filter(issue => issue.severity === 'error').map(issue => issue.rowIndex);
      
      const transformedData = selectedSheetData.rows
        .map((row, rowIndex) => {
          // Skip rows with errors
          if (errorRows.includes(rowIndex)) {
            return null;
          }

          const item: any = {};
          let hasData = false;
          
          // Only process mapped columns (skip columns marked as "__skip__")
          mappedColumns.forEach(mapping => {
            const columnIndex = getColumnIndex(mapping.csvColumn, selectedSheetData.headers);
            let cellValue = row[columnIndex];
            if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
              // Get field configuration for transformation
              const fieldConfig = getFieldConfig(mapping.dbColumn, databaseFields);
              // Transform data based on field type
              cellValue = transformFieldValue(mapping.dbColumn, cellValue, fieldConfig);
              item[mapping.dbColumn] = cellValue;
              hasData = true;
            }
          });
          
          if (hasData) {
            validRowIndices.add(rowIndex);
            return item;
          }
          return null;
        })
        .filter(item => item !== null);

      const skippedRows = selectedSheetData.rows.length - transformedData.length;

      if (transformedData.length === 0) {
        throw new Error("No valid data rows found after mapping");
      }

      const importConfig = getImportTypeConfig(selectedType);
      if (!importConfig) {
        throw new Error("Invalid import type");
      }

      // Use upsert instead of insert to handle existing records
      const upsertResult = await performUpsert(
        importConfig.table,
        transformedData,
        getDatabaseFields(selectedType)
      );

      if (upsertResult.errors.length > 0) {
        throw new Error(`Import completed with errors: ${upsertResult.errors.join(', ')}`);
      }

      // Create import job record
      const newJob: ImportJob = {
        id: Date.now().toString(),
        type: selectedType,
        filename: uploadedFile?.name || "",
        status: "completed",
        progress: 100,
        totalRows: transformedData.length,
        processedRows: transformedData.length,
        successRows: upsertResult.inserted + upsertResult.updated,
        failedRows: upsertResult.errors.length,
        errors: upsertResult.errors,
        createdAt: new Date().toISOString()
      };

      setImportJobs(prev => [newJob, ...prev]);

      const summaryText = getUpsertSummary(upsertResult);
      toast({
        title: "Import Successful",
        description: `${summaryText}${skippedRows > 0 ? `, ${skippedRows} rows skipped due to data quality issues` : ''}`,
      });

      closeModal();

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: `${error?.message || "An error occurred during import"}${error?.details ? " — " + error.details : ""}`,
        variant: "destructive"
      });

      // Create failed job record
      const failedJob: ImportJob = {
        id: Date.now().toString(),
        type: selectedType,
        filename: uploadedFile?.name || "",
        status: "failed",
        progress: 0,
        totalRows: 0,
        processedRows: 0,
        successRows: 0,
        failedRows: 0,
        errors: [error.message],
        createdAt: new Date().toISOString()
      };

      setImportJobs(prev => [failedJob, ...prev]);
    } finally {
      setIsImporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing':
        return <Database className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const currentSheetData = fileData ? fileData.sheets[fileData.selectedSheet] : null;

  return (
    <PageLayout>
      <Helmet>
        <title>Bulk Import | Metadata Organization</title>
        <meta name="description" content="Import data in bulk from Excel or CSV files for facilities, products, users, and more." />
        <link rel="canonical" href="/settings/metadata/bulk-import" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Bulk Import</h1>
            <p className="text-muted-foreground">Import data from Excel or CSV files for all metadata types</p>
          </div>
          <Button onClick={openImportModal} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>

        {/* Import History */}
        {importJobs.length > 0 && (
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Recent Imports</h2>
            <div className="space-y-3">
              {importJobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.filename}</div>
                      <div className="text-sm text-muted-foreground">
                        {IMPORT_TYPES.find(t => t.value === job.type)?.label} • {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {job.successRows}/{job.totalRows} rows
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Modal */}
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Import Data</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden space-y-6">
              {/* Step 1: File Upload */}
              {currentStep === 'upload' && (
                <div className="space-y-4">
                  {/* Only show import type selector if not auto-detected */}
                  {!searchParams.get('type') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Import Type</label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select what you want to import" />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Show selected type when auto-detected */}
                  {searchParams.get('type') && selectedType && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {IMPORT_TYPES.find(t => t.value === selectedType)?.icon}
                        </span>
                        <div>
                          <h3 className="font-medium">
                            Import {IMPORT_TYPES.find(t => t.value === selectedType)?.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Upload your file to begin importing data
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload File</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="space-y-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-primary font-medium hover:underline">
                            Choose a file
                          </span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Supports CSV, Excel (.xlsx, .xls) files
                        </p>
                      </div>
                      {uploadedFile && (
                        <div className="mt-4 text-sm text-green-600">
                          ✓ {uploadedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Sheet Selection (for Excel files with multiple sheets) */}
              {currentStep === 'sheet' && fileData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Select Sheet to Import</h3>
                      <p className="text-sm text-muted-foreground">
                        This Excel file contains {Object.keys(fileData.sheets).length} sheets. Please select the one to import:
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStep('upload')}
                    >
                      ← Back
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(fileData.sheets).map(sheetName => {
                      const sheet = fileData.sheets[sheetName];
                      const hasData = sheet.rows.length > 0;
                      const hasHeaders = sheet.headers.length > 0;
                      
                      return (
                        <Button
                          key={sheetName}
                          variant="outline"
                          className="justify-start h-auto p-4 hover:bg-accent"
                          onClick={() => handleSheetSelection(sheetName)}
                          disabled={!hasHeaders && !hasData}
                        >
                          <div className="text-left w-full">
                            <div className="font-medium flex items-center gap-2">
                              {sheetName}
                              {!hasData && !hasHeaders && (
                                <Badge variant="secondary" className="text-xs">Empty</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {hasHeaders ? `${sheet.headers.length} columns` : 'No headers'}, {sheet.rows.length} data rows
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Column Mapping */}
              {currentStep === 'mapping' && currentSheetData && selectedType && (
                <div className="flex flex-col h-full space-y-4">
                  <div>
                    <h3 className="font-medium">Map Columns & Preview Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Match your file columns to database fields for {IMPORT_TYPES.find(t => t.value === selectedType)?.label}
                    </p>
                  </div>

                  {/* Column Mapping Section - Top */}
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h4 className="font-medium text-sm mb-3">Column Mapping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {columnMappings
                        .sort((a, b) => {
                          // Sort required fields first
                          if (a.required && !b.required) return -1;
                          if (!a.required && b.required) return 1;
                          return a.label.localeCompare(b.label);
                        })
                        .map((mapping) => {
                        const isMapped = mapping.csvColumn && mapping.csvColumn !== "__skip__";
                        
                        return (
                          <div 
                            key={mapping.dbColumn} 
                            className={`flex items-center gap-3 p-2 rounded border transition-colors ${
                              !isMapped ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 
                              'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {isMapped ? (
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                              )}
                              <div className="flex flex-col flex-1 min-w-0">
                                <div className="text-sm font-medium truncate flex items-center gap-1">
                                  {mapping.label}
                                  {mapping.required && <span className="text-red-500">*</span>}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {mapping.dbColumn}
                                </div>
                              </div>
                            </div>
                            <div className="w-4 text-muted-foreground flex-shrink-0">←</div>
                            <div className="flex-1 min-w-0">
                              <Select
                                value={mapping.csvColumn}
                                onValueChange={(value) => handleMappingChange(mapping.dbColumn, value)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select CSV column" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__skip__">Skip this field</SelectItem>
                                  {fileData && fileData.sheets[fileData.selectedSheet].headers.map((header, index) => {
                                    // Handle empty headers by providing a fallback value
                                    const headerValue = header && header.trim() !== '' ? header : `Column ${index + 1}`;
                                    const headerKey = header && header.trim() !== '' ? header : `__column_${index}`;
                                    
                                    return (
                                      <SelectItem key={headerKey} value={headerKey}>
                                        {headerValue}
                                        {header !== headerKey && <span className="text-muted-foreground ml-1">(unnamed)</span>}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data Preview Section - Bottom */}
                  <DataPreviewTable 
                    currentSheetData={currentSheetData}
                    dataQualityIssues={dataQualityIssues}
                  />
                </div>
              )}
            </div>

            {/* Bottom Action Bar - Fixed at bottom */}
            {currentStep === 'mapping' && currentSheetData && selectedType && (
              <div className="border-t bg-background p-4 flex gap-3">
                <Button
                  onClick={() => {
                    checkDataQuality();
                    handleImport();
                  }}
                  disabled={isImporting || columnMappings.filter(m => m.csvColumn && m.csvColumn !== "__skip__").length === 0}
                  className="flex-1"
                >
                  {isImporting ? (
                    <>
                      <Database className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {currentSheetData.rows.length - dataQualityIssues.filter(i => i.severity === 'error').length} rows
                      {dataQualityIssues.filter(i => i.severity === 'error').length > 0 && (
                        <span className="ml-1 text-xs">
                          ({dataQualityIssues.filter(i => i.severity === 'error').length} skipped)
                        </span>
                      )}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Bottom Action Bar for other steps */}
            {currentStep !== 'mapping' && (
              <div className="border-t bg-background p-4 flex gap-3">
                <Button 
                  onClick={() => setCurrentStep('upload')}
                  variant="outline"
                >
                  Back
                </Button>
                <Button onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default BulkImport;