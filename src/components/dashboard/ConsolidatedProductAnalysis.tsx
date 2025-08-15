import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { ForecastDataset } from "@/types/forecast";

export type ConsolidatedProductAnalysisProps = {
  rows: ForecastDataset["rows"];
  onPickProduct: (product: string) => void;
  selectedPrograms?: string[];
  selectedYears?: string[];
  limit?: number;
};

interface ProductAnalysis {
  product: string;
  programs: string[];
  years: string[];
  unit: string;
  totalForecasted: number;
  totalObserved: number;
  difference: number;
  accuracyScore: number;
  accuracyCategory: 'excellent' | 'good' | 'acceptable' | 'poor';
  abruptChange: {
    hasChange: boolean;
    maxChange: string;
    changeRatio: number;
  };
  calculationErrors: {
    hasError: boolean;
    errorType: string;
    errorCount: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const numberFmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const ConsolidatedProductAnalysis: React.FC<ConsolidatedProductAnalysisProps> = ({ 
  rows, 
  onPickProduct, 
  selectedPrograms = [],
  selectedYears = [],
  limit = 50 
}) => {
  const [issueData, setIssueData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Fetch issue data for accuracy calculation
  React.useEffect(() => {
    const fetchIssueData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("commodity_issues")
          .select("program, item_description, year, quantity");
        
        if (!error && data) {
          setIssueData(data);
        }
      } catch (error) {
        console.error("Error fetching issue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssueData();
  }, []);

  const analysisData = React.useMemo(() => {
    const productMap = new Map<string, ProductAnalysis>();

    // Group data by product
    rows.forEach((row) => {
      const productKey = row["Product List"];
      if (!productMap.has(productKey)) {
        productMap.set(productKey, {
          product: productKey,
          programs: [],
          years: [],
          unit: row.Unit || "",
          totalForecasted: 0,
          totalObserved: 0,
          difference: 0,
          accuracyScore: 0,
          accuracyCategory: 'poor',
          abruptChange: {
            hasChange: false,
            maxChange: "",
            changeRatio: 0
          },
          calculationErrors: {
            hasError: false,
            errorType: "",
            errorCount: 0
          },
          riskLevel: 'low'
        });
      }

      const analysis = productMap.get(productKey)!;
      
      // Add program and year if not already included
      if (!analysis.programs.includes(row.Program)) {
        analysis.programs.push(row.Program);
      }
      if (!analysis.years.includes(row.Year)) {
        analysis.years.push(row.Year);
      }

      // Accumulate values
      analysis.totalForecasted += row["Forecasted Total"] || 0;
      analysis.totalObserved += row["Opian Total"] || 0;
      analysis.difference += row["Observed difference"] || 0;
    });

    // Calculate abrupt changes for each product
    productMap.forEach((analysis, productKey) => {
      const productRows = rows.filter(r => r["Product List"] === productKey);
      const yearData = new Map<string, number>();
      
      productRows.forEach(r => {
        const year = r.Year || "";
        const qty = r["Forecasted Quantity"] || 0;
        yearData.set(year, (yearData.get(year) || 0) + qty);
      });

      const years = Array.from(yearData.keys()).sort((a, b) => parseInt(a) - parseInt(b));
      const thresholdUp = 2.0; // +100% or more increase
      const thresholdDown = 0.5; // -50% or more decrease
      
      let maxChangeRatio = 0;
      let maxChangeText = "";

      for (let i = 1; i < years.length; i++) {
        const prevQty = yearData.get(years[i - 1]) || 0;
        const currQty = yearData.get(years[i]) || 0;
        
        if (prevQty <= 0) continue;
        
        const ratio = currQty / prevQty;
        if (ratio >= thresholdUp || ratio <= thresholdDown) {
          const changeAbs = Math.abs(ratio - 1);
          if (changeAbs > maxChangeRatio) {
            maxChangeRatio = changeAbs;
            const pct = ((ratio - 1) * 100).toFixed(0);
            const sign = ratio >= 1 ? "+" : "";
            maxChangeText = `${years[i - 1]}→${years[i]}: ${sign}${pct}%`;
          }
        }
      }

      analysis.abruptChange = {
        hasChange: maxChangeRatio > 0,
        maxChange: maxChangeText,
        changeRatio: maxChangeRatio
      };
    });

    // Calculate accuracy scores using issue data
    if (issueData.length > 0) {
      productMap.forEach((analysis, productKey) => {
        // Find matching issue data with fuzzy matching
        const matchingIssues = issueData.filter(issue => {
          const issueProduct = issue.item_description?.toLowerCase().trim() || "";
          const forecastProduct = productKey.toLowerCase().trim();
          
          // Simple fuzzy matching
          return issueProduct.includes(forecastProduct.slice(0, 10)) ||
                 forecastProduct.includes(issueProduct.slice(0, 10)) ||
                 analysis.programs.some(prog => 
                   prog.toLowerCase() === issue.program?.toLowerCase()
                 );
        });

        if (matchingIssues.length > 0) {
          const totalIssueQty = matchingIssues.reduce((sum, issue) => 
            sum + (Number(issue.quantity) || 0), 0
          );
          
          // Calculate MAPE
          let mape = 0;
          const forecastQty = rows
            .filter(r => r["Product List"] === productKey)
            .reduce((sum, r) => sum + (r["Forecasted Quantity"] || 0), 0);

          if (totalIssueQty > 0) {
            mape = Math.abs(totalIssueQty - forecastQty) / totalIssueQty * 100;
          } else if (forecastQty > 0) {
            mape = 100;
          }

          analysis.accuracyScore = Math.round(mape * 100) / 100;
          
          // Categorize accuracy
          if (mape <= 10) analysis.accuracyCategory = 'excellent';
          else if (mape <= 20) analysis.accuracyCategory = 'good';
          else if (mape <= 25) analysis.accuracyCategory = 'acceptable';
          else analysis.accuracyCategory = 'poor';
        }
      });
    }

    // Detect calculation errors
    productMap.forEach((analysis, productKey) => {
      const productRows = rows.filter(r => r["Product List"] === productKey);
      let errorCount = 0;
      let errorTypes: string[] = [];

      productRows.forEach(row => {
        // Check for inconsistent unit prices
        const calculatedTotal = (row["Forecasted Quantity"] || 0) * (row["unit price"] || 0);
        const forecastedTotal = row["Forecasted Total"] || 0;
        
        if (Math.abs(calculatedTotal - forecastedTotal) > 0.01) {
          errorCount++;
          if (!errorTypes.includes("price calculation")) {
            errorTypes.push("price calculation");
          }
        }

        // Check for zero values where they shouldn't be
        if ((row["Forecasted Quantity"] || 0) > 0 && (row["unit price"] || 0) === 0) {
          errorCount++;
          if (!errorTypes.includes("missing price")) {
            errorTypes.push("missing price");
          }
        }

        // Check for negative values
        if ((row["Forecasted Quantity"] || 0) < 0 || (row["unit price"] || 0) < 0) {
          errorCount++;
          if (!errorTypes.includes("negative values")) {
            errorTypes.push("negative values");
          }
        }
      });

      analysis.calculationErrors = {
        hasError: errorCount > 0,
        errorType: errorTypes.join(", "),
        errorCount
      };
    });

    // Calculate risk levels
    productMap.forEach((analysis) => {
      let riskScore = 0;
      
      // Accuracy risk
      if (analysis.accuracyCategory === 'poor') riskScore += 3;
      else if (analysis.accuracyCategory === 'acceptable') riskScore += 2;
      else if (analysis.accuracyCategory === 'good') riskScore += 1;
      
      // Abrupt change risk
      if (analysis.abruptChange.hasChange) {
        if (analysis.abruptChange.changeRatio > 2) riskScore += 3;
        else if (analysis.abruptChange.changeRatio > 1) riskScore += 2;
        else riskScore += 1;
      }
      
      // Calculation error risk
      if (analysis.calculationErrors.hasError) {
        riskScore += Math.min(analysis.calculationErrors.errorCount, 3);
      }

      // Determine risk level
      if (riskScore >= 6) analysis.riskLevel = 'critical';
      else if (riskScore >= 4) analysis.riskLevel = 'high';
      else if (riskScore >= 2) analysis.riskLevel = 'medium';
      else analysis.riskLevel = 'low';
    });

    // Convert to array and sort by risk level, then by total forecasted value
    const analysisArray = Array.from(productMap.values())
      .sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const riskDiff = riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        if (riskDiff !== 0) return riskDiff;
        return b.totalForecasted - a.totalForecasted;
      })
      .slice(0, limit);

    return analysisArray;
  }, [rows, issueData, limit]);

  const getRiskBadge = (level: string) => {
    const variants = {
      critical: "destructive" as const,
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const
    };
    return (
      <Badge variant={variants[level as keyof typeof variants] || "outline"}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getAccuracyBadge = (category: string) => {
    const variants = {
      excellent: "default" as const,
      good: "secondary" as const, 
      acceptable: "outline" as const,
      poor: "destructive" as const
    };
    return (
      <Badge variant={variants[category as keyof typeof variants] || "destructive"}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle>Product Analysis Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Loading analysis data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Product Analysis Dashboard</CardTitle>
        <p className="text-sm text-muted-foreground">
          Consolidated view of forecast accuracy, calculation errors, and abrupt changes for all products
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Program(s)</TableHead>
                <TableHead>Years</TableHead>
                <TableHead className="text-right">Forecasted Total</TableHead>
                <TableHead className="text-right">Observed Total</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Abrupt Changes</TableHead>
                <TableHead>Calc Errors</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisData.map((item, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-accent/50 cursor-pointer"
                  onClick={() => onPickProduct(item.product)}
                  title={`View detailed analysis for ${item.product}`}
                >
                  <TableCell className="font-medium max-w-xs truncate" title={item.product}>
                    {item.product}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={item.programs.join(", ")}>
                    {item.programs.join(", ")}
                  </TableCell>
                  <TableCell>{item.years.sort().join(", ")}</TableCell>
                  <TableCell className="text-right">
                    ${numberFmt(item.totalForecasted)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${numberFmt(item.totalObserved)}
                  </TableCell>
                  <TableCell className={`text-right ${Math.abs(item.difference) > 0 ? "font-semibold" : ""}`}>
                    ${numberFmt(item.difference)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getAccuracyBadge(item.accuracyCategory)}
                      {item.accuracyScore > 0 && (
                        <div className="text-xs text-muted-foreground">
                          MAPE: {item.accuracyScore.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.abruptChange.hasChange ? (
                      <div className="space-y-1">
                        <Badge variant="destructive" className="text-xs">
                          Yes
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {item.abruptChange.maxChange}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.calculationErrors.hasError ? (
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {item.calculationErrors.errorCount} errors
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {item.calculationErrors.errorType}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">None</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getRiskBadge(item.riskLevel)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground space-y-2">
          <p><strong>Risk Levels:</strong></p>
          <div className="grid grid-cols-2 gap-2">
            <span>• <strong>Critical:</strong> Multiple major issues requiring immediate attention</span>
            <span>• <strong>High:</strong> Significant accuracy or calculation problems</span>
            <span>• <strong>Medium:</strong> Some concerns but manageable</span>
            <span>• <strong>Low:</strong> Minor or no issues detected</span>
          </div>
          <p className="mt-3">
            Showing up to {analysisData.length} products sorted by risk level and forecast value. 
            Click any row to view detailed product trends.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};