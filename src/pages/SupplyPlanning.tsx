import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, HelpCircle } from "lucide-react";
import { RefinedForecastWizard } from "@/components/forecast/RefinedForecastWizard";
import PageHeader from "@/components/layout/PageHeader";
import { PeriodSelector } from "@/components/supply-planning/PeriodSelector";
import { SupplyPlanningControls } from "@/components/supply-planning/SupplyPlanningControls";
import { DrugAnalysisTable } from "@/components/supply-planning/DrugAnalysisTable";

const SupplyPlanning: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  
  const [periodType, setPeriodType] = useState<string>("monthly");
  const [startingPeriod, setStartingPeriod] = useState<string>("hamle-2017");
  const [showWizard, setShowWizard] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);

  // Generate periods based on selection
  const generatePeriods = () => {
    if (periodType === "monthly") {
      const hamleMonths = ["Hamle", "Nehase", "Meskerem", "Tekemet", "Hedar", "Tahsas", 
                          "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene"];
      return hamleMonths;
    } else if (periodType === "bi-monthly") {
      return ["Hamle-Nehase", "Meskerem-Tekemet", "Hedar-Tahsas", "Tir-Yekatit", "Megabit-Miazia", "Ginbot-Sene"];
    } else if (periodType === "quarterly") {
      return ["Q1 (Hamle-Meskerem)", "Q2 (Tekemet-Tahsas)", "Q3 (Tir-Miazia)", "Q4 (Ginbot-Sene)"];
    } else if (periodType === "biannually") {
      return ["H1 (Hamle-Tahsas)", "H2 (Tir-Sene)"];
    }
    return [];
  };

  const periods = generatePeriods();

  // Initialize all periods as collapsed by default
  const [collapsedPeriods, setCollapsedPeriods] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    periods.forEach((_, index) => {
      initialState[index] = true; // Start collapsed
    });
    return initialState;
  });

  // State for manual entry - only for drugs without inventory data
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});

  const handleValueChange = (drugName: string, periodIndex: number, value: string) => {
    const key = `${drugName}-${periodIndex}`;
    setEditableValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEditableValue = (drugName: string, periodIndex: number) => {
    const key = `${drugName}-${periodIndex}`;
    return editableValues[key] || "";
  };

  const togglePeriod = (index: number) => {
    setCollapsedPeriods(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleClearAndManualEntry = () => {
    setEditableValues({});
    
    if (manualEntryMode) {
      setManualEntryMode(false);
    } else {
      setManualEntryMode(true);
    }
  };

  const handleImportFromExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("Selected file:", file.name);
        setManualEntryMode(true);
      }
    };
    input.click();
  };

  const actions = (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Annual Analysis
      </Badge>
      <Button variant="ghost" size="icon">
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Supply Planning | Health Supply Management System</title>
        <meta
          name="description"
          content="Annual drug consumption analysis and supply forecasting for facility supply planning."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <PageHeader
        title="Supply Planning"
        description="Facility: Main Health Center • Period: Feb 2024 • Analysis Period: Ethiopian Calendar Year"
        actions={actions}
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Period Configuration */}
            <div className="space-y-4">
              <PeriodSelector
                periodType={periodType}
                startingPeriod={startingPeriod}
                onPeriodTypeChange={setPeriodType}
                onStartingPeriodChange={setStartingPeriod}
                periods={periods}
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium">Drug-by-Drug Annual Analysis ({periodType} periods)</h4>
                <SupplyPlanningControls
                  manualEntryMode={manualEntryMode}
                  onToggleManualEntry={handleClearAndManualEntry}
                  onImportFromExcel={handleImportFromExcel}
                />
              </div>
            </div>

            {/* Drug Analysis Table */}
            <DrugAnalysisTable
              periods={periods}
              collapsedPeriods={collapsedPeriods}
              editableValues={editableValues}
              onTogglePeriod={togglePeriod}
              onValueChange={handleValueChange}
              getEditableValue={getEditableValue}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">Next Steps</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => setShowWizard(true)} 
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Generate Forecast Report
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export to Excel
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h4 className="font-medium">Analysis Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Total drugs analyzed: 3</div>
                  <div>• Periods covered: {periods.length} {periodType} periods</div>
                  <div>• Data completion: {manualEntryMode ? "Manual entry mode" : "Using inventory data"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wizard Modal */}
        {showWizard && (
          <RefinedForecastWizard 
            onClose={() => setShowWizard(false)}
            onComplete={(data) => {
              console.log('Forecast completed:', data);
              setShowWizard(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default SupplyPlanning;