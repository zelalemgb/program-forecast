import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryTransaction {
  id: string;
  facility_id: number;
  product_id: string;
  user_id: string;
  transaction_type: 'receipt' | 'issue' | 'adjustment' | 'loss' | 'expired';
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  expiry_date?: string;
  transaction_date: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    unit?: string;
  };
}

export interface InventoryBalance {
  id: string;
  facility_id: number;
  product_id: string;
  current_stock: number;
  reorder_level: number;
  max_level: number;
  last_transaction_date?: string;
  last_updated: string;
  products?: {
    name: string;
    unit?: string;
  };
  facility?: {
    facility_name: string;
  };
}

export interface ConsumptionAnalytics {
  id: string;
  facility_id: number;
  product_id: string;
  period_start: string;
  period_end: string;
  consumption_quantity: number;
  adjustments: number;
  wastage: number;
  stockout_days: number;
  amc: number;
  created_at: string;
  updated_at: string;
  products?: {
    name: string;
    unit?: string;
  };
}

export const useInventoryData = (facilityId?: number) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [consumption, setConsumption] = useState<ConsumptionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryData = async () => {
    if (!facilityId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Fetch inventory balances
      const { data: balanceData, error: balanceError } = await supabase
        .from('inventory_balances')
        .select(`
          *,
          products(name, unit)
        `)
        .eq('facility_id', facilityId)
        .order('last_updated', { ascending: false });

      if (balanceError) throw balanceError;

      // Fetch recent transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: transactionData, error: transactionError } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          products(name, unit)
        `)
        .eq('facility_id', facilityId)
        .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch consumption analytics (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('consumption_analytics')
        .select(`
          *,
          products(name, unit)
        `)
        .eq('facility_id', facilityId)
        .gte('period_start', sixMonthsAgo.toISOString().split('T')[0])
        .order('period_start', { ascending: false });

      if (consumptionError) throw consumptionError;

      console.log('Fetched balances:', balanceData);
      console.log('Fetched transactions:', transactionData);
      console.log('Fetched consumption:', consumptionData);
      
      setBalances(balanceData as InventoryBalance[] || []);
      setTransactions(transactionData as InventoryTransaction[] || []);
      setConsumption(consumptionData as ConsumptionAnalytics[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'products'>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;

      // Refresh data
      await fetchInventoryData();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const calculateConsumptionForPeriod = async (startDate: string, endDate: string) => {
    if (!facilityId) return;
    
    try {
      const { error } = await supabase.rpc('calculate_consumption_analytics', {
        p_facility_id: facilityId,
        p_start_date: startDate,
        p_end_date: endDate
      });

      if (error) throw error;
      
      // Refresh consumption data
      await fetchInventoryData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to calculate consumption');
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, [facilityId]);

  return {
    transactions,
    balances,
    consumption,
    loading,
    error,
    addTransaction,
    calculateConsumptionForPeriod,
    refreshData: fetchInventoryData
  };
};