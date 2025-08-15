import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Calendar, 
  Building2, 
  BarChart3, 
  Target,
  Users,
  Activity,
  AlertTriangle
} from "lucide-react";

interface Forecast {
  id: string;
  name: string;
  healthProgram: string;
  commodityTypes: string[];
  method: string;
  forecastPeriod: string;
  status: "completed" | "in-progress" | "draft";
  createdDate: string;
  lastModified: string;
  accuracy?: number;
}

interface ForecastSummaryModalProps {
  forecast: Forecast | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForecastSummaryModal: React.FC<ForecastSummaryModalProps> = ({
  forecast,
  open,
  onOpenChange
}) => {
  if (!forecast) return null;

  // Mock detailed data based on forecast method
  const getAssumptions = (method: string) => {
    switch (method) {
      case "Consumption Method":
        return [
          { key: "Historical Consumption", value: "24 months of consumption data", icon: BarChart3 },
          { key: "Adjustment Factor", value: "1.15 for seasonal variation", icon: TrendingUp },
          { key: "Stock Buffer", value: "10% safety stock", icon: Target },
          { key: "Lead Time", value: "3 months average", icon: Calendar }
        ];
      case "Service Statistics Method":
        return [
          { key: "Service Delivery Data", value: "Monthly service statistics", icon: Activity },
          { key: "Coverage Target", value: "85% population coverage", icon: Users },
          { key: "Protocol Standards", value: "WHO treatment guidelines", icon: Building2 },
          { key: "Wastage Rate", value: "5% assumed wastage", icon: AlertTriangle }
        ];
      case "Demographic Morbidity Method":
        return [
          { key: "Population Size", value: "125,000 catchment population", icon: Users },
          { key: "Disease Incidence", value: "12.3 per 1000 population", icon: Activity },
          { key: "Treatment Success", value: "92% completion rate", icon: Target },
          { key: "Case Finding", value: "75% detection rate", icon: BarChart3 }
        ];
      default:
        return [
          { key: "Multi-method approach", value: "Combined analysis", icon: TrendingUp },
          { key: "Data Quality", value: "High confidence level", icon: Target },
          { key: "Validation", value: "Cross-method verification", icon: BarChart3 },
          { key: "Uncertainty", value: "±15% confidence interval", icon: AlertTriangle }
        ];
    }
  };

  const getOutputSummary = (healthProgram: string, method: string) => {
    // Mock output data based on health program
    const baseForecast = {
      "Malaria": {
        totalQuantity: "2,450,000 units",
        totalValue: "$1,250,000",
        keyProducts: ["ACT tablets", "RDT kits", "Severe malaria vials"],
        peakDemand: "Q4 2024 (rainy season)"
      },
      "HIV": {
        totalQuantity: "875,000 units", 
        totalValue: "$890,000",
        keyProducts: ["Test kits", "Prevention supplies", "Treatment kits"],
        peakDemand: "Consistent throughout year"
      },
      "Tuberculosis (TB)": {
        totalQuantity: "1,200,000 units",
        totalValue: "$680,000", 
        keyProducts: ["First-line drugs", "Diagnostic kits", "Second-line drugs"],
        peakDemand: "Q1-Q2 2024"
      },
      "RMNCH": {
        totalQuantity: "3,100,000 units",
        totalValue: "$1,450,000",
        keyProducts: ["Essential medicines", "Medical devices", "Nutrition supplies"],
        peakDemand: "Q3 2024"
      }
    };

    return baseForecast[healthProgram as keyof typeof baseForecast] || {
      totalQuantity: "1,500,000 units",
      totalValue: "$800,000", 
      keyProducts: ["Essential medicines", "Medical supplies"],
      peakDemand: "Q2-Q3 2024"
    };
  };

  const assumptions = getAssumptions(forecast.method);
  const output = getOutputSummary(forecast.healthProgram, forecast.method);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {forecast.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forecast Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Health Program</p>
                  <p className="font-medium">{forecast.healthProgram}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forecast Period</p>
                  <p className="font-medium">{forecast.forecastPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-medium">{forecast.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(forecast.status)}>
                    {forecast.status}
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Commodity Types</p>
                <div className="flex flex-wrap gap-2">
                  {forecast.commodityTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assumptions Used */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Assumptions & Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assumptions.map((assumption, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <assumption.icon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{assumption.key}</p>
                      <p className="text-sm text-muted-foreground">{assumption.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Forecast Output */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Forecast Output Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Quantity Forecasted</p>
                    <p className="text-2xl font-bold text-primary">{output.totalQuantity}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated Value</p>
                    <p className="text-2xl font-bold text-green-600">{output.totalValue}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key Products</p>
                    <div className="space-y-1">
                      {output.keyProducts.map((product, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm">{product}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Peak Demand Period</p>
                    <p className="font-medium">{output.peakDemand}</p>
                  </div>
                </div>
              </div>
              
              {forecast.accuracy && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Forecast Accuracy</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{forecast.accuracy}%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline & History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="font-medium">{new Date(forecast.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Modified</p>
                  <p className="font-medium">{new Date(forecast.lastModified).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};