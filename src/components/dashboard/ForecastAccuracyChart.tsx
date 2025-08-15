import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface AccuracyData {
  year: string;
  program: string;
  forecastedQuantity: number;
  issueQuantity: number;
  accuracy: number;
  accuracyPercentage: string;
}

interface ForecastAccuracyChartProps {
  selectedPrograms?: string[];
  selectedYears?: string[];
}

export const ForecastAccuracyChart: React.FC<ForecastAccuracyChartProps> = ({
  selectedPrograms = [],
  selectedYears = []
}) => {
  const [accuracyData, setAccuracyData] = React.useState<AccuracyData[]>([]);
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

        console.log("Raw forecast data sample:", forecastData?.slice(0, 3));
        console.log("Raw issue data sample:", issueData?.slice(0, 3));

        // Extract unique years and programs for debugging
        const forecastYears = [...new Set(forecastData?.map(r => r.year) || [])];
        const issueYears = [...new Set(issueData?.map(r => r.year) || [])];
        const forecastPrograms = [...new Set(forecastData?.map(r => r.program?.toLowerCase()) || [])];
        const issuePrograms = [...new Set(issueData?.map(r => r.program?.toLowerCase()) || [])];
        
        console.log("Forecast years:", forecastYears);
        console.log("Issue years:", issueYears);
        console.log("Forecast programs:", forecastPrograms);
        console.log("Issue programs:", issuePrograms);

        // Find overlapping years and programs
        const commonYears = forecastYears.filter(year => issueYears.includes(year));
        const commonPrograms = forecastPrograms.filter(prog => issuePrograms.includes(prog));
        
        console.log("Common years:", commonYears);
        console.log("Common programs:", commonPrograms);

        // Process and match data by program and year with case-insensitive matching
        const accuracyMap = new Map<string, {
          year: string;
          program: string;
          totalForecasted: number;
          totalIssue: number;
          productCount: number;
        }>();

        // Aggregate forecast data
        forecastData?.forEach(row => {
          if (!row.program || !row.year) return;
          
          const normalizedProgram = row.program.toLowerCase().trim();
          
          // Apply filters with case-insensitive matching
          if (selectedPrograms.length > 0 && !selectedPrograms.some(p => p.toLowerCase() === normalizedProgram)) return;
          if (selectedYears.length > 0 && !selectedYears.includes(row.year)) return;
          
          const key = `${normalizedProgram}-${row.year}`;
          const existing = accuracyMap.get(key) || {
            year: row.year,
            program: row.program, // Keep original casing for display
            totalForecasted: 0,
            totalIssue: 0,
            productCount: 0
          };
          
          existing.totalForecasted += Number(row.forecasted_quantity) || 0;
          existing.productCount += 1;
          accuracyMap.set(key, existing);
        });

        // Aggregate issue data and match with forecast using case-insensitive matching
        issueData?.forEach(row => {
          if (!row.program || !row.year) return;
          
          const normalizedProgram = row.program.toLowerCase().trim();
          
          // Apply filters with case-insensitive matching  
          if (selectedPrograms.length > 0 && !selectedPrograms.some(p => p.toLowerCase() === normalizedProgram)) return;
          if (selectedYears.length > 0 && !selectedYears.includes(row.year)) return;
          
          const key = `${normalizedProgram}-${row.year}`;
          const existing = accuracyMap.get(key);
          
          if (existing) {
            existing.totalIssue += Number(row.quantity) || 0;
          }
        });

        // Calculate accuracy and format for chart
        const chartData: AccuracyData[] = Array.from(accuracyMap.values())
          .filter(item => item.totalForecasted > 0 && item.totalIssue > 0)
          .map(item => {
            const accuracy = item.totalIssue > 0 
              ? Math.min(100, (item.totalForecasted / item.totalIssue) * 100)
              : 0;
            
            return {
              year: item.year,
              program: item.program,
              forecastedQuantity: Math.round(item.totalForecasted),
              issueQuantity: Math.round(item.totalIssue),
              accuracy: Math.round(accuracy * 100) / 100,
              accuracyPercentage: `${Math.round(accuracy)}%`
            };
          })
          .sort((a, b) => a.year.localeCompare(b.year) || a.program.localeCompare(b.program));

        setAccuracyData(chartData);
      } catch (error) {
        console.error("Error processing accuracy data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccuracyData();
  }, [selectedPrograms, selectedYears]);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`${data.program} - ${data.year}`}</p>
          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
            Forecasted: {data.forecastedQuantity.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
            Actual Issue: {data.issueQuantity.toLocaleString()}
          </p>
          <p className="text-sm font-medium">
            <span className="inline-block w-3 h-3 bg-orange-500 rounded mr-2"></span>
            Accuracy: {data.accuracyPercentage}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Forecast Accuracy Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compares forecasted quantities with actual issue data to measure prediction accuracy
        </p>
      </CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={accuracyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={(data) => `${data.program.slice(0, 15)}... (${data.year})`}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" orientation="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="forecastedQuantity" fill="hsl(var(--primary))" name="Forecasted Quantity" />
            <Bar yAxisId="left" dataKey="issueQuantity" fill="hsl(var(--secondary))" name="Actual Issue Quantity" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="accuracy" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={3}
              name="Accuracy %" 
              dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};