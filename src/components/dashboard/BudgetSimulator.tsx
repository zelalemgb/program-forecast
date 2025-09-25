import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Package2,
  AlertTriangle
} from "lucide-react";

interface BudgetItem {
  id: string;
  productName: string;
  originalQty: number;
  originalCost: number;
  priority: 'A' | 'B' | 'C';
  adjustedQty?: number;
  adjustedCost?: number;
  status: 'included' | 'reduced' | 'excluded';
}

const mockBudgetItems: BudgetItem[] = [
  { id: '1', productName: 'RDT Malaria', originalQty: 500, originalCost: 25000, priority: 'A', status: 'included' },
  { id: '2', productName: 'ACT (AL)', originalQty: 200, originalCost: 18000, priority: 'A', status: 'included' },
  { id: '3', productName: 'Paracetamol 500mg', originalQty: 1000, originalCost: 8000, priority: 'B', status: 'included' },
  { id: '4', productName: 'Oxytocin inj', originalQty: 100, originalCost: 15000, priority: 'A', status: 'included' },
  { id: '5', productName: 'Vitamin supplements', originalQty: 300, originalCost: 4500, priority: 'C', status: 'included' },
  { id: '6', productName: 'Antiseptic solution', originalQty: 50, originalCost: 2000, priority: 'C', status: 'included' }
];

export default function BudgetSimulator() {
  const [budgetAdjustment, setBudgetAdjustment] = useState([0]);
  const [simulatedItems, setSimulatedItems] = useState<BudgetItem[]>(mockBudgetItems);
  const [isSimulating, setIsSimulating] = useState(false);

  const originalTotal = mockBudgetItems.reduce((sum, item) => sum + item.originalCost, 0);
  const adjustmentPercent = budgetAdjustment[0];
  const targetBudget = originalTotal * (1 + adjustmentPercent / 100);

  const runSimulation = () => {
    setIsSimulating(true);
    
    // Simulate budget constraint logic
    setTimeout(() => {
      const adjustedItems = [...mockBudgetItems];
      let currentTotal = originalTotal;
      
      if (adjustmentPercent < 0) {
        // Budget cut - reduce C items first, then B items
        const cutAmount = Math.abs(targetBudget - originalTotal);
        let remainingCut = cutAmount;
        
        // First, exclude C priority items
        adjustedItems.forEach(item => {
          if (item.priority === 'C' && remainingCut > 0) {
            if (remainingCut >= item.originalCost) {
              item.status = 'excluded';
              item.adjustedQty = 0;
              item.adjustedCost = 0;
              remainingCut -= item.originalCost;
            } else {
              item.status = 'reduced';
              const reductionRatio = remainingCut / item.originalCost;
              item.adjustedQty = Math.floor(item.originalQty * (1 - reductionRatio));
              item.adjustedCost = item.originalCost - remainingCut;
              remainingCut = 0;
            }
          }
        });
        
        // Then reduce B priority items if needed
        adjustedItems.forEach(item => {
          if (item.priority === 'B' && remainingCut > 0 && item.status === 'included') {
            const maxReduction = item.originalCost * 0.5; // Max 50% reduction for B items
            if (remainingCut >= maxReduction) {
              item.status = 'reduced';
              item.adjustedQty = Math.floor(item.originalQty * 0.5);
              item.adjustedCost = item.originalCost * 0.5;
              remainingCut -= maxReduction;
            }
          }
        });
      } else if (adjustmentPercent > 0) {
        // Budget increase - proportionally increase quantities
        adjustedItems.forEach(item => {
          item.adjustedQty = Math.floor(item.originalQty * (1 + adjustmentPercent / 100));
          item.adjustedCost = item.originalCost * (1 + adjustmentPercent / 100);
          item.status = 'included';
        });
      } else {
        // No change
        adjustedItems.forEach(item => {
          item.adjustedQty = item.originalQty;
          item.adjustedCost = item.originalCost;
          item.status = 'included';
        });
      }
      
      setSimulatedItems(adjustedItems);
      setIsSimulating(false);
    }, 1000);
  };

  const simulatedTotal = simulatedItems.reduce((sum, item) => sum + (item.adjustedCost || item.originalCost), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'included': return 'bg-green-100 text-green-800';
      case 'reduced': return 'bg-yellow-100 text-yellow-800';
      case 'excluded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'A': return 'bg-red-100 text-red-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="surface border-border/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-foreground">Budget Simulator</h2>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Light Mode
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Budget Adjustment Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Budget Adjustment</Label>
              <span className="text-sm text-muted-foreground">
                {adjustmentPercent > 0 ? '+' : ''}{adjustmentPercent}%
              </span>
            </div>
            
            <Slider
              value={budgetAdjustment}
              onValueChange={setBudgetAdjustment}
              max={20}
              min={-30}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-30% (Cut)</span>
              <span>0% (Baseline)</span>
              <span>+20% (Increase)</span>
            </div>
            
            <Button onClick={runSimulation} disabled={isSimulating} className="w-full">
              {isSimulating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </div>
              ) : (
                'Run Simulation'
              )}
            </Button>
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Original Budget</div>
              <div className="text-lg font-semibold">{originalTotal.toLocaleString()} ETB</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Target Budget</div>
              <div className="text-lg font-semibold flex items-center gap-1">
                {targetBudget.toLocaleString()} ETB
                {adjustmentPercent > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : adjustmentPercent < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Impact Preview</h3>
              <div className="text-xs text-muted-foreground">
                {simulatedItems.filter(i => i.status === 'excluded').length} excluded, 
                {simulatedItems.filter(i => i.status === 'reduced').length} reduced
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {simulatedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{item.productName}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.adjustedQty !== undefined 
                          ? `${item.adjustedQty} (was ${item.originalQty})`
                          : item.originalQty
                        } units
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">
                        {(item.adjustedCost || item.originalCost).toLocaleString()} ETB
                      </div>
                      {item.adjustedCost && item.adjustedCost !== item.originalCost && (
                        <div className="text-xs text-muted-foreground">
                          was {item.originalCost.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {simulatedTotal !== originalTotal && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div className="text-sm text-amber-800">
                <strong>Impact:</strong> Budget adjusted from {originalTotal.toLocaleString()} to {simulatedTotal.toLocaleString()} ETB
                ({((simulatedTotal - originalTotal) / originalTotal * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}