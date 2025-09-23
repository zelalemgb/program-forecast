import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Database, 
  Users, 
  Activity, 
  FileText, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";

interface DataCollectionStepProps {
  forecastMethod: string;
  onDataCollected: (data: any) => void;
  onBack: () => void;
  facilityId?: number;
}

export const DataCollectionStep: React.FC<DataCollectionStepProps> = ({
  forecastMethod,
  onDataCollected,
  onBack,
  facilityId = 1
}) => {
  const { balances, consumption, loading, error } = useInventoryData(facilityId);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [manualData, setManualData] = useState<any>({});
  const [populationData, setPopulationData] = useState({
    totalPopulation: '',
    targetPopulation: '',
    incidenceRate: '',
    treatmentSeekingRate: ''
  });

  // Normalize the forecast method - moved to top to ensure it's available for all functions
  const normalizeMethod = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('consumption')) return 'consumption-based';
    if (methodLower.includes('service') || methodLower.includes('trend')) return 'trend-analysis';
    if (methodLower.includes('demographic') || methodLower.includes('hybrid') || methodLower.includes('morbidity')) return 'hybrid';
    return method;
  };

  const normalizedMethod = normalizeMethod(forecastMethod);

  // Debug log to understand what method is being used
  console.log('Forecast method received:', forecastMethod);
  console.log('Normalized method:', normalizedMethod);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleContinue = () => {
    const collectedData = {
      method: forecastMethod,
      files: uploadedFiles,
      manualData,
      populationData: normalizedMethod === 'hybrid' ? populationData : null,
      inventoryData: {
        balances,
        consumption,
        facilityId
      },
      timestamp: new Date().toISOString()
    };
    onDataCollected(collectedData);
  };

  const hasInventoryData = balances.length > 0 || consumption.length > 0;

  const getMethodTitle = () => {
    switch (normalizedMethod) {
      case 'consumption-based':
        return 'Historical Consumption Data';
      case 'trend-analysis':
        return 'Service Statistics Data';
      case 'hybrid':
        return 'Multiple Data Sources';
      default:
        return 'Data Collection';
    }
  };

  const getMethodDescription = () => {
    switch (normalizedMethod) {
      case 'consumption-based':
        return 'Upload historical consumption data or enter monthly consumption figures for accurate forecasting';
      case 'trend-analysis':
        return 'Provide service statistics and consumption trends to identify patterns';
      case 'hybrid':
        return 'Combine consumption data, service statistics, and demographic information including population, disease incidence, and treatment seeking rates';
      default:
        return 'Provide the necessary data for forecasting calculations';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {getMethodTitle()}
          </CardTitle>
          <CardDescription>{getMethodDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Data Files</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="inventory">Use Inventory Data</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              {normalizedMethod === 'consumption-based' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Upload Consumption Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Excel or CSV files with historical consumption by product and month
                    </p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      multiple
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Uploaded Files:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Expected Data Format:</h4>
                    <div className="text-sm space-y-1">
                      <p>• Product Name | Month | Consumption Quantity | Unit</p>
                      <p>• At least 6 months of historical data recommended</p>
                      <p>• Include stock-out periods as zero consumption</p>
                    </div>
                  </div>
                </div>
              )}

              {normalizedMethod === 'trend-analysis' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <h4 className="font-medium">Service Statistics</h4>
                    <p className="text-xs text-muted-foreground mb-2">Patient visits, treatments given</p>
                    <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Expected Data Format:</h4>
                    <div className="text-sm space-y-1">
                      <p>• Month | Patient Visits | Treatments | Services Provided</p>
                      <p>• At least 12 months of service data recommended</p>
                      <p>• Include seasonal variations and trends</p>
                    </div>
                  </div>
                </div>
              )}

              {normalizedMethod === 'hybrid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Consumption Data</h4>
                      <p className="text-xs text-muted-foreground mb-2">Historical consumption by product</p>
                      <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                    </div>
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Service Statistics</h4>
                      <p className="text-xs text-muted-foreground mb-2">Patient visits, treatments given</p>
                      <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                    </div>
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <h4 className="font-medium">Population Data</h4>
                      <p className="text-xs text-muted-foreground mb-2">Demographic and morbidity data</p>
                      <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              {normalizedMethod === 'consumption-based' && (
                <div className="space-y-4">
                  <h4 className="font-medium">Manual Consumption Entry</h4>
                  <div className="border rounded-lg p-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Last 3 Months Avg</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Stock-outs (days)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Artemether 20mg</TableCell>
                          <TableCell>
                            <Input type="number" placeholder="85" className="w-20" />
                          </TableCell>
                          <TableCell>tablets</TableCell>
                          <TableCell>
                            <Input type="number" placeholder="0" className="w-16" />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Paracetamol 500mg</TableCell>
                          <TableCell>
                            <Input type="number" placeholder="150" className="w-20" />
                          </TableCell>
                          <TableCell>tablets</TableCell>
                          <TableCell>
                            <Input type="number" placeholder="5" className="w-16" />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Product
                    </Button>
                  </div>
                </div>
              )}

              {normalizedMethod === 'trend-analysis' && (
                <div className="space-y-4">
                  <div>
                    <Label>Monthly Service Statistics</Label>
                    <Textarea 
                      placeholder="Enter average monthly patient visits, treatments provided, etc."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {normalizedMethod === 'hybrid' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Population</Label>
                      <Input 
                        type="number" 
                        value={populationData.totalPopulation}
                        onChange={(e) => setPopulationData(prev => ({
                          ...prev, 
                          totalPopulation: e.target.value
                        }))}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <Label>Target Population (%)</Label>
                      <Input 
                        type="number" 
                        value={populationData.targetPopulation}
                        onChange={(e) => setPopulationData(prev => ({
                          ...prev, 
                          targetPopulation: e.target.value
                        }))}
                        placeholder="15"
                      />
                    </div>
                    <div>
                      <Label>Disease Incidence Rate (%)</Label>
                      <Input 
                        type="number" 
                        value={populationData.incidenceRate}
                        onChange={(e) => setPopulationData(prev => ({
                          ...prev, 
                          incidenceRate: e.target.value
                        }))}
                        placeholder="12"
                      />
                    </div>
                    <div>
                      <Label>Treatment Seeking Rate (%)</Label>
                      <Input 
                        type="number" 
                        value={populationData.treatmentSeekingRate}
                        onChange={(e) => setPopulationData(prev => ({
                          ...prev, 
                          treatmentSeekingRate: e.target.value
                        }))}
                        placeholder="70"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Monthly Service Statistics</Label>
                    <Textarea 
                      placeholder="Enter average monthly patient visits, treatments provided, etc."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              {hasInventoryData && (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        Inventory data available: {balances.length} products with stock levels, 
                        {consumption.length} consumption records
                      </span>
                      <Badge variant="secondary">Auto-detected</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p>Loading inventory data...</p>
                  </div>
                ) : error ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Error loading inventory data: {error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Current Stock Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{balances.length}</p>
                          <p className="text-sm text-muted-foreground">Products with stock data</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Consumption Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{consumption.length}</p>
                          <p className="text-sm text-muted-foreground">Historical consumption periods</p>
                        </CardContent>
                      </Card>
                    </div>

                    {hasInventoryData ? (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Inventory data is available and will be automatically used for forecasting. 
                          This includes stock levels, consumption patterns, and transaction history.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No inventory data found for this facility. Consider using manual entry or file upload methods.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              Back to Method Selection
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!hasInventoryData && uploadedFiles.length === 0 && (normalizedMethod === 'hybrid' ? !Object.values(populationData).some(val => val) : false)}
            >
              Continue to Calculation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataCollectionStep;