import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForecastSummary } from '@/hooks/useForecastSummary';

interface SaveForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forecastData: any[];
  facilityName?: string;
  accountType?: string;
  forecastDuration: number;
  onSaved?: () => void;
}

export const SaveForecastModal: React.FC<SaveForecastModalProps> = ({
  open,
  onOpenChange,
  forecastData,
  facilityName,
  accountType,
  forecastDuration,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableBudget, setAvailableBudget] = useState<number | undefined>();
  const { loading, saveForecastSummary } = useForecastSummary();

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      await saveForecastSummary(forecastData, {
        name: name.trim(),
        description: description.trim() || undefined,
        facility_name: facilityName,
        account_type: accountType,
        forecast_duration: forecastDuration,
        available_budget: availableBudget,
      });

      onSaved?.();
      onOpenChange(false);
      
      // Reset form
      setName('');
      setDescription('');
      setAvailableBudget(undefined);
    } catch (error) {
      // Error handled in hook
    }
  };

  const totalValue = forecastData.reduce((sum, item) => 
    sum + (item.forecastedQuantity || 0) * (item.unitPrice || 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save Forecast Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Forecast Name *</Label>
            <Input
              id="name"
              placeholder="Enter forecast name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Available Budget (Optional)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter available budget..."
              value={availableBudget || ''}
              onChange={(e) => setAvailableBudget(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Forecast Summary</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Facility:</div>
              <div>{facilityName || 'N/A'}</div>
              <div>Account Type:</div>
              <div>{accountType || 'N/A'}</div>
              <div>Duration:</div>
              <div>{forecastDuration} periods</div>
              <div>Line Items:</div>
              <div>{forecastData.length}</div>
              <div>Total Value:</div>
              <div className="font-semibold">{totalValue.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || !name.trim()}
            >
              Save Forecast
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};