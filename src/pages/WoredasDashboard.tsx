import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataScopeIndicator } from '@/components/ui/data-scope-indicator';
import { PermissionGate } from '@/components/ui/permission-gate';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Building2, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const WoredasDashboard: React.FC = () => {
  const { locationDisplay } = useCurrentUser();

  // Mock data for woreda-level dashboard
  const facilitiesData = [
    { id: 1, name: 'Addis Ketema Health Center', status: 'active', stockouts: 2, lowStock: 5 },
    { id: 2, name: 'Gulele Health Center', status: 'active', stockouts: 0, lowStock: 3 },
    { id: 3, name: 'Kirkos Health Center', status: 'active', stockouts: 1, lowStock: 7 },
    { id: 4, name: 'Lideta Health Center', status: 'maintenance', stockouts: 3, lowStock: 8 },
  ];

  const metrics = {
    totalFacilities: facilitiesData.length,
    activeFacilities: facilitiesData.filter(f => f.status === 'active').length,
    totalStockouts: facilitiesData.reduce((sum, f) => sum + f.stockouts, 0),
    totalLowStock: facilitiesData.reduce((sum, f) => sum + f.lowStock, 0),
  };

  return (
    <PermissionGate customCheck={(p) => p.canViewWoredasFacilities} showAlert alertMessage="You need woreda-level access to view this dashboard.">
      <div className="container py-6 space-y-6">
        <Helmet>
          <title>Woreda Dashboard | Forlab+ Platform</title>
          <meta name="description" content="Woreda-level health facility oversight and supply chain management dashboard." />
        </Helmet>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Woreda Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {locationDisplay || 'Woreda-level'} health facility oversight and management
            </p>
          </div>
          <DataScopeIndicator showDetails />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFacilities}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.activeFacilities} active, {metrics.totalFacilities - metrics.activeFacilities} under maintenance
              </p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stockouts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-status-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-critical">{metrics.totalStockouts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all facilities
              </p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-status-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-status-warning">{metrics.totalLowStock}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card className="surface">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all facilities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Facilities Overview */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Facilities Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {facilitiesData.map((facility) => (
                <div key={facility.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={facility.status === 'active' ? 'default' : 'secondary'}>
                          {facility.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="text-status-critical font-medium">{facility.stockouts} stockouts</div>
                      <div className="text-status-warning">{facility.lowStock} low stock</div>
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
              You have read-only access to facility data. Contact facility administrators to make changes to facility-level data.
            </span>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};

export default WoredasDashboard;