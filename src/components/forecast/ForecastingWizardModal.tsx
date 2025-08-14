import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Heart, 
  Calendar, 
  Building2, 
  Database, 
  Users, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Lightbulb,
  Target
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface WizardData {
  commodityTypes: string[];
  customCommodity: string;
  forecastMonths: string;
  customMonths: string;
  healthProgram: string;
  customProgram: string;
  serviceData: string;
  consumptionData: string;
  stockouts: string;
  catchmentPopulation: string;
  diseaseIncidence: string;
}

interface ForecastingWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (data: WizardData) => void;
}

const ForecastingWizardModal: React.FC<ForecastingWizardModalProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    commodityTypes: [],
    customCommodity: "",
    forecastMonths: "",
    customMonths: "",
    healthProgram: "",
    customProgram: "",
    serviceData: "",
    consumptionData: "",
    stockouts: "",
    catchmentPopulation: "",
    diseaseIncidence: "",
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (field: keyof WizardData, value: string | string[]) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
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

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({
      commodityTypes: [],
      customCommodity: "",
      forecastMonths: "",
      customMonths: "",
      healthProgram: "",
      customProgram: "",
      serviceData: "",
      consumptionData: "",
      stockouts: "",
      catchmentPopulation: "",
      diseaseIncidence: "",
    });
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleComplete = () => {
    onComplete?.(wizardData);
    resetWizard();
    onOpenChange(false);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return true; // Welcome step
      case 2:
        return wizardData.commodityTypes.length > 0 && 
               (wizardData.forecastMonths !== "" || wizardData.customMonths !== "");
      case 3:
        return wizardData.healthProgram !== "" || wizardData.customProgram !== "";
      case 4:
        return true; // Introduction step
      case 5:
        return wizardData.serviceData !== "" && 
               wizardData.consumptionData !== "" && 
               wizardData.stockouts !== "" && 
               wizardData.catchmentPopulation !== "" && 
               wizardData.diseaseIncidence !== "";
      case 6:
        return true; // Analysis step
      case 7:
        return true; // Recommendation step
      default:
        return false;
    }
  };

  const getRecommendedMethod = (): string => {
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

  const getMethodDetails = (): string => {
    const method = getRecommendedMethod();
    
    switch (method) {
      case "Consumption Method":
        return "This method works best when you have reliable monthly consumption data. It uses your facility's historical usage patterns to predict future needs.";
      case "Service Statistics Method":
        return "This method uses your service delivery data (patient visits, treatments) combined with treatment protocols to estimate commodity needs.";
      case "Demographic Morbidity Method":
        return "This method works best when you know your population size and have general disease trends, even if your service or consumption data is incomplete.";
      default:
        return "This method combines multiple data sources to provide the best possible forecast given your available information.";
    }
  };

  const handleCommodityChange = (commodity: string, checked: boolean) => {
    if (checked) {
      updateData("commodityTypes", [...wizardData.commodityTypes, commodity]);
    } else {
      updateData("commodityTypes", wizardData.commodityTypes.filter(c => c !== commodity));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 hero-gradient rounded-2xl flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Welcome to the Health Forecasting Assistant!</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This tool will help you estimate how many medicines, test kits, and supplies your facility will need.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-md mx-auto">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>You don't need to be an expert—we'll guide you step by step.</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-semibold">Define Your Forecasting Goal</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">📌 What do you want to forecast?</Label>
                <p className="text-sm text-muted-foreground mb-3">Select one or more</p>
                <div className="space-y-3">
                  {["Medicines", "Test kits", "Medical supplies"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={wizardData.commodityTypes.includes(type)}
                        onCheckedChange={(checked) => handleCommodityChange(type, checked as boolean)}
                      />
                      <Label htmlFor={type}>{type}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={wizardData.commodityTypes.includes("other")}
                      onCheckedChange={(checked) => handleCommodityChange("other", checked as boolean)}
                    />
                    <Label htmlFor="other">Other:</Label>
                    <Input
                      placeholder="Specify..."
                      value={wizardData.customCommodity}
                      onChange={(e) => updateData("customCommodity", e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">📅 For how many months do you want to forecast?</Label>
                <RadioGroup 
                  value={wizardData.forecastMonths} 
                  onValueChange={(value) => updateData("forecastMonths", value)}
                  className="mt-3"
                >
                  {["6", "12", "24"].map((months) => (
                    <div key={months} className="flex items-center space-x-2">
                      <RadioGroupItem value={months} id={`months-${months}`} />
                      <Label htmlFor={`months-${months}`}>{months} months</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="months-custom" />
                    <Label htmlFor="months-custom">Custom:</Label>
                    <Input
                      placeholder="Number of months"
                      value={wizardData.customMonths}
                      onChange={(e) => updateData("customMonths", e.target.value)}
                      className="max-w-xs"
                      type="number"
                    />
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-semibold">Select Health Program Area</h2>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">💊 Which health area is this forecast for?</Label>
              <RadioGroup 
                value={wizardData.healthProgram} 
                onValueChange={(value) => updateData("healthProgram", value)}
                className="space-y-3"
              >
                {["Malaria", "HIV", "Tuberculosis (TB)", "Reproductive, Maternal, Newborn, Child Health (RMNCH)"].map((program) => (
                  <div key={program} className="flex items-center space-x-2">
                    <RadioGroupItem value={program} id={`program-${program}`} />
                    <Label htmlFor={`program-${program}`}>{program}</Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="program-other" />
                  <Label htmlFor="program-other">Other:</Label>
                  <Input
                    placeholder="Specify..."
                    value={wizardData.customProgram}
                    onChange={(e) => updateData("customProgram", e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </RadioGroup>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Lightbulb className="h-4 w-4" />
                <span><strong>Why this matters:</strong> Forecasting logic and commodities are different for each program.</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 hero-gradient rounded-2xl flex items-center justify-center">
                <Database className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Smart Method Recommendation</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                🔍 Let's find the best forecasting method based on the information you have at your facility.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-semibold">Facility Reality Check</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-base mb-4">📊 DATA AVAILABILITY</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Service Data</Label>
                    <p className="text-sm text-muted-foreground mb-2">Do you regularly record the number of patients or services provided for this condition?</p>
                    <RadioGroup 
                      value={wizardData.serviceData} 
                      onValueChange={(value) => updateData("serviceData", value)}
                    >
                      {["yes", "no", "not-sure"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`service-${option}`} />
                          <Label htmlFor={`service-${option}`}>
                            {option === "yes" ? "Yes" : option === "no" ? "No" : "Not Sure"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Consumption Data</Label>
                    <p className="text-sm text-muted-foreground mb-2">Do you have records of how many health commodities your facility used each month?</p>
                    <RadioGroup 
                      value={wizardData.consumptionData} 
                      onValueChange={(value) => updateData("consumptionData", value)}
                    >
                      {["yes", "no", "not-sure"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`consumption-${option}`} />
                          <Label htmlFor={`consumption-${option}`}>
                            {option === "yes" ? "Yes" : option === "no" ? "No" : "Not Sure"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Stockouts</Label>
                    <p className="text-sm text-muted-foreground mb-2">Have you experienced frequent stockouts in the past 6–12 months?</p>
                    <RadioGroup 
                      value={wizardData.stockouts} 
                      onValueChange={(value) => updateData("stockouts", value)}
                    >
                      {["yes", "no"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`stockouts-${option}`} />
                          <Label htmlFor={`stockouts-${option}`}>
                            {option === "yes" ? "Yes" : "No"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-base mb-4">🧮 POPULATION-BASED DATA</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Catchment Population</Label>
                    <p className="text-sm text-muted-foreground mb-2">Do you know the population your facility serves?</p>
                    <RadioGroup 
                      value={wizardData.catchmentPopulation} 
                      onValueChange={(value) => updateData("catchmentPopulation", value)}
                    >
                      {["yes", "no", "estimate"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`population-${option}`} />
                          <Label htmlFor={`population-${option}`}>
                            {option === "yes" ? "Yes" : option === "no" ? "No" : "Estimate"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Disease Incidence/Prevalence</Label>
                    <p className="text-sm text-muted-foreground mb-2">Do you know how common this disease is in your area?</p>
                    <RadioGroup 
                      value={wizardData.diseaseIncidence} 
                      onValueChange={(value) => updateData("diseaseIncidence", value)}
                    >
                      {["yes", "no", "use-default"].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`incidence-${option}`} />
                          <Label htmlFor={`incidence-${option}`}>
                            {option === "yes" ? "Yes" : option === "no" ? "No" : "Use default"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-semibold">Decision Logic Summary</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left text-sm font-medium">Conditions Met</th>
                    <th className="border border-border p-3 text-left text-sm font-medium">Recommended Method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 text-sm">Reliable monthly stock usage data</td>
                    <td className="border border-border p-3 text-sm">Consumption Method</td>
                  </tr>
                  <tr className="bg-muted/25">
                    <td className="border border-border p-3 text-sm">Reliable service delivery data</td>
                    <td className="border border-border p-3 text-sm">Service Statistics Method</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3 text-sm">Only population and general disease rates known</td>
                    <td className="border border-border p-3 text-sm">Demographic Morbidity Method</td>
                  </tr>
                  <tr className="bg-muted/25">
                    <td className="border border-border p-3 text-sm">Partial data</td>
                    <td className="border border-border p-3 text-sm">Hybrid / Demographic fallback</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold">Recommendation</h2>
            </div>
            
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-base">🧠 Based on your answers, we recommend the:</p>
                <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-lg font-semibold text-lg">
                  <Target className="h-5 w-5" />
                  {getRecommendedMethod()}
                </div>
              </div>
              
              <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                {getMethodDetails()}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" className="flex items-center gap-2" onClick={handleComplete}>
                  <CheckCircle className="h-4 w-4" />
                  Use Recommended Method
                </Button>
                <Button variant="outline" size="lg">
                  🔁 Choose a Different Method Manually
                </Button>
                <Button variant="ghost" size="lg">
                  ℹ️ Why this method?
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Health Forecasting Assistant - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          <div className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? handleClose : prevStep}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 1 ? "Cancel" : "Previous"}
              </Button>
              
              <Button
                onClick={currentStep === totalSteps ? handleComplete : nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2"
              >
                {currentStep === totalSteps ? "Start Forecasting" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForecastingWizardModal;