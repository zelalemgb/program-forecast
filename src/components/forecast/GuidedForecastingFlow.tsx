import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Save, Target, BarChart3, Calendar, Users, Upload } from "lucide-react";

/**
 * Forecasting Module – Guided Flow Implementation
 * ----------------------------------------------
 * Implements a 5-step wizard flow for guided forecasting based on the provided spec
 */

// Types
type ScenarioType = "INV" | "PROGRAM" | "CAMPAIGN" | "NATIONAL" | "CUSTOM";

interface Scenario {
  key: ScenarioType;
  title: string;
  desc: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}

const scenarios: Scenario[] = [
  { 
    key: 'INV', 
    title: 'Facility – Inventory', 
    desc: 'Use issues/consumption from stock to forecast automatically.',
    time: '~2 min',
    icon: BarChart3
  },
  { 
    key: 'PROGRAM', 
    title: 'Program (Morbidity)', 
    desc: 'Malaria, RMNCH, HIV, EPI templates with conversion factors.',
    time: '~3–5 min',
    icon: Target
  },
  { 
    key: 'CAMPAIGN', 
    title: 'Campaign/Event', 
    desc: 'Forecast for HIV testing month, Measles catch-up, etc.',
    time: '~5 min',
    icon: Calendar
  },
  { 
    key: 'NATIONAL', 
    title: 'National/Regional Roll-up', 
    desc: 'Aggregate facility data or morbidity estimates at scale.',
    time: '~10+ min',
    icon: Users
  },
  { 
    key: 'CUSTOM', 
    title: 'Custom Data Source', 
    desc: 'Upload CSV or connect DHIS2/service statistics.',
    time: '~3–5 min',
    icon: Upload
  }
];

interface IntentModalProps {
  onSelect: (key: ScenarioType) => void;
  onClose: () => void;
}

function IntentModal({ onSelect, onClose }: IntentModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            What do you want to forecast today?
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map(s => {
            const Icon = s.icon;
            return (
              <button 
                key={s.key} 
                onClick={() => onSelect(s.key)}
                className="p-4 rounded-xl border border-border hover:border-primary/50 text-left bg-card hover:bg-muted/50 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {s.time}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSelect('INV')} className="bg-foreground text-background hover:bg-foreground/90">
            Skip to Expert Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WizardProps {
  scenario: ScenarioType;
  onClose: () => void;
}

function Wizard({ scenario, onClose }: WizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const next = () => setStep(s => Math.min(totalSteps, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const getScenarioTitle = () => {
    const scenarioObj = scenarios.find(s => s.key === scenario);
    return scenarioObj?.title || scenario;
  };

  const StepBox = ({ children }: { children: React.ReactNode }) => (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );

  const stepProgress = (step / totalSteps) * 100;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {getScenarioTitle()} Forecast Wizard
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(stepProgress)}% Complete</span>
            </div>
            <Progress value={stepProgress} className="h-2" />
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <div 
                  key={n} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step === n ? 'bg-primary text-primary-foreground' : 
                    step > n ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <StepBox>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Step 1 – Scope & Planning
              </h3>
              <p className="text-muted-foreground mb-4">
                Define your forecasting scope, including organizational level, programs, and time horizon.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Geographic Level</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <select className="w-full p-2 border border-border rounded-lg bg-background">
                      <option>Facility Level</option>
                      <option>Woreda Level</option>
                      <option>Zone Level</option>
                      <option>Regional Level</option>
                      <option>National Level</option>
                    </select>
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Program Focus</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <select className="w-full p-2 border border-border rounded-lg bg-background">
                      <option>All Programs</option>
                      <option>Malaria</option>
                      <option>RMNCH</option>
                      <option>HIV/AIDS</option>
                      <option>EPI (Immunization)</option>
                    </select>
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Time Horizon</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <select className="w-full p-2 border border-border rounded-lg bg-background">
                      <option>3 Months</option>
                      <option>6 Months</option>
                      <option>12 Months</option>
                      <option>24 Months</option>
                    </select>
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Forecast Period</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <select className="w-full p-2 border border-border rounded-lg bg-background">
                      <option>FY 2024/25</option>
                      <option>FY 2025/26</option>
                      <option>FY 2026/27</option>
                    </select>
                  </CardContent>
                </Card>
              </div>
            </StepBox>
          )}

          {step === 2 && (
            <StepBox>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Step 2 – Data Source Selection
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose the primary data source for your forecast calculations.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'inventory', title: 'Inventory Consumption Data', desc: 'Use historical issues and consumption patterns from stock records' },
                  { id: 'service', title: 'Service Statistics', desc: 'Patient visits, procedures, and clinical service data from HMIS' },
                  { id: 'morbidity', title: 'Morbidity & Epidemiological Data', desc: 'Disease burden estimates and population health indicators' },
                  { id: 'upload', title: 'Upload Custom Data', desc: 'CSV files with your own consumption or service data' }
                ].map(source => (
                  <label key={source.id} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="dataSource" value={source.id} className="mt-1" />
                    <div>
                      <div className="font-medium">{source.title}</div>
                      <div className="text-sm text-muted-foreground">{source.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </StepBox>
          )}

          {step === 3 && (
            <StepBox>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Step 3 – Assumptions & Parameters
              </h3>
              <p className="text-muted-foreground mb-4">
                Configure key assumptions that will influence your forecast calculations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Lead Time (Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <input type="number" placeholder="30" className="w-full p-2 border border-border rounded-lg bg-background" />
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Service Level (%)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <input type="number" placeholder="95" className="w-full p-2 border border-border rounded-lg bg-background" />
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Wastage Rate (%)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <input type="number" placeholder="5" className="w-full p-2 border border-border rounded-lg bg-background" />
                  </CardContent>
                </Card>
                
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Growth Factor (%)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <input type="number" placeholder="10" className="w-full p-2 border border-border rounded-lg bg-background" />
                  </CardContent>
                </Card>
              </div>
              
              {scenario === 'PROGRAM' && (
                <Card className="border-primary/30 bg-primary/5 mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Program-Specific Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Malaria Positivity Rate (%)</label>
                        <input type="number" placeholder="15" className="w-full p-2 border border-border rounded-lg bg-background mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Treatment Success Rate (%)</label>
                        <input type="number" placeholder="90" className="w-full p-2 border border-border rounded-lg bg-background mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </StepBox>
          )}

          {step === 4 && (
            <StepBox>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Step 4 – Review & Data Quality
              </h3>
              <p className="text-muted-foreground mb-4">
                Review your configuration and check data quality before generating the forecast.
              </p>
              
              <div className="space-y-4">
                <Card className="border-info/30 bg-info/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Forecast Formula
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <code className="text-xs bg-muted p-2 rounded block">
                      Forecast = (Historical_AMC × Growth_Factor × Forecast_Period) + Safety_Stock + Wastage_Allowance
                    </code>
                  </CardContent>
                </Card>
                
                <Card className="border-status-warning/30 bg-status-warning/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Data Quality Warnings</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-status-warning rounded-full"></div>
                        <span>3 products have less than 6 months of consumption data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-status-ok rounded-full"></div>
                        <span>85% of products have complete transaction history</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-info rounded-full"></div>
                        <span>Seasonal adjustments will be applied for 12 products</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </StepBox>
          )}

          {step === 5 && (
            <StepBox>
              <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Step 5 – Generate & Export
              </h3>
              <p className="text-muted-foreground mb-4">
                Your forecast is ready! Review the results and choose your export options.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Products</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-primary">247</div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Forecast Value</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-primary">$1.2M</div>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Confidence Score</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-primary">87%</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-12">
                  Export to Excel
                </Button>
                <Button variant="outline" className="h-12">
                  Generate RRF
                </Button>
                <Button variant="outline" className="h-12">
                  Budget Simulator
                </Button>
                <Button variant="outline" className="h-12">
                  Share Forecast
                </Button>
              </div>
            </StepBox>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t border-border">
          <Button 
            onClick={back} 
            disabled={step === 1} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {step < totalSteps && (
              <Button onClick={next} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            {step === totalSteps && (
              <Button onClick={onClose} className="flex items-center gap-2 bg-status-ok hover:bg-status-ok/90">
                <Save className="h-4 w-4" />
                Save & Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GuidedForecastingFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidedForecastingFlow({ isOpen, onClose }: GuidedForecastingFlowProps) {
  const [scenario, setScenario] = useState<ScenarioType | null>(null);

  const handleScenarioSelect = (selectedScenario: ScenarioType) => {
    setScenario(selectedScenario);
  };

  const handleClose = () => {
    setScenario(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {!scenario && <IntentModal onSelect={handleScenarioSelect} onClose={handleClose} />}
      {scenario && <Wizard scenario={scenario} onClose={handleClose} />}
    </>
  );
}