import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { DollarSign, Building2, Calculator, TrendingUp, AlertTriangle, CheckCircle2, TrendingDown, Target, Zap } from "lucide-react";

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
    { name: "Artemether + Lumefantrine", lineItems: 156, procurementValue: 285000, sharePercentage: 10.0, category: "Essential Medicines" },
    { name: "Rapid Diagnostic Test (RDT)", lineItems: 134, procurementValue: 245000, sharePercentage: 8.6, category: "Diagnostics" },
    { name: "Oral Rehydration Salt", lineItems: 128, procurementValue: 195000, sharePercentage: 6.9, category: "Essential Medicines" },
    { name: "Amoxicillin", lineItems: 98, procurementValue: 165000, sharePercentage: 5.8, category: "Essential Medicines" },
    { name: "Disposable Syringes", lineItems: 87, procurementValue: 145000, sharePercentage: 5.1, category: "Medical Supplies" },
    { name: "Blood Pressure Monitor", lineItems: 76, procurementValue: 125000, sharePercentage: 4.4, category: "Equipment" },
    { name: "Paracetamol", lineItems: 65, procurementValue: 115000, sharePercentage: 4.0, category: "Essential Medicines" },
    { name: "Examination Gloves", lineItems: 58, procurementValue: 98000, sharePercentage: 3.4, category: "Medical Supplies" },
    { name: "Iron Folate Tablets", lineItems: 52, procurementValue: 87000, sharePercentage: 3.1, category: "Essential Medicines" },
    { name: "Zinc Sulfate", lineItems: 45, procurementValue: 76000, sharePercentage: 2.7, category: "Essential Medicines" }
  ];

  // Mock data for regional costs (enhanced)
  const regionalData = [
    { region: "Addis Ababa", cost: 485000, facilities: 25, trend: 8.5, efficiency: 92 },
    { region: "Oromia", cost: 425000, facilities: 45, trend: 5.2, efficiency: 87 },
    { region: "Amhara", cost: 398000, facilities: 38, trend: -2.1, efficiency: 85 },
    { region: "SNNP", cost: 356000, facilities: 32, trend: 3.8, efficiency: 89 },
    { region: "Tigray", cost: 298000, facilities: 18, trend: 12.5, efficiency: 91 },
    { region: "Somali", cost: 245000, facilities: 15, trend: 7.2, efficiency: 83 },
    { region: "Afar", cost: 198000, facilities: 12, trend: 4.6, efficiency: 88 }
  ];

  // Mock data for quarterly trends
  const quarterlyTrends = [
    { quarter: "Q1 2024", forecast: 2200000, actual: 2150000, variance: -2.3 },
    { quarter: "Q2 2024", forecast: 2400000, actual: 2380000, variance: -0.8 },
    { quarter: "Q3 2024", forecast: 2600000, actual: 2650000, variance: 1.9 },
    { quarter: "Q4 2024", forecast: 2845000, actual: 2845000, variance: 0 }
  ];

  // Mock data for cost efficiency metrics
  const efficiencyMetrics = [
    { metric: "Cost per Patient", value: 145, target: 150, status: "good" },
    { metric: "Admin Cost %", value: 8.5, target: 10, status: "good" },
    { metric: "Procurement Efficiency", value: 94, target: 90, status: "excellent" },
    { metric: "Delivery Timeline", value: 87, target: 85, status: "good" }
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
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center"># Line Items</div>
                <div className="col-span-3 text-right">Procurement Value</div>
                <div className="col-span-2 text-right">% Share</div>
              </div>
              
              {/* Table Rows */}
              {topProducts.map((product, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="col-span-5">
                    <div className="font-medium text-sm">{product.name}</div>
                    <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                  </div>
                  <div className="col-span-2 text-center font-semibold text-sm">
                    {product.lineItems}
                  </div>
                  <div className="col-span-3 text-right font-semibold text-sm">
                    {formatCurrency(product.procurementValue)}
                  </div>
                  <div className="col-span-2 text-right">
                    <Badge variant="outline" className="font-medium">
                      {product.sharePercentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Trends and Performance Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Forecast vs Actual Trends */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Quarterly Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quarterlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="quarter" className="text-xs" />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value, name) => {
                        if (name === 'forecast' || name === 'actual') return [formatCurrency(value as number), name === 'forecast' ? "Forecast" : "Actual"];
                        if (name === 'variance') return [`${value}%`, "Variance"];
                        return [value, name];
                      }}
                    />} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="hsl(var(--moh-secondary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--moh-secondary))", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--brand))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--brand))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Cost Efficiency Metrics */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Cost Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {efficiencyMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {metric.status === "excellent" ? (
                      <Zap className="h-4 w-4 text-status-ok" />
                    ) : metric.status === "good" ? (
                      <Target className="h-4 w-4 text-status-ok" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-status-warning" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{metric.metric}</div>
                      <div className="text-xs text-muted-foreground">Target: {metric.target}{metric.metric.includes('%') ? '%' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{metric.value}{metric.metric.includes('%') ? '%' : ''}</div>
                    <Badge 
                      variant={metric.status === "excellent" ? "default" : metric.status === "good" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {metric.status === "excellent" ? "Excellent" : metric.status === "good" ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Analysis - Full Width */}
      <Card className="surface">
        <CardHeader>
          <CardTitle>Regional Cost and Efficiency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Regional Cost Chart */}
            <div>
              <h4 className="font-medium mb-4">Cost Distribution by Region</h4>
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
                          return [value, name];
                        }}
                      />} 
                    />
                    <Bar dataKey="cost" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Regional Efficiency Table */}
            <div>
              <h4 className="font-medium mb-4">Regional Performance Metrics</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                  <div>Region</div>
                  <div className="text-center">Facilities</div>
                  <div className="text-center">Trend %</div>
                  <div className="text-center">Efficiency</div>
                  <div className="text-center">Status</div>
                </div>
                
                {regionalData.map((region, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-sm">{region.region}</div>
                    <div className="text-center text-sm">{region.facilities}</div>
                    <div className="text-center">
                      <span className={`text-sm flex items-center justify-center gap-1 ${
                        region.trend > 0 ? 'text-status-ok' : 'text-status-error'
                      }`}>
                        {region.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {region.trend}%
                      </span>
                    </div>
                    <div className="text-center text-sm font-semibold">{region.efficiency}%</div>
                    <div className="text-center">
                      <Badge 
                        variant={region.efficiency >= 90 ? "default" : region.efficiency >= 85 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {region.efficiency >= 90 ? "Excellent" : region.efficiency >= 85 ? "Good" : "Poor"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default CDSSDashboard;