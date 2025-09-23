import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, Database, CheckCircle, AlertTriangle } from "lucide-react";
import { useForecastIntegration, ForecastFromInventory } from "@/hooks/useForecastIntegration";
import { useToast } from "@/hooks/use-toast";

interface InventoryForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: number;
  facilityName?: string;
}

export const InventoryForecastModal: React.FC<InventoryForecastModalProps> = ({
  open,
  onOpenChange,
  facilityId,
  facilityName = "Current Facility"
}) => {
  const [forecasts, setForecasts] = useState<ForecastFromInventory[]>([]);
  const [step, setStep] = useState<'generate' | 'review' | 'save'>('generate');
  const { generateForecastFromInventory, saveForecastWithSource, loading } = useForecastIntegration();
  const { toast } = useToast();

  const handleGenerateForecast = async () => {
    try {
      const results = await generateForecastFromInventory(facilityId, 6, 12);
      setForecasts(results);
      setStep('review');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate forecast",
        variant: "destructive"
      });
    }
  };

  const handleSaveForecast = async () => {
    try {
      // TODO: Get actual user ID and program from context
      const userId = "user-id"; // Replace with actual user ID
      const program = "HIV"; // Replace with selected program
      const year = new Date().getFullYear().toString();
      
      await saveForecastWithSource(forecasts, userId, program, year);
      
      toast({
        title: "Success",
        description: "Forecast saved successfully with inventory data sources",
      });
      
      setStep('save');
      setTimeout(() => {
        onOpenChange(false);
        setStep('generate');
        setForecasts([]);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save forecast",
        variant: "destructive"
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 0.6) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const totalForecastValue = forecasts.reduce((sum, item) => sum + item.forecasted_total, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Generate Forecast from Inventory Data
          </DialogTitle>
          <DialogDescription>
            Create forecasts based on consumption patterns from {facilityName}
          </DialogDescription>
        </DialogHeader>

        {step === 'generate' && (
          <div className="space-y-6">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                This will analyze the last 6 months of inventory consumption data to forecast needs for the next 12 months.
                Forecasts will include trend analysis and confidence scores based on data consistency.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Analysis Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">6 Months</p>
                  <p className="text-sm text-muted-foreground">Historical consumption data</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Forecast Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">12 Months</p>
                  <p className="text-sm text-muted-foreground">Future needs prediction</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Data Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Inventory</p>
                  <p className="text-sm text-muted-foreground">Consumption analytics</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleGenerateForecast} 
                disabled={loading}
                size="lg"
                className="w-full max-w-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Consumption Data...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Forecast Results</h3>
                <p className="text-sm text-muted-foreground">
                  {forecasts.length} products analyzed • Total value: ${totalForecastValue.toLocaleString()}
                </p>
              </div>
              <Badge variant="secondary">
                Based on inventory data
              </Badge>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Forecasted Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((forecast, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{forecast.product_name}</TableCell>
                    <TableCell>{forecast.unit}</TableCell>
                    <TableCell>{forecast.forecasted_quantity.toLocaleString()}</TableCell>
                    <TableCell>${forecast.unit_price.toFixed(2)}</TableCell>
                    <TableCell>${forecast.forecasted_total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getConfidenceColor(forecast.confidence_score)}>
                        {Math.round(forecast.confidence_score * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {forecast.consumption_trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                        )}
                        <span className={forecast.consumption_trend > 0 ? "text-green-600" : "text-red-600"}>
                          {Math.abs(forecast.consumption_trend).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('generate')}>
                Back
              </Button>
              <Button onClick={handleSaveForecast} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Forecast"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'save' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Forecast Saved Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your inventory-based forecast has been saved with full traceability to source data.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};