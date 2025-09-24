import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PeriodGranularity = 'weekly' | 'monthly' | 'bi-monthly' | 'quarterly' | 'yearly';

export interface ConsumptionPeriod {
  period_label: string;
  period_start: string;
  period_end: string;
  consumption: number;
}

export interface ProductConsumptionHistory {
  product_id: string;
  product_name: string;
  unit?: string;
  periods: ConsumptionPeriod[];
  total_consumption: number;
  average_consumption: number;
}

export interface HistoricalConsumptionData {
  products: ProductConsumptionHistory[];
  period_headers: string[];
  period_range: {
    start: string;
    end: string;
  };
}

export const useHistoricalConsumption = (facilityId?: number) => {
  const [data, setData] = useState<HistoricalConsumptionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePeriods = (
    startDate: Date,
    endDate: Date,
    granularity: PeriodGranularity
  ): { start: Date; end: Date; label: string }[] => {
    const periods = [];
    const current = new Date(startDate);

    while (current < endDate) {
      const periodStart = new Date(current);
      const periodEnd = new Date(current);
      let label = '';

      switch (granularity) {
        case 'weekly':
          periodEnd.setDate(periodEnd.getDate() + 6);
          label = `Week ${Math.ceil((periodStart.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;
          current.setDate(current.getDate() + 7);
          break;
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          periodEnd.setDate(0); // Last day of the month
          label = periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          current.setMonth(current.getMonth() + 1);
          break;
        case 'bi-monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 2);
          periodEnd.setDate(0);
          label = `${periodStart.toLocaleDateString('en-US', { month: 'short' })}-${periodEnd.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
          current.setMonth(current.getMonth() + 2);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          periodEnd.setDate(0);
          const quarter = Math.floor(periodStart.getMonth() / 3) + 1;
          label = `Q${quarter} ${periodStart.getFullYear()}`;
          current.setMonth(current.getMonth() + 3);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          periodEnd.setDate(0);
          label = periodStart.getFullYear().toString();
          current.setFullYear(current.getFullYear() + 1);
          break;
      }

      // Ensure we don't go beyond the end date
      if (periodEnd > endDate) {
        periodEnd.setTime(endDate.getTime());
      }

      periods.push({
        start: new Date(periodStart),
        end: new Date(periodEnd),
        label
      });

      if (periodEnd.getTime() >= endDate.getTime()) break;
    }

    return periods;
  };

  const fetchHistoricalConsumption = async (
    periodMonths: number = 12,
    granularity: PeriodGranularity = 'monthly'
  ) => {
    if (!facilityId) return;

    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - periodMonths);

      // Generate period structure based on granularity
      const periods = generatePeriods(startDate, endDate, granularity);

      // Fetch all transactions for the period
      const { data: transactionData, error: transactionError } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          products(name, unit)
        `)
        .eq('facility_id', facilityId)
        .eq('transaction_type', 'issue')
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true });

      if (transactionError) throw transactionError;

      // Group transactions by product
      const productTransactions = new Map<string, any[]>();
      transactionData?.forEach(transaction => {
        const productId = transaction.product_id;
        if (!productTransactions.has(productId)) {
          productTransactions.set(productId, []);
        }
        productTransactions.get(productId)!.push(transaction);
      });

      // Process each product's consumption history
      const products: ProductConsumptionHistory[] = [];
      const periodHeaders = periods.map(p => p.label);

      for (const [productId, transactions] of productTransactions.entries()) {
        if (transactions.length === 0) continue;

        const productName = transactions[0].products?.name || 'Unknown Product';
        const unit = transactions[0].products?.unit || 'units';

        // Calculate consumption for each period
        const periodConsumption: ConsumptionPeriod[] = periods.map(period => {
          const periodTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.transaction_date);
            return transactionDate >= period.start && transactionDate <= period.end;
          });

          const consumption = periodTransactions.reduce((sum, t) => sum + Math.abs(t.quantity || 0), 0);

          return {
            period_label: period.label,
            period_start: period.start.toISOString().split('T')[0],
            period_end: period.end.toISOString().split('T')[0],
            consumption
          };
        });

        const totalConsumption = periodConsumption.reduce((sum, p) => sum + p.consumption, 0);
        const averageConsumption = totalConsumption / periodConsumption.length;

        products.push({
          product_id: productId,
          product_name: productName,
          unit,
          periods: periodConsumption,
          total_consumption: totalConsumption,
          average_consumption: averageConsumption
        });
      }

      // Sort products by total consumption (descending)
      products.sort((a, b) => b.total_consumption - a.total_consumption);

      setData({
        products,
        period_headers: periodHeaders,
        period_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical consumption data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchHistoricalConsumption
  };
};