import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DrugAccuracyData {
  program: string;
  year: string;
  productName: string;
  forecastQuantity: number;
  issueQuantity: number;
  mape: number;
  accuracyCategory: 'excellent' | 'good' | 'acceptable' | 'poor';
}

interface ForecastAccuracyChartProps {
  selectedPrograms?: string[];
  selectedYears?: string[];
}

export const ForecastAccuracyChart: React.FC<ForecastAccuracyChartProps> = ({
  selectedPrograms = [],
  selectedYears = []
}) => {
  const [accuracyData, setAccuracyData] = React.useState<DrugAccuracyData[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchAccuracyData = async () => {
      setLoading(true);
      try {
        // Fetch forecast data
        const { data: forecastData, error: forecastError } = await supabase
          .from("forecast_rows")
          .select("program, product_list, year, forecasted_quantity");
        
        if (forecastError) {
          console.error("Error fetching forecast data:", forecastError);
          return;
        }

        // Fetch issue data
        const { data: issueData, error: issueError } = await supabase
          .from("product_issues")
          .select("program, items_description, year, quantity");
        
        if (issueError) {
          console.error("Error fetching issue data:", issueError);
          return;
        }

        // Create a comprehensive map for drug matching
        const drugAccuracyMap = new Map<string, DrugAccuracyData>();

        // Process forecast data first
        forecastData?.forEach(row => {
          if (!row.program || !row.year || !row.product_list) return;
          
          const normalizedProgram = row.program.toLowerCase().trim();
          
          // Apply filters with case-insensitive matching
          if (selectedPrograms.length > 0 && !selectedPrograms.some(p => p.toLowerCase() === normalizedProgram)) return;
          if (selectedYears.length > 0 && !selectedYears.includes(row.year)) return;
          
          const key = `${normalizedProgram}-${row.year}-${row.product_list.toLowerCase().trim()}`;
          
          if (!drugAccuracyMap.has(key)) {
            drugAccuracyMap.set(key, {
              program: row.program,
              year: row.year,
              productName: row.product_list,
              forecastQuantity: Number(row.forecasted_quantity) || 0,
              issueQuantity: 0,
              mape: 0,
              accuracyCategory: 'poor'
            });
          }
        });

        // Simple Levenshtein distance function for fuzzy matching
        const levenshteinDistance = (str1: string, str2: string): number => {
          const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
          
          for (let i = 0; i <= str1.length; i += 1) matrix[0][i] = i;
          for (let j = 0; j <= str2.length; j += 1) matrix[j][0] = j;
          
          for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
              const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
              matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
              );
            }
          }
          
          return matrix[str2.length][str1.length];
        };

        // Process issue data and match with forecast using fuzzy matching
        issueData?.forEach(row => {
          if (!row.program || !row.year || !row.items_description) return;
          
          const normalizedProgram = row.program.toLowerCase().trim();
          
          // Apply filters with case-insensitive matching  
          if (selectedPrograms.length > 0 && !selectedPrograms.some(p => p.toLowerCase() === normalizedProgram)) return;
          if (selectedYears.length > 0 && !selectedYears.includes(row.year)) return;
          
          const issueProductNormalized = row.items_description.toLowerCase().trim();
          
          // Try to find matching forecast entries
          for (let [key, forecastEntry] of drugAccuracyMap.entries()) {
            if (key.includes(normalizedProgram) && key.includes(row.year)) {
              const forecastProductNormalized = forecastEntry.productName.toLowerCase().trim();
              
              // Simple fuzzy matching - check if products have similar names
              if (issueProductNormalized.includes(forecastProductNormalized.slice(0, 10)) ||
                  forecastProductNormalized.includes(issueProductNormalized.slice(0, 10)) ||
                  levenshteinDistance(issueProductNormalized, forecastProductNormalized) < 10) {
                
                forecastEntry.issueQuantity += Number(row.quantity) || 0;
                break;
              }
            }
          }
        });

        // Calculate MAPE and categorize accuracy - only include items with issue data
        const finalData: DrugAccuracyData[] = Array.from(drugAccuracyMap.values())
          .filter(item => item.issueQuantity > 0) // Only show items that have actual issue data
          .map(item => {
            let mape = 0;
            if (item.issueQuantity > 0) {
              mape = Math.abs(item.issueQuantity - item.forecastQuantity) / item.issueQuantity * 100;
            } else if (item.forecastQuantity > 0) {
              mape = 100; // If forecast exists but no actual issue, 100% error
            }
            
            // Categorize accuracy based on MAPE
            let accuracyCategory: 'excellent' | 'good' | 'acceptable' | 'poor' = 'poor';
            if (mape <= 10) accuracyCategory = 'excellent';
            else if (mape <= 20) accuracyCategory = 'good';
            else if (mape <= 50) accuracyCategory = 'acceptable';
            
            return {
              ...item,
              mape: Math.round(mape * 100) / 100,
              accuracyCategory
            };
          })
          .sort((a, b) => a.program.localeCompare(b.program) || a.year.localeCompare(b.year) || a.mape - b.mape);

        setAccuracyData(finalData);
        
        // Calculate summary statistics
        if (finalData.length > 0) {
          const avgMape = finalData.reduce((sum, item) => sum + item.mape, 0) / finalData.length;
          const underForecast = finalData.filter(item => item.issueQuantity > item.forecastQuantity);
          const overForecast = finalData.filter(item => item.forecastQuantity > item.issueQuantity);
          
          console.log("Summary Stats:", {
            avgMape: avgMape.toFixed(1),
            underForecastCount: underForecast.length,
            overForecastCount: overForecast.length,
            totalItems: finalData.length
          });
        }
      } catch (error) {
        console.error("Error processing accuracy data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracyData();
  }, [selectedPrograms, selectedYears]);

  const getSummaryStats = () => {
    if (accuracyData.length === 0) return null;
    
    const avgMape = accuracyData.reduce((sum, item) => sum + item.mape, 0) / accuracyData.length;
    const underForecast = accuracyData.filter(item => item.issueQuantity > item.forecastQuantity);
    const overForecast = accuracyData.filter(item => item.forecastQuantity > item.issueQuantity);
    const exactMatch = accuracyData.filter(item => item.forecastQuantity === item.issueQuantity);
    
    const underForecastPct = (underForecast.length / accuracyData.length) * 100;
    const overForecastPct = (overForecast.length / accuracyData.length) * 100;
    
    // Calculate potential service interruption risk
    const highUnderForecast = underForecast.filter(item => 
      (item.issueQuantity - item.forecastQuantity) / item.issueQuantity > 0.2 // More than 20% under-forecasted
    );
    
    // Calculate potential waste risk  
    const highOverForecast = overForecast.filter(item => 
      (item.forecastQuantity - item.issueQuantity) / item.forecastQuantity > 0.3 // More than 30% over-forecasted
    );
    
    return {
      avgMape,
      underForecast: underForecast.length,
      overForecast: overForecast.length,
      exactMatch: exactMatch.length,
      underForecastPct,
      overForecastPct,
      highUnderForecast: highUnderForecast.length,
      highOverForecast: highOverForecast.length,
      totalItems: accuracyData.length
    };
  };

  const getInsights = (stats: any) => {
    if (!stats) return [];
    
    const insights = [];
    
    // MAPE Analysis
    if (stats.avgMape > 50) {
      insights.push({
        type: 'error',
        title: 'Poor Forecast Accuracy',
        message: `Average MAPE of ${stats.avgMape.toFixed(1)}% indicates significant forecasting challenges. Review forecasting methodology.`
      });
    } else if (stats.avgMape > 20) {
      insights.push({
        type: 'warning', 
        title: 'Moderate Forecast Accuracy',
        message: `Average MAPE of ${stats.avgMape.toFixed(1)}% suggests room for improvement in forecasting accuracy.`
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Good Forecast Accuracy',
        message: `Average MAPE of ${stats.avgMape.toFixed(1)}% indicates relatively good forecasting performance.`
      });
    }
    
    // Service Interruption Risk
    if (stats.highUnderForecast > 0) {
      insights.push({
        type: 'error',
        title: 'Service Interruption Risk',
        message: `${stats.highUnderForecast} products are significantly under-forecasted (>20% gap), potentially leading to stockouts and service disruptions.`
      });
    }
    
    // Waste Risk
    if (stats.highOverForecast > 0) {
      insights.push({
        type: 'warning',
        title: 'Resource Waste Risk', 
        message: `${stats.highOverForecast} products are significantly over-forecasted (>30% excess), potentially leading to waste and budget inefficiency.`
      });
    }
    
    // Balance Analysis
    if (stats.underForecastPct > 60) {
      insights.push({
        type: 'info',
        title: 'Systematic Under-forecasting',
        message: `${stats.underForecastPct.toFixed(1)}% of products are under-forecasted. Consider adjusting forecasting parameters upward.`
      });
    } else if (stats.overForecastPct > 60) {
      insights.push({
        type: 'info', 
        title: 'Systematic Over-forecasting',
        message: `${stats.overForecastPct.toFixed(1)}% of products are over-forecasted. Consider adjusting forecasting parameters downward.`
      });
    }
    
    return insights;
  };

  const summaryStats = getSummaryStats();
  const insights = getInsights(summaryStats);

  const getAccuracyBadge = (category: string) => {
    const variants = {
      excellent: { variant: "default", color: "bg-green-100 text-green-800" },
      good: { variant: "secondary", color: "bg-blue-100 text-blue-800" },
      acceptable: { variant: "outline", color: "bg-yellow-100 text-yellow-800" },
      poor: { variant: "destructive", color: "bg-red-100 text-red-800" }
    };
    
    const config = variants[category as keyof typeof variants] || variants.poor;
    return (
      <Badge className={config.color}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle>Forecast Accuracy Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Loading accuracy data...</div>
        </CardContent>
      </Card>
    );
  }

  if (accuracyData.length === 0) {
    return (
      <Card className="surface">
        <CardHeader>
          <CardTitle>Forecast Accuracy Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex flex-col items-center justify-center space-y-4">
          <div className="text-muted-foreground text-center">
            <p className="mb-2">No matching data found between forecast and issue data.</p>
            <p className="text-sm">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-left mt-2 space-y-1">
              <li>• Different year formats (e.g., forecast: "2025/26" vs issues: "2021/22")</li>
              <li>• Different program names (case sensitivity)</li>
              <li>• No overlapping time periods between forecast and actual issue data</li>
            </ul>
            <p className="text-sm mt-3">
              Import both forecast and issue data for the same programs and years to see accuracy analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Forecast Accuracy Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drug-level comparison of forecasted vs actual issue quantities with MAPE (Mean Absolute Percentage Error)
        </p>
        {summaryStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Average MAPE</p>
              <p className="text-2xl font-semibold">{summaryStats.avgMape.toFixed(1)}%</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Under-forecast</p>
              <p className="text-2xl font-semibold text-orange-600">{summaryStats.underForecast} ({summaryStats.underForecastPct.toFixed(1)}%)</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Over-forecast</p>
              <p className="text-2xl font-semibold text-blue-600">{summaryStats.overForecast} ({summaryStats.overForecastPct.toFixed(1)}%)</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-semibold">{summaryStats.totalItems}</p>
            </div>
          </div>
        )}
        {insights.length > 0 && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium">Analysis & Insights</h4>
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'error' ? 'bg-red-50 border-red-400' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-sm text-muted-foreground">{insight.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Drug/Product</TableHead>
                <TableHead className="text-right">Forecast Quantity</TableHead>
                <TableHead className="text-right">Issue Quantity</TableHead>
                <TableHead className="text-right">MAPE (%)</TableHead>
                <TableHead>Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accuracyData.map((item, index) => (
                <TableRow key={index} className="hover:bg-accent/50">
                  <TableCell className="font-medium">{item.program}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell className="max-w-xs truncate" title={item.productName}>
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.forecastQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.issueQuantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.mape.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {getAccuracyBadge(item.accuracyCategory)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {accuracyData.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>MAPE Categories:</strong></p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span>• Excellent: &le;10%</span>
              <span>• Good: &le;20%</span>
              <span>• Acceptable: &le;50%</span>
              <span>• Poor: &gt;50%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};