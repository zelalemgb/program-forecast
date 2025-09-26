import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { HistoricalInventoryData } from '@/hooks/useHistoricalInventoryData';

interface HistoricalInventoryTableProps {
  periods: string[];
  collapsedPeriods: { [key: number]: boolean };
  onTogglePeriod: (index: number) => void;
  data: HistoricalInventoryData[];
  loading: boolean;
}

export const HistoricalInventoryTable: React.FC<HistoricalInventoryTableProps> = ({
  periods,
  collapsedPeriods,
  onTogglePeriod,
  data,
  loading
}) => {
  // Group data by product
  const productData = data.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        name: item.product_name,
        periods: {}
      };
    }
    const periodName = new Date(item.period_start).toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    acc[item.product_id].periods[periodName] = item;
    return acc;
  }, {} as Record<string, { name: string; periods: Record<string, HistoricalInventoryData> }>);

  const getDataForProductPeriod = (productId: string, periodIndex: number) => {
    const periodName = periods[periodIndex]?.toLowerCase();
    return productData[productId]?.periods[periodName];
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r min-w-[200px]">Drug Name</TableHead>
              {periods.map((period, index) => (
                <TableHead key={index} className="text-center border-l relative" colSpan={collapsedPeriods[index] ? 1 : 9}>
                  <Collapsible>
                    <CollapsibleTrigger
                      className="flex items-center gap-1 hover:bg-muted/50 p-1 rounded"
                      onClick={() => onTogglePeriod(index)}
                    >
                      {collapsedPeriods[index] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {period}
                    </CollapsibleTrigger>
                  </Collapsible>
                </TableHead>
              ))}
            </TableRow>
            <TableRow>
              <TableHead className="sticky left-0 bg-background z-20 border-r"></TableHead>
              {periods.map((_, periodIndex) => (
                <React.Fragment key={periodIndex}>
                  {!collapsedPeriods[periodIndex] ? (
                    <>
                      <TableHead className="text-right text-xs">Beg.</TableHead>
                      <TableHead className="text-right text-xs">Rec.</TableHead>
                      <TableHead className="text-right text-xs">Iss.</TableHead>
                      <TableHead className="text-right text-xs">Adj.</TableHead>
                      <TableHead className="text-right text-xs">T.Out</TableHead>
                      <TableHead className="text-right text-xs">End</TableHead>
                      <TableHead className="text-right text-xs">S.Days</TableHead>
                      <TableHead className="text-right text-xs">Exp/Dam</TableHead>
                      <TableHead className="text-right text-xs border-r">Cons.</TableHead>
                    </>
                  ) : (
                    <TableHead className="text-right text-xs border-r">Consumption</TableHead>
                  )}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={periods.length * 9 + 1} className="text-center py-8">
                  Loading historical data...
                </TableCell>
              </TableRow>
            ) : Object.keys(productData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={periods.length * 9 + 1} className="text-center py-8 text-muted-foreground">
                  No historical inventory data available
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(productData).map(([productId, product]) => (
                <TableRow key={productId}>
                  <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                    {product.name}
                  </TableCell>
                  {periods.map((_, periodIndex) => {
                    const periodData = getDataForProductPeriod(productId, periodIndex);
                    
                    return (
                      <React.Fragment key={periodIndex}>
                        {!collapsedPeriods[periodIndex] ? (
                          <>
                            <TableCell className="text-right text-xs">
                              {periodData?.beginning_balance || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.receipts || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.issues || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.adjustments || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.transfers_out || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.ending_balance || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.stockout_days || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              {periodData?.losses_wastage || '-'}
                            </TableCell>
                            <TableCell className="text-right text-xs border-r font-medium">
                              {periodData?.consumption || '-'}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell className="text-right text-xs border-r font-medium text-primary">
                            {periodData?.consumption || '-'}
                          </TableCell>
                        )}
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