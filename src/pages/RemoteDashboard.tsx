import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Database, 
  Users, 
  Package, 
  Building, 
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  facilitiesByRegion: Array<{ region: string; count: number }>;
  totalUniqueProducts: number;
  totalUsers: number;
}

interface ConnectionTestResult {
  success: boolean;
  message: string;
  tableInfo?: Array<{ tableName: string; rowCount: number }>;
}

const CONNECTION_TIMEOUT = 12000; // 12 seconds timeout for better UX

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RemoteDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionTestResult | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      // Add timeout promise to fail faster
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
      );
      
      const dataPromise = supabase.functions.invoke('mysql-dashboard-data');
      
      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }

      setDashboardData(data);
      console.log('Dashboard data loaded:', data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "MySQL Connection Issue",
        description: "Cannot connect to remote database. Using fallback data.",
        variant: "destructive",
      });
      
      // Set fallback data immediately
      setDashboardData({
        facilitiesByRegion: [
          { region: 'Addis Ababa', count: 25 },
          { region: 'Oromia', count: 18 },
          { region: 'Amhara', count: 32 },
          { region: 'Tigray', count: 12 },
          { region: 'SNNP', count: 20 }
        ],
        totalUniqueProducts: 156,
        totalUsers: 89
      });
    }
  };

  const testConnection = async () => {
    try {
      // Add timeout for connection test too
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), CONNECTION_TIMEOUT)
      );
      
      const testPromise = supabase.functions.invoke('test-mysql-connection');
      
      const { data, error } = await Promise.race([testPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Connection test error:', error);
        throw error;
      }

      setConnectionStatus(data);
      console.log('Connection test result:', data);
    } catch (error) {
      console.error('Failed to test connection:', error);
      setConnectionStatus({
        success: false,
        message: `Connection test failed: ${error.message || 'Unable to reach MySQL database'}`
      });
    }
  };

  const debugConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('debug-mysql-config');
      
      if (error) {
        console.error('Debug check error:', error);
        throw error;
      }

      setDebugInfo(data);
      console.log('Debug info:', data);
      
      toast({
        title: "Debug Info Retrieved",
        description: "Check the connection details below.",
      });
    } catch (error) {
      console.error('Failed to get debug info:', error);
      toast({
        title: "Debug Check Failed",
        description: "Could not retrieve debug information.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), testConnection()]);
    setRefreshing(false);
    
    toast({
      title: "Dashboard refreshed",
      description: "Data has been updated from the remote database.",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), testConnection()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Remote Database Dashboard</h1>
            <p className="text-muted-foreground">Medicine consumption data from remote MySQL database</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalFacilities = dashboardData?.facilitiesByRegion.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Remote Database Dashboard</h1>
          <p className="text-muted-foreground">Medicine consumption data from remote MySQL database</p>
        </div>
        
        <div className="flex items-center gap-3">
          {connectionStatus && (
            <Badge variant={connectionStatus.success ? "default" : "destructive"} className="flex items-center gap-1">
              {connectionStatus.success ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3" />
              )}
              {connectionStatus.success ? "Connected" : "Disconnected"}
            </Badge>
          )}
          
          <Button 
            onClick={debugConnection}
            variant="outline"
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            Debug Connection
          </Button>
          
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {connectionStatus && !connectionStatus.success && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {connectionStatus.message}. Showing fallback data.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFacilities}</div>
            <p className="text-xs text-muted-foreground">
              Across all regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalUniqueProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Medicine products tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active system users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Facilities by Region</CardTitle>
            <CardDescription>Distribution of healthcare facilities across regions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData?.facilitiesByRegion || []}>
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
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Percentage breakdown of facilities by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.facilitiesByRegion || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(dashboardData?.facilitiesByRegion || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Database Tables Information */}
      {connectionStatus?.tableInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Schema Information
            </CardTitle>
            <CardDescription>Tables available in the remote MySQL database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectionStatus.tableInfo.map((table, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{table.tableName}</span>
                  <Badge variant="secondary">
                    {table.rowCount === -1 ? 'N/A' : `${table.rowCount} rows`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      {debugInfo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              MySQL Connection Debug Information
            </CardTitle>
            <CardDescription>Configuration and connectivity details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Connection Configuration:</h4>
                <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                  <div>Host: {debugInfo.secrets?.hostname}</div>
                  <div>Port: {debugInfo.secrets?.port}</div>
                  <div>Database: {debugInfo.secrets?.database}</div>
                  <div>Username: {debugInfo.secrets?.username}</div>
                  <div>Password: {debugInfo.secrets?.password}</div>
                </div>
              </div>
              
              {debugInfo.recommendation && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendation:</h4>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{debugInfo.recommendation}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RemoteDashboard;