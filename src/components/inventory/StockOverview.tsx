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
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="surface">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-status-ok" />
              <span className="text-xs sm:text-sm font-medium">Good Stock</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-status-ok">{goodStock}</div>
            <p className="text-xs text-muted-foreground">Above reorder level</p>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-status-warning" />
              <span className="text-xs sm:text-sm font-medium">Low Stock</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-status-warning">{lowStock}</div>
            <p className="text-xs text-muted-foreground">Need reorder soon</p>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-status-critical" />
              <span className="text-xs sm:text-sm font-medium">Stock Out</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-status-critical">{stockouts}</div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
        
        <Card className="surface">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-brand" />
              <span className="text-xs sm:text-sm font-medium">Total Items</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-brand">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In system</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Items */}
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle className="h-5 w-5 text-status-critical" />
            Critical Items
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Product</TableHead>
                  <TableHead className="text-xs sm:text-sm">Current Stock</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Reorder Level</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="text-xs sm:text-sm">Action</TableHead>
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
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <div className="min-w-0">
                          <div className="truncate">{balance.products?.name || 'Unknown Product'}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="font-medium">{balance.current_stock.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{balance.products?.unit || 'units'}</div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        {balance.reorder_level.toLocaleString()} {balance.products?.unit || 'units'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(status)} flex items-center gap-1 w-fit text-xs`}>
                          {getStatusIcon(status)}
                          <span className="hidden sm:inline">
                            {status === "out" ? "Stock Out" : status === "low" ? "Low Stock" : "Good"}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                        {balance.last_updated ? new Date(balance.last_updated).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            </Table>
          </div>
          
          {balances.filter(b => b.current_stock <= b.reorder_level).length === 0 && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground p-4">
              <CheckCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-status-ok" />
              <p className="text-base sm:text-lg font-medium">All items have adequate stock</p>
              <p className="text-sm">No critical stock levels detected</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-5 w-5" />
            Recent Stock Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-4 w-4 text-status-ok flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Stock Received</div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Central Medical Store delivery - 15 items</div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">2h ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <TrendingDown className="h-4 w-4 text-brand flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Ward Issue</div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Maternity Ward - 8 items dispensed</div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">4h ago</div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-4 w-4 text-status-warning flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Stock Adjustment</div>
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Damaged items removed - 3 batches</div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">1d ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};