import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { PermissionGate } from '@/components/ui/permission-gate';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Globe, Map, MapPin, Building2, AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const NationalDashboard: React.FC = () => {
  const { userRole } = useCurrentUser();

  // Mock data for national-level dashboard
  const regionsData = [
    { name: 'Addis Ababa', zones: 3, woredas: 45, facilities: 285, stockouts: 125, budget: 2500000, performance: 92 },
    { name: 'Oromia', zones: 8, woredas: 156, facilities: 1250, stockouts: 456, budget: 8500000, performance: 78 },
    { name: 'Amhara', zones: 6, woredas: 128, facilities: 945, stockouts: 342, budget: 6200000, performance: 85 },
    { name: 'SNNP', zones: 5, woredas: 89, facilities: 678, stockouts: 298, budget: 4800000, performance: 81 },
    { name: 'Tigray', zones: 4, woredas: 67, facilities: 456, stockouts: 189, budget: 3200000, performance: 88 },
    { name: 'Somali', zones: 3, woredas: 45, facilities: 234, stockouts: 134, budget: 2100000, performance: 76 },
  ];

  // Mock national trends
  const nationalTrends = [
    { month: 'Jan', stockouts: 1245, budget: 25000000, performance: 82, facilities: 3848 },
    { month: 'Feb', stockouts: 1156, budget: 26500000, performance: 85, facilities: 3848 },
    { month: 'Mar', stockouts: 1089, budget: 24800000, performance: 88, facilities: 3848 },
    { month: 'Apr', stockouts: 1234, budget: 27200000, performance: 84, facilities: 3848 },
    { month: 'May', stockouts: 998, budget: 28000000, performance: 90, facilities: 3848 },
    { month: 'Jun', stockouts: 1544, budget: 27300000, performance: 78, facilities: 3848 },
  ];

  // Program distribution
  const programData = [
    { program: 'Essential Medicines', value: 45, color: 'hsl(var(--brand))' },
    { program: 'RMNCH', value: 25, color: 'hsl(var(--moh-secondary))' },
    { program: 'HIV/AIDS', value: 15, color: 'hsl(var(--status-warning))' },
    { program: 'TB/Malaria', value: 10, color: 'hsl(var(--status-ok))' },
    { program: 'Other', value: 5, color: 'hsl(var(--muted))' },
  ];

  const chartConfig: ChartConfig = {
    stockouts: {
      label: "Stockouts",
      color: "hsl(var(--status-critical))"
    },
    performance: {
      label: "Performance %",
      color: "hsl(var(--status-ok))"
    },
    budget: {
      label: "Budget (ETB)",
      color: "hsl(var(--brand))"
    }
  };

  const metrics = {
    totalRegions: regionsData.length,
    totalZones: regionsData.reduce((sum, r) => sum + r.zones, 0),
    totalWoredas: regionsData.reduce((sum, r) => sum + r.woredas, 0),
    totalFacilities: regionsData.reduce((sum, r) => sum + r.facilities, 0),
    totalStockouts: regionsData.reduce((sum, r) => sum + r.stockouts, 0),
    totalBudget: regionsData.reduce((sum, r) => sum + r.budget, 0),
    avgPerformance: Math.round(regionsData.reduce((sum, r) => sum + r.performance, 0) / regionsData.length),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(amount);
  };

  return (
    <PermissionGate customCheck={(p) => p.canViewNationalData} showAlert alertMessage="You need national-level access to view this dashboard.">
      <div className="container py-6 space-y-6">
        <Helmet>
          <title>National Dashboard | Forlab+ Platform</title>
          <meta name="description" content="National health supply system overview with country-wide analytics and strategic insights." />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">National Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Ethiopia health supply system strategic overview and national coordination
            </p>
          </div>
          <DataScopeIndicator showDetails />
        </div>

        {/* Key National Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRegions}</div>
              <p className="text-xs text-muted-foreground mt-1">Coverage</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zones</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalZones}</div>
              <p className="text-xs text-muted-foreground mt-1">Administrative</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Woredas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWoredas}</div>
              <p className="text-xs text-muted-foreground mt-1">Districts</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Health facilities</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stockouts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-critical">{metrics.totalStockouts}</div>
              <p className="text-xs text-muted-foreground mt-1">National total</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</div>
              <p className="text-xs text-muted-foreground mt-1">Annual allocation</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-status-ok" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-ok">{metrics.avgPerformance}%</div>
              <p className="text-xs text-muted-foreground mt-1">National average</p>
            </CardContent>
          </Card>
        </div>

        {/* National Trends and Program Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="surface">
            <CardHeader>
              <CardTitle>National Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={nationalTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value, name) => {
                          if (name === 'budget') return [formatCurrency(value as number), "Budget"];
                          return [value, name];
                        }}
                      />} 
                    />
                    <Bar yAxisId="left" dataKey="stockouts" fill="var(--color-stockouts)" />
                    <Line yAxisId="right" type="monotone" dataKey="performance" stroke="var(--color-performance)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader>
              <CardTitle>Program Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={programData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ program, value }) => `${program}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {programData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Regional Overview */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Regional Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionsData.map((region) => (
                <div key={region.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{region.name} Region</div>
                      <div className="text-sm text-muted-foreground">
                        {region.zones} zones • {region.woredas} woredas • {region.facilities} facilities
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-status-critical font-medium">{region.stockouts} stockouts</div>
                      <div className="text-muted-foreground">{formatCurrency(region.budget)}</div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={region.performance >= 90 ? 'default' : region.performance >= 80 ? 'secondary' : 'destructive'}
                      >
                        {region.performance}% performance
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strategic Insights */}
        {(userRole === 'program_officer' || userRole === 'national_user') && (
          <div className="bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Strategic Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Priority Actions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Focus on Somali region (76% performance)</li>
                  <li>• Address Oromia stockouts (456 total)</li>
                  <li>• Optimize budget allocation efficiency</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Forecast Generation Access</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Generate national-level forecasts</li>
                  <li>• Use aggregated regional data</li>
                  <li>• Access program-specific templates</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Read-only Notice */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>
              You have read-only access to all lower-level data. Use this dashboard for national planning, policy coordination, and strategic decision-making.
            </span>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default NationalDashboard;