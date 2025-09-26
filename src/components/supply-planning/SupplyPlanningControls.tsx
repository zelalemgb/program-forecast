import React from 'react';
import { Button } from '@/components/ui/button';

interface SupplyPlanningControlsProps {
  manualEntryMode: boolean;
  onToggleManualEntry: () => void;
  onImportFromExcel: () => void;
}

export const SupplyPlanningControls: React.FC<SupplyPlanningControlsProps> = ({
  manualEntryMode,
  onToggleManualEntry,
  onImportFromExcel
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        variant="outline" 
        onClick={onToggleManualEntry}
        className="flex items-center gap-2"
      >
        {manualEntryMode ? "Switch to Auto Forecast using inventory" : "Clear values and Enter Manually"}
      </Button>
      <Button 
        variant="outline" 
        onClick={onImportFromExcel}
        className="flex items-center gap-2"
      >
        Import from Excel
      </Button>
    </div>
  );
};