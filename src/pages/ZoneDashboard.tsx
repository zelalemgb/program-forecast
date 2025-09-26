import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { PermissionGate } from '@/components/ui/permission-gate';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { MapPin, Building2, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const ZoneDashboard: React.FC = () => {
  const { locationDisplay } = useCurrentUser();

  // Mock data for zone-level dashboard
  const woredasData = [
    { name: 'Addis Ketema', facilities: 8, stockouts: 12, lowStock: 25, performance: 85 },
    { name: 'Gulele', facilities: 6, stockouts: 8, lowStock: 18, performance: 92 },
    { name: 'Kirkos', facilities: 10, stockouts: 15, lowStock: 32, performance: 78 },
    { name: 'Lideta', facilities: 7, stockouts: 5, lowStock: 14, performance: 95 },
    { name: 'Yeka', facilities: 12, stockouts: 20, lowStock: 45, performance: 72 },
  ];

  const chartConfig: ChartConfig = {
    stockouts: {
      label: "Stockouts",
      color: "hsl(var(--status-critical))"
    },
    lowStock: {
      label: "Low Stock",
      color: "hsl(var(--status-warning))"
    }
  };

  const metrics = {
    totalWoredas: woredasData.length,
    totalFacilities: woredasData.reduce((sum, w) => sum + w.facilities, 0),
    totalStockouts: woredasData.reduce((sum, w) => sum + w.stockouts, 0),
    totalLowStock: woredasData.reduce((sum, w) => sum + w.lowStock, 0),
    avgPerformance: Math.round(woredasData.reduce((sum, w) => sum + w.performance, 0) / woredasData.length),
  };

  return (
    <PermissionGate customCheck={(p) => p.canViewZoneFacilities} showAlert alertMessage="You need zone-level access to view this dashboard.">
      <div className="container py-6 space-y-6">
        <Helmet>
          <title>Zone Dashboard | Forlab+ Platform</title>
          <meta name="description" content="Zone-level health supply chain analytics and woreda performance overview." />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Zone Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {locationDisplay || 'Zone-level'} aggregated analytics and woreda performance
            </p>
          </div>
          <DataScopeIndicator showDetails />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Woredas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWoredas}</div>
              <p className="text-xs text-muted-foreground mt-1">Under supervision</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Total across zone</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zone Stockouts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-critical">{metrics.totalStockouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Critical attention needed</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-status-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-warning">{metrics.totalLowStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitoring required</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-status-ok" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-ok">{metrics.avgPerformance}%</div>
              <p className="text-xs text-muted-foreground mt-1">Zone-wide average</p>
            </CardContent>
          </Card>
        </div>

        {/* Woreda Performance Chart */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Woreda Stock Issues Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={woredasData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="stockouts" fill="var(--color-stockouts)" />
                  <Bar dataKey="lowStock" fill="var(--color-lowStock)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Woreda Details */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Woreda Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {woredasData.map((woreda) => (
                <div key={woreda.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{woreda.name} Woreda</div>
                      <div className="text-sm text-muted-foreground">{woreda.facilities} facilities</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-status-critical font-medium">{woreda.stockouts} stockouts</div>
                      <div className="text-status-warning">{woreda.lowStock} low stock</div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={woreda.performance >= 90 ? 'default' : woreda.performance >= 80 ? 'secondary' : 'destructive'}
                      >
                        {woreda.performance}% performance
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Read-only Notice */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>
              You have read-only access to woreda and facility data. Use this dashboard for monitoring and coordination with woreda administrators.
            </span>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default ZoneDashboard;