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
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <Label htmlFor="period-type" className="font-medium whitespace-nowrap">Period Type:</Label>
          <Select value={periodType} onValueChange={onPeriodTypeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="biannually">Biannually</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="starting-period" className="font-medium whitespace-nowrap">Starting Period:</Label>
          <Select value={startingPeriod} onValueChange={onStartingPeriodChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hamle-2017">Hamle 2017 E.C.</SelectItem>
              <SelectItem value="hamle-2016">Hamle 2016 E.C.</SelectItem>
              <SelectItem value="hamle-2015">Hamle 2015 E.C.</SelectItem>
              <SelectItem value="hamle-2014">Hamle 2014 E.C.</SelectItem>
              <SelectItem value="hamle-2013">Hamle 2013 E.C.</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Badge variant="outline" className="ml-2 whitespace-nowrap">
        One Year Analysis ({periods.length} {periodType === "monthly" ? "months" : periodType === "bi-monthly" ? "bi-monthly periods" : periodType === "quarterly" ? "quarters" : "periods"})
      </Badge>
    </div>
  );
};