import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowLeft,
  FileSpreadsheet,
  Database,
  ArrowRight,
  MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/layout/PageHeader";
import Papa from "papaparse";

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

interface CSVPreview {
  headers: string[];
  rows: string[][];
}

const BulkImport: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'import'>('upload');
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([
    {
      id: "1",
      type: "facilities",
      filename: "facilities_batch_001.xlsx",
      status: "completed",
      progress: 100,
      totalRows: 150,
      processedRows: 150,
      successRows: 145,
      failedRows: 5,
      errors: ["Row 23: Invalid woreda ID", "Row 45: Missing facility name"],
      createdAt: "2024-01-15T10:30:00"
    },
    {
      id: "2", 
      type: "products",
      filename: "products_update.csv",
      status: "processing",
      progress: 65,
      totalRows: 500,
      processedRows: 325,
      successRows: 320,
      failedRows: 5,
      errors: [],
      createdAt: "2024-01-15T14:20:00"
    }
  ]);

  const importTypes = [
    { value: "facilities", label: "Health Facilities", icon: "🏥" },
    { value: "products", label: "Products & Medicines", icon: "💊" },
    { value: "users", label: "Users & Staff", icon: "👥" },
    { value: "areas", label: "Administrative Areas", icon: "🗺️" },
    { value: "suppliers", label: "Suppliers & Vendors", icon: "🏢" },
    { value: "inventory", label: "Inventory Balances", icon: "📦" }
  ];

  const databaseFields = {
    facilities: [
      { value: "facility_name", label: "Facility Name" },
      { value: "facility_code", label: "Facility Code" },
      { value: "facility_type", label: "Facility Type" },
      { value: "woreda_id", label: "Woreda ID" },
      { value: "level", label: "Level" },
      { value: "ownership", label: "Ownership" },
      { value: "latitude", label: "Latitude" },
      { value: "longitude", label: "Longitude" }
    ],
    products: [
      { value: "canonical_name", label: "Product Name" },
      { value: "code", label: "Product Code" },
      { value: "program", label: "Program" },
      { value: "atc_code", label: "ATC Code" },
      { value: "strength", label: "Strength" },
      { value: "form", label: "Form" },
      { value: "pack_size", label: "Pack Size" },
      { value: "base_unit", label: "Base Unit" },
      { value: "default_unit", label: "Default Unit" }
    ],
    users: [
      { value: "full_name", label: "Full Name" },
      { value: "email", label: "Email" },
      { value: "facility_id", label: "Facility ID" },
      { value: "role", label: "Role" }
    ],
    areas: [
      { value: "region_name", label: "Region Name" },
      { value: "zone_name", label: "Zone Name" },
      { value: "woreda_name", label: "Woreda Name" }
    ],
    suppliers: [
      { value: "name", label: "Supplier Name" },
      { value: "contact_info", label: "Contact Info" }
    ],
    inventory: [
      { value: "facility_id", label: "Facility ID" },
      { value: "product_id", label: "Product ID" },
      { value: "current_stock", label: "Current Stock" },
      { value: "reorder_level", label: "Reorder Level" },
      { value: "max_level", label: "Max Level" }
    ]
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Parse CSV to get headers and preview
      if (file.name.toLowerCase().endsWith('.csv')) {
        Papa.parse(file, {
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              const headers = results.data[0] as string[];
              const rows = results.data.slice(1, 6) as string[][]; // First 5 rows
              setCsvPreview({ headers, rows });
              
              // Initialize mappings
              const initialMappings = headers.map(header => ({
                csvColumn: header,
                dbColumn: ""
              }));
              setColumnMappings(initialMappings);
            }
          },
          header: false,
          skipEmptyLines: true
        });
      }
    }
  };

  const handleNextToMapping = () => {
    if (!selectedType || !uploadedFile) {
      toast({
        title: "Validation Error",
        description: "Please select an import type and upload a file",
        variant: "destructive"
      });
      return;
    }
    
    if (!csvPreview) {
      toast({
        title: "Error",
        description: "Unable to read CSV file. Please ensure it's a valid CSV format.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep('mapping');
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

  const handleImport = () => {
    const unmappedColumns = columnMappings.filter(m => !m.dbColumn);
    if (unmappedColumns.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please map all columns: ${unmappedColumns.map(m => m.csvColumn).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Simulate import process
    const newJob: ImportJob = {
      id: Date.now().toString(),
      type: selectedType,
      filename: uploadedFile?.name || "",
      status: "processing",
      progress: 0,
      totalRows: csvPreview?.rows.length || 0,
      processedRows: 0,
      successRows: 0,
      failedRows: 0,
      errors: [],
      createdAt: new Date().toISOString()
    };

    setImportJobs(prev => [newJob, ...prev]);
    
    toast({
      title: "Import Started",
      description: `Started importing ${uploadedFile?.name} with column mappings`
    });

    // Reset form
    setSelectedType("");
    setUploadedFile(null);
    setCsvPreview(null);
    setColumnMappings([]);
    setCurrentStep('upload');
    
    // Clear file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
  };

  const downloadTemplate = (type: string) => {
    toast({
      title: "Downloading Template",
      description: `Template for ${type} is being downloaded`
    });
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

  return (
    <>
      <Helmet>
        <title>Bulk Import | Metadata Organization</title>
        <meta name="description" content="Import data in bulk from Excel or CSV files for facilities, products, users, and more." />
        <link rel="canonical" href="/settings/metadata/bulk-import" />
      </Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/settings/metadata')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Metadata
        </Button>
      </div>

      <PageHeader
        title="Bulk Data Import"
        description="Import large datasets from Excel or CSV files"
      />

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">New Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          {currentStep === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Data File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Import Type *</label>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data File *</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-sm text-muted-foreground">
                              Drop your CSV file here or{" "}
                              <span className="text-primary underline">browse</span>
                            </span>
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              accept=".csv"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                        {uploadedFile && (
                          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                            <FileText className="h-4 w-4" />
                            {uploadedFile.name}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Supported format: CSV (.csv) - Any column structure
                        </div>
                      </div>
                    </div>
                  </div>

                  {csvPreview && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CSV Preview</label>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-2">
                          Found {csvPreview.headers.length} columns, showing first 5 rows
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {csvPreview.headers.map((header, index) => (
                                  <TableHead key={index} className="text-xs">
                                    {header}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {csvPreview.rows.slice(0, 3).map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className="text-xs">
                                      {cell}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedType && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Template</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadTemplate(selectedType)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Download the template to see the expected format
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleNextToMapping}
                      disabled={!selectedType || !uploadedFile || !csvPreview}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next: Map Columns
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Validate Only
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

           {currentStep === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Map Columns
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Map CSV columns to database fields for{" "}
                  <span className="font-medium">
                    {importTypes.find(t => t.value === selectedType)?.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Database Fields - Left Side */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Database className="h-4 w-4" />
                      <h3 className="text-sm font-medium">Database Fields</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedType && databaseFields[selectedType as keyof typeof databaseFields]?.map((field) => (
                        <div key={field.value} className="p-3 border rounded-lg bg-muted/30">
                          <div className="font-medium text-sm">{field.label}</div>
                          <div className="text-xs text-muted-foreground font-mono">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CSV Columns & Mapping - Right Side */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <FileSpreadsheet className="h-4 w-4" />
                      <h3 className="text-sm font-medium">CSV Columns & Mapping</h3>
                    </div>
                    <div className="space-y-3">
                      {columnMappings.map((mapping, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">CSV Column</label>
                            <div className="p-2 bg-background rounded border text-sm font-mono">
                              {mapping.csvColumn}
                            </div>
                            {csvPreview && csvPreview.rows[0] && (
                              <div className="text-xs text-muted-foreground">
                                Sample: "{csvPreview.rows[0][index] || 'No data'}"
                              </div>
                            )}
                           </div>
                          
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Maps to Database Field</label>
                            <Select 
                              value={mapping.dbColumn} 
                              onValueChange={(value) => handleMappingChange(mapping.csvColumn, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select database field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">-- Skip this column --</SelectItem>
                                {selectedType && databaseFields[selectedType as keyof typeof databaseFields]?.map(field => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
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

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleBackToUpload}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleImport}>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Import History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="font-medium">{job.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {importTypes.find(t => t.value === job.type)?.label}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>

                    {job.status === 'processing' && (
                      <div className="space-y-2">
                        <Progress value={job.progress} />
                        <div className="text-sm text-muted-foreground">
                          Processing {job.processedRows} of {job.totalRows} rows ({job.progress}%)
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Rows</div>
                        <div className="font-medium">{job.totalRows}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Successful</div>
                        <div className="font-medium text-green-600">{job.successRows}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Failed</div>
                        <div className="font-medium text-red-600">{job.failedRows}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Started</div>
                        <div className="font-medium">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {job.errors.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-red-600">Errors:</div>
                        <ul className="text-xs space-y-1">
                          {job.errors.slice(0, 3).map((error, index) => (
                            <li key={index} className="text-red-600">• {error}</li>
                          ))}
                          {job.errors.length > 3 && (
                            <li className="text-muted-foreground">
                              ... and {job.errors.length - 3} more errors
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      {job.status === 'failed' && (
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Retry Import
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {importTypes.map((type) => (
              <Card key={type.value}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{type.icon}</span>
                    {type.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Template for importing {type.label.toLowerCase()} data
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadTemplate(type.value)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Excel Template
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => downloadTemplate(type.value)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        CSV Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default BulkImport;