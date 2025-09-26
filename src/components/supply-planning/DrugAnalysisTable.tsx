import React from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface DrugAnalysisTableProps {
  periods: string[];
  collapsedPeriods: { [key: number]: boolean };
  editableValues: { [key: string]: string };
  onTogglePeriod: (index: number) => void;
  onValueChange: (drugName: string, periodIndex: number, value: string) => void;
  getEditableValue: (drugName: string, periodIndex: number) => string;
}

export const DrugAnalysisTable: React.FC<DrugAnalysisTableProps> = ({
  periods,
  collapsedPeriods,
  editableValues,
  onTogglePeriod,
  onValueChange,
  getEditableValue
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r min-w-[200px]">Drug Name</TableHead>
              {periods.map((period, index) => (
                <TableHead key={index} className="text-center border-l relative" colSpan={collapsedPeriods[index] ? 1 : 9}>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="flex items-center gap-1 hover:bg-muted/50 p-1 rounded"
                      onClick={() => onTogglePeriod(index)}
                    >
                      {collapsedPeriods[index] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {period}
                    </CollapsibleTrigger>
                  </Collapsible>
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r"></TableHead>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  {!collapsedPeriods[periodIndex] ? (
                    <>
                      <TableHead className="text-right text-xs">Beg.</TableHead>
                      <TableHead className="text-right text-xs">Rec.</TableHead>
                      <TableHead className="text-right text-xs">Iss.</TableHead>
                      <TableHead className="text-right text-xs">Adj.</TableHead>
                      <TableHead className="text-right text-xs">T.Out</TableHead>
                      <TableHead className="text-right text-xs">End</TableHead>
                      <TableHead className="text-right text-xs">S.Days</TableHead>
                      <TableHead className="text-right text-xs">Exp/Dam</TableHead>
                      <TableHead className="text-right text-xs border-r">Cons.</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right text-xs border-r">Consumption</TableHead>
                  )}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Amoxicillin - has inventory data */}
            <TableRow>
              <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Amoxicillin 250mg</TableCell>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  {!collapsedPeriods[periodIndex] ? (
                    <>
                      <TableCell className="text-right text-xs">500</TableCell>
                      <TableCell className="text-right text-xs">200</TableCell>
                      <TableCell className="text-right text-xs">180</TableCell>
                      <TableCell className="text-right text-xs">-5</TableCell>
                      <TableCell className="text-right text-xs">10</TableCell>
                      <TableCell className="text-right text-xs">505</TableCell>
                      <TableCell className="text-right text-xs">2</TableCell>
                      <TableCell className="text-right text-xs">5</TableCell>
                      <TableCell className="text-right text-xs border-r font-medium">195</TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right text-xs border-r font-medium text-primary">195</TableCell>
                  )}
                </React.Fragment>
              ))}
            </TableRow>
            
            {/* Paracetamol - no inventory data, allow manual entry */}
            <TableRow>
              <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Paracetamol 500mg</TableCell>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  {!collapsedPeriods[periodIndex] ? (
                    <>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-soh-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-soh-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-received-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-received-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-issued-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-issued-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-adjustments-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-adjustments-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-transfers-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-transfers-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-balance-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-balance-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-stockout-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-stockout-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`Paracetamol-losses-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-losses-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                          value={getEditableValue(`Paracetamol-consumption-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`Paracetamol-consumption-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right text-xs border-r p-1">
                      <Input 
                        type="number" 
                        placeholder="0"
                        className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium text-primary"
                        value={getEditableValue(`Paracetamol-consumption-${periodIndex}`, 0)}
                        onChange={(e) => onValueChange(`Paracetamol-consumption-${periodIndex}`, 0, e.target.value)}
                      />
                    </TableCell>
                  )}
                </React.Fragment>
              ))}
            </TableRow>

            {/* ORS - no inventory data, allow manual entry */}
            <TableRow>
              <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">ORS Sachets</TableCell>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  {!collapsedPeriods[periodIndex] ? (
                    <>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-soh-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-soh-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-received-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-received-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-issued-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-issued-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-adjustments-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-adjustments-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-transfers-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-transfers-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-balance-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-balance-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-stockout-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-stockout-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                          value={getEditableValue(`ORS-losses-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-losses-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right text-xs p-1">
                        <Input 
                          type="number" 
                          placeholder="0"
                          className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                          value={getEditableValue(`ORS-consumption-${periodIndex}`, 0)}
                          onChange={(e) => onValueChange(`ORS-consumption-${periodIndex}`, 0, e.target.value)}
                        />
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="text-right text-xs border-r p-1">
                      <Input 
                        type="number" 
                        placeholder="0"
                        className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium text-primary"
                        value={getEditableValue(`ORS-consumption-${periodIndex}`, 0)}
                        onChange={(e) => onValueChange(`ORS-consumption-${periodIndex}`, 0, e.target.value)}
                      />
                    </TableCell>
                  )}
                </React.Fragment>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};