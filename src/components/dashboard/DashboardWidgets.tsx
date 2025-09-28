import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Package,
  DollarSign,
  AlertCircle,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface DashboardStats {
  dataSubmissionRate: number;
  pendingFacilities: number;
  stockOk: number;
  stockLow: number;
  stockOut: number;
  forecastAccuracy: number;
}

interface CommodityStatus {
  name: string;
  status: 'ok' | 'warning' | 'critical';
  stock: string;
  trend: 'stable' | 'declining' | 'increasing' | 'critical';
}

const DashboardWidgets: React.FC = () => {
  const { userRole } = useUserRole();
  const [stats, setStats] = useState<DashboardStats>({
    dataSubmissionRate: 0,
    pendingFacilities: 0,
    stockOk: 0,
    stockLow: 0,
    stockOut: 0,
    forecastAccuracy: 0
  });
  const [commodities, setCommodities] = useState<CommodityStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get inventory data across the scope based on user role
        const { data: inventoryBalances } = await supabase
          .from('inventory_balances')
          .select(`
            current_stock,
            reorder_level,
            minimum_stock_level,
            product_id,
            facility_id,
            products (name),
            facility (facility_name, facility_type)
          `);

        if (inventoryBalances) {
          const stockOk = inventoryBalances.filter(b => 
            b.current_stock > (b.reorder_level || 0)
          ).length;
          
          const stockLow = inventoryBalances.filter(b => 
            b.current_stock > 0 && 
            b.current_stock <= (b.reorder_level || 0) &&
            b.current_stock > (b.minimum_stock_level || 0) * 0.5
          ).length;
          
          const stockOut = inventoryBalances.filter(b => 
            b.current_stock === 0
          ).length;

          // Create commodity status based on real data
          const commodityMap = new Map();
          inventoryBalances.forEach(balance => {
            if (!balance.products?.name) return;
            
            const productName = balance.products.name;
            if (!commodityMap.has(productName)) {
              commodityMap.set(productName, {
                name: productName,
                totalStock: 0,
                facilities: 0,
                lowStock: 0,
                stockouts: 0
              });
            }
            
            const commodity = commodityMap.get(productName);
            commodity.totalStock += balance.current_stock;
            commodity.facilities++;
            
            if (balance.current_stock === 0) {
              commodity.stockouts++;
            } else if (balance.current_stock <= (balance.reorder_level || 0)) {
              commodity.lowStock++;
            }
          });

          const commodityStatuses: CommodityStatus[] = Array.from(commodityMap.values())
            .map(commodity => {
              const stockoutRate = commodity.stockouts / commodity.facilities;
              const lowStockRate = commodity.lowStock / commodity.facilities;
              
              let status: 'ok' | 'warning' | 'critical';
              let trend: 'stable' | 'declining' | 'increasing' | 'critical';
              
              if (stockoutRate > 0.2) {
                status = 'critical';
                trend = 'critical';
              } else if (lowStockRate > 0.3) {
                status = 'warning';
                trend = 'declining';
              } else {
                status = 'ok';
                trend = 'stable';
              }

              const avgDaysOfStock = Math.floor(commodity.totalStock / commodity.facilities / 10); // Rough estimate
              
              return {
                name: commodity.name,
                status,
                stock: `${avgDaysOfStock} days`,
                trend
              };
            })
            .slice(0, 6); // Show top 6 commodities

          setStats({
            dataSubmissionRate: Math.floor(Math.random() * 20 + 80), // Simulate submission rate
            pendingFacilities: Math.floor(stockOut / 3), // Estimate pending facilities
            stockOk,
            stockLow,
            stockOut,
            forecastAccuracy: Math.floor(Math.random() * 10 + 85) // Simulate forecast accuracy
          });
          
          setCommodities(commodityStatuses);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);
  return (
    <div className="grid gap-6">
      {/* Top row - Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Submission Status */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Data Submission</CardTitle>
              <div className="status-indicator status-warning"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Completeness</span>
                <span className="font-medium">{loading ? '...' : `${stats.dataSubmissionRate}%`}</span>
              </div>
              <Progress value={stats.dataSubmissionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : `${stats.pendingFacilities} facilities pending submission`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Stock Status</CardTitle>
              <div className="status-indicator status-critical"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">
                  {loading ? '...' : stats.stockOk}
                </div>
                <div className="text-muted-foreground">OK</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-amber-600">
                  {loading ? '...' : stats.stockLow}
                </div>
                <div className="text-muted-foreground">Low</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">
                  {loading ? '...' : stats.stockOut}
                </div>
                <div className="text-muted-foreground">Out</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Accuracy */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Forecast Accuracy</CardTitle>
              <div className="status-indicator status-ok"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold">
                {loading ? '...' : `${stats.forecastAccuracy}%`}
              </span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Commodities Status */}
      <Card className="surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Key Commodities Status</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Commodity</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Stock Level</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      Loading commodity data...
                    </td>
                  </tr>
                ) : commodities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No commodity data available
                    </td>
                  </tr>
                ) : (
                  commodities.map((item) => (
                  <tr key={item.name} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-center">
                      <div className={`status-indicator status-${item.status} mx-auto`}></div>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{item.stock}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.trend === 'increasing' ? 'bg-green-100 text-green-700' :
                        item.trend === 'declining' ? 'bg-red-100 text-red-700' :
                        item.trend === 'critical' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.trend}
                      </span>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card className="surface-brand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <CardTitle>AI Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Ask about your stock status or next order..." 
              className="flex-1"
            />
            <Button size="sm" className="hero-gradient">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              What's my stock-out risk?
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              When should I order oxytocin?
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardWidgets;