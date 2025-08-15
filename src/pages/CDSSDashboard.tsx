import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import OSMFacilitiesMap from "@/components/map/OSMFacilitiesMap";
import { DollarSign, Building2, Calculator, TrendingUp, AlertTriangle, CheckCircle2, TrendingDown } from "lucide-react";

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

  // Mock data for product cost by category with colors
  const categoryData = [
    { category: "Essential Medicines", cost: 1200000, percentage: 42, color: "hsl(var(--brand))" },
    { category: "Medical Supplies", cost: 850000, percentage: 30, color: "hsl(var(--moh-secondary))" },
    { category: "Diagnostics", cost: 450000, percentage: 16, color: "hsl(var(--status-warning))" },
    { category: "Equipment", cost: 345000, percentage: 12, color: "hsl(var(--status-ok))" }
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

  // Mock data for regional costs (enhanced)
  const regionalData = [
    { region: "Addis Ababa", cost: 485000, facilities: 25, trend: 8.5 },
    { region: "Oromia", cost: 425000, facilities: 45, trend: 5.2 },
    { region: "Amhara", cost: 398000, facilities: 38, trend: -2.1 },
    { region: "SNNP", cost: 356000, facilities: 32, trend: 3.8 },
    { region: "Tigray", cost: 298000, facilities: 18, trend: 12.5 },
    { region: "Somali", cost: 245000, facilities: 15, trend: 7.2 },
    { region: "Afar", cost: 198000, facilities: 12, trend: 4.6 }
  ];

  const pieChartConfig: ChartConfig = {
    cost: {
      label: "Cost (ETB)"
    }
  };

  const chartConfig: ChartConfig = {
    cost: {
      label: "Cost (ETB)",
      color: "hsl(var(--brand))"
    },
    trend: {
      label: "Trend (%)",
      color: "hsl(var(--moh-secondary))"
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
            <p className="text-xs text-muted-foreground mt-1">
              <span className="inline-flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-status-ok" />
                +12% from previous period
              </span>
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
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {((metrics.allocatedBudget / metrics.totalForecastCost) * 100).toFixed(1)}% of forecast
              </p>
              <Badge variant="secondary" className="text-xs">87.9%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Gap</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-warning">{formatCurrency(metrics.fundingGap)}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">Requires additional funding</p>
              <Badge variant="destructive" className="text-xs">12.1%</Badge>
            </div>
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
            <p className="text-xs text-muted-foreground mt-1">
              All health facilities completed
            </p>
            <Badge className="mt-2 bg-status-ok text-white">100% Complete</Badge>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjusted Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.facilitiesAdjusted}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {((metrics.facilitiesAdjusted / metrics.facilitiesGenerated) * 100).toFixed(1)}% completion
              </p>
              <Badge variant="outline">{metrics.facilitiesGenerated - metrics.facilitiesAdjusted} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Forecast</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-status-ok" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-ok">{metrics.facilitiesSubmitted}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {((metrics.facilitiesSubmitted / metrics.facilitiesGenerated) * 100).toFixed(1)}% submitted
              </p>
              <Badge className="bg-status-ok text-white">On Track</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advanced Pie Chart for Product Categories */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Product Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cost"
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent 
                      formatter={(value) => [formatCurrency(value as number), "Cost"]}
                    />}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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

        {/* Enhanced Regional Cost Distribution */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Regional Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                      formatter={(value, name) => {
                        if (name === 'cost') return [formatCurrency(value as number), "Total Cost"];
                        if (name === 'facilities') return [value, "Facilities"];
                        if (name === 'trend') return [`${value}%`, "Growth"];
                        return [value, name];
                      }}
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