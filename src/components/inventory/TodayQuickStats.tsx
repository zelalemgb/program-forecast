import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuickStats {
  todayReceived: number;
  todayIssued: number;
  totalStock: number;
  criticalItems: number;
  lowStockItems: number;
}

interface DetailedItem {
  id: string;
  name: string;
  currentStock: number;
  reorderLevel?: number;
  minimumLevel?: number;
  quantity?: number;
  transactionDate?: string;
  transactionType?: string;
}

type ModalType = 'received' | 'issued' | 'critical' | 'lowStock' | 'totalStock' | null;

export const TodayQuickStats: React.FC = () => {
  const [stats, setStats] = useState<QuickStats>({
    todayReceived: 0,
    todayIssued: 0,
    totalStock: 0,
    criticalItems: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalData, setModalData] = useState<DetailedItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's transactions
        const { data: todayTransactions } = await supabase
          .from('inventory_transactions')
          .select('transaction_type, quantity')
          .eq('transaction_date', today);

        // Get inventory balances for stock levels
        const { data: inventoryBalances } = await supabase
          .from('inventory_balances')
          .select('current_stock, reorder_level, minimum_stock_level');

        // Calculate stats
        const todayReceived = todayTransactions
          ?.filter(t => t.transaction_type === 'receipt')
          ?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;

        const todayIssued = todayTransactions
          ?.filter(t => t.transaction_type === 'issue')
          ?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0;

        const totalStock = inventoryBalances
          ?.reduce((sum, b) => sum + (b.current_stock || 0), 0) || 0;

        const criticalItems = inventoryBalances
          ?.filter(b => (b.current_stock || 0) <= (b.reorder_level || 0))
          ?.length || 0;

        const lowStockItems = inventoryBalances
          ?.filter(b => 
            (b.current_stock || 0) > (b.reorder_level || 0) && 
            (b.current_stock || 0) <= ((b.minimum_stock_level || 0) * 1.2)
          )
          ?.length || 0;

        setStats({
          todayReceived,
          todayIssued,
          totalStock,
          criticalItems,
          lowStockItems,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchDetailedData = async (type: ModalType) => {
    if (!type) return;
    
    setModalLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      let data: DetailedItem[] = [];

      switch (type) {
        case 'received':
          const { data: receivedTransactions } = await supabase
            .from('inventory_transactions')
            .select('id, quantity, transaction_date, product_id')
            .eq('transaction_type', 'receipt')
            .eq('transaction_date', today);

          // Get product names for the transactions
          if (receivedTransactions && receivedTransactions.length > 0) {
            const productIds = receivedTransactions.map(t => t.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('product_reference')
              .select('id, canonical_name')
              .in('id', productIds);

            const productMap = products?.reduce((acc, p) => {
              acc[p.id] = p.canonical_name;
              return acc;
            }, {} as Record<string, string>) || {};

            data = receivedTransactions.map(item => ({
              id: item.id,
              name: productMap[item.product_id] || 'Unknown Product',
              quantity: item.quantity,
              transactionDate: item.transaction_date,
              transactionType: 'receipt',
              currentStock: 0
            }));
          }
          break;

        case 'issued':
          const { data: issuedTransactions } = await supabase
            .from('inventory_transactions')
            .select('id, quantity, transaction_date, product_id')
            .eq('transaction_type', 'issue')
            .eq('transaction_date', today);

          // Get product names for the transactions
          if (issuedTransactions && issuedTransactions.length > 0) {
            const productIds = issuedTransactions.map(t => t.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('product_reference')
              .select('id, canonical_name')
              .in('id', productIds);

            const productMap = products?.reduce((acc, p) => {
              acc[p.id] = p.canonical_name;
              return acc;
            }, {} as Record<string, string>) || {};

            data = issuedTransactions.map(item => ({
              id: item.id,
              name: productMap[item.product_id] || 'Unknown Product',
              quantity: item.quantity,
              transactionDate: item.transaction_date,
              transactionType: 'issue',
              currentStock: 0
            }));
          }
          break;

        case 'critical':
          const { data: criticalBalances } = await supabase
            .from('inventory_balances')
            .select('id, current_stock, reorder_level, product_id');
          
          // Get product names for critical items
          if (criticalBalances && criticalBalances.length > 0) {
            const productIds = criticalBalances.map(b => b.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('product_reference')
              .select('id, canonical_name')
              .in('id', productIds);

            const productMap = products?.reduce((acc, p) => {
              acc[p.id] = p.canonical_name;
              return acc;
            }, {} as Record<string, string>) || {};

            // Filter critical items (current stock <= reorder level)
            data = criticalBalances
              .filter(item => (item.current_stock || 0) <= (item.reorder_level || 0))
              .map(item => ({
                id: item.id,
                name: productMap[item.product_id] || 'Unknown Product',
                currentStock: item.current_stock,
                reorderLevel: item.reorder_level
              }));
          }
          break;

        case 'lowStock':
          const { data: lowStockBalances } = await supabase
            .from('inventory_balances')
            .select('id, current_stock, reorder_level, minimum_stock_level, product_id');
          
          // Get product names for low stock items
          if (lowStockBalances && lowStockBalances.length > 0) {
            const productIds = lowStockBalances.map(b => b.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('product_reference')
              .select('id, canonical_name')
              .in('id', productIds);

            const productMap = products?.reduce((acc, p) => {
              acc[p.id] = p.canonical_name;
              return acc;
            }, {} as Record<string, string>) || {};

            // Filter low stock items (current stock > reorder level but <= minimum * 1.2)
            data = lowStockBalances
              .filter(item => {
                const current = item.current_stock || 0;
                const reorder = item.reorder_level || 0;
                const minimum = item.minimum_stock_level || 0;
                return current > reorder && current <= (minimum * 1.2);
              })
              .map(item => ({
                id: item.id,
                name: productMap[item.product_id] || 'Unknown Product',
                currentStock: item.current_stock,
                reorderLevel: item.reorder_level,
                minimumLevel: item.minimum_stock_level
              }));
          }
          break;

        case 'totalStock':
          const { data: allStockBalances } = await supabase
            .from('inventory_balances')
            .select('id, current_stock, product_id')
            .gt('current_stock', 0);
          
          // Get product names for all stock items
          if (allStockBalances && allStockBalances.length > 0) {
            const productIds = allStockBalances.map(b => b.product_id).filter(Boolean);
            const { data: products } = await supabase
              .from('product_reference')
              .select('id, canonical_name')
              .in('id', productIds);

            const productMap = products?.reduce((acc, p) => {
              acc[p.id] = p.canonical_name;
              return acc;
            }, {} as Record<string, string>) || {};

            data = allStockBalances.map(item => ({
              id: item.id,
              name: productMap[item.product_id] || 'Unknown Product',
              currentStock: item.current_stock
            }));
          }
          break;
      }

      setModalData(data);
    } catch (error) {
      console.error('Error fetching detailed data:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCardClick = (type: ModalType) => {
    setModalType(type);
    fetchDetailedData(type);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'received': return 'Today\'s Received Items';
      case 'issued': return 'Today\'s Issued Items';
      case 'critical': return 'Critical Stock Items';
      case 'lowStock': return 'Low Stock Items';
      case 'totalStock': return 'All Stock Items';
      default: return 'Details';
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Loading today's stats...</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-primary/10 bg-gradient-to-r from-background to-primary/5">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-foreground">Today's Overview</div>
          <div className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-3">
          {/* Today Received */}
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCardClick('received')}
          >
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.todayReceived}</div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>

          {/* Today Issued */}
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCardClick('issued')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.todayIssued}</div>
              <div className="text-xs text-muted-foreground">Issued</div>
            </div>
          </div>

          {/* Total Stock */}
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCardClick('totalStock')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.totalStock}</div>
              <div className="text-xs text-muted-foreground">Total Stock</div>
            </div>
          </div>

          {/* Critical Items */}
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCardClick('critical')}
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{stats.criticalItems}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => handleCardClick('lowStock')}
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">{stats.lowStockItems}</div>
              <div className="text-xs text-muted-foreground">Low Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed information */}
      <Dialog open={modalType !== null} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalType === 'received' && <TrendingUp className="h-5 w-5 text-green-600" />}
              {modalType === 'issued' && <TrendingDown className="h-5 w-5 text-blue-600" />}
              {modalType === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
              {modalType === 'lowStock' && <Package className="h-5 w-5 text-yellow-600" />}
              {modalType === 'totalStock' && <Package className="h-5 w-5 text-primary" />}
              {getModalTitle()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[60vh]">
            {modalLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading details...</div>
              </div>
            ) : modalData.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">No items found</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    {(modalType === 'received' || modalType === 'issued') && (
                      <>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                      </>
                    )}
                    {(modalType === 'critical' || modalType === 'lowStock' || modalType === 'totalStock') && (
                      <>
                        <TableHead>Current Stock</TableHead>
                        {modalType !== 'totalStock' && <TableHead>Reorder Level</TableHead>}
                        {modalType === 'lowStock' && <TableHead>Minimum Level</TableHead>}
                        {modalType !== 'totalStock' && <TableHead>Status</TableHead>}
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modalData.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      {(modalType === 'received' || modalType === 'issued') && (
                        <>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.transactionDate}</TableCell>
                          <TableCell>
                            <Badge variant={item.transactionType === 'receipt' ? 'default' : 'secondary'}>
                              {item.transactionType === 'receipt' ? 'Received' : 'Issued'}
                            </Badge>
                          </TableCell>
                        </>
                      )}
                      {(modalType === 'critical' || modalType === 'lowStock' || modalType === 'totalStock') && (
                        <>
                          <TableCell>{item.currentStock}</TableCell>
                          {modalType !== 'totalStock' && <TableCell>{item.reorderLevel || 'N/A'}</TableCell>}
                          {modalType === 'lowStock' && <TableCell>{item.minimumLevel || 'N/A'}</TableCell>}
                          {modalType !== 'totalStock' && (
                            <TableCell>
                              <Badge 
                                variant={
                                  modalType === 'critical' ? 'destructive' : 
                                  modalType === 'lowStock' ? 'secondary' : 'default'
                                }
                              >
                                {modalType === 'critical' ? 'Critical' : 'Low Stock'}
                              </Badge>
                            </TableCell>
                          )}
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TodayQuickStats;