import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Users,
  Package,
  Calendar
} from "lucide-react";

const HealthProgramsDashboard = () => {
  const programs = [
    {
      name: "Malaria",
      status: "Validated",
      lastUpdate: "2024-01-15",
      facilities: 45,
      commodities: 23,
      progress: 95,
      issues: 2
    },
    {
      name: "HIV/AIDS", 
      status: "In Review",
      lastUpdate: "2024-01-12",
      facilities: 38,
      commodities: 31,
      progress: 78,
      issues: 5
    },
    {
      name: "Tuberculosis",
      status: "Pending",
      lastUpdate: "2024-01-10",
      facilities: 52,
      commodities: 18,
      progress: 45,
      issues: 8
    },
    {
      name: "RMNCH",
      status: "Validated",
      lastUpdate: "2024-01-14",
      facilities: 67,
      commodities: 42,
      progress: 92,
      issues: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validated": return "bg-green-100 text-green-800";
      case "In Review": return "bg-yellow-100 text-yellow-800";
      case "Pending": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Health Programs Forecast Dashboard - Forlab+</title>
        <meta name="description" content="Validate and manage health program forecasts across facilities" />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Programs Forecast Dashboard</h1>
            <p className="text-muted-foreground">
              Validate Excel forecasts and monitor health program commodity planning
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload New Forecast
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Across all health areas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">202</div>
              <p className="text-xs text-muted-foreground">+12 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validated Forecasts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">50% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Program Overview</TabsTrigger>
            <TabsTrigger value="validation">Validation Queue</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4">
              {programs.map((program, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{program.name} Program</CardTitle>
                          <CardDescription>
                            Last updated: {new Date(program.lastUpdate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Facilities</div>
                        <div className="text-2xl font-bold text-primary">{program.facilities}</div>
                      </div>
                      <div>
                        <div className="font-medium">Commodities</div>
                        <div className="text-2xl font-bold text-primary">{program.commodities}</div>
                      </div>
                      <div>
                        <div className="font-medium">Issues</div>
                        <div className="text-2xl font-bold text-destructive">{program.issues}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Validation Progress</span>
                        <span>{program.progress}%</span>
                      </div>
                      <Progress value={program.progress} className="h-2" />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Download Report
                      </Button>
                      {program.status !== "Validated" && (
                        <Button size="sm">
                          Validate Forecast
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Validation Queue</CardTitle>
                <CardDescription>
                  Forecasts waiting for validation and review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No forecasts in validation queue</p>
                  <p className="text-sm">Upload Excel forecasts to start validation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Reports</CardTitle>
                <CardDescription>
                  Generated reports and analytics for health program forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No reports available</p>
                  <p className="text-sm">Reports will be generated after forecast validation</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HealthProgramsDashboard;