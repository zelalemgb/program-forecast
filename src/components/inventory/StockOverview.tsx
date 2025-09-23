import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Package, TrendingUp, TrendingDown, CheckCircle, Clock, Eye } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";

interface StockOverviewProps {
  facilityId: number;
}

export const StockOverview: React.FC<StockOverviewProps> = ({ facilityId }) => {
  const { balances, loading, error } = useInventoryData(facilityId);

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return "out";
    if (currentStock <= reorderLevel) return "low";
    return "good";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200";
      case "low":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "out":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      case "low":
        return <TrendingDown className="h-4 w-4" />;
      case "out":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Calculate summary stats
  const totalItems = balances.length;
  const stockouts = balances.filter(b => b.current_stock === 0).length;
  const lowStock = balances.filter(b => b.current_stock > 0 && b.current_stock <= b.reorder_level).length;
  const goodStock = balances.filter(b => b.current_stock > b.reorder_level).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Good Stock</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{goodStock}</div>
            <p className="text-xs text-muted-foreground">Above reorder level</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{lowStock}</div>
            <p className="text-xs text-muted-foreground">Need reorder soon</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Stock Out</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{stockouts}</div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Items</span>
            </div>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In system</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances
                .filter(balance => balance.current_stock <= balance.reorder_level)
                .slice(0, 10) // Show top 10 critical items
                .map((balance) => {
                  const status = getStockStatus(balance.current_stock, balance.reorder_level);
                  return (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">
                        {balance.products?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>
                        {balance.current_stock.toLocaleString()} {balance.products?.unit || 'units'}
                      </TableCell>
                      <TableCell>
                        {balance.reorder_level.toLocaleString()} {balance.products?.unit || 'units'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(status)}
                          {status === "out" ? "Stock Out" : status === "low" ? "Low Stock" : "Good"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {balance.last_updated ? new Date(balance.last_updated).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          
          {balances.filter(b => b.current_stock <= b.reorder_level).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium">All items have adequate stock</p>
              <p className="text-sm">No critical stock levels detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Stock Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="font-medium">Stock Received</div>
                <div className="text-sm text-muted-foreground">Central Medical Store delivery - 15 items</div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Ward Issue</div>
                <div className="text-sm text-muted-foreground">Maternity Ward - 8 items dispensed</div>
              </div>
              <div className="text-sm text-muted-foreground">4 hours ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <div className="font-medium">Stock Adjustment</div>
                <div className="text-sm text-muted-foreground">Damaged items removed - 3 batches</div>
              </div>
              <div className="text-sm text-muted-foreground">1 day ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};