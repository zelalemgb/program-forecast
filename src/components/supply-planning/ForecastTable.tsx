import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ForecastData } from '@/hooks/useHistoricalInventoryData';

interface ForecastTableProps {
  periods: string[];
  data: ForecastData[];
  loading: boolean;
}

export const ForecastTable: React.FC<ForecastTableProps> = ({
  periods,
  data,
  loading
}) => {
  // Group data by product
  const productData = data.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        name: item.product_name,
        forecasts: {}
      };
    }
    acc[item.product_id].forecasts[item.period.toLowerCase()] = item;
    return acc;
  }, {} as Record<string, { name: string; forecasts: Record<string, ForecastData> }>);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800';
    if (score >= 0.8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.8) return 'Medium';
    return 'Low';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r min-w-[200px]">Drug Name</TableHead>
              {periods.map((period, index) => (
                <TableHead key={index} className="text-center border-l" colSpan={2}>
                  {period}
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r"></TableHead>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  <TableHead className="text-right text-xs">Predicted Consumption</TableHead>
                  <TableHead className="text-center text-xs border-r">Confidence</TableHead>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={periods.length * 2 + 1} className="text-center py-8">
                  Generating forecast...
                </TableCell>
              </TableRow>
            ) : Object.keys(productData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={periods.length * 2 + 1} className="text-center py-8 text-muted-foreground">
                  No forecast data available
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(productData).map(([productId, product]) => (
                <TableRow key={productId}>
                  <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                    {product.name}
                  </TableCell>
                  {periods.map((period, periodIndex) => {
                    const forecast = product.forecasts[period.toLowerCase()];
                    
                    return (
                      <React.Fragment key={periodIndex}>
                        <TableCell className="text-right text-xs font-medium text-primary">
                          {forecast?.predicted_consumption || '-'}
                        </TableCell>
                        <TableCell className="text-center text-xs border-r">
                          {forecast ? (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getConfidenceColor(forecast.confidence_score)}`}
                            >
                              {getConfidenceLabel(forecast.confidence_score)}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};