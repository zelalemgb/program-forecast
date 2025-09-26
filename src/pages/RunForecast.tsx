import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  Plus, 
  Eye, 
  Download, 
  Calendar,
  Building2,
  BarChart3,
  FileText
} from "lucide-react";

import ForecastingWizardModal from "@/components/forecast/ForecastingWizardModal";
import { ForecastSummaryModal } from "@/components/forecast/ForecastSummaryModal";

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

// Mock data for existing forecasts
const mockForecasts: Forecast[] = [
  {
    id: "1",
    name: "Q1 2024 Malaria Commodities",
    healthProgram: "Malaria",
    commodityTypes: ["Medicines", "Test kits"],
    method: "Consumption Method",
    forecastPeriod: "12 months",
    status: "completed",
    createdDate: "2024-01-15",
    lastModified: "2024-01-20",
    accuracy: 87
  },
  {
    id: "2",
    name: "HIV Prevention Supplies",
    healthProgram: "HIV",
    commodityTypes: ["Medical supplies", "Test kits"],
    method: "Service Statistics Method",
    forecastPeriod: "6 months",
    status: "completed",
    createdDate: "2024-02-10",
    lastModified: "2024-02-15",
    accuracy: 92
  },
  {
    id: "3",
    name: "TB Treatment Forecast",
    healthProgram: "Tuberculosis (TB)",
    commodityTypes: ["Medicines"],
    method: "Demographic Morbidity Method",
    forecastPeriod: "24 months",
    status: "in-progress",
    createdDate: "2024-03-01",
    lastModified: "2024-03-05"
  },
  {
    id: "4",
    name: "RMNCH Essential Supplies",
    healthProgram: "RMNCH",
    commodityTypes: ["Medicines", "Medical supplies"],
    method: "Hybrid Method",
    forecastPeriod: "12 months",
    status: "draft",
    createdDate: "2024-03-10",
    lastModified: "2024-03-10"
  }
];

const RunForecast: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [forecasts, setForecasts] = useState<Forecast[]>(mockForecasts);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleForecastComplete = (wizardData: any) => {
    // Close the wizard and show completion message
    setIsWizardOpen(false);
    console.log("Forecast configuration completed:", wizardData);
  };

  const getRecommendedMethod = (wizardData: any): string => {
    const { consumptionData, serviceData, catchmentPopulation, diseaseIncidence } = wizardData;
    
    if (consumptionData === "yes") {
      return "Consumption Method";
    } else if (serviceData === "yes") {
      return "Service Statistics Method";
    } else if (catchmentPopulation !== "no" && diseaseIncidence !== "no") {
      return "Demographic Morbidity Method";
    } else {
      return "Hybrid Method";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "in-progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "draft":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const handleForecastClick = (forecast: Forecast) => {
    setSelectedForecast(forecast);
    setIsSummaryOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Run Forecast</h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">Create and manage health commodity forecasts for your facility</p>
        </div>
        <Button 
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Forecast
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecasts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {forecasts.filter(f => f.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {forecasts.filter(f => f.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                forecasts
                  .filter(f => f.accuracy)
                  .reduce((acc, f) => acc + (f.accuracy || 0), 0) /
                forecasts.filter(f => f.accuracy).length
              ) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Forecast History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Forecast Name</TableHead>
                <TableHead>Health Program</TableHead>
                <TableHead>Commodities</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts.map((forecast) => (
                <TableRow 
                  key={forecast.id} 
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleForecastClick(forecast)}
                >
                  <TableCell className="font-medium">{forecast.name}</TableCell>
                  <TableCell>{forecast.healthProgram}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {forecast.commodityTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{forecast.method}</TableCell>
                  <TableCell>{forecast.forecastPeriod}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(forecast.status)}>
                      {getStatusText(forecast.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {forecast.accuracy ? `${forecast.accuracy}%` : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(forecast.lastModified).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleForecastClick(forecast);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {forecasts.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No forecasts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first forecast to get started with commodity planning.
              </p>
              <Button onClick={() => setIsWizardOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Forecast
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ForecastingWizardModal
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        onComplete={handleForecastComplete}
      />

      <ForecastSummaryModal
        forecast={selectedForecast}
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
      />
    </div>
  );
};

export default RunForecast;