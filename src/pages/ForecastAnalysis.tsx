import React, { useState, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistoricalConsumption, PeriodGranularity } from '@/hooks/useHistoricalConsumption';
import { useForecastIntegration } from '@/hooks/useForecastIntegration';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

const ForecastAnalysis: React.FC = () => {
  const [selectedGranularity, setSelectedGranularity] = useState<PeriodGranularity>('monthly');
  const [periodMonths, setPeriodMonths] = useState(12);
  const facilityId = 1; // This should come from context or user selection

  const { data: historicalData, loading: historicalLoading, fetchHistoricalConsumption } = useHistoricalConsumption(facilityId);
  const { generateForecastFromInventory } = useForecastIntegration();
  
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Fetch historical data when parameters change
  useEffect(() => {
    if (facilityId) {
      fetchHistoricalConsumption(periodMonths, selectedGranularity);
    }
  }, [facilityId, periodMonths, selectedGranularity, fetchHistoricalConsumption]);

  // Generate forecast data
  useEffect(() => {
    const generateForecast = async () => {
      if (facilityId && historicalData?.products?.length > 0) {
        setForecastLoading(true);
        try {
          const forecast = await generateForecastFromInventory(facilityId, periodMonths, 3);
          setForecastData(forecast);
        } catch (error) {
          console.error('Error generating forecast:', error);
        } finally {
          setForecastLoading(false);
        }
      }
    };

    generateForecast();
  }, [facilityId, historicalData, periodMonths, generateForecastFromInventory]);

  // Combine historical and forecast data
  const combinedData = useMemo(() => {
    if (!historicalData?.products) return [];

    return historicalData.products.map(product => {
      const forecast = forecastData.find(f => f.product_id === product.product_id);
      
      // Calculate trend from last two periods
      const periods = product.periods;
      const trend = periods.length >= 2 ? 
        periods[periods.length - 1].consumption - periods[periods.length - 2].consumption : 0;

      return {
        ...product,
        forecast_quantities: forecast ? [
          forecast.forecasted_quantity_1,
          forecast.forecasted_quantity_2, 
          forecast.forecasted_quantity_3
        ] : [0, 0, 0],
        trend,
        confidence: forecast?.confidence_score || 0
      };
    });
  }, [historicalData, forecastData]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default" className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge variant="outline" className="bg-red-100 text-red-800">Low</Badge>;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const titleActions = (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Period</Label>
        <Select 
          value={selectedGranularity} 
          onValueChange={(value: PeriodGranularity) => setSelectedGranularity(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Duration</Label>
        <Select 
          value={periodMonths.toString()} 
          onValueChange={(value) => setPeriodMonths(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6">6 Months</SelectItem>
            <SelectItem value="12">12 Months</SelectItem>
            <SelectItem value="18">18 Months</SelectItem>
            <SelectItem value="24">24 Months</SelectItem>
            <SelectItem value="36">36 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-2">
        <div>{historicalData?.products?.length || 0} products</div>
        <div>{historicalData?.period_headers?.length || 0} periods</div>
      </div>
    </div>
  );

  return (
    <PageLayout
      title="Forecast Analysis"
      description="Analyze historical consumption patterns and future demand forecasts"
      actions={titleActions}
    >
      <div className="space-y-6">
        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Pattern & Forecast Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {historicalLoading || forecastLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      <TableHead className="text-center">Unit</TableHead>
                      <TableHead className="text-center">Avg Consumption</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      {historicalData?.period_headers?.slice(-3).map((header, index) => (
                        <TableHead key={`hist-${index}`} className="text-center">
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="text-center bg-blue-50">Forecast P1</TableHead>
                      <TableHead className="text-center bg-blue-50">Forecast P2</TableHead>
                      <TableHead className="text-center bg-blue-50">Forecast P3</TableHead>
                      <TableHead className="text-center">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No consumption data available for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      combinedData.map((product) => (
                        <TableRow key={product.product_id}>
                          <TableCell className="font-medium">
                            {product.product_name}
                          </TableCell>
                          <TableCell className="text-center">{product.unit}</TableCell>
                          <TableCell className="text-center">
                            {formatNumber(product.average_consumption)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              {getTrendIcon(product.trend)}
                            </div>
                          </TableCell>
                          {product.periods.slice(-3).map((period, index) => (
                            <TableCell key={`period-${index}`} className="text-center">
                              {formatNumber(period.consumption)}
                            </TableCell>
                          ))}
                          {product.forecast_quantities.map((forecast, index) => (
                            <TableCell key={`forecast-${index}`} className="text-center bg-blue-50">
                              <span className="font-medium text-blue-700">
                                {formatNumber(forecast)}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            {getConfidenceBadge(product.confidence)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ForecastAnalysis;