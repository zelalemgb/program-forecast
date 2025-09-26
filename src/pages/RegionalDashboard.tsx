import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { PermissionGate } from '@/components/ui/permission-gate';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Map, MapPin, Building2, AlertTriangle, TrendingUp, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const RegionalDashboard: React.FC = () => {
  const { locationDisplay } = useCurrentUser();

  // Mock data for regional-level dashboard
  const zonesData = [
    { name: 'Central Zone', woredas: 15, facilities: 125, stockouts: 45, lowStock: 89, trend: 8.5 },
    { name: 'Northern Zone', woredas: 12, facilities: 98, stockouts: 32, lowStock: 67, trend: -2.1 },
    { name: 'Southern Zone', woredas: 18, facilities: 156, stockouts: 58, lowStock: 112, trend: 5.2 },
    { name: 'Eastern Zone', woredas: 10, facilities: 87, stockouts: 28, lowStock: 54, trend: 12.5 },
    { name: 'Western Zone', woredas: 14, facilities: 134, stockouts: 41, lowStock: 78, trend: 3.8 },
  ];

  // Mock trend data
  const trendData = [
    { month: 'Jan', stockouts: 180, performance: 82 },
    { month: 'Feb', stockouts: 165, performance: 85 },
    { month: 'Mar', stockouts: 142, performance: 88 },
    { month: 'Apr', stockouts: 158, performance: 84 },
    { month: 'May', stockouts: 134, performance: 90 },
    { month: 'Jun', stockouts: 204, performance: 78 },
  ];

  const chartConfig: ChartConfig = {
    stockouts: {
      label: "Stockouts",
      color: "hsl(var(--status-critical))"
    },
    performance: {
      label: "Performance %",
      color: "hsl(var(--status-ok))"
    }
  };

  const metrics = {
    totalZones: zonesData.length,
    totalWoredas: zonesData.reduce((sum, z) => sum + z.woredas, 0),
    totalFacilities: zonesData.reduce((sum, z) => sum + z.facilities, 0),
    totalStockouts: zonesData.reduce((sum, z) => sum + z.stockouts, 0),
    totalLowStock: zonesData.reduce((sum, z) => sum + z.lowStock, 0),
    avgTrend: 5.6,
  };

  return (
    <PermissionGate customCheck={(p) => p.canViewRegionalFacilities} showAlert alertMessage="You need regional-level access to view this dashboard.">
      <div className="container py-6 space-y-6">
        <Helmet>
          <title>Regional Dashboard | Forlab+ Platform</title>
          <meta name="description" content="Regional health supply chain analytics and multi-zone performance overview." />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Regional Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {locationDisplay || 'Regional-level'} health supply chain analytics and coordination
            </p>
          </div>
          <DataScopeIndicator showDetails />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zones</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalZones}</div>
              <p className="text-xs text-muted-foreground mt-1">Under coordination</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Woredas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalWoredas}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all zones</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">Total in region</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regional Stockouts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-critical">{metrics.totalStockouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Immediate intervention</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At Risk Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-status-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-warning">{metrics.totalLowStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Regional monitoring</p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <Globe className="h-4 w-4 text-status-ok" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-ok">+{metrics.avgTrend}%</div>
              <p className="text-xs text-muted-foreground mt-1">Regional improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Regional Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="surface">
            <CardHeader>
              <CardTitle>Regional Stock Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="stockouts" 
                      stroke="var(--color-stockouts)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-stockouts)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="performance" 
                      stroke="var(--color-performance)" 
                      fill="var(--color-performance)"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Zone Performance Details */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Zone Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zonesData.map((zone) => (
                <div key={zone.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Map className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{zone.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {zone.woredas} woredas • {zone.facilities} facilities
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-status-critical font-medium">{zone.stockouts} stockouts</div>
                      <div className="text-status-warning">{zone.lowStock} low stock</div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={zone.trend >= 10 ? 'default' : zone.trend >= 0 ? 'secondary' : 'destructive'}
                      >
                        {zone.trend >= 0 ? '+' : ''}{zone.trend}% trend
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
              You have read-only access to zone, woreda, and facility data. Use this dashboard for strategic planning and coordination with zone administrators.
            </span>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default RegionalDashboard;