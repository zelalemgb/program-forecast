import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  Calculator, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  FileText,
  ArrowLeft,
  ArrowRight,
  Download,
  Upload
} from "lucide-react";
import { ForecastCalculationStep } from "./ForecastCalculationStep";
import DataCollectionStep from "./DataCollectionStep";

interface ForecastItem {
  id: string;
  productName: string;
  currentStock: number;
  amc: number;
  forecastMethod: "consumption" | "manual" | "trend";
  forecastQuantity: number;
  unit: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

const mockForecastData: ForecastItem[] = [
  {
    id: "1",
    productName: "Artemether 20mg",
    currentStock: 450,
    amc: 2.83,
    forecastMethod: "consumption",
    forecastQuantity: 255,
    unit: "tablets",
    confidence: "high"
  },
  {
    id: "2",
    productName: "Paracetamol 500mg", 
    currentStock: 0,
    amc: 5.0,
    forecastMethod: "consumption",
    forecastQuantity: 450,
    unit: "tablets",
    confidence: "high"
  },
  {
    id: "3",
    productName: "ORS Sachets",
    currentStock: 25,
    amc: 1.5,
    forecastMethod: "consumption",
    forecastQuantity: 135,
    unit: "sachets",
    confidence: "medium"
  }
];

const wizardSteps = [
  {
    id: "setup",
    title: "Forecast Setup",
    description: "Configure forecast parameters and period"
  },
  {
    id: "method-selection",
    title: "Method Selection",
    description: "Select forecasting methodology and parameters"
  },
  {
    id: "data-collection",
    title: "Data Collection",
    description: "Provide required data for your selected method"
  },
  {
    id: "calculation",
    title: "Calculation",
    description: "Running forecast calculations"
  },
  {
    id: "review",
    title: "Review & Adjust",
    description: "Review calculated forecasts and make adjustments"
  },
  {
    id: "finalize",
    title: "Finalize",
    description: "Complete forecast and generate reports"
  }
];

export const GuidedForecastWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [forecastPeriod, setForecastPeriod] = useState("quarterly");
  const [dataSource, setDataSource] = useState("dagu-mini");
  const [forecastMethod, setForecastMethod] = useState("consumption-based");
  const [forecastData, setForecastData] = useState(mockForecastData);
  const [calculationResults, setCalculationResults] = useState<any>(null);
  const [collectedData, setCollectedData] = useState<any>(null);

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataCollected = (data: any) => {
    setCollectedData(data);
    setCurrentStep(currentStep + 1); // Move to calculation step
  };

  const handleCalculationComplete = (results: any) => {
    setCalculationResults(results);
    // Update forecast data with calculated results
    if (results.products) {
      const updatedForecastData = results.products.map((product: any) => ({
        id: product.id,
        productName: product.name,
        currentStock: Math.floor(Math.random() * 1000), // Mock current stock
        amc: (product.forecastQuantity / 12).toFixed(2), // Calculate AMC
        forecastMethod: results.method.toLowerCase().includes('consumption') ? 'consumption' : 
                       results.method.toLowerCase().includes('service') ? 'service' : 'demographic',
        forecastQuantity: product.forecastQuantity,
        unit: product.unit,
        confidence: product.confidence >= 85 ? 'high' : product.confidence >= 70 ? 'medium' : 'low'
      }));
      setForecastData(updatedForecastData);
    }
    setCurrentStep(currentStep + 1); // Move to review step
  };

  const updateForecastQuantity = (id: string, quantity: number) => {
    setForecastData(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, forecastQuantity: quantity, forecastMethod: "manual" }
          : item
      )
    );
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const progressPercentage = ((currentStep + 1) / wizardSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Guided Forecast Wizard
              </CardTitle>
              <CardDescription>
                Step-by-step forecast creation using your inventory and consumption data
              </CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {wizardSteps.length}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              {wizardSteps.map((step, index) => (
                <span 
                  key={step.id}
                  className={`${index <= currentStep ? 'text-primary font-medium' : ''}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Wizard Content */}
      <Card>
        <CardHeader>
          <CardTitle>{wizardSteps[currentStep].title}</CardTitle>
          <CardDescription>{wizardSteps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Forecast Setup */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="forecast-period">Forecast Period</Label>
                  <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly (Next 3 months)</SelectItem>
                      <SelectItem value="quarterly">Quarterly (Next quarter)</SelectItem>
                      <SelectItem value="biannual">Biannual (Next 6 months)</SelectItem>
                      <SelectItem value="annual">Annual (Next year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input type="date" defaultValue="2024-04-01" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="forecast-purpose">Forecast Purpose</Label>
                <Select defaultValue="procurement">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="procurement">Procurement Planning</SelectItem>
                    <SelectItem value="budget">Budget Planning</SelectItem>
                    <SelectItem value="emergency">Emergency Preparedness</SelectItem>
                    <SelectItem value="redistribution">Stock Redistribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  placeholder="Add any specific considerations for this forecast period..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Method Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`cursor-pointer border-2 ${forecastMethod === 'consumption-based' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => setForecastMethod('consumption-based')}>
                  <CardContent className="p-4 text-center">
                    <Calculator className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Consumption-Based</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on Average Monthly Consumption (AMC)
                    </p>
                    <Badge variant="secondary" className="mt-2">Recommended</Badge>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer border-2 ${forecastMethod === 'trend-analysis' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => setForecastMethod('trend-analysis')}>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Trend Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Account for seasonal and growth trends
                    </p>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer border-2 ${forecastMethod === 'hybrid' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => setForecastMethod('hybrid')}>
                  <CardContent className="p-4 text-center">
                    <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Hybrid Model</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Combine multiple forecasting methods
                    </p>
                  </CardContent>
                </Card>
              </div>

              {forecastMethod === 'consumption-based' && (
                <div className="space-y-3">
                  <h4 className="font-medium">Consumption-Based Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="lead-time">Lead Time (days)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label htmlFor="safety-stock">Safety Stock (days)</Label>
                      <Input type="number" defaultValue="15" />
                    </div>
                    <div>
                      <Label htmlFor="max-stock">Max Stock Level (months)</Label>
                      <Input type="number" defaultValue="6" />
                    </div>
                  </div>
                </div>
              )}
              
              {forecastMethod && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      <strong>{forecastMethod === 'consumption-based' ? 'Consumption-Based' : 
                               forecastMethod === 'trend-analysis' ? 'Trend Analysis' : 'Hybrid'}</strong> method selected. 
                      Click "Next" to proceed with data collection.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Data Collection */}
          {currentStep === 2 && (
            <DataCollectionStep
              forecastMethod={forecastMethod}
              onDataCollected={handleDataCollected}
              onBack={handleBack}
            />
          )}

          {/* Step 4: Calculation */}
          {currentStep === 3 && (
            <ForecastCalculationStep
              wizardData={{
                forecastPeriod,
                dataSource,
                forecastMethod,
                collectedData,
                commodityTypes: ["Medicines", "Test kits"],
                healthProgram: "Malaria",
                consumptionData: collectedData?.files?.length > 0 ? 'yes' : 'no',
                serviceData: 'yes',
                catchmentPopulation: 'yes',
                diseaseIncidence: 'yes'
              }}
              onCalculationComplete={handleCalculationComplete}
              onBack={handleBack}
            />
          )}

          {/* Step 5: Review & Adjust */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Forecast Results</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calculator className="h-4 w-4 mr-1" />
                    Recalculate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>AMC</TableHead>
                    <TableHead>Forecast Quantity</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.currentStock} {item.unit}</TableCell>
                      <TableCell>{item.amc}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.forecastQuantity}
                          onChange={(e) => updateForecastQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.forecastMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getConfidenceColor(item.confidence)}>
                          {item.confidence}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Step 6: Finalize */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                <h3 className="text-lg font-semibold">Forecast Ready for Submission</h3>
                <p className="text-muted-foreground">
                  Your forecast has been calculated and is ready for review and submission.
                </p>
              </div>

              {calculationResults && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{calculationResults.totalProducts}</div>
                      <p className="text-sm text-muted-foreground">Products Forecasted</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{calculationResults.averageConfidence}%</div>
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${calculationResults.totalValue.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms">I confirm the forecast data is accurate and complete</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="submit" />
                  <Label htmlFor="submit">Submit this forecast to the procurement workflow</Label>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={
            currentStep === wizardSteps.length - 1 || 
            (currentStep === 1 && !forecastMethod) ||
            (currentStep === 2 && !collectedData)
          }
        >
          {currentStep === wizardSteps.length - 1 ? "Complete Forecast" : "Next"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};