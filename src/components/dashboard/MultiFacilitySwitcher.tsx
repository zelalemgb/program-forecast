import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Users,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FacilityOverview {
  id: string;
  name: string;
  code: string;
  type: string;
  woreda: string;
  zone: string;
  region: string;
  stockoutCount: number;
  lowStockCount: number;
  fillRate: number;
  lastUpdated: string;
  status: 'active' | 'warning' | 'critical';
  staffCount: number;
  distance?: string;
}

const mockFacilities: FacilityOverview[] = [
  {
    id: '1',
    name: 'Debre Berhan Health Center',
    code: 'DBHC001',
    type: 'Health Center',
    woreda: 'Debre Berhan',
    zone: 'North Shewa',
    region: 'Amhara',
    stockoutCount: 3,
    lowStockCount: 6,
    fillRate: 86,
    lastUpdated: '2 hours ago',
    status: 'warning',
    staffCount: 45
  },
  {
    id: '2',
    name: 'Ankober Health Post',
    code: 'ANKB002',
    type: 'Health Post',
    woreda: 'Ankober',
    zone: 'North Shewa',
    region: 'Amhara',
    stockoutCount: 0,
    lowStockCount: 2,
    fillRate: 94,
    lastUpdated: '4 hours ago',
    status: 'active',
    staffCount: 12,
    distance: '15 km'
  },
  {
    id: '3',
    name: 'Sheno Rural Clinic',
    code: 'SHEN003',
    type: 'Clinic',
    woreda: 'Sheno',
    zone: 'North Shewa',
    region: 'Amhara',
    stockoutCount: 8,
    lowStockCount: 12,
    fillRate: 67,
    lastUpdated: '1 day ago',
    status: 'critical',
    staffCount: 8,
    distance: '28 km'
  },
  {
    id: '4',
    name: 'Mehal Meda Hospital',
    code: 'MEHA004',
    type: 'Primary Hospital',
    woreda: 'Mehal Meda',
    zone: 'North Shewa',
    region: 'Amhara',
    stockoutCount: 1,
    lowStockCount: 4,
    fillRate: 91,
    lastUpdated: '30 min ago',
    status: 'active',
    staffCount: 120,
    distance: '22 km'
  }
];

export default function MultiFacilitySwitcher() {
  const [selectedFacility, setSelectedFacility] = useState<string>(mockFacilities[0].id);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentFacility = mockFacilities.find(f => f.id === selectedFacility) || mockFacilities[0];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleFacilitySwitch = (facilityId: string) => {
    setSelectedFacility(facilityId);
    // Here you would typically reload the dashboard with scoped data
    console.log('Switching to facility:', facilityId);
  };

  return (
    <Card className="surface border-border/50">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-foreground">Multi-Facility Overview</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              District Manager
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Current Facility Selector */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Active Facility</label>
            <Badge variant="secondary">{mockFacilities.length} facilities</Badge>
          </div>
          
          <Select value={selectedFacility} onValueChange={handleFacilitySwitch}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              {mockFacilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(facility.status)}
                    <span>{facility.name}</span>
                    <span className="text-xs text-muted-foreground">({facility.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-3 text-sm text-muted-foreground">
            Dashboard data will reload for: <strong>{currentFacility.name}</strong>
          </div>
        </div>

        {/* Facilities Overview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">All Facilities Summary</h3>
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockFacilities.map((facility) => (
                <Card
                  key={facility.id}
                  className={cn(
                    "border cursor-pointer transition-all hover:shadow-md",
                    facility.id === selectedFacility && "ring-2 ring-blue-500",
                    getStatusColor(facility.status)
                  )}
                  onClick={() => handleFacilitySwitch(facility.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(facility.status)}
                        <div>
                          <div className="font-medium text-sm">{facility.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {facility.code} • {facility.type}
                          </div>
                        </div>
                      </div>
                      {facility.distance && (
                        <Badge variant="outline" className="text-xs">
                          {facility.distance}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-red-600">{facility.stockoutCount}</div>
                        <div className="text-muted-foreground">Stockouts</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{facility.lowStockCount}</div>
                        <div className="text-muted-foreground">Low Stock</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">{facility.fillRate}%</div>
                        <div className="text-muted-foreground">Fill Rate</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {facility.staffCount} staff
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {facility.woreda}
                        </span>
                      </div>
                      <div className="mt-1">Updated: {facility.lastUpdated}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mockFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50",
                    facility.id === selectedFacility && "ring-2 ring-blue-500",
                    getStatusColor(facility.status)
                  )}
                  onClick={() => handleFacilitySwitch(facility.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(facility.status)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{facility.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {facility.code} • {facility.type} • {facility.woreda}, {facility.zone}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-red-600">{facility.stockoutCount}</div>
                      <div className="text-muted-foreground">SO</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{facility.lowStockCount}</div>
                      <div className="text-muted-foreground">LS</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{facility.fillRate}%</div>
                      <div className="text-muted-foreground">FR</div>
                    </div>
                    {facility.distance && (
                      <Badge variant="outline" className="text-xs">
                        {facility.distance}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <strong>Note:</strong> Switching facilities reloads the entire dashboard with facility-specific data. 
          SO = Stockouts, LS = Low Stock, FR = Fill Rate
        </div>
      </CardContent>
    </Card>
  );
}