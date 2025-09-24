import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  AlertTriangle, Package, TrendingUp, TrendingDown, CheckCircle, Clock, 
  DollarSign, BarChart3, Calendar, ArrowUp, ArrowDown, Minus,
  Target, ShoppingCart, Timer, Activity
} from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { ConsumptionAnalysis } from "./ConsumptionAnalysis";
import { supabase } from "@/integrations/supabase/client";

interface StockOverviewProps {
  facilityId: number;
}

interface InventoryMetrics {
  totalItems: number;
  stockouts: number;
  lowStock: number;
  goodStock: number;
  totalValue: number;
  nearExpiry: number;
  avgStockTurnover: number;
  emergencyItems: number;
}

interface CriticalAlert {
  id: string;
  type: 'stockout' | 'low-stock' | 'near-expiry' | 'over-stock';
  product_name: string;
  current_stock: number;
  reorder_level: number;
  days_until_expiry?: number;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface SupplyChainInsight {
  category: string;
  availability_percentage: number;
  avg_lead_time: number;
  stock_coverage_days: number;
  cost_trend: 'up' | 'down' | 'stable';
}

export const StockOverview: React.FC<StockOverviewProps> = ({ facilityId }) => {
  const { balances, transactions, loading, error } = useInventoryData(facilityId);
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalItems: 0,
    stockouts: 0,
    lowStock: 0,
    goodStock: 0,
    totalValue: 0,
    nearExpiry: 0,
    avgStockTurnover: 0,
    emergencyItems: 0
  });
  const [criticalAlerts, setCriticalAlerts] = useState<CriticalAlert[]>([]);
  const [supplyChainInsights, setSupplyChainInsights] = useState<SupplyChainInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("30");

  useEffect(() => {
    if (balances.length > 0) {
      calculateMetrics();
      generateCriticalAlerts();
      generateSupplyChainInsights();
    }
  }, [balances, transactions, selectedTimeframe]);

  const calculateMetrics = async () => {
    const totalItems = balances.length;
    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const lowStock = balances.filter(b => b.current_stock > 0 && b.current_stock <= b.reorder_level).length;
    const goodStock = balances.filter(b => b.current_stock > b.reorder_level).length;
    
    // Calculate total inventory value (simplified - would need unit costs)
    const totalValue = balances.reduce((sum, b) => sum + (b.current_stock * 10), 0); // Placeholder calculation
    
    // Near expiry items (would need expiry date data)
    const nearExpiry = Math.floor(totalItems * 0.05); // 5% estimation
    
    // Emergency items (low stock + stockouts)
    const emergencyItems = stockouts + lowStock;
    
    // Stock turnover calculation (simplified)
    const avgStockTurnover = transactions.length > 0 ? 
      transactions.filter(t => t.transaction_type === 'issue').length / Math.max(totalItems, 1) : 0;

    setMetrics({
      totalItems,
      stockouts,
      lowStock,
      goodStock,
      totalValue,
      nearExpiry,
      avgStockTurnover,
      emergencyItems
    });
  };

  const generateCriticalAlerts = () => {
    const alerts: CriticalAlert[] = [];
    
    balances.forEach(balance => {
      // Stockout alerts
      if (balance.current_stock === 0) {
        alerts.push({
          id: `stockout-${balance.id}`,
          type: 'stockout',
          product_name: balance.products?.name || 'Unknown Product',
          current_stock: balance.current_stock,
          reorder_level: balance.reorder_level,
          priority: 'high',
          recommendation: 'Immediate procurement required'
        });
      }
      // Low stock alerts
      else if (balance.current_stock <= balance.reorder_level) {
        alerts.push({
          id: `low-stock-${balance.id}`,
          type: 'low-stock',
          product_name: balance.products?.name || 'Unknown Product',
          current_stock: balance.current_stock,
          reorder_level: balance.reorder_level,
          priority: balance.current_stock <= balance.reorder_level * 0.5 ? 'high' : 'medium',
          recommendation: `Reorder ${balance.reorder_level * 2} units`
        });
      }
      // Overstock alerts (simplified - stock > 5x reorder level)
      else if (balance.current_stock > balance.reorder_level * 5) {
        alerts.push({
          id: `overstock-${balance.id}`,
          type: 'over-stock',
          product_name: balance.products?.name || 'Unknown Product',
          current_stock: balance.current_stock,
          reorder_level: balance.reorder_level,
          priority: 'low',
          recommendation: 'Consider redistributing excess stock'
        });
      }
    });

    setCriticalAlerts(alerts.slice(0, 10)); // Top 10 alerts
  };

  const generateSupplyChainInsights = () => {
    // Generate mock supply chain insights - in real implementation, this would analyze actual data
    const insights: SupplyChainInsight[] = [
      {
        category: 'Essential Medicines',
        availability_percentage: 85,
        avg_lead_time: 14,
        stock_coverage_days: 45,
        cost_trend: 'stable'
      },
      {
        category: 'Medical Supplies',
        availability_percentage: 92,
        avg_lead_time: 7,
        stock_coverage_days: 30,
        cost_trend: 'up'
      },
      {
        category: 'Vaccines',
        availability_percentage: 78,
        avg_lead_time: 21,
        stock_coverage_days: 60,
        cost_trend: 'down'
      },
      {
        category: 'Laboratory Supplies',
        availability_percentage: 88,
        avg_lead_time: 10,
        stock_coverage_days: 35,
        cost_trend: 'stable'
      }
    ];
    
    setSupplyChainInsights(insights);
  };

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return "out";
    if (currentStock <= reorderLevel) return "low";
    if (currentStock > reorderLevel * 5) return "high";
    return "good";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-green-100 text-green-800 border-green-200";
      case "low": return "bg-orange-100 text-orange-800 border-orange-200";
      case "out": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCostTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="h-4 w-4 text-red-600" />;
      case "down": return <ArrowDown className="h-4 w-4 text-green-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inventory Analysis Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Real-time insights into your health product supply chain
          </p>
        </div>
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-brand" />
              <span className="text-sm font-medium">Total Items</span>
            </div>
            <div className="text-2xl font-bold text-brand">{metrics.totalItems}</div>
            <p className="text-xs text-muted-foreground">Active products in inventory</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
              <span className="text-sm font-medium">Emergency Items</span>
            </div>
            <div className="text-2xl font-bold text-status-critical">{metrics.emergencyItems}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-status-ok" />
              <span className="text-sm font-medium">Inventory Value</span>
            </div>
            <div className="text-2xl font-bold text-status-ok">
              ${(metrics.totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Estimated total value</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-brand" />
              <span className="text-sm font-medium">Stock Turnover</span>
            </div>
            <div className="text-2xl font-bold text-brand">
              {metrics.avgStockTurnover.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">Average turnover rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-status-ok" />
              <span className="text-sm font-medium">Good Stock</span>
            </div>
            <div className="text-xl font-bold text-status-ok">{metrics.goodStock}</div>
            <p className="text-xs text-muted-foreground">Above reorder level</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-status-warning" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <div className="text-xl font-bold text-status-warning">{metrics.lowStock}</div>
            <p className="text-xs text-muted-foreground">Need reorder soon</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-status-critical" />
              <span className="text-sm font-medium">Stock Outs</span>
            </div>
            <div className="text-xl font-bold text-status-critical">{metrics.stockouts}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card className="surface">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Near Expiry</span>
            </div>
            <div className="text-xl font-bold text-orange-600">{metrics.nearExpiry}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-status-critical" />
            Critical Alerts & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {criticalAlerts.length > 0 ? (
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{alert.product_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current: {alert.current_stock} | Reorder Level: {alert.reorder_level}
                    </p>
                    <p className="text-sm font-medium text-brand mt-1">
                      💡 {alert.recommendation}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-status-ok" />
              <p className="font-medium">No critical alerts</p>
              <p className="text-sm">Your inventory is well managed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supply Chain Insights */}
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand" />
            Supply Chain Performance by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supplyChainInsights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{insight.category}</h4>
                  {getCostTrendIcon(insight.cost_trend)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Availability</span>
                    <span className={`font-medium ${
                      insight.availability_percentage >= 90 ? 'text-status-ok' : 
                      insight.availability_percentage >= 75 ? 'text-status-warning' : 'text-status-critical'
                    }`}>
                      {insight.availability_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Lead Time</span>
                    <span className="font-medium">{insight.avg_lead_time} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Stock Coverage</span>
                    <span className="font-medium">{insight.stock_coverage_days} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        insight.availability_percentage >= 90 ? 'bg-status-ok' : 
                        insight.availability_percentage >= 75 ? 'bg-status-warning' : 'bg-status-critical'
                      }`}
                      style={{ width: `${insight.availability_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consumption Analysis & Forecast */}
      <ConsumptionAnalysis facilityId={facilityId} />
    </div>
  );
};