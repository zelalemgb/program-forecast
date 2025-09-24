import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertCircle, CheckCircle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  canonical_name: string;
  default_unit: string;
}

interface CountItem {
  product_id: string;
  product_name: string;
  unit: string;
  system_count: number;
  physical_count: number | null;
  variance: number;
  variance_percentage: number;
}

interface CycleCountTabProps {
  facilityId: number;
}

export const CycleCountTab: React.FC<CycleCountTabProps> = ({ facilityId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockBalances, setStockBalances] = useState<Record<string, number>>({});
  const [countItems, setCountItems] = useState<CountItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countStarted, setCountStarted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProductsAndStock();
  }, []);

  const fetchProductsAndStock = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('product_reference')
        .select('id, canonical_name, default_unit')
        .eq('active', true)
        .order('canonical_name')
        .limit(20); // Limit for cycle count

      if (productsError) throw productsError;

      // Fetch current stock balances
      const { data: balancesData, error: balancesError } = await supabase
        .from('inventory_balances')
        .select('product_id, current_stock')
        .eq('facility_id', facilityId);

      if (balancesError) throw balancesError;

      const balancesMap = (balancesData || []).reduce((acc, balance) => {
        acc[balance.product_id] = balance.current_stock || 0;
        return acc;
      }, {} as Record<string, number>);

      setProducts(productsData || []);
      setStockBalances(balancesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load products and stock data",
        variant: "destructive",
      });
    }
  };

  const startCycleCount = () => {
    const items: CountItem[] = products.map(product => ({
      product_id: product.id,
      product_name: product.canonical_name,
      unit: product.default_unit,
      system_count: stockBalances[product.id] || 0,
      physical_count: null,
      variance: 0,
      variance_percentage: 0
    }));
    
    setCountItems(items);
    setCountStarted(true);
  };

  const updatePhysicalCount = (productId: string, count: number) => {
    setCountItems(items => items.map(item => {
      if (item.product_id === productId) {
        const variance = count - item.system_count;
        const variance_percentage = item.system_count > 0 ? (variance / item.system_count) * 100 : 0;
        return {
          ...item,
          physical_count: count,
          variance,
          variance_percentage
        };
      }
      return item;
    }));
  };

  const finalizeCycleCount = async () => {
    setIsProcessing(true);
    try {
      const adjustments = countItems.filter(item => 
        item.physical_count !== null && item.variance !== 0
      );

      for (const adjustment of adjustments) {
        await supabase
          .from('inventory_transactions')
          .insert({
            facility_id: facilityId,
            product_id: adjustment.product_id,
            transaction_type: 'adjustment',
            quantity: adjustment.variance,
            transaction_date: new Date().toISOString().split('T')[0],
            reference_number: `CYCLE-${Date.now()}`,
            notes: `Cycle count adjustment. System: ${adjustment.system_count}, Physical: ${adjustment.physical_count}, Variance: ${adjustment.variance}`
          });
      }

      toast({
        title: "Cycle count completed",
        description: `${adjustments.length} adjustments processed`,
      });

      // Reset for next count
      setCountStarted(false);
      setCountItems([]);
      fetchProductsAndStock();
    } catch (error) {
      console.error('Error finalizing cycle count:', error);
      toast({
        title: "Error",
        description: "Failed to finalize cycle count",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalVarianceValue = () => {
    return countItems.reduce((total, item) => {
      if (item.physical_count !== null && item.variance !== 0) {
        return total + Math.abs(item.variance);
      }
      return total;
    }, 0);
  };

  const getVarianceItems = () => {
    return countItems.filter(item => 
      item.physical_count !== null && item.variance !== 0
    ).length;
  };

  if (!countStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Start Cycle Count
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Cycle Count Process</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    This will start a systematic count of {products.length} products. 
                    Count each item physically and record the actual quantities found.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-muted-foreground">Products to Count</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(stockBalances).reduce((sum, val) => sum + val, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total System Units</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stockBalances).length}
                </div>
                <div className="text-sm text-muted-foreground">Items in Stock</div>
              </div>
            </div>

            <Button onClick={startCycleCount} className="w-full">
              Start Cycle Count
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Count Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-lg font-semibold">{countItems.length}</div>
                <div className="text-xs text-muted-foreground">Total Items</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {countItems.filter(item => item.physical_count !== null).length}
                </div>
                <div className="text-xs text-muted-foreground">Counted</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-lg font-semibold text-orange-600">{getVarianceItems()}</div>
                <div className="text-xs text-muted-foreground">Variances</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calculator className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-lg font-semibold text-purple-600">{getTotalVarianceValue()}</div>
                <div className="text-xs text-muted-foreground">Total Variance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Count Table */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Count</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>System Count</TableHead>
                <TableHead>Physical Count</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Variance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countItems.map((item) => (
                <TableRow 
                  key={item.product_id}
                  className={item.variance !== 0 && item.physical_count !== null ? "bg-orange-50" : ""}
                >
                  <TableCell>
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">{item.unit}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.system_count.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Count..."
                      value={item.physical_count || ""}
                      onChange={(e) => updatePhysicalCount(item.product_id, Number(e.target.value))}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    {item.physical_count !== null && (
                      <span className={item.variance === 0 ? "text-green-600" : "text-orange-600 font-medium"}>
                        {item.variance > 0 ? "+" : ""}{item.variance}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.physical_count !== null && (
                      <span className={Math.abs(item.variance_percentage) < 5 ? "text-green-600" : "text-orange-600"}>
                        {item.variance_percentage.toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.physical_count === null ? (
                      <Badge variant="outline">Pending</Badge>
                    ) : item.variance === 0 ? (
                      <Badge className="bg-green-100 text-green-800">Match</Badge>
                    ) : (
                      <Badge variant="destructive">Variance</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setCountStarted(false)}>
          Cancel Count
        </Button>
        <Button 
          onClick={finalizeCycleCount}
          disabled={isProcessing || countItems.every(item => item.physical_count === null)}
        >
          {isProcessing ? "Processing..." : "Finalize Count"}
        </Button>
      </div>
    </div>
  );
};