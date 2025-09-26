import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface QuickStats {
  todayReceived: number;
  todayIssued: number;
  totalStock: number;
  criticalItems: number;
  lowStockItems: number;
}

export const TodayQuickStats: React.FC = () => {
  const [stats, setStats] = useState<QuickStats>({
    todayReceived: 0,
    todayIssued: 0,
    totalStock: 0,
    criticalItems: 0,
    lowStockItems: 0,
  });
  const [loading, setLoading] = useState(true);

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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.todayReceived}</div>
              <div className="text-xs text-muted-foreground">Received</div>
            </div>
          </div>

          {/* Today Issued */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.todayIssued}</div>
              <div className="text-xs text-muted-foreground">Issued</div>
            </div>
          </div>

          {/* Total Stock */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{stats.totalStock}</div>
              <div className="text-xs text-muted-foreground">Total Stock</div>
            </div>
          </div>

          {/* Critical Items */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{stats.criticalItems}</div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="flex items-center gap-2">
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
    </Card>
  );
};

export default TodayQuickStats;