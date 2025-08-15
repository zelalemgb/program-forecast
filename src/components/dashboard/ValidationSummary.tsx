import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import type { ForecastDataset } from "@/types/forecast";

export type ValidationSummaryProps = {
  rows: ForecastDataset["rows"];
  onViewIssues: (type: string) => void;
};

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({ rows, onViewIssues }) => {
  const validation = React.useMemo(() => {
    const missingUnits = rows.filter(r => !r.Unit || String(r.Unit).trim() === "");
    const zeroNegativePrices = rows.filter(r => (r["unit price"] ?? 0) <= 0);
    const zeroNegativeTotals = rows.filter(r => (r["Forecasted Total"] ?? 0) <= 0);
    const missingYears = rows.filter(r => !r.Year || String(r.Year).trim() === "");
    
    // Anomaly detection
    const productQtyMap = new Map<string, Array<{ year: string; qty: number }>>();
    rows.forEach(r => {
      const product = r["Product List"];
      if (!productQtyMap.has(product)) productQtyMap.set(product, []);
      productQtyMap.get(product)!.push({ 
        year: r.Year || "", 
        qty: r["Forecasted Quantity"] || 0 
      });
    });
    
    const anomalies = Array.from(productQtyMap.entries()).filter(([_, data]) => {
      if (data.length < 2) return false;
      const sorted = data.sort((a, b) => a.year.localeCompare(b.year));
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1].qty;
        const curr = sorted[i].qty;
        if (prev > 0 && (curr / prev >= 3 || curr / prev <= 0.3)) {
          return true; // >200% increase or >70% decrease
        }
      }
      return false;
    });

    // Logical errors
    const priceConsistency = new Map<string, Set<number>>();
    rows.forEach(r => {
      const product = r["Product List"];
      const price = r["unit price"] || 0;
      if (price > 0) {
        if (!priceConsistency.has(product)) priceConsistency.set(product, new Set());
        priceConsistency.get(product)!.add(price);
      }
    });
    
    const inconsistentPrices = Array.from(priceConsistency.entries()).filter(([_, prices]) => {
      if (prices.size <= 1) return false;
      const priceArray = Array.from(prices);
      const max = Math.max(...priceArray);
      const min = Math.min(...priceArray);
      return max / min > 2; // More than 100% price difference
    });

    // Calculate overall health score
    const totalRows = rows.length;
    const totalIssues = missingUnits.length + zeroNegativePrices.length + 
                       zeroNegativeTotals.length + missingYears.length + 
                       anomalies.length + inconsistentPrices.length;
    
    let healthScore = 100;
    if (totalRows > 0) {
      healthScore = Math.max(0, 100 - (totalIssues / totalRows) * 100);
    }

    return {
      healthScore,
      dataQuality: {
        missingUnits: missingUnits.length,
        zeroNegativePrices: zeroNegativePrices.length,
        zeroNegativeTotals: zeroNegativeTotals.length,
        missingYears: missingYears.length,
      },
      anomalies: anomalies.length,
      logicalErrors: inconsistentPrices.length,
      totalIssues,
      totalRows
    };
  }, [rows]);

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      <Card className="surface border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Forecast Health Score</CardTitle>
            {getHealthIcon(validation.healthScore)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              <span className={getHealthColor(validation.healthScore)}>
                {Math.round(validation.healthScore)}%
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={validation.healthScore >= 90 ? "default" : validation.healthScore >= 70 ? "secondary" : "destructive"}>
                  {getHealthStatus(validation.healthScore)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {validation.totalIssues} issues in {validation.totalRows} records
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    validation.healthScore >= 90 ? "bg-emerald-500" : 
                    validation.healthScore >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${validation.healthScore}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {validation.totalIssues > 0 && (
        <Card className="surface border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">Critical Issues Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {validation.dataQuality.missingUnits > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Missing Units</div>
                  <div className="text-2xl font-bold text-destructive">{validation.dataQuality.missingUnits}</div>
                  <Button variant="outline" size="sm" onClick={() => onViewIssues("missing-units")}>
                    View Details
                  </Button>
                </div>
              )}
              
              {validation.dataQuality.zeroNegativePrices > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Invalid Prices</div>
                  <div className="text-2xl font-bold text-destructive">{validation.dataQuality.zeroNegativePrices}</div>
                  <Button variant="outline" size="sm" onClick={() => onViewIssues("invalid-prices")}>
                    View Details
                  </Button>
                </div>
              )}
              
              {validation.anomalies > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Anomalies</div>
                  <div className="text-2xl font-bold text-yellow-600">{validation.anomalies}</div>
                  <Button variant="outline" size="sm" onClick={() => onViewIssues("anomalies")}>
                    View Details
                  </Button>
                </div>
              )}
              
              {validation.logicalErrors > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Logical Errors</div>
                  <div className="text-2xl font-bold text-yellow-600">{validation.logicalErrors}</div>
                  <Button variant="outline" size="sm" onClick={() => onViewIssues("logical-errors")}>
                    View Details
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Success State */}
      {validation.totalIssues === 0 && validation.totalRows > 0 && (
        <Card className="surface border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <div className="font-medium text-emerald-700">No Critical Issues Found</div>
              <div className="text-sm text-muted-foreground">Your forecast data passed all validation checks</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};