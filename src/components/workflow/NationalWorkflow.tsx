import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Globe, TrendingUp, Users, AlertTriangle, MapPin, FileText } from "lucide-react";

const nationalMetrics = [
  {
    title: "National Coverage",
    value: "2,847/3,200",
    percentage: 89,
    description: "Facilities reporting"
  },
  {
    title: "System Reliability",
    value: "97.8%",
    percentage: 98,
    description: "Uptime this month"
  },
  {
    title: "Data Quality Score",
    value: "8.4/10",
    percentage: 84,
    description: "Average data completeness"
  },
  {
    title: "Policy Compliance",
    value: "92%",
    percentage: 92,
    description: "Facilities following protocols"
  }
];

const regionProgress = [
  { region: "Amhara", facilities: 456, reporting: 398, percentage: 87 },
  { region: "Oromia", facilities: 1247, reporting: 1089, percentage: 87 },
  { region: "SNNPR", facilities: 623, reporting: 567, percentage: 91 },
  { region: "Tigray", facilities: 289, reporting: 234, percentage: 81 },
  { region: "Somali", facilities: 178, reporting: 145, percentage: 81 },
  { region: "Afar", facilities: 87, reporting: 73, percentage: 84 },
  { region: "Benishangul", facilities: 76, reporting: 65, percentage: 86 },
  { region: "Gambela", facilities: 34, reporting: 29, percentage: 85 },
  { region: "Harari", facilities: 12, reporting: 11, percentage: 92 },
  { region: "Dire Dawa", facilities: 18, reporting: 16, percentage: 89 }
];

const commodityData = [
  { name: "Essential Medicines", value: 78, color: "#22c55e" },
  { name: "Vaccines", value: 92, color: "#3b82f6" },
  { name: "Medical Supplies", value: 65, color: "#f59e0b" },
  { name: "Diagnostics", value: 71, color: "#8b5cf6" }
];

const nationalPriorities = [
  {
    title: "Regional Stock Imbalance",
    description: "3 regions showing critical shortages in essential medicines",
    urgency: "high",
    affectedRegions: ["Tigray", "Somali", "Afar"]
  },
  {
    title: "Forecast Model Update",
    description: "Deploy new ML forecasting models to improve accuracy",
    urgency: "medium",
    timeline: "Next quarter"
  },
  {
    title: "Policy Harmonization",
    description: "Standardize procurement policies across all regions",
    urgency: "medium",
    timeline: "6 months"
  },
  {
    title: "System Integration",
    description: "Complete FHIR integration with hospital systems",
    urgency: "low",
    timeline: "12 months"
  }
];

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const NationalWorkflow: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* National Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nationalMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{metric.title}</h3>
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Progress value={metric.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regional Performance & Commodity Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Performance
            </CardTitle>
            <CardDescription>
              Facility reporting rates by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Commodity Coverage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              National Commodity Coverage
            </CardTitle>
            <CardDescription>
              Stock availability by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commodityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {commodityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Coverage"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {commodityData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* National Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            National Priorities
          </CardTitle>
          <CardDescription>
            Strategic initiatives and critical issues requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {nationalPriorities.map((priority, index) => (
            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{priority.title}</h4>
                  <Badge variant="outline" className={getUrgencyColor(priority.urgency)}>
                    {priority.urgency} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{priority.description}</p>
                {priority.affectedRegions && (
                  <div className="text-xs text-muted-foreground">
                    Affected regions: {priority.affectedRegions.join(", ")}
                  </div>
                )}
                {priority.timeline && (
                  <div className="text-xs text-muted-foreground">
                    Timeline: {priority.timeline}
                  </div>
                )}
              </div>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Policy Management</h3>
            <p className="text-sm text-muted-foreground">Manage national supply policies</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">National Forecasting</h3>
            <p className="text-sm text-muted-foreground">Strategic demand planning</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">System Administration</h3>
            <p className="text-sm text-muted-foreground">Manage users and settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};