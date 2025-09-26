import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PeriodSelectorProps {
  periodType: string;
  startingPeriod: string;
  onPeriodTypeChange: (value: string) => void;
  onStartingPeriodChange: (value: string) => void;
  periods: string[];
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periodType,
  startingPeriod,
  onPeriodTypeChange,
  onStartingPeriodChange,
  periods
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Label className="text-xs font-medium text-muted-foreground">Period Type</Label>
        <Select value={periodType} onValueChange={onPeriodTypeChange}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly (12 periods)</SelectItem>
            <SelectItem value="bi-monthly">Bi-monthly (6 periods)</SelectItem>
            <SelectItem value="quarterly">Quarterly (4 periods)</SelectItem>
            <SelectItem value="biannually">Bi-annually (2 periods)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs font-medium text-muted-foreground">Starting Period</Label>
        <Select value={startingPeriod} onValueChange={onStartingPeriodChange}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hamle-2017">Hamle 2017 EC</SelectItem>
            <SelectItem value="hamle-2018">Hamle 2018 EC</SelectItem>
            <SelectItem value="hamle-2019">Hamle 2019 EC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="text-xs font-medium text-muted-foreground">Generated Periods</Label>
        <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded border min-h-[32px] flex items-center">
          {periods.length} {periodType} periods
        </div>
      </div>
    </div>
  );
};