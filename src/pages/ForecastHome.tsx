import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuickActions, { ActionConfig, QuickTaskAction } from '@/components/home/QuickActions';
import {
  Target,
  Database,
  Activity,
  FileText,
  Upload,
  BarChart3
} from 'lucide-react';

// Types
type ScenarioType = "INV" | "PROGRAM" | "CAMPAIGN" | "NATIONAL" | "CUSTOM";

interface Scenario {
  key: ScenarioType;
  title: string;
  desc: string;
  time: string;
}

interface ForecastHistory {
  id: string;
  name: string;
  type: string;
  status: string;
  accuracy?: number;
  updated: string;
}

interface ForecastHomeProps {
  onOpenForecast?: (id: string) => void;
  onViewAllForecasts?: () => void;
  onNewForecast?: () => void;
  onGenerateRRF?: () => void;
  onStartCDSSForecast?: () => void;
  onStartNonCDSSForecast?: () => void;
  onStartProgramForecast?: () => void;
  onImportForecast?: () => void;
  onFixDataIssue?: (id: string) => void;
  onCreateStockPost?: () => void;
  onScenarioSelected?: (scenario: ScenarioType) => void;
  historyItems?: ForecastHistory[];
}

// Data
const scenarios: Scenario[] = [
  { key: 'INV', title: 'Facility – Inventory', desc: 'Use issues/consumption from stock to forecast automatically.', time: '~2 min' },
  { key: 'PROGRAM', title: 'Program (Morbidity)', desc: 'Malaria, RMNCH, HIV, EPI templates with conversion factors.', time: '~3–5 min' },
  { key: 'CAMPAIGN', title: 'Campaign/Event', desc: 'Forecast for HIV testing month, Measles catch-up, etc.', time: '~5 min' },
  { key: 'NATIONAL', title: 'National/Regional Roll-up', desc: 'Aggregate facility data or morbidity estimates at scale.', time: '~10+ min' },
  { key: 'CUSTOM', title: 'Custom Data Source', desc: 'Upload CSV or connect DHIS2/service statistics.', time: '~3–5 min' }
];

// Components
const IntentModal: React.FC<{ onSelect: (key: ScenarioType) => void; onClose: () => void }> = ({ onSelect, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>What do you want to forecast today?</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map(s => (
            <Button
              key={s.key}
              variant="outline"
              className="p-6 h-auto text-left justify-start flex-col items-start space-y-2"
              onClick={() => onSelect(s.key)}
            >
              <div className="font-medium text-foreground">{s.title}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
              <div className="text-xs text-muted-foreground">{s.time}</div>
            </Button>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSelect('INV')}>Skip (Expert Mode)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Wizard: React.FC<{ scenario: ScenarioType; onClose: () => void }> = ({ scenario, onClose }) => {
  const [step, setStep] = useState(1);
  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const StepBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Card>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-background overflow-auto p-6 z-40">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{scenario} Forecast Wizard</h2>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
        
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(n => (
            <div 
              key={n} 
              className={`px-3 py-1 rounded-full text-sm ${
                step === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Step {n}
            </div>
          ))}
        </div>

        {step === 1 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 1 – Scope</h3>
            <p className="text-sm text-muted-foreground">Choose level (Facility/National), program, time horizon.</p>
          </StepBox>
        )}
        {step === 2 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 2 – Data source</h3>
            <p className="text-sm text-muted-foreground">Select inventory, service stats, morbidity, or upload CSV.</p>
          </StepBox>
        )}
        {step === 3 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 3 – Assumptions</h3>
            <p className="text-sm text-muted-foreground">Lead time, service level, wastage, seasonality. Program templates add specific inputs (e.g., malaria positivity).</p>
          </StepBox>
        )}
        {step === 4 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 4 – Review & warnings</h3>
            <p className="text-sm text-muted-foreground">Show formulas, data quality flags, missing data prompts.</p>
          </StepBox>
        )}
        {step === 5 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 5 – Outputs & actions</h3>
            <p className="text-sm text-muted-foreground">Forecast table & charts, export RRF/procurement, budget simulator slider.</p>
          </StepBox>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={back} disabled={step === 1}>
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
              Save & Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoryList: React.FC<{
  items: ForecastHistory[];
  onOpen: (id: string) => void;
  onViewAll?: () => void;
}> = ({ items, onOpen, onViewAll }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Forecasts</CardTitle>
          <Button variant="link" className="text-sm" onClick={onViewAll}>
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No forecasts yet</div>
        ) : (
          <div className="space-y-4">
            {items.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="text-sm font-medium">
                    {item.name} 
                    <span className="text-xs text-muted-foreground ml-2">
                      · {item.type} · {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {item.updated}
                    {item.accuracy && ` · Accuracy ${item.accuracy}%`}
                  </div>
                </div>
                <Button size="sm" onClick={() => onOpen(item.id)}>
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


const ForecastHome: React.FC<ForecastHomeProps> = ({
  onOpenForecast,
  onViewAllForecasts,
  onNewForecast,
  onGenerateRRF,
  onStartCDSSForecast,
  onStartNonCDSSForecast,
  onStartProgramForecast,
  onImportForecast,
  onFixDataIssue,
  onCreateStockPost,
  onScenarioSelected,
  historyItems,
}) => {
  const navigate = useNavigate();
  const [showIntentModal, setShowIntentModal] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);

  const safeOpenForecast = onOpenForecast ?? (() => undefined);
  const safeViewAllForecasts = onViewAllForecasts ?? (() => undefined);
  const safeOnNewForecast = onNewForecast ?? (() => undefined);
  const safeGenerateRRF = onGenerateRRF ?? (() => undefined);
  const safeStartCDSS = onStartCDSSForecast ?? (() => undefined);
  const safeStartNonCDSS = onStartNonCDSSForecast ?? (() => undefined);
  const safeStartProgram = onStartProgramForecast ?? (() => undefined);
  const safeImportForecast = onImportForecast ?? (() => undefined);
  const safeFixDataIssue = onFixDataIssue ?? (() => undefined);
  const safeCreateStockPost = onCreateStockPost ?? (() => undefined);
  const safeScenarioSelected = onScenarioSelected ?? (() => undefined);

  const history: ForecastHistory[] = historyItems ?? [
    { id: 'F-102', name: 'RMNCH Q3', type: 'Program', status: 'Approved', accuracy: 82, updated: '3 days ago' },
    { id: 'F-101', name: 'Facility RRF Aug', type: 'CDSS', status: 'Submitted', accuracy: 88, updated: '2 weeks ago' },
    { id: 'F-100', name: 'Malaria Jun–Aug', type: 'Program', status: 'Draft', updated: '1 month ago' }
  ];

  const handleNewForecast = () => {
    setShowIntentModal(true);
    safeOnNewForecast();
  };

  const handleScenarioSelect = (scenario: ScenarioType) => {
    if (scenario === 'INV') {
      navigate('/supply-planning');
      setShowIntentModal(false);
    } else {
      setSelectedScenario(scenario);
      setShowIntentModal(false);
    }
    safeScenarioSelected(scenario);
  };

  const handleWizardClose = () => {
    setSelectedScenario(null);
  };

  const quickActionCards: ActionConfig[] = [
    {
      title: 'Guided Forecast Wizard',
      description: 'Launch a scenario-based workflow with guardrails.',
      icon: BarChart3,
      color: 'bg-violet-500/10 text-violet-600',
      stats: 'Scope programs, data sources, and assumptions',
      onClick: handleNewForecast,
    },
    {
      title: 'Forecast History',
      description: 'Review, approve, or reopen previous forecasts.',
      icon: Activity,
      color: 'bg-slate-500/10 text-slate-600',
      stats: 'Keep teams aligned on the latest runs',
      onClick: safeViewAllForecasts,
    },
  ];

  const quickTaskButtons: QuickTaskAction[] = [
    { title: 'Generate RRF', icon: FileText, variant: 'outline', onClick: safeGenerateRRF },
    { title: 'CDSS Forecast', icon: Target, variant: 'outline', onClick: safeStartCDSS },
    { title: 'Non-CDSS Forecast', icon: Activity, variant: 'outline', onClick: safeStartNonCDSS },
    { title: 'Program Forecast', icon: Database, variant: 'outline', onClick: safeStartProgram },
    { title: 'Import Forecast', icon: Upload, variant: 'outline', onClick: safeImportForecast },
  ];

  return (
    <>
      <Helmet>
        <title>Forecasting Home | Health Supply Management System</title>
        <meta name="description" content="Comprehensive forecasting dashboard for health supply management with guided workflows and analytics." />
        <link rel="canonical" href="/forecast-home" />
      </Helmet>

      <div className="space-y-6">
        {/* KPI Cards removed as requested */}

        {/* Main Content Grid */}
        <div className="space-y-6">
          <HistoryList
            items={history}
            onOpen={safeOpenForecast}
            onViewAll={safeViewAllForecasts}
          />
          <QuickActions
            actions={quickActionCards}
            quickTasks={quickTaskButtons}
          />
        </div>
      </div>

      {/* Modals */}
      {showIntentModal && (
        <IntentModal 
          onSelect={handleScenarioSelect}
          onClose={() => setShowIntentModal(false)}
        />
      )}

      {selectedScenario && (
        <Wizard 
          scenario={selectedScenario}
          onClose={handleWizardClose}
        />
      )}
    </>
  );
};

export default ForecastHome;