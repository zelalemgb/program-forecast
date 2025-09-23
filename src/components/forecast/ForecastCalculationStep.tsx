import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  Database, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  BarChart3
} from "lucide-react";

interface ForecastCalculationStepProps {
  wizardData: any;
  onCalculationComplete: (forecastResults: any) => void;
  onBack: () => void;
}

interface CalculationStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "error";
  progress: number;
  description: string;
}

export const ForecastCalculationStep: React.FC<ForecastCalculationStepProps> = ({
  wizardData,
  onCalculationComplete,
  onBack
}) => {
  const [calculationSteps, setCalculationSteps] = useState<CalculationStep[]>([
    {
      id: "data-prep",
      name: "Data Preparation",
      status: "pending",
      progress: 0,
      description: "Loading and validating input data"
    },
    {
      id: "method-setup",
      name: "Method Configuration", 
      status: "pending",
      progress: 0,
      description: "Setting up forecasting parameters"
    },
    {
      id: "calculation",
      name: "Forecast Calculation",
      status: "pending", 
      progress: 0,
      description: "Running forecasting algorithm"
    },
    {
      id: "validation",
      name: "Result Validation",
      status: "pending",
      progress: 0,
      description: "Validating and optimizing results"
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResults, setCalculationResults] = useState<any>(null);

  const getRecommendedMethod = () => {
    const { consumptionData, serviceData, catchmentPopulation, diseaseIncidence } = wizardData;
    
    if (consumptionData === "yes") {
      return "Consumption Method";
    } else if (serviceData === "yes") {
      return "Service Statistics Method";
    } else if (catchmentPopulation !== "no" && diseaseIncidence !== "no") {
      return "Demographic Morbidity Method";
    } else {
      return "Hybrid / Demographic Method";
    }
  };

  const simulateCalculation = async () => {
    setIsCalculating(true);
    const method = getRecommendedMethod();
    
    for (let i = 0; i < calculationSteps.length; i++) {
      // Update current step to running
      setCalculationSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? "running" : index < i ? "completed" : "pending"
      })));

      setCurrentStepIndex(i);

      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setCalculationSteps(prev => prev.map((step, index) => ({
          ...step,
          progress: index === i ? progress : step.progress
        })));
      }

      // Mark step as completed
      setCalculationSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? "completed" : step.status,
        progress: index === i ? 100 : step.progress
      })));
    }

    // Generate forecast results based on method and inputs
    const results = generateForecastResults(method, wizardData);
    setCalculationResults(results);
    setIsCalculating(false);
  };

  const generateForecastResults = (method: string, data: any) => {
    const forecastPeriod = parseInt(data.forecastMonths || data.customMonths || "12");
    const healthProgram = data.healthProgram || data.customProgram;
    
    // Mock forecast calculation based on method
    const baseProductData = getProductsForProgram(healthProgram);
    
    return {
      method,
      healthProgram,
      forecastPeriod,
      totalProducts: baseProductData.length,
      totalQuantity: baseProductData.reduce((sum, p) => sum + p.forecastQuantity, 0),
      totalValue: baseProductData.reduce((sum, p) => sum + (p.forecastQuantity * p.unitPrice), 0),
      averageConfidence: Math.round(baseProductData.reduce((sum, p) => sum + p.confidence, 0) / baseProductData.length),
      products: baseProductData,
      assumptions: getMethodAssumptions(method),
      nextSteps: [
        "Review individual product forecasts",
        "Adjust quantities if needed",
        "Submit for procurement planning",
        "Schedule regular updates"
      ]
    };
  };

  const getProductsForProgram = (program: string) => {
    const products = {
      "Malaria": [
        { id: "1", name: "Artemether-Lumefantrine 20/120mg", unit: "tablets", forecastQuantity: 12500, unitPrice: 0.85, confidence: 85 },
        { id: "2", name: "Malaria RDT", unit: "tests", forecastQuantity: 8200, unitPrice: 1.20, confidence: 90 },
        { id: "3", name: "Severe Malaria Injectable", unit: "vials", forecastQuantity: 450, unitPrice: 12.50, confidence: 75 }
      ],
      "HIV": [
        { id: "4", name: "HIV Test Kit", unit: "tests", forecastQuantity: 5500, unitPrice: 2.80, confidence: 88 },
        { id: "5", name: "Male Condoms", unit: "pieces", forecastQuantity: 25000, unitPrice: 0.05, confidence: 92 },
        { id: "6", name: "Prevention Kit", unit: "kits", forecastQuantity: 1200, unitPrice: 15.00, confidence: 80 }
      ],
      "Tuberculosis (TB)": [
        { id: "7", name: "TB Test Kit", unit: "tests", forecastQuantity: 3200, unitPrice: 8.50, confidence: 85 },
        { id: "8", name: "First-line Anti-TB Drugs", unit: "sets", forecastQuantity: 890, unitPrice: 25.00, confidence: 90 },
        { id: "9", name: "Second-line Anti-TB Drugs", unit: "sets", forecastQuantity: 150, unitPrice: 120.00, confidence: 70 }
      ],
      "RMNCH": [
        { id: "10", name: "Iron/Folic Acid Tablets", unit: "tablets", forecastQuantity: 18000, unitPrice: 0.02, confidence: 95 },
        { id: "11", name: "ORS Sachets", unit: "sachets", forecastQuantity: 4500, unitPrice: 0.08, confidence: 90 },
        { id: "12", name: "Delivery Kit", unit: "kits", forecastQuantity: 650, unitPrice: 8.50, confidence: 85 }
      ]
    };

    return products[program as keyof typeof products] || [
      { id: "13", name: "Essential Medicine A", unit: "tablets", forecastQuantity: 8000, unitPrice: 0.50, confidence: 80 },
      { id: "14", name: "Essential Medicine B", unit: "vials", forecastQuantity: 1200, unitPrice: 5.00, confidence: 85 }
    ];
  };

  const getMethodAssumptions = (method: string) => {
    const assumptions = {
      "Consumption Method": [
        "Based on 12 months historical consumption data",
        "Adjusted for seasonal variations (+15%)",
        "Safety stock: 2 months coverage",
        "Lead time: 3 months average"
      ],
      "Service Statistics Method": [
        "Patient load: 850 patients/month average",
        "Treatment success rate: 85%",
        "Protocol adherence: 90%",
        "Wastage rate: 5%"
      ],
      "Demographic Morbidity Method": [
        "Catchment population: 125,000",
        "Disease incidence: 12.3 per 1,000",
        "Coverage target: 85%",
        "Case detection rate: 75%"
      ],
      "Hybrid / Demographic Method": [
        "Multi-source data validation",
        "Population-based calculations with service adjustments",
        "Conservative estimates with 20% buffer",
        "Quarterly review and updates"
      ]
    };

    return assumptions[method as keyof typeof assumptions] || [];
  };

  useEffect(() => {
    // Auto-start calculation when component mounts
    const timer = setTimeout(() => {
      simulateCalculation();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleProceedToResults = () => {
    if (calculationResults) {
      onCalculationComplete(calculationResults);
    }
  };

  const overallProgress = calculationSteps.filter(s => s.status === "completed").length / calculationSteps.length * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Forecast Calculation in Progress
              </CardTitle>
              <p className="text-muted-foreground">
                Method: {getRecommendedMethod()}
              </p>
            </div>
            <Badge variant="outline">
              {Math.round(overallProgress)}% Complete
            </Badge>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Calculation Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calculation Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculationSteps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {step.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : step.status === "running" ? (
                    <Clock className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : step.status === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted" />
                  )}
                  <div>
                    <p className="font-medium">{step.name}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <Badge variant={
                  step.status === "completed" ? "default" :
                  step.status === "running" ? "secondary" :
                  step.status === "error" ? "destructive" : "outline"
                }>
                  {step.status === "completed" ? "Complete" :
                   step.status === "running" ? "Running" :
                   step.status === "error" ? "Error" : "Pending"}
                </Badge>
              </div>
              {step.status === "running" && (
                <Progress value={step.progress} className="w-full" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Results Preview */}
      {calculationResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Calculation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Forecast calculation completed successfully. Your forecast is ready for review.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{calculationResults.totalProducts}</div>
                  <p className="text-sm text-muted-foreground">Products</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {calculationResults.totalQuantity.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${calculationResults.totalValue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{calculationResults.averageConfidence}%</div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack}>
                Back to Setup
              </Button>
              <Button onClick={handleProceedToResults}>
                Review Forecast Details
                <TrendingUp className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};