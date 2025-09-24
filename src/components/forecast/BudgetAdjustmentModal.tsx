import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Package, AlertTriangle, History } from 'lucide-react';
import { ForecastSummary, useForecastSummary } from '@/hooks/useForecastSummary';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface BudgetAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ForecastSummary | null;
  onSaved?: () => void;
}

interface ForecastItem {
  id: string;
  forecast_row_id: string;
  current_quantity: number;
  current_price: number;
  current_total: number;
  forecast_rows: {
    product_list: string;
  } | null;
}

export const BudgetAdjustmentModal: React.FC<BudgetAdjustmentModalProps> = ({
  open,
  onOpenChange,
  summary,
  onSaved,
}) => {
  const [items, setItems] = useState<ForecastItem[]>([]);
  const [availableBudget, setAvailableBudget] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentHistory, setAdjustmentHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { 
    loading, 
    getForecastSummaryDetails, 
    updateForecastItem, 
    getAdjustmentHistory 
  } = useForecastSummary();
  const { toast } = useToast();

  useEffect(() => {
    if (open && summary) {
      loadForecastDetails();
      loadAdjustmentHistory();
      setAvailableBudget(summary.available_budget || summary.current_total_value);
    }
  }, [open, summary]);

  const loadForecastDetails = async () => {
    if (!summary) return;
    
    const details = await getForecastSummaryDetails(summary.id);
    if (details) {
      // Get forecast row details separately
      const itemsWithProducts = await Promise.all(
        details.items.map(async (item) => {
          const { data: forecastRow } = await supabase
            .from('forecast_rows')
            .select('product_list')
            .eq('id', item.forecast_row_id)
            .single();
          
          return {
            ...item,
            forecast_rows: forecastRow || { product_list: 'Unknown Product' }
          };
        })
      );
      setItems(itemsWithProducts as ForecastItem[]);
    }
  };

  const loadAdjustmentHistory = async () => {
    if (!summary) return;
    
    const history = await getAdjustmentHistory(summary.id);
    setAdjustmentHistory(history);
  };

  const currentTotal = items.reduce((sum, item) => sum + item.current_total, 0);
  const budgetDifference = availableBudget - currentTotal;
  const isOverBudget = budgetDifference < 0;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              current_quantity: newQuantity,
              current_total: newQuantity * item.current_price,
            }
          : item
      )
    );
  };

  const handlePriceChange = (itemId: string, newPrice: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? {
              ...item,
              current_price: newPrice,
              current_total: item.current_quantity * newPrice,
            }
          : item
      )
    );
  };

  const handleAutoAdjust = () => {
    if (availableBudget <= 0 || items.length === 0) return;

    const totalCost = items.reduce((sum, item) => sum + item.current_total, 0);
    const adjustmentRatio = availableBudget / totalCost;

    setItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        current_quantity: Math.max(1, Math.floor(item.current_quantity * adjustmentRatio)),
        current_total: Math.max(1, Math.floor(item.current_quantity * adjustmentRatio)) * item.current_price,
      }))
    );
  };

  const handleSaveAdjustments = async () => {
    if (!summary) return;

    try {
      for (const item of items) {
        await updateForecastItem(
          summary.id,
          item.id,
          {
            current_quantity: item.current_quantity,
            current_price: item.current_price,
          },
          adjustmentReason
        );
      }

      toast({
        title: "Success",
        description: "Budget adjustments saved successfully",
      });

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget Adjustment - {summary?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Budget Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Available Budget</Label>
                  <Input
                    type="number"
                    value={availableBudget}
                    onChange={(e) => setAvailableBudget(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Current Total</Label>
                  <div className="text-lg font-semibold mt-1">
                    {currentTotal.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Difference</Label>
                  <div className={`text-lg font-semibold mt-1 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {budgetDifference.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAutoAdjust} variant="outline" size="sm">
                    Auto Adjust
                  </Button>
                </div>
              </div>
              
              {isOverBudget && (
                <div className="flex items-center mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800">
                    Current forecast exceeds available budget by {Math.abs(budgetDifference).toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forecast Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Forecast Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">
                          {item.forecast_rows?.product_list || 'Unknown Product'}
                        </Label>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Quantity</Label>
                        <Input
                          type="number"
                          value={item.current_quantity}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          min="0"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.current_price}
                          onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Total</Label>
                        <div className="text-lg font-semibold mt-1">
                          {item.current_total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Adjustment Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Adjustment Reason</Label>
            <Textarea
              id="reason"
              placeholder="Describe the reason for this budget adjustment..."
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Adjustment History */}
          {adjustmentHistory.length > 0 && (
            <Collapsible open={showHistory} onOpenChange={setShowHistory}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <History className="w-4 h-4 mr-2" />
                  View Adjustment History ({adjustmentHistory.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {adjustmentHistory.map((adjustment) => (
                  <div key={adjustment.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {adjustment.adjustment_type}
                        </Badge>
                        <div>
                          Changed from {adjustment.old_value} to {adjustment.new_value}
                        </div>
                        {adjustment.reason && (
                          <div className="text-muted-foreground mt-1">
                            Reason: {adjustment.reason}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(adjustment.adjusted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAdjustments} 
              disabled={loading}
            >
              Save Adjustments
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};