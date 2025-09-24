import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, TrendingUp, Package, DollarSign } from 'lucide-react';
import { ForecastSummary } from '@/hooks/useForecastSummary';
import { format } from 'date-fns';

interface ForecastSummaryCardProps {
  summary: ForecastSummary;
  onView: (summary: ForecastSummary) => void;
  onAdjust: (summary: ForecastSummary) => void;
}

export const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({
  summary,
  onView,
  onAdjust,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'adjusted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isAdjusted = summary.current_total_value !== summary.original_total_value;
  const savingsAmount = summary.original_total_value - summary.current_total_value;
  const savingsPercentage = summary.original_total_value > 0 
    ? ((savingsAmount / summary.original_total_value) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg mb-1">{summary.name}</CardTitle>
            <CardDescription>{summary.description}</CardDescription>
          </div>
          <Badge className={getStatusColor(summary.status)}>
            {summary.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Package className="w-4 h-4 mr-2" />
              {summary.total_line_items} items
            </div>
            {summary.facility_name && (
              <div className="text-sm text-muted-foreground">
                {summary.facility_name}
              </div>
            )}
            {summary.account_type && (
              <Badge variant="outline" className="text-xs">
                {summary.account_type}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-1" />
              {summary.current_total_value.toLocaleString()}
            </div>
            {isAdjusted && (
              <div className="flex items-center justify-end text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span className={savingsAmount > 0 ? "text-green-600" : "text-red-600"}>
                  {savingsAmount > 0 ? "Saved" : "Increased"} {Math.abs(savingsPercentage).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {summary.available_budget && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Budget Utilization:</span>
              <span className="font-medium">
                {((summary.current_total_value / summary.available_budget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-background rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min((summary.current_total_value / summary.available_budget) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Created {format(new Date(summary.created_at), 'MMM dd, yyyy')}
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(summary)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => onAdjust(summary)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Adjust
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};