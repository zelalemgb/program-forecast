import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, HelpCircle } from "lucide-react";
import { RefinedForecastWizard } from "@/components/forecast/RefinedForecastWizard";
import { PeriodSelector } from "@/components/supply-planning/PeriodSelector";
import { SupplyPlanningControls } from "@/components/supply-planning/SupplyPlanningControls";
import { HistoricalInventoryTable } from "@/components/supply-planning/HistoricalInventoryTable";
import { ForecastTable } from "@/components/supply-planning/ForecastTable";
import { useHistoricalInventoryData } from "@/hooks/useHistoricalInventoryData";
import { useCurrentFacility } from "@/hooks/useCurrentFacility";

const SupplyPlanning: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  
  const [periodType, setPeriodType] = useState<string>("monthly");
  const [startingPeriod, setStartingPeriod] = useState<string>("hamle-2017");
  const [showWizard, setShowWizard] = useState(false);
  const [manualEntryMode, setManualEntryMode] = useState(false);

  // Get user's facility
  const { facility } = useCurrentFacility();
  
  // Fetch historical inventory data and forecasts
  const { 
    historicalData, 
    forecastData, 
    loading, 
    error 
  } = useHistoricalInventoryData(facility?.facility_id, periodType, startingPeriod);

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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Supply Planning
          </h1>
          <p className="text-muted-foreground mt-1">
            Facility: Main Health Center • Period: Feb 2024 • Analysis Period: Ethiopian Calendar Year
          </p>
        </div>
        {actions}
      </div>

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

            {/* Historical Drug Analysis Table */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Historical Inventory Analysis (Previous Year)</h4>
              <p className="text-sm text-muted-foreground">
                Inventory data from one year prior to the selected starting period ({periodType} view)
              </p>
              <HistoricalInventoryTable
                periods={periods}
                collapsedPeriods={collapsedPeriods}
                onTogglePeriod={togglePeriod}
                data={historicalData}
                loading={loading}
              />
            </div>

            {/* Forecast Table */}
            <div className="space-y-4">
              <h4 className="font-medium text-lg">Consumption Forecast (Next Year)</h4>
              <p className="text-sm text-muted-foreground">
                Predicted consumption values starting from the selected period for one year ({periods.length} {periodType} periods)
              </p>
              <ForecastTable
                periods={periods}
                data={forecastData}
                loading={loading}
              />
            </div>

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
                  <div>• Total products analyzed: {Object.keys(historicalData.reduce((acc, item) => ({ ...acc, [item.product_id]: true }), {})).length}</div>
                  <div>• Periods covered: {periods.length} {periodType} periods</div>
                  <div>• Data source: {historicalData.length > 0 ? "Database inventory records" : "No historical data available"}</div>
                  <div>• Facility: {facility?.facility_name || "Not selected"}</div>
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