import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useHistoricalConsumption, PeriodGranularity } from '@/hooks/useHistoricalConsumption';

interface HistoricalConsumptionTableProps {
  facilityId: number;
  facilityName?: string;
  onDataReady?: (hasData: boolean) => void;
}

export const HistoricalConsumptionTable: React.FC<HistoricalConsumptionTableProps> = ({
  facilityId,
  facilityName = "Current Facility",
  onDataReady
}) => {
  const [periodMonths, setPeriodMonths] = useState<number>(12);
  const [granularity, setGranularity] = useState<PeriodGranularity>('monthly');
  const { data, loading, error, fetchHistoricalConsumption } = useHistoricalConsumption(facilityId);

  useEffect(() => {
    if (facilityId) {
      fetchHistoricalConsumption(periodMonths, granularity);
    }
  }, [facilityId, periodMonths, granularity]);

  useEffect(() => {
    onDataReady?.(data?.products && data.products.length > 0);
  }, [data, onDataReady]);

  const handleRefresh = () => {
    fetchHistoricalConsumption(periodMonths, granularity);
  };

  const getCellColor = (consumption: number, average: number) => {
    if (consumption === 0) return 'text-muted-foreground';
    if (consumption > average * 1.5) return 'text-red-600 font-semibold';
    if (consumption > average * 1.2) return 'text-orange-600 font-medium';
    if (consumption < average * 0.5) return 'text-blue-600';
    return 'text-foreground';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p>Error loading historical data: {error}</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Historical Consumption Data
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {facilityName} - {data?.period_range.start} to {data?.period_range.end}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Period:</label>
              <Select value={periodMonths.toString()} onValueChange={(value) => setPeriodMonths(parseInt(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="18">18 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Granularity:</label>
              <Select value={granularity} onValueChange={(value) => setGranularity(value as PeriodGranularity)}>
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
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading consumption data...</span>
            </div>
          )}

          {/* Data Table */}
          {data && data.products.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {data.products.length} products
                </Badge>
                <Badge variant="outline">
                  {data.period_headers.length} periods
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48 sticky left-0 bg-background">Product</TableHead>
                      <TableHead className="w-20">Unit</TableHead>
                      <TableHead className="w-24">Total</TableHead>
                      <TableHead className="w-24">Average</TableHead>
                      {data.period_headers.map((header, index) => (
                        <TableHead key={index} className="text-center min-w-24">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium sticky left-0 bg-background">
                          {product.product_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-primary" />
                            {product.total_consumption.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {Math.round(product.average_consumption).toLocaleString()}
                        </TableCell>
                        {product.periods.map((period, index) => (
                          <TableCell 
                            key={index} 
                            className={`text-center ${getCellColor(period.consumption, product.average_consumption)}`}
                          >
                            {period.consumption > 0 ? period.consumption.toLocaleString() : '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-muted-foreground mt-4">
                <p>Color coding: <span className="text-red-600 font-semibold">High consumption ({'>'}150% avg)</span> • 
                <span className="text-orange-600 font-medium ml-2">Above average ({'>'}120% avg)</span> • 
                <span className="text-blue-600 ml-2">Low consumption ({'<'}50% avg)</span></p>
              </div>
            </div>
          )}

          {/* No Data State */}
          {data && data.products.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No consumption data found for the selected period.</p>
              <p className="text-sm mt-1">Try adjusting the time range or check if inventory transactions exist.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};