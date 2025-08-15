import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ForecastDataset } from "@/types/forecast";

export type AccuracyMetricsProps = {
  rows: ForecastDataset["rows"];
};

export const AccuracyMetrics: React.FC<AccuracyMetricsProps> = ({ rows }) => {
  const metrics = React.useMemo(() => {
    if (rows.length === 0) return null;

    let totalForecast = 0;
    let totalObserved = 0;
    let totalAbsError = 0;
    let totalSquaredError = 0;
    let validComparisons = 0;

    const programAccuracy = new Map<string, { forecast: number; observed: number; absError: number; count: number }>();

    rows.forEach(r => {
      const forecast = r["Forecasted Total"] || 0;
      const observed = r["Opian Total"] || 0;
      
      if (forecast > 0 && observed > 0) {
        totalForecast += forecast;
        totalObserved += observed;
        
        const absError = Math.abs(forecast - observed);
        const relativeError = absError / observed;
        
        totalAbsError += relativeError;
        totalSquaredError += relativeError * relativeError;
        validComparisons++;

        // Program-level accuracy
        const program = r.Program || "Unknown";
        if (!programAccuracy.has(program)) {
          programAccuracy.set(program, { forecast: 0, observed: 0, absError: 0, count: 0 });
        }
        const prog = programAccuracy.get(program)!;
        prog.forecast += forecast;
        prog.observed += observed;
        prog.absError += relativeError;
        prog.count++;
      }
    });

    if (validComparisons === 0) return null;

    // Calculate MAPE (Mean Absolute Percentage Error)
    const mape = (totalAbsError / validComparisons) * 100;
    
    // Calculate RMSE (Root Mean Square Error) as percentage
    const rmse = Math.sqrt(totalSquaredError / validComparisons) * 100;
    
    // Overall bias (positive = over-forecast, negative = under-forecast)
    const bias = ((totalForecast - totalObserved) / totalObserved) * 100;

    // Program-level MAPE
    const programMape = Array.from(programAccuracy.entries()).map(([program, data]) => ({
      program,
      mape: (data.absError / data.count) * 100,
      bias: ((data.forecast - data.observed) / data.observed) * 100,
      count: data.count
    })).sort((a, b) => a.mape - b.mape);

    return {
      mape,
      rmse,
      bias,
      totalComparisons: validComparisons,
      programMape
    };
  }, [rows]);

  if (!metrics) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle>Forecast Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No observed data available for accuracy analysis. Import historical data to see accuracy metrics.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAccuracyRating = (mape: number) => {
    if (mape <= 10) return { label: "Excellent", variant: "default" as const, color: "text-emerald-600" };
    if (mape <= 20) return { label: "Good", variant: "secondary" as const, color: "text-blue-600" };
    if (mape <= 30) return { label: "Fair", variant: "outline" as const, color: "text-yellow-600" };
    return { label: "Poor", variant: "destructive" as const, color: "text-red-600" };
  };

  const getBiasIcon = (bias: number) => {
    if (Math.abs(bias) <= 5) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (bias > 5) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-blue-500" />;
  };

  const getBiasLabel = (bias: number) => {
    if (Math.abs(bias) <= 5) return "Unbiased";
    if (bias > 5) return "Over-forecast";
    return "Under-forecast";
  };

  const overallRating = getAccuracyRating(metrics.mape);

  return (
    <div className="space-y-4">
      {/* Overall Accuracy */}
      <Card className="surface">
        <CardHeader>
          <CardTitle>Overall Forecast Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                <span className={overallRating.color}>{metrics.mape.toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                <Badge variant={overallRating.variant}>{overallRating.label}</Badge>
                <div className="text-sm text-muted-foreground">Mean Absolute Error</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getBiasIcon(metrics.bias)}
                <span className="text-3xl font-bold">{Math.abs(metrics.bias).toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                <Badge variant="outline">{getBiasLabel(metrics.bias)}</Badge>
                <div className="text-sm text-muted-foreground">Forecast Bias</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{metrics.rmse.toFixed(1)}%</div>
              <div className="space-y-2">
                <Badge variant="outline">RMSE</Badge>
                <div className="text-sm text-muted-foreground">Root Mean Square Error</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Based on {metrics.totalComparisons} forecast vs. observed comparisons
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Program-Level Accuracy */}
      <Card className="surface">
        <CardHeader>
          <CardTitle>Program-Level Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.programMape.map((prog, idx) => {
              const rating = getAccuracyRating(prog.mape);
              return (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{prog.program}</span>
                    <Badge variant={rating.variant} className="text-xs">{rating.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className={rating.color}>{prog.mape.toFixed(1)}% MAPE</div>
                      <div className="text-muted-foreground">{prog.count} comparisons</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getBiasIcon(prog.bias)}
                      <span className="text-muted-foreground">{Math.abs(prog.bias).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};