import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

const facilityStatuses = [
  {
    name: "Gondar Hospital",
    type: "Hospital",
    zone: "North Gondar",
    currentStep: "Forecast",
    progress: 50,
    status: "on-track",
    lastUpdate: "2 days ago",
    alerts: 0
  },
  {
    name: "Bahir Dar Health Center",
    type: "Health Center",
    zone: "West Gojjam",
    currentStep: "Inventory",
    progress: 25,
    status: "delayed",
    lastUpdate: "5 days ago",
    alerts: 2
  },
  {
    name: "Debre Markos HC",
    type: "Health Center", 
    zone: "East Gojjam",
    currentStep: "Request",
    progress: 75,
    status: "on-track",
    lastUpdate: "1 day ago",
    alerts: 0
  },
  {
    name: "Dessie Hospital",
    type: "Hospital",
    zone: "South Wollo",
    currentStep: "Delivery",
    progress: 90,
    status: "on-track",
    lastUpdate: "3 hours ago",
    alerts: 1
  }
];

const regionalMetrics = [
  {
    title: "Facilities Reporting",
    value: "67/89",
    percentage: 75,
    trend: "up",
    description: "On-time reporting this quarter"
  },
  {
    title: "Stock Coverage",
    value: "2.8 months",
    percentage: 85,
    trend: "up", 
    description: "Average stock on hand"
  },
  {
    title: "Pending Requests",
    value: "12",
    percentage: 60,
    trend: "down",
    description: "Awaiting approval"
  },
  {
    title: "Overdue Tasks",
    value: "5",
    percentage: 20,
    trend: "down",
    description: "Require immediate attention"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "on-track":
      return "bg-green-100 text-green-800 border-green-200";
    case "delayed":
      return "bg-red-100 text-red-800 border-red-200";
    case "at-risk":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const RegionalWorkflow: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Regional Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {regionalMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{metric.title}</h3>
                <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Progress value={metric.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Facility Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Facility Network Status
          </CardTitle>
          <CardDescription>
            Monitor supply cycle progress across all facilities in your region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Current Step</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilityStatuses.map((facility, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {facility.alerts > 0 && (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                      {facility.name}
                    </div>
                  </TableCell>
                  <TableCell>{facility.type}</TableCell>
                  <TableCell>{facility.zone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{facility.currentStep}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={facility.progress} className="w-16" />
                      <span className="text-sm">{facility.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(facility.status)}>
                      {facility.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {facility.lastUpdate}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Regional Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Priority Actions
            </CardTitle>
            <CardDescription>
              Facilities requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
              <div>
                <div className="font-medium">Bahir Dar Health Center</div>
                <div className="text-sm text-muted-foreground">5 days overdue on inventory update</div>
              </div>
              <Button size="sm" variant="outline">Contact</Button>
            </div>
            <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <div>
                <div className="font-medium">Stock Redistribution</div>
                <div className="text-sm text-muted-foreground">3 facilities have excess stock for redistribution</div>
              </div>
              <Button size="sm" variant="outline">Plan</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Quarterly Report</div>
                <div className="text-sm text-muted-foreground">Due in 5 days</div>
              </div>
              <Button size="sm" variant="outline">Prepare</Button>
            </div>
          </CardContent>
        </Card>

        {/* Regional Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Regional Analytics
            </CardTitle>
            <CardDescription>
              Quick insights and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Average Forecast Accuracy</div>
                <div className="text-sm text-muted-foreground">Last quarter</div>
              </div>
              <div className="text-2xl font-semibold text-green-600">87%</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Stock-out Incidents</div>
                <div className="text-sm text-muted-foreground">This month</div>
              </div>
              <div className="text-2xl font-semibold text-orange-600">3</div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">On-time Delivery Rate</div>
                <div className="text-sm text-muted-foreground">Last 30 days</div>
              </div>
              <div className="text-2xl font-semibold text-blue-600">92%</div>
            </div>
            <Button className="w-full" variant="outline">
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};