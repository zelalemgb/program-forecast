import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
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
  Database,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

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
  csvColumn: string;
  dbColumn: string;
}

interface SheetData {
  headers: string[];
  rows: any[][];
}

interface FileData {
  sheets: { [key: string]: SheetData };
  selectedSheet: string;
}

const BulkImport: React.FC = () => {
  const { toast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'sheet' | 'mapping'>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);

  const importTypes = [
    { value: "facilities", label: "Health Facilities", icon: "🏥", table: "facility" as const },
    { value: "regional_hubs", label: "EPSS Regional Hubs", icon: "🏭", table: "epss_regional_hubs" as const },
    { value: "products", label: "Products & Medicines", icon: "💊", table: "product_reference" as const },
    { value: "users", label: "Users & Staff", icon: "👥", table: "profiles" as const },
    { value: "areas", label: "Administrative Areas", icon: "🗺️", table: "woreda" as const },
    { value: "suppliers", label: "Suppliers & Vendors", icon: "🏢", table: "suppliers" as const },
    { value: "inventory", label: "Inventory Balances", icon: "📦", table: "inventory_balances" as const }
  ];

  const databaseFields = {
    facilities: [
      { value: "facility_name", label: "Facility Name", required: true },
      { value: "facility_code", label: "Facility Code", required: false },
      { value: "facility_type", label: "Facility Type", required: false },
      { value: "region_id", label: "Region ID", required: false },
      { value: "zone_id", label: "Zone ID", required: false },
      { value: "woreda_id", label: "Woreda ID", required: false },
      { value: "regional_hub_id", label: "Regional Hub ID", required: false },
      { value: "ownership_type", label: "Ownership Type (public/private/ngo)", required: false },
      { value: "level", label: "Level", required: false },
      { value: "ownership", label: "Ownership", required: false },
      { value: "latitude", label: "Latitude", required: false },
      { value: "longitude", label: "Longitude", required: false }
    ],
    regional_hubs: [
      { value: "hub_code", label: "Hub Code", required: true },
      { value: "hub_name", label: "Hub Name", required: true },
      { value: "region_id", label: "Region ID", required: false },
      { value: "contact_person", label: "Contact Person", required: false },
      { value: "contact_phone", label: "Contact Phone", required: false },
      { value: "contact_email", label: "Contact Email", required: false },
      { value: "address", label: "Address", required: false },
      { value: "latitude", label: "Latitude", required: false },
      { value: "longitude", label: "Longitude", required: false }
    ],
    products: [
      { value: "canonical_name", label: "Product Name", required: true },
      { value: "code", label: "Product Code", required: false },
      { value: "program", label: "Program", required: false },
      { value: "atc_code", label: "ATC Code", required: false },
      { value: "strength", label: "Strength", required: false },
      { value: "form", label: "Form", required: false },
      { value: "pack_size", label: "Pack Size", required: false },
      { value: "base_unit", label: "Base Unit", required: true },
      { value: "default_unit", label: "Default Unit", required: false }
    ],
    users: [
      { value: "full_name", label: "Full Name", required: true },
      { value: "email", label: "Email", required: true },
      { value: "phone_number", label: "Phone Number", required: false }
    ],
    areas: [
      { value: "woreda_name", label: "Woreda Name", required: true },
      { value: "zone_id", label: "Zone ID", required: true }
    ],
    suppliers: [
      { value: "name", label: "Supplier Name", required: true },
      { value: "contact_info", label: "Contact Info", required: false }
    ],
    inventory: [
      { value: "facility_id", label: "Facility ID", required: true },
      { value: "product_id", label: "Product ID", required: true },
      { value: "current_stock", label: "Current Stock", required: true },
      { value: "reorder_level", label: "Reorder Level", required: false },
      { value: "max_level", label: "Max Level", required: false }
    ]
  };

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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      // Handle CSV files
      Papa.parse(file, {
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const headers = results.data[0] as string[];
            const rows = results.data.slice(1) as any[][];
            
            const sheetData = {
              sheets: { 'Sheet1': { headers, rows } },
              selectedSheet: 'Sheet1'
            };
            
            setFileData(sheetData);
            initializeColumnMappings(headers);
            setCurrentStep('mapping');
          }
        },
        header: false,
        skipEmptyLines: true
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
            
            if (jsonData.length > 0) {
              const headers = jsonData[0] as string[];
              const rows = jsonData.slice(1) as any[][];
              sheets[sheetName] = { headers, rows };
            }
          });
          
          const firstSheet = Object.keys(sheets)[0];
          setFileData({
            sheets,
            selectedSheet: firstSheet
          });
          
          // If multiple sheets, show sheet selection, otherwise go to mapping
          if (Object.keys(sheets).length > 1) {
            setCurrentStep('sheet');
          } else {
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

  const initializeColumnMappings = (headers: string[]) => {
    const mappings = headers.map(header => ({
      csvColumn: header,
      dbColumn: ""
    }));
    setColumnMappings(mappings);
  };

  const handleMappingChange = (csvColumn: string, dbColumn: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, dbColumn } 
          : mapping
      )
    );
  };

  const handleImport = async () => {
    if (!selectedType || !fileData) return;

    const mappedColumns = columnMappings.filter(m => m.dbColumn && m.dbColumn !== "__skip__");
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
      const mappingObj = mappedColumns.reduce((acc, mapping) => {
        acc[mapping.csvColumn] = mapping.dbColumn;
        return acc;
      }, {} as { [key: string]: string });

      // Transform data according to mappings
      const transformedData = selectedSheetData.rows.map(row => {
        const item: any = {};
        selectedSheetData.headers.forEach((header, index) => {
          const dbColumn = mappingObj[header];
          if (dbColumn && dbColumn !== "__skip__" && row[index] !== undefined && row[index] !== null && row[index] !== '') {
            item[dbColumn] = row[index];
          }
        });
        return item;
      }).filter(item => Object.keys(item).length > 0);

      if (transformedData.length === 0) {
        throw new Error("No valid data rows found after mapping");
      }

      // Get the table name for the selected import type
      const importConfig = importTypes.find(type => type.value === selectedType);
      if (!importConfig) {
        throw new Error("Invalid import type");
      }

      // Insert data into Supabase
      const { data, error } = await supabase
        .from(importConfig.table)
        .insert(transformedData);

      if (error) {
        throw error;
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
        successRows: transformedData.length,
        failedRows: 0,
        errors: [],
        createdAt: new Date().toISOString()
      };

      setImportJobs(prev => [newJob, ...prev]);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${transformedData.length} records`,
      });

      closeModal();

    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred during import",
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
            <p className="text-muted-foreground">Import data from Excel or CSV files</p>
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
                        {importTypes.find(t => t.value === job.type)?.label} • {new Date(job.createdAt).toLocaleDateString()}
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Import Data</DialogTitle>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: File Upload */}
              {currentStep === 'upload' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Import Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select what you want to import" />
                      </SelectTrigger>
                      <SelectContent>
                        {importTypes.map(type => (
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload File</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="space-y-2">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-primary underline">Browse files</span>
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
                  <div>
                    <h3 className="font-medium">Select Sheet</h3>
                    <p className="text-sm text-muted-foreground">This Excel file contains multiple sheets. Please select the one to import:</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.keys(fileData.sheets).map(sheetName => (
                      <Button
                        key={sheetName}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleSheetSelection(sheetName)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{sheetName}</div>
                          <div className="text-sm text-muted-foreground">
                            {fileData.sheets[sheetName].rows.length} rows, {fileData.sheets[sheetName].headers.length} columns
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Column Mapping */}
              {currentStep === 'mapping' && currentSheetData && selectedType && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium">Map Columns</h3>
                    <p className="text-sm text-muted-foreground">
                      Match your file columns to database fields for {importTypes.find(t => t.value === selectedType)?.label}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* File Preview */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">File Preview</h4>
                      <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {currentSheetData.headers.map((header, index) => (
                                <TableHead key={index} className="text-xs">
                                  {header}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentSheetData.rows.slice(0, 3).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex} className="text-xs">
                                    {cell?.toString() || ''}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Column Mapping */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">Column Mapping</h4>
                      <div className="space-y-3 max-h-96 overflow-auto">
                        {columnMappings.map((mapping) => (
                          <div key={mapping.csvColumn} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{mapping.csvColumn}</div>
                            </div>
                            <div className="w-4 text-muted-foreground">→</div>
                            <div className="flex-1">
                              <Select
                                value={mapping.dbColumn}
                                onValueChange={(value) => handleMappingChange(mapping.csvColumn, value)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__skip__">Skip this column</SelectItem>
                                  {databaseFields[selectedType as keyof typeof databaseFields]?.map((field) => (
                                    <SelectItem key={field.value} value={field.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{field.label}</span>
                                        {field.required && <span className="text-red-500">*</span>}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || columnMappings.filter(m => m.dbColumn && m.dbColumn !== "__skip__").length === 0}
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
                          Import {currentSheetData.rows.length} rows
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default BulkImport;