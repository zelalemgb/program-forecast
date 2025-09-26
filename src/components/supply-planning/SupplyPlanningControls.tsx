import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
    <div className="flex items-center gap-2">
      <Button
        variant={manualEntryMode ? "default" : "outline"}
        size="sm"
        onClick={onToggleManualEntry}
        className="text-xs"
      >
        {manualEntryMode ? "Auto Mode" : "Manual Entry"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onImportFromExcel}
        className="flex items-center gap-1 text-xs"
      >
        <Download className="h-3 w-3" />
        Import
      </Button>
    </div>
  );
};