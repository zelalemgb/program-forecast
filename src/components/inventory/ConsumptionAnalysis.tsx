import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, Calendar, Filter } from "lucide-react";
import { useHistoricalConsumption } from "@/hooks/useHistoricalConsumption";
import { useForecastIntegration } from "@/hooks/useForecastIntegration";

interface ConsumptionAnalysisProps {
  facilityId: number;
}

type TimeGranularity = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const ConsumptionAnalysis: React.FC<ConsumptionAnalysisProps> = ({ facilityId }) => {
  const [selectedGranularity, setSelectedGranularity] = useState<TimeGranularity>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { data: historicalData, loading: historicalLoading, fetchHistoricalConsumption } = useHistoricalConsumption(facilityId);
  const { generateForecastFromInventory, loading: forecastLoading } = useForecastIntegration();
  
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [combinedAnalysis, setCombinedAnalysis] = useState<any[]>([]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    const periodMonths = {
      weekly: 3, // 3 months for weekly analysis
      monthly: 12, // 12 months for monthly analysis
      quarterly: 24, // 24 months (8 quarters) for quarterly analysis
      yearly: 36 // 36 months (3 years) for yearly analysis
    }[selectedGranularity];

    fetchHistoricalConsumption(periodMonths, selectedGranularity);
  }, [selectedGranularity, facilityId, fetchHistoricalConsumption]);

  // Generate forecasts when historical data is available
  useEffect(() => {
    if (historicalData && historicalData.products.length > 0) {
      generateForecastFromInventory(facilityId, 12, 3)
        .then(forecast => {
          setForecastData(forecast);
        })
        .catch(console.error);
    }
  }, [historicalData, facilityId, generateForecastFromInventory]);

  // Combine historical and forecast data
  useEffect(() => {
    if (historicalData && forecastData.length > 0) {
      const combined = historicalData.products
        .map(product => {
          const forecast = forecastData.find(f => f.productName === product.product_name);
          return {
            ...product,
            forecast: forecast || null
          };
        })
        .sort((a, b) => b.total_consumption - a.total_consumption)
        .slice(0, 20); // Top 20 products
      
      setCombinedAnalysis(combined);
    }
  }, [historicalData, forecastData]);

  const getGranularityLabel = (granularity: TimeGranularity) => {
    const labels = {
      weekly: 'Week',
      monthly: 'Month',
      quarterly: 'Quarter',
      yearly: 'Year'
    };
    return labels[granularity];
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-3 w-3 text-status-warning" />;
    }
    return <TrendingUp className="h-3 w-3 text-status-ok rotate-180" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (historicalLoading || forecastLoading) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="h-5 w-5" />
            Consumption Analysis & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="h-10 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
              <div className="h-10 bg-muted rounded w-32"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="h-5 w-5" />
          Consumption Analysis & Forecast
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-4">
          <Select value={selectedGranularity} onValueChange={(value: TimeGranularity) => setSelectedGranularity(value)}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="medicines">Medicines</SelectItem>
              <SelectItem value="supplies">Medical Supplies</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="essential">Essential</SelectItem>
              <SelectItem value="tracer">Tracer</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm min-w-[200px]">Product</TableHead>
                <TableHead className="text-xs sm:text-sm text-center">Total Consumption</TableHead>
                <TableHead className="text-xs sm:text-sm text-center">Avg per {getGranularityLabel(selectedGranularity)}</TableHead>
                {historicalData?.period_headers.slice(-3).map((period, index) => (
                  <TableHead key={index} className="text-xs sm:text-sm text-center min-w-[100px]">
                    {period}
                  </TableHead>
                ))}
                <TableHead className="text-xs sm:text-sm text-center bg-accent/10 min-w-[120px]">
                  Forecast (Next 3)
                </TableHead>
                <TableHead className="text-xs sm:text-sm text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combinedAnalysis.map((product, index) => {
                const recentPeriods = product.periods.slice(-3);
                const lastTwo = recentPeriods.slice(-2);
                const trend = lastTwo.length === 2 ? lastTwo[1].consumption - lastTwo[0].consumption : 0;
                
                return (
                  <TableRow key={product.productId || index}>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      <div className="min-w-0">
                        <div className="truncate">{product.product_name}</div>
                        <div className="text-xs text-muted-foreground">{product.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">
                      <div className="font-semibold">{formatNumber(product.total_consumption)}</div>
                    </TableCell>
                    <TableCell className="text-center text-xs sm:text-sm">
                      <div className="font-medium">{formatNumber(product.average_consumption)}</div>
                    </TableCell>
                    {recentPeriods.map((period, periodIndex) => (
                      <TableCell key={periodIndex} className="text-center text-xs sm:text-sm">
                        <div className="font-medium">{formatNumber(period.consumption)}</div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center text-xs sm:text-sm bg-accent/5">
                      <div className="font-semibold text-brand">
                        {product.forecast ? formatNumber(product.forecast.forecastedQuantity) : 'N/A'}
                      </div>
                      {product.forecast && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {Math.round(product.forecast.confidenceScore * 100)}% confidence
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(
                          recentPeriods[recentPeriods.length - 1]?.consumption || 0,
                          recentPeriods[recentPeriods.length - 2]?.consumption || 0
                        )}
                        <span className="text-xs">
                          {trend > 0 ? '+' : ''}{formatNumber(trend)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {combinedAnalysis.length === 0 && !historicalLoading && (
          <div className="text-center py-8 text-muted-foreground p-4">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No consumption data available</p>
            <p className="text-sm">Start recording inventory transactions to see consumption patterns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};