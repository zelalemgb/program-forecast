import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, DollarSign, Package, Calendar } from "lucide-react";
import type { ForecastDataset } from "@/types/forecast";

export type ActionableInsightsProps = {
  rows: ForecastDataset["rows"];
  onTakeAction: (action: string, data?: any) => void;
};

export const ActionableInsights: React.FC<ActionableInsightsProps> = ({ rows, onTakeAction }) => {
  const insights = React.useMemo(() => {
    if (rows.length === 0) return [];

    const actions = [];

    // High-impact data quality issues
    const missingUnits = rows.filter(r => !r.Unit || String(r.Unit).trim() === "");
    if (missingUnits.length > 0) {
      actions.push({
        id: "fix-missing-units",
        priority: "high",
        type: "data-quality",
        title: "Fix Missing Product Units",
        description: `${missingUnits.length} products missing unit specifications`,
        impact: "Prevents accurate quantity planning",
        action: "Review and standardize units",
        icon: Package,
        data: missingUnits
      });
    }

    // Budget vs forecast misalignment
    const highValueItems = rows
      .filter(r => (r["Forecasted Total"] || 0) > 100000)
      .sort((a, b) => (b["Forecasted Total"] || 0) - (a["Forecasted Total"] || 0))
      .slice(0, 5);
    
    if (highValueItems.length > 0) {
      const totalValue = highValueItems.reduce((sum, r) => sum + (r["Forecasted Total"] || 0), 0);
      actions.push({
        id: "review-high-value",
        priority: "medium",
        type: "budget",
        title: "Review High-Value Forecasts",
        description: `Top 5 items represent $${(totalValue / 1000000).toFixed(1)}M`,
        impact: "Large budget implications",
        action: "Validate assumptions",
        icon: DollarSign,
        data: highValueItems
      });
    }

    // Abrupt changes detection
    const productChanges = new Map<string, Array<{ year: string; qty: number; total: number }>>();
    rows.forEach(r => {
      const product = r["Product List"];
      if (!productChanges.has(product)) productChanges.set(product, []);
      productChanges.get(product)!.push({
        year: r.Year || "",
        qty: r["Forecasted Quantity"] || 0,
        total: r["Forecasted Total"] || 0
      });
    });

    const abruptChanges = Array.from(productChanges.entries()).filter(([_, data]) => {
      if (data.length < 2) return false;
      const sorted = data.sort((a, b) => a.year.localeCompare(b.year));
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1].qty;
        const curr = sorted[i].qty;
        if (prev > 0 && (curr / prev >= 2.5 || curr / prev <= 0.4)) {
          return true;
        }
      }
      return false;
    });

    if (abruptChanges.length > 0) {
      actions.push({
        id: "investigate-changes",
        priority: "high",
        type: "anomaly",
        title: "Investigate Abrupt Changes",
        description: `${abruptChanges.length} products show significant year-over-year changes`,
        impact: "May indicate data errors or major program changes",
        action: "Review and validate",
        icon: TrendingUp,
        data: abruptChanges
      });
    }

    // Forecast accuracy issues (if observed data available)
    const observedData = rows.filter(r => (r["Opian Total"] || 0) > 0);
    if (observedData.length > 0) {
      const highErrorItems = observedData.filter(r => {
        const forecast = r["Forecasted Total"] || 0;
        const observed = r["Opian Total"] || 0;
        if (observed === 0) return false;
        const error = Math.abs(forecast - observed) / observed;
        return error > 0.5; // >50% error
      });

      if (highErrorItems.length > 0) {
        actions.push({
          id: "improve-accuracy",
          priority: "medium",
          type: "accuracy",
          title: "Improve Forecast Accuracy",
          description: `${highErrorItems.length} items with >50% forecast error`,
          impact: "Poor planning accuracy affects supply security",
          action: "Refine forecasting methods",
          icon: AlertTriangle,
          data: highErrorItems
        });
      }
    }

    // Missing year data
    const missingYears = rows.filter(r => !r.Year || String(r.Year).trim() === "");
    if (missingYears.length > 0) {
      actions.push({
        id: "fix-missing-years",
        priority: "high",
        type: "data-quality",
        title: "Fix Missing Year Data",
        description: `${missingYears.length} records missing year information`,
        impact: "Prevents time-series analysis",
        action: "Complete year data",
        icon: Calendar,
        data: missingYears
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  }, [rows]);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high": return "destructive" as const;
      case "medium": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      default: return "border-l-blue-500";
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">No immediate actions required</div>
            <div className="text-sm text-muted-foreground">
              Your forecast data looks good! Regular monitoring is recommended.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Recommended Actions</CardTitle>
        <div className="text-sm text-muted-foreground">
          Priority actions to improve your forecast quality and accuracy
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={`border-l-4 ${getPriorityColor(insight.priority)} bg-muted/30 rounded-r-lg p-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant={getPriorityVariant(insight.priority)} className="text-xs">
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">Impact:</span> {insight.impact}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTakeAction(insight.id, insight.data)}
                  >
                    {insight.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};