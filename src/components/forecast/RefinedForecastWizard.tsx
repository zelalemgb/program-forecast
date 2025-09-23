import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Target, Calendar, Database, CheckCircle, TrendingUp } from "lucide-react";
import { ForecastWizardSteps } from "./ForecastWizardSteps";

interface RefinedForecastWizardProps {
  onClose: () => void;
  onComplete: (data: ForecastData) => void;
}

export interface ForecastData {
  // Step 1: Define Forecast
  name: string;
  purpose: 'procurement' | 'budget' | 'emergency' | 'redistribution';
  
  // Step 2: Define Scope
  commodityTypes: string[];
  timeframe: number;
  startDate: string;
  program: string;
  
  // Step 3: Data Assessment
  availableData: {
    consumption: boolean;
    service: boolean;
    population: boolean;
    stockData: boolean;
  };
  
  // Step 4: Method Selection
  selectedMethod: 'consumption' | 'service' | 'demographic' | 'hybrid' | undefined;
  
  // Step 5: Data Collection (varies by method)
  collectedData: any;
  
  // Step 6: Analysis Results
  analysisResults?: any;
}

const STEPS = [
  { id: 1, title: "Define Forecast", icon: Target },
  { id: 2, title: "Define Scope", icon: Calendar },
  { id: 3, title: "Data Assessment", icon: Database },
  { id: 4, title: "Method Selection", icon: TrendingUp },
  { id: 5, title: "Data Collection", icon: Database },
  { id: 6, title: "Analysis & Output", icon: CheckCircle },
];

export const RefinedForecastWizard: React.FC<RefinedForecastWizardProps> = ({ 
  onClose, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [forecastData, setForecastData] = useState<ForecastData>({
    name: '',
    purpose: 'procurement',
    commodityTypes: [],
    timeframe: 12,
    startDate: new Date().toISOString().split('T')[0],
    program: '',
    availableData: {
      consumption: false,
      service: false,
      population: false,
      stockData: false,
    },
    selectedMethod: undefined,
    collectedData: null,
  });

  const totalSteps = STEPS.length;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateForecastData = (updates: Partial<ForecastData>) => {
    setForecastData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return forecastData.name.length > 0;
      case 2:
        return forecastData.commodityTypes.length > 0 && forecastData.program.length > 0;
      case 3:
        return Object.values(forecastData.availableData).some(Boolean);
      case 4:
        return forecastData.selectedMethod !== undefined;
      case 5:
        return forecastData.collectedData !== null;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(forecastData);
  };

  const getCurrentStepInfo = () => STEPS.find(step => step.id === currentStep);
  const currentStepInfo = getCurrentStepInfo();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4 border-b bg-muted/20">
          <div>
            <CardTitle className="flex items-center gap-2">
              {currentStepInfo?.icon && <currentStepInfo.icon className="h-5 w-5 text-primary" />}
              Health Forecasting Assistant - {currentStepInfo?.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStepInfo?.title} - Step {currentStep} of {totalSteps}
            </p>
          </div>
          
          {/* Integrated step navigation */}
          <div className="relative pb-4">
            {/* Progress line background */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              />
            </div>
            
            {/* Step indicators integrated with the line */}
            <div className="flex justify-between relative">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Integrated checkmark/circle indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 border-2 ${
                    index < currentStep 
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                      : index === currentStep - 1 
                      ? 'bg-background border-primary text-primary shadow-sm' 
                      : 'bg-background border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {index < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step label */}
                  <span className={`text-xs mt-2 transition-colors duration-200 hidden sm:block max-w-16 text-center ${
                    index < currentStep ? 'text-primary font-medium' : 
                    index === currentStep - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          <ForecastWizardSteps
            currentStep={currentStep}
            forecastData={forecastData}
            updateForecastData={updateForecastData}
          />
        </CardContent>

        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
          <Button 
            variant="outline" 
            onClick={currentStep === 1 ? onClose : prevStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          
          <div className="flex items-center gap-2">
            {currentStep === totalSteps ? (
              <Button 
                onClick={handleComplete}
                className="flex items-center gap-2"
                disabled={!canProceed()}
              >
                <CheckCircle className="h-4 w-4" />
                Complete Forecast
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RefinedForecastWizard;