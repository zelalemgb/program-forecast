import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ForecastSummary {
  id: string;
  name: string;
  description?: string;
  facility_name?: string;
  account_type?: string;
  forecast_duration: number;
  total_line_items: number;
  original_total_value: number;
  current_total_value: number;
  available_budget?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastSummaryItem {
  id: string;
  forecast_summary_id: string;
  forecast_row_id: string;
  current_quantity: number;
  current_price: number;
  current_total: number;
}

export interface ForecastAdjustment {
  id: string;
  forecast_summary_id: string;
  forecast_row_id: string;
  adjustment_type: string;
  old_value: number;
  new_value: number;
  reason?: string;
  adjusted_at: string;
}

export const useForecastSummary = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveForecastSummary = async (
    forecastData: any[],
    summaryData: {
      name: string;
      description?: string;
      facility_name?: string;
      account_type?: string;
      forecast_duration: number;
      available_budget?: number;
    }
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      const totalValue = forecastData.reduce((sum, item) => 
        sum + (item.forecastedQuantity || 0) * (item.unitPrice || 0), 0
      );

      // Create forecast summary
      const { data: summary, error: summaryError } = await supabase
        .from('forecast_summaries')
        .insert({
          user_id: user.id,
          name: summaryData.name,
          description: summaryData.description,
          facility_name: summaryData.facility_name,
          account_type: summaryData.account_type,
          forecast_duration: summaryData.forecast_duration,
          total_line_items: forecastData.length,
          original_total_value: totalValue,
          current_total_value: totalValue,
          available_budget: summaryData.available_budget,
        })
        .select()
        .single();

      if (summaryError) throw summaryError;

      // Save forecast rows first
      const { data: forecastRows, error: rowsError } = await supabase
        .from('forecast_rows')
        .insert(
          forecastData.map(item => ({
            user_id: user.id,
            program: summaryData.account_type || 'general',
            product_list: item.productName,
            forecasted_quantity: item.forecastedQuantity,
            unit_price: item.unitPrice,
            forecasted_total: (item.forecastedQuantity || 0) * (item.unitPrice || 0),
            year: new Date().getFullYear().toString(),
          }))
        )
        .select();

      if (rowsError) throw rowsError;

      // Create summary items linking to forecast rows
      if (forecastRows) {
        const summaryItems = forecastRows.map((row, index) => ({
          forecast_summary_id: summary.id,
          forecast_row_id: row.id,
          current_quantity: forecastData[index].forecastedQuantity || 0,
          current_price: forecastData[index].unitPrice || 0,
          current_total: (forecastData[index].forecastedQuantity || 0) * (forecastData[index].unitPrice || 0),
        }));

        const { error: itemsError } = await supabase
          .from('forecast_summary_items')
          .insert(summaryItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Forecast summary saved successfully",
      });

      return summary;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save forecast summary",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getForecastSummaries = async (): Promise<ForecastSummary[]> => {
    setLoading(true);
    try {
      console.log('Fetching forecast summaries...');
      const { data, error } = await supabase
        .from('forecast_summaries')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Forecast summaries query result:', { data, error });
      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error in getForecastSummaries:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch forecast summaries",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getForecastSummaryDetails = async (summaryId: string) => {
    setLoading(true);
    try {
      const [summaryResult, itemsResult] = await Promise.all([
        supabase
          .from('forecast_summaries')
          .select('*')
          .eq('id', summaryId)
          .single(),
        supabase
          .from('forecast_summary_items')
          .select('*')
          .eq('forecast_summary_id', summaryId)
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        summary: summaryResult.data,
        items: itemsResult.data || []
      };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch forecast details",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateForecastItem = async (
    summaryId: string,
    itemId: string,
    updates: {
      current_quantity?: number;
      current_price?: number;
    },
    reason?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current item data
      const { data: currentItem, error: fetchError } = await supabase
        .from('forecast_summary_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) throw fetchError;

      // Update the item
      const newQuantity = updates.current_quantity ?? currentItem.current_quantity;
      const newPrice = updates.current_price ?? currentItem.current_price;
      const newTotal = newQuantity * newPrice;

      const { error: updateError } = await supabase
        .from('forecast_summary_items')
        .update({
          current_quantity: newQuantity,
          current_price: newPrice,
          current_total: newTotal,
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      // Record adjustments
      if (updates.current_quantity !== undefined && updates.current_quantity !== currentItem.current_quantity) {
        await supabase
          .from('forecast_adjustments')
          .insert({
            forecast_summary_id: summaryId,
            forecast_row_id: currentItem.forecast_row_id,
            adjustment_type: 'quantity',
            old_value: currentItem.current_quantity,
            new_value: updates.current_quantity,
            reason: reason,
            adjusted_by: user.id,
          });
      }

      if (updates.current_price !== undefined && updates.current_price !== currentItem.current_price) {
        await supabase
          .from('forecast_adjustments')
          .insert({
            forecast_summary_id: summaryId,
            forecast_row_id: currentItem.forecast_row_id,
            adjustment_type: 'price',
            old_value: currentItem.current_price,
            new_value: updates.current_price,
            reason: reason,
            adjusted_by: user.id,
          });
      }

      // Update summary totals
      const { data: allItems, error: itemsError } = await supabase
        .from('forecast_summary_items')
        .select('current_total')
        .eq('forecast_summary_id', summaryId);

      if (itemsError) throw itemsError;

      const newTotalValue = allItems?.reduce((sum, item) => sum + item.current_total, 0) || 0;

      await supabase
        .from('forecast_summaries')
        .update({ current_total_value: newTotalValue })
        .eq('id', summaryId);

      toast({
        title: "Success",
        description: "Forecast item updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update forecast item",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAdjustmentHistory = async (summaryId: string): Promise<ForecastAdjustment[]> => {
    try {
      const { data, error } = await supabase
        .from('forecast_adjustments')
        .select('*')
        .eq('forecast_summary_id', summaryId)
        .order('adjusted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch adjustment history",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    loading,
    saveForecastSummary,
    getForecastSummaries,
    getForecastSummaryDetails,
    updateForecastItem,
    getAdjustmentHistory,
  };
};