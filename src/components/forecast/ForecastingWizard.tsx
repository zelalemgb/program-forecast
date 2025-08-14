import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Users, Calendar, Heart, Brain, Database, TrendingUp } from "lucide-react";

interface ForecastingWizardProps {
  onClose: () => void;
  onComplete: (data: any) => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface WizardData {
  commodityTypes: string[];
  forecastMonths: number;
  customMonths?: number;
  healthProgram: string;
  customProgram?: string;
  hasServiceData: string;
  hasConsumptionData: string;
  hasStockouts: string;
  knowsCatchmentPopulation: string;
  knowsDiseaseIncidence: string;
  recommendedMethod?: string;
}

const ForecastingWizard: React.FC<ForecastingWizardProps> = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    commodityTypes: [],
    forecastMonths: 12,
    healthProgram: "",
    hasServiceData: "",
    hasConsumptionData: "",
    hasStockouts: "",
    knowsCatchmentPopulation: "",
    knowsDiseaseIncidence: "",
  });

  const totalSteps = 7;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const getRecommendedMethod = () => {
    const { hasConsumptionData, hasServiceData, knowsCatchmentPopulation } = wizardData;
    
    if (hasConsumptionData === "yes") {
      return "consumption";
    } else if (hasServiceData === "yes") {
      return "service";
    } else if (knowsCatchmentPopulation === "yes") {
      return "demographic";
    } else {
      return "hybrid";
    }
  };

  const getMethodDetails = (method: string) => {
    const methods = {
      consumption: {
        name: "Consumption Method",
        description: "Based on historical usage data from your facility",
        icon: <TrendingUp className="h-5 w-5" />,
        color: "text-green-600"
      },
      service: {
        name: "Service Statistics Method", 
        description: "Based on patient services and treatment protocols",
        icon: <Heart className="h-5 w-5" />,
        color: "text-blue-600"
      },
      demographic: {
        name: "Demographic Morbidity Method",
        description: "Based on population size and disease patterns",
        icon: <Users className="h-5 w-5" />,
        color: "text-purple-600"
      },
      hybrid: {
        name: "Hybrid / Demographic Method",
        description: "Uses available data with demographic fallback",
        icon: <Database className="h-5 w-5" />,
        color: "text-orange-600"
      }
    };
    return methods[method as keyof typeof methods];
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // Welcome step
      case 2: return wizardData.commodityTypes.length > 0 && wizardData.forecastMonths > 0;
      case 3: return wizardData.healthProgram !== "";
      case 4: return true; // Info step
      case 5: return wizardData.hasServiceData !== "" && wizardData.hasConsumptionData !== "";
      case 6: return true; // Analysis step
      case 7: return true; // Recommendation step
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">👋 Welcome to the Health Forecasting Assistant!</h2>
              <p className="text-muted-foreground text-lg">
                This tool will help you estimate how many medicines, test kits, and supplies your facility will need.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">You don't need to be an expert—we'll guide you step by step.</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">📌 What do you want to forecast?</h2>
            <div className="space-y-4">
              <Label className="text-base">Select one or more:</Label>
              <div className="grid grid-cols-2 gap-3">
                {["Medicines", "Test kits", "Medical supplies", "Other"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={wizardData.commodityTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData({ commodityTypes: [...wizardData.commodityTypes, type] });
                        } else {
                          updateData({ 
                            commodityTypes: wizardData.commodityTypes.filter(t => t !== type) 
                          });
                        }
                      }}
                    />
                    <Label htmlFor={type} className="font-normal">{type}</Label>
                  </div>
                ))}
              </div>
              {wizardData.commodityTypes.includes("Other") && (
                <Input 
                  placeholder="Specify other commodity type..."
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                For how many months do you want to forecast?
              </Label>
              <RadioGroup 
                value={wizardData.forecastMonths.toString()} 
                onValueChange={(value) => updateData({ forecastMonths: parseInt(value) })}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6" id="6-months" />
                    <Label htmlFor="6-months">6 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="12" id="12-months" />
                    <Label htmlFor="12-months">12 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="24" id="24-months" />
                    <Label htmlFor="24-months">24 months</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </div>
              </RadioGroup>
              {wizardData.forecastMonths.toString() === "custom" && (
                <Input 
                  type="number" 
                  placeholder="Enter number of months"
                  onChange={(e) => updateData({ customMonths: parseInt(e.target.value) })}
                  className="mt-2"
                />
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              💊 Which health area is this forecast for?
            </h2>
            <p className="text-sm text-muted-foreground">Choose one:</p>
            
            <RadioGroup 
              value={wizardData.healthProgram} 
              onValueChange={(value) => updateData({ healthProgram: value })}
            >
              <div className="space-y-3">
                {[
                  "Malaria",
                  "HIV", 
                  "Tuberculosis (TB)",
                  "Reproductive, Maternal, Newborn, Child Health (RMNCH)",
                  "Other"
                ].map((program) => (
                  <div key={program} className="flex items-center space-x-2">
                    <RadioGroupItem value={program} id={program} />
                    <Label htmlFor={program} className="font-normal">{program}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {wizardData.healthProgram === "Other" && (
              <Input 
                placeholder="Specify health program..."
                onChange={(e) => updateData({ customProgram: e.target.value })}
                className="mt-2"
              />
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Why this matters:</span>
              </div>
              <p className="text-blue-700 mt-1">
                Forecasting logic and commodities are different for each program.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🔍 Smart Method Recommendation
            </h2>
            <p className="text-muted-foreground">
              Let's find the best forecasting method based on the information you have at your facility.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Next: Facility Reality Check</h3>
              <p className="text-sm text-muted-foreground">
                We'll ask you a few simple questions about your data availability to recommend the best method.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">📊 Data Availability Check</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Do you regularly record the number of patients or services provided for this condition?</p>
                  <RadioGroup 
                    value={wizardData.hasServiceData} 
                    onValueChange={(value) => updateData({ hasServiceData: value })}
                  >
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="service-yes" />
                        <Label htmlFor="service-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="service-no" />
                        <Label htmlFor="service-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-sure" id="service-not-sure" />
                        <Label htmlFor="service-not-sure">Not Sure</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumption Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Do you have records of how many health commodities (medicines, tests, supplies) your facility used each month?</p>
                  <RadioGroup 
                    value={wizardData.hasConsumptionData} 
                    onValueChange={(value) => updateData({ hasConsumptionData: value })}
                  >
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="consumption-yes" />
                        <Label htmlFor="consumption-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="consumption-no" />
                        <Label htmlFor="consumption-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-sure" id="consumption-not-sure" />
                        <Label htmlFor="consumption-not-sure">Not Sure</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stockouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Have you experienced frequent stockouts in the past 6–12 months?</p>
                  <RadioGroup 
                    value={wizardData.hasStockouts} 
                    onValueChange={(value) => updateData({ hasStockouts: value })}
                  >
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="stockouts-yes" />
                        <Label htmlFor="stockouts-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="stockouts-no" />
                        <Label htmlFor="stockouts-no">No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">🧮 Population-Based Data</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catchment Population</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Do you know the population your facility serves (your catchment area)?</p>
                  <RadioGroup 
                    value={wizardData.knowsCatchmentPopulation} 
                    onValueChange={(value) => updateData({ knowsCatchmentPopulation: value })}
                  >
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="population-yes" />
                        <Label htmlFor="population-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="population-no" />
                        <Label htmlFor="population-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="estimate" id="population-estimate" />
                        <Label htmlFor="population-estimate">Estimate</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disease Incidence/Prevalence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Do you know how common this disease is in your area?</p>
                  <RadioGroup 
                    value={wizardData.knowsDiseaseIncidence} 
                    onValueChange={(value) => updateData({ knowsDiseaseIncidence: value })}
                  >
                    <div className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="disease-yes" />
                        <Label htmlFor="disease-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="disease-no" />
                        <Label htmlFor="disease-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="use-default" id="disease-default" />
                        <Label htmlFor="disease-default">Use default</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 7:
        const recommendedMethod = getRecommendedMethod();
        const methodDetails = getMethodDetails(recommendedMethod);
        
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">🧠 Method Recommendation</h2>
            
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={methodDetails.color}>
                    {methodDetails.icon}
                  </div>
                  <div>
                    <div className="text-lg">Based on your answers, we recommend:</div>
                    <div className="text-xl font-bold text-primary">{methodDetails.name}</div>
                  </div>
                </CardTitle>
                <CardDescription className="text-base">
                  {methodDetails.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => onComplete({ ...wizardData, recommendedMethod })}
                    className="flex-1"
                  >
                    ✅ Use Recommended Method
                  </Button>
                  <Button variant="outline" className="flex-1">
                    🔁 Choose Different Method
                  </Button>
                </div>
                <Button variant="ghost" className="w-full mt-2">
                  ℹ️ Why this method?
                </Button>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">🔀 Decision Logic Summary</h4>
              <div className="text-sm space-y-1">
                <div>• Reliable consumption data → Consumption Method</div>
                <div>• Reliable service data → Service Statistics Method</div>
                <div>• Population + disease rates → Demographic Method</div>
                <div>• Partial data → Hybrid/Demographic fallback</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Health Forecasting Assistant</CardTitle>
              <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
            </div>
            <Badge variant="outline">Phase 1: Method Selection</Badge>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
        </CardContent>

        <div className="flex items-center justify-between p-6 border-t">
          <Button 
            variant="outline" 
            onClick={currentStep === 1 ? onClose : prevStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          
          <Button 
            onClick={currentStep === totalSteps ? () => onComplete(wizardData) : nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === totalSteps ? "Start Forecasting" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ForecastingWizard;