import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import OSMFacilitiesMap from "@/components/map/OSMFacilitiesMap";
import { DollarSign, Building2, Calculator, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const CDSSDashboard: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  // Mock data for CDSS metrics
  const metrics = {
    totalForecastCost: 2845000,
    allocatedBudget: 2500000,
    fundingGap: 345000,
    facilitiesGenerated: 156,
    facilitiesAdjusted: 134,
    facilitiesSubmitted: 98
  };

  // Mock data for product cost by category
  const categoryData = [
    { category: "Essential Medicines", cost: 1200000, percentage: 42 },
    { category: "Medical Supplies", cost: 850000, percentage: 30 },
    { category: "Diagnostics", cost: 450000, percentage: 16 },
    { category: "Equipment", cost: 345000, percentage: 12 }
  ];

  // Mock data for top 10 products by cost
  const topProducts = [
    { name: "Artemether + Lumefantrine", cost: 285000, category: "Essential Medicines" },
    { name: "Rapid Diagnostic Test (RDT)", cost: 245000, category: "Diagnostics" },
    { name: "Oral Rehydration Salt", cost: 195000, category: "Essential Medicines" },
    { name: "Amoxicillin", cost: 165000, category: "Essential Medicines" },
    { name: "Disposable Syringes", cost: 145000, category: "Medical Supplies" },
    { name: "Blood Pressure Monitor", cost: 125000, category: "Equipment" },
    { name: "Paracetamol", cost: 115000, category: "Essential Medicines" },
    { name: "Examination Gloves", cost: 98000, category: "Medical Supplies" },
    { name: "Iron Folate Tablets", cost: 87000, category: "Essential Medicines" },
    { name: "Zinc Sulfate", cost: 76000, category: "Essential Medicines" }
  ];

  // Mock data for regional costs
  const regionalData = [
    { region: "Addis Ababa", cost: 485000 },
    { region: "Oromia", cost: 425000 },
    { region: "Amhara", cost: 398000 },
    { region: "SNNP", cost: 356000 },
    { region: "Tigray", cost: 298000 },
    { region: "Somali", cost: 245000 },
    { region: "Afar", cost: 198000 }
  ];

  const chartConfig: ChartConfig = {
    cost: {
      label: "Cost (ETB)",
      color: "hsl(var(--brand))"
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>CDSS Dashboard | Forlab+ Platform</title>
        <meta name="description" content="CDSS budget alignment dashboard showing forecast costs, budget allocation, funding gaps, and facility performance metrics." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <PageHeader 
        title="CDSS Dashboard" 
        description="Monitor CDSS budget alignment, forecast performance, and facility participation across the health system."
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecast Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalForecastCost)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from previous period
            </p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated Budget</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.allocatedBudget)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.allocatedBudget / metrics.totalForecastCost) * 100).toFixed(1)}% of forecast
            </p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Gap</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{formatCurrency(metrics.fundingGap)}</div>
            <p className="text-xs text-muted-foreground">
              Requires additional funding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facility Participation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Forecast</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.facilitiesGenerated}</div>
            <p className="text-xs text-muted-foreground">Health facilities</p>
            <Progress value={100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjusted Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.facilitiesAdjusted}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.facilitiesAdjusted / metrics.facilitiesGenerated) * 100).toFixed(1)}% completion
            </p>
            <Progress value={(metrics.facilitiesAdjusted / metrics.facilitiesGenerated) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Forecast</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-ok" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-ok">{metrics.facilitiesSubmitted}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.facilitiesSubmitted / metrics.facilitiesGenerated) * 100).toFixed(1)}% submitted
            </p>
            <Progress value={(metrics.facilitiesSubmitted / metrics.facilitiesGenerated) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Cost by Category */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Product Cost by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(category.cost)}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Products by Cost */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Top 10 Products by Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{product.name}</div>
                    <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                  </div>
                  <div className="text-sm font-semibold">{formatCurrency(product.cost)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facilities Heat Map */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Health Facilities Heat Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <OSMFacilitiesMap />
            </div>
          </CardContent>
        </Card>

        {/* Regional Cost Distribution */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Total Cost by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="region" 
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [formatCurrency(value as number), "Cost"]}
                    />} 
                  />
                  <Bar dataKey="cost" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CDSSDashboard;