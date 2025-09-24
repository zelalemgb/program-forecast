import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConsumptionAnalytics } from './useInventoryData';

export interface ForecastDataSource {
  id: string;
  forecast_row_id: string;
  source_type: 'inventory' | 'manual' | 'import';
  source_reference_id?: string;
  confidence_score?: number;
  data_quality_flags?: any;
  created_at: string;
}

export interface ForecastFromInventory {
  product_id: string;
  product_name: string;
  unit?: string;
  forecasted_quantity: number;
  unit_price: number;
  forecasted_total: number;
  confidence_score: number;
  data_source: 'inventory';
  source_period: string;
  amc: number;
  consumption_trend: number;
}

export const useForecastIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateForecastFromInventory = async (
    facilityId: number,
    periodMonths: number = 12,
    forecastPeriodMonths: number = 12
  ): Promise<ForecastFromInventory[]> => {
    try {
      setLoading(true);
      setError(null);

      // Calculate the period for historical data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - periodMonths);

      // Fetch consumption analytics for the facility
      const { data: consumptionData, error: consumptionError } = await supabase
        .from('consumption_analytics')
        .select(`
          *,
          products(name, unit)
        `)
        .eq('facility_id', facilityId)
        .gte('period_start', startDate.toISOString().split('T')[0])
        .lte('period_end', endDate.toISOString().split('T')[0])
        .order('period_start', { ascending: true });

      if (consumptionError) throw consumptionError;

      if (!consumptionData || consumptionData.length === 0) {
        throw new Error('No consumption data available for forecasting');
      }

      // Group by product and calculate forecast
      const productConsumption = new Map<string, ConsumptionAnalytics[]>();
      
      consumptionData.forEach(item => {
        const productId = item.product_id;
        if (!productConsumption.has(productId)) {
          productConsumption.set(productId, []);
        }
        productConsumption.get(productId)!.push(item);
      });

      const forecasts: ForecastFromInventory[] = [];

      for (const [productId, periods] of productConsumption.entries()) {
        if (periods.length < 3) continue; // Need at least 3 periods for meaningful forecast

        // Calculate trend and average consumption
        const avgConsumption = periods.reduce((sum, p) => sum + p.consumption_quantity, 0) / periods.length;
        const avgAMC = periods.reduce((sum, p) => sum + p.amc, 0) / periods.length;
        
        // Simple trend calculation (linear regression would be better)
        const firstHalf = periods.slice(0, Math.floor(periods.length / 2));
        const secondHalf = periods.slice(Math.floor(periods.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.consumption_quantity, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.consumption_quantity, 0) / secondHalf.length;
        
        const trendFactor = secondHalfAvg / firstHalfAvg;
        const consumptionTrend = (trendFactor - 1) * 100; // Percentage change
        
        // Apply trend to forecast
        const trendAdjustedConsumption = avgConsumption * Math.max(0.5, Math.min(2.0, trendFactor));
        const forecastedQuantity = trendAdjustedConsumption * forecastPeriodMonths;
        
        // Estimate unit price (could be improved with actual price data)
        const estimatedUnitPrice = 2.50; // Default price, should come from product reference or recent procurement data
        
        // Calculate confidence score based on data consistency
        const variance = periods.reduce((sum, p) => sum + Math.pow(p.consumption_quantity - avgConsumption, 2), 0) / periods.length;
        const coefficientOfVariation = Math.sqrt(variance) / avgConsumption;
        const confidence = Math.max(0.3, Math.min(1.0, 1 - coefficientOfVariation));

        const productName = periods[0].products?.name || 'Unknown Product';
        const unit = periods[0].products?.unit || 'units';

        forecasts.push({
          product_id: productId,
          product_name: productName,
          unit,
          forecasted_quantity: Math.round(forecastedQuantity),
          unit_price: estimatedUnitPrice,
          forecasted_total: Math.round(forecastedQuantity * estimatedUnitPrice),
          confidence_score: confidence,
          data_source: 'inventory',
          source_period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          amc: avgAMC,
          consumption_trend: consumptionTrend
        });
      }

      return forecasts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate forecast from inventory data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const saveForecastWithSource = async (
    forecastData: ForecastFromInventory[],
    userId: string,
    program: string,
    year: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Insert forecast rows
      const forecastRows = forecastData.map(item => ({
        user_id: userId,
        program,
        product_list: item.product_name,
        unit: item.unit,
        year,
        forecasted_quantity: item.forecasted_quantity,
        unit_price: item.unit_price,
        forecasted_total: item.forecasted_total
      }));

      const { data: savedRows, error: forecastError } = await supabase
        .from('forecast_rows')
        .insert(forecastRows)
        .select();

      if (forecastError) throw forecastError;

      // Insert forecast data sources
      const dataSources = savedRows?.map((row, index) => ({
        forecast_row_id: row.id,
        source_type: 'inventory' as const,
        confidence_score: forecastData[index].confidence_score,
        data_quality_flags: {
          source_period: forecastData[index].source_period,
          amc: forecastData[index].amc,
          consumption_trend: forecastData[index].consumption_trend
        }
      })) || [];

      const { error: sourceError } = await supabase
        .from('forecast_data_sources')
        .insert(dataSources);

      if (sourceError) throw sourceError;

      return savedRows;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save forecast data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getForecastDataSources = async (forecastRowId: string): Promise<ForecastDataSource[]> => {
    try {
      const { data, error } = await supabase
        .from('forecast_data_sources')
        .select('*')
        .eq('forecast_row_id', forecastRowId);

      if (error) throw error;
      return (data as ForecastDataSource[]) || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch forecast data sources');
    }
  };

  return {
    loading,
    error,
    generateForecastFromInventory,
    saveForecastWithSource,
    getForecastDataSources
  };
};