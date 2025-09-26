import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRolePermissions } from './useRolePermissions';
import { useCurrentUser } from './useCurrentUser';

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
  facility?: {
    facility_name: string;
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
  facility?: {
    facility_name: string;
  };
}

export const useRoleBasedInventoryData = (facilityId?: number) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [consumption, setConsumption] = useState<ConsumptionAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const permissions = useRolePermissions();
  const { facilityId: userFacilityId, woredaId, zoneId, regionId } = useCurrentUser();

  // Determine which facilities to query based on user role
  const getFacilityFilter = () => {
    // If specific facilityId provided, use it (for facility-level users)
    if (facilityId) return { facility_id: facilityId };
    
    // Role-based filtering
    if (permissions.isFacilityLevel && userFacilityId) {
      return { facility_id: userFacilityId };
    }
    
    // For hierarchical users, we need to join with facility table to filter by location
    return null; // Will use joins for higher-level filtering
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const facilityFilter = getFacilityFilter();
      
      // Build queries based on user permissions
      let balanceQuery = supabase.from('inventory_balances').select(`
        *,
        products(name, unit),
        facility!inner(facility_name, woreda_id)
      `);
      
      let transactionQuery = supabase.from('inventory_transactions').select(`
        *,
        products(name, unit),
        facility!inner(facility_name, woreda_id)
      `);
      
      let consumptionQuery = supabase.from('consumption_analytics').select(`
        *,
        products(name, unit),
        facility!inner(facility_name, woreda_id)
      `);

      // Apply role-based filtering
      if (facilityFilter) {
        // Facility-level users - direct filter
        balanceQuery = balanceQuery.eq('facility_id', facilityFilter.facility_id);
        transactionQuery = transactionQuery.eq('facility_id', facilityFilter.facility_id);
        consumptionQuery = consumptionQuery.eq('facility_id', facilityFilter.facility_id);
      } else {
        // Hierarchical users - filter by administrative scope
        if (permissions.canViewWoredasFacilities && woredaId) {
          balanceQuery = balanceQuery.eq('facility.woreda_id', woredaId);
          transactionQuery = transactionQuery.eq('facility.woreda_id', woredaId);
          consumptionQuery = consumptionQuery.eq('facility.woreda_id', woredaId);
        } else if (permissions.canViewZoneFacilities && zoneId) {
          // Join through woreda table for zone filtering
          balanceQuery = balanceQuery
            .eq('facility.woreda.zone_id', zoneId);
          transactionQuery = transactionQuery
            .eq('facility.woreda.zone_id', zoneId);
          consumptionQuery = consumptionQuery
            .eq('facility.woreda.zone_id', zoneId);
        } else if (permissions.canViewRegionalFacilities && regionId) {
          // Join through zone and woreda for regional filtering
          balanceQuery = balanceQuery
            .eq('facility.woreda.zone.region_id', regionId);
          transactionQuery = transactionQuery
            .eq('facility.woreda.zone.region_id', regionId);
          consumptionQuery = consumptionQuery
            .eq('facility.woreda.zone.region_id', regionId);
        }
        // National level users see all data (no additional filters)
      }

      // Apply time filters
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Execute queries
      const [balanceResult, transactionResult, consumptionResult] = await Promise.all([
        balanceQuery.order('last_updated', { ascending: false }),
        transactionQuery
          .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('transaction_date', { ascending: false }),
        consumptionQuery
          .gte('period_start', sixMonthsAgo.toISOString().split('T')[0])
          .order('period_start', { ascending: false })
      ]);

      if (balanceResult.error) throw balanceResult.error;
      if (transactionResult.error) throw transactionResult.error;
      if (consumptionResult.error) throw consumptionResult.error;

      setBalances(balanceResult.data as any[] || []);
      setTransactions(transactionResult.data as any[] || []);
      setConsumption(consumptionResult.data as any[] || []);
      
    } catch (err) {
      console.error('Inventory data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<InventoryTransaction, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'products' | 'facility'>) => {
    if (!permissions.canEditFacilityData && !permissions.isAdmin) {
      throw new Error('You do not have permission to add transactions');
    }

    try {
      // Create audit log entry
      await logAuditEvent('inventory_transaction_created', transaction);

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

  const logAuditEvent = async (action: string, data: any) => {
    try {
      await supabase.from('audit_log').insert([{
        table_name: 'inventory_transactions',
        record_id: data.id || 'new',
        action,
        new_values: data,
      }]);
    } catch (err) {
      console.error('Failed to log audit event:', err);
      // Don't fail the main operation for audit logging issues
    }
  };

  useEffect(() => {
    if (permissions.canViewOwnFacility || permissions.canViewWoredasFacilities || 
        permissions.canViewZoneFacilities || permissions.canViewRegionalFacilities || 
        permissions.canViewNationalData) {
      fetchInventoryData();
    }
  }, [permissions, facilityId, userFacilityId]);

  return {
    transactions,
    balances,
    consumption,
    loading,
    error,
    addTransaction: permissions.canEditFacilityData || permissions.isAdmin ? addTransaction : undefined,
    refreshData: fetchInventoryData,
    dataScope: permissions.dataScope,
    isReadOnly: permissions.isReadOnly,
    totalFacilities: balances.length > 0 ? new Set(balances.map(b => b.facility_id)).size : 0,
  };
};