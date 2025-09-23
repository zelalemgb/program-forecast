import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target, 
  Calendar, 
  Database, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Upload,
  BarChart3
} from "lucide-react";
import type { ForecastData } from "./RefinedForecastWizard";

interface ForecastWizardStepsProps {
  currentStep: number;
  forecastData: ForecastData;
  updateForecastData: (updates: Partial<ForecastData>) => void;
}

const COMMODITY_TYPES = ["Medicines", "Test kits", "Medical supplies", "Consumables"];
const HEALTH_PROGRAMS = [
  "Malaria", "TB", "HIV/AIDS", "Maternal Health", "Child Health", 
  "NCDs", "Mental Health", "General Medicine", "Emergency Medicine"
];

const FORECAST_METHODS = [
  {
    id: 'consumption',
    name: 'Consumption-Based',
    description: 'Uses historical consumption data and patterns',
    requirements: ['Historical consumption data', 'Stock transaction records'],
    icon: BarChart3
  },
  {
    id: 'service',
    name: 'Service Statistics',
    description: 'Based on patient visits and service delivery data',
    requirements: ['Patient visit records', 'Service delivery statistics'],
    icon: TrendingUp
  },
  {
    id: 'demographic',
    name: 'Demographic Morbidity',
    description: 'Uses population data and disease incidence rates',
    requirements: ['Population data', 'Disease incidence rates', 'Treatment protocols'],
    icon: Target
  },
  {
    id: 'hybrid',
    name: 'Hybrid Approach',
    description: 'Combines multiple methods for comprehensive forecasting',
    requirements: ['Multiple data sources', 'Expert validation'],
    icon: Database
  }
];

export const ForecastWizardSteps: React.FC<ForecastWizardStepsProps> = ({
  currentStep,
  forecastData,
  updateForecastData,
}) => {

  const getRecommendedMethod = () => {
    const { availableData } = forecastData;
    
    if (availableData.consumption && availableData.stockData) {
      return 'consumption';
    } else if (availableData.service) {
      return 'service';
    } else if (availableData.population) {
      return 'demographic';
    } else {
      return 'hybrid';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Define Forecast
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Define Your Forecast</h2>
              <p className="text-muted-foreground">
                Start by defining what you want to forecast and why
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <Label htmlFor="forecast-name">Forecast Name</Label>
                <Input
                  id="forecast-name"
                  placeholder="e.g., Q1 2024 Malaria Medicines"
                  value={forecastData.name}
                  onChange={(e) => updateForecastData({ name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="purpose">Forecast Purpose</Label>
                <Select 
                  value={forecastData.purpose} 
                  onValueChange={(value: any) => updateForecastData({ purpose: value })}
                >
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
            </div>
          </div>
        );

      case 2: // Define Scope
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Define Forecast Scope</h2>
              <p className="text-muted-foreground">
                Specify what products and timeframe to forecast
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Commodity Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {COMMODITY_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={forecastData.commodityTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateForecastData({ 
                                commodityTypes: [...forecastData.commodityTypes, type] 
                              });
                            } else {
                              updateForecastData({ 
                                commodityTypes: forecastData.commodityTypes.filter(t => t !== type) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={type} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="program">Health Program</Label>
                  <Select 
                    value={forecastData.program} 
                    onValueChange={(value) => updateForecastData({ program: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_PROGRAMS.map((program) => (
                        <SelectItem key={program} value={program}>{program}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="timeframe">Forecast Period (months)</Label>
                  <Select 
                    value={forecastData.timeframe.toString()} 
                    onValueChange={(value) => updateForecastData({ timeframe: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={forecastData.startDate}
                    onChange={(e) => updateForecastData({ startDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Data Assessment
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Database className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Assess Available Data</h2>
              <p className="text-muted-foreground">
                Tell us what data sources you have available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'consumption', label: 'Historical Consumption Data', description: 'Past usage records and consumption patterns' },
                { key: 'service', label: 'Service Statistics', description: 'Patient visits, treatments provided' },
                { key: 'population', label: 'Population Data', description: 'Demographics, disease incidence rates' },
                { key: 'stockData', label: 'Stock Data', description: 'Current inventory levels and transactions' }
              ].map((item) => (
                <Card key={item.key} className={`cursor-pointer transition-all ${
                  forecastData.availableData[item.key as keyof typeof forecastData.availableData] 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={forecastData.availableData[item.key as keyof typeof forecastData.availableData]}
                        onCheckedChange={(checked) => {
                          updateForecastData({
                            availableData: {
                              ...forecastData.availableData,
                              [item.key]: checked
                            }
                          });
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Select at least one data source to proceed. The system will recommend the best forecasting method based on your available data.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 4: // Method Selection
        const recommendedMethod = getRecommendedMethod();
        
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Select Forecasting Method</h2>
              <p className="text-muted-foreground">
                Choose the best method based on your available data
              </p>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> {FORECAST_METHODS.find(m => m.id === recommendedMethod)?.name} method based on your available data.
              </AlertDescription>
            </Alert>

            <RadioGroup 
              value={forecastData.selectedMethod} 
              onValueChange={(value: any) => updateForecastData({ selectedMethod: value })}
              className="space-y-4"
            >
              {FORECAST_METHODS.map((method) => {
                const Icon = method.icon;
                const isRecommended = method.id === recommendedMethod;
                
                return (
                  <Card key={method.id} className={`cursor-pointer transition-all ${
                    forecastData.selectedMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-5 w-5 text-primary" />
                            <h4 className="font-medium">{method.name}</h4>
                            {isRecommended && <Badge variant="secondary">Recommended</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {method.requirements.map((req) => (
                                <Badge key={req} variant="outline" className="text-xs">{req}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>
          </div>
        );

      case 5: // Data Collection
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Upload className="h-12 w-12 mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Data Collection</h2>
              <p className="text-muted-foreground">
                Provide the required data for {FORECAST_METHODS.find(m => m.id === forecastData.selectedMethod)?.name} method
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.selectedMethod === 'consumption' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Upload historical consumption data or use existing inventory data
                      </p>
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm">Upload consumption data (Excel/CSV)</p>
                        <Input type="file" accept=".xlsx,.xls,.csv" className="mt-2 max-w-xs mx-auto" />
                      </div>
                    </div>
                  )}

                  {forecastData.selectedMethod === 'service' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Provide service statistics and patient visit data
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Monthly Patient Visits</Label>
                          <Input type="number" placeholder="e.g., 500" />
                        </div>
                        <div>
                          <Label>Treatment Success Rate (%)</Label>
                          <Input type="number" placeholder="e.g., 85" />
                        </div>
                      </div>
                    </div>
                  )}

                  {forecastData.selectedMethod === 'demographic' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Enter population and epidemiological data
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Catchment Population</Label>
                          <Input type="number" placeholder="e.g., 50000" />
                        </div>
                        <div>
                          <Label>Disease Incidence Rate (%)</Label>
                          <Input type="number" placeholder="e.g., 15" />
                        </div>
                        <div>
                          <Label>Treatment Seeking Rate (%)</Label>
                          <Input type="number" placeholder="e.g., 70" />
                        </div>
                        <div>
                          <Label>Target Population (%)</Label>
                          <Input type="number" placeholder="e.g., 25" />
                        </div>
                      </div>
                    </div>
                  )}

                  {forecastData.selectedMethod === 'hybrid' && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Provide multiple data sources for comprehensive analysis
                      </p>
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Hybrid method combines multiple approaches. Please provide as much data as possible from the categories above.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => updateForecastData({ collectedData: { method: forecastData.selectedMethod, timestamp: Date.now() } })}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Process Data
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6: // Analysis & Output
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h2 className="text-2xl font-semibold">Analysis Complete</h2>
              <p className="text-muted-foreground">
                Your forecast has been generated successfully
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {forecastData.commodityTypes.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Product Categories</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {forecastData.timeframe}
                  </div>
                  <p className="text-sm text-muted-foreground">Months Forecasted</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    Ready
                  </div>
                  <p className="text-sm text-muted-foreground">Status</p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Forecast Summary:</strong> {forecastData.name} using {FORECAST_METHODS.find(m => m.id === forecastData.selectedMethod)?.name} method 
                for {forecastData.timeframe} months starting {new Date(forecastData.startDate).toLocaleDateString()}.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">✅ Review forecast results in the dashboard</p>
                <p className="text-sm">✅ Export data for procurement planning</p>
                <p className="text-sm">✅ Set up monitoring and alerts</p>
                <p className="text-sm">✅ Schedule regular forecast updates</p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return renderStep();
};