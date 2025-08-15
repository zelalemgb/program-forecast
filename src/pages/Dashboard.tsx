import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ImportForecast } from "@/components/forecast/ImportForecast";
import ImportIssueData from "@/components/forecast/ImportIssueData";
import { ForecastDataset, ForecastRow, buildDataset } from "@/types/forecast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ProductTrendDialog } from "@/components/dashboard/ProductTrendDialog";
import { AbruptChangesTable } from "@/components/dashboard/AbruptChangesTable";
import ProgramInsights from "@/components/dashboard/ProgramInsights";
import { ForecastAccuracyChart } from "@/components/dashboard/ForecastAccuracyChart";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ValidationSummary } from "@/components/dashboard/ValidationSummary";
import { AccuracyMetrics } from "@/components/dashboard/AccuracyMetrics";
import { ActionableInsights } from "@/components/dashboard/ActionableInsights";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const currency = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const Dashboard: React.FC = () => {
  const [dataset, setDataset] = React.useState<ForecastDataset | null>(null);
  const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
  const [selectedYears, setSelectedYears] = React.useState<string[]>([]);
  const [trendOpen, setTrendOpen] = React.useState(false);
  const [trendProduct, setTrendProduct] = React.useState<string | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  
  // Progressive disclosure state
  const [expandedSections, setExpandedSections] = React.useState({
    validation: true,
    accuracy: false,
    insights: false,
    programs: false,
    trends: false,
    details: false
  });

  const { user } = useAuth();

  // Auto-load previously imported forecast data from Supabase on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return; // Only fetch after login so RLS returns your rows
      const { data, error } = await supabase
        .from("forecast_rows")
        .select(
          "program,product_list,unit,year,forecasted_quantity,unit_price,forecasted_total,opian_total,observed_difference"
        );
      if (error) {
        console.error("Failed to load saved forecast rows:", error);
        return;
      }
      if (!mounted) return;
      if (data && data.length > 0) {
        const rows: ForecastRow[] = data.map((r: any) => ({
          Program: r.program?.toString() || "",
          "Product List": r.product_list?.toString() || "",
          Unit: (r.unit ?? "").toString(),
          Year: (r.year ?? "").toString(),
          "Forecasted Quantity": Number(r.forecasted_quantity ?? 0),
          "unit price": Number(r.unit_price ?? 0),
          "Forecasted Total": Number(r.forecasted_total ?? 0),
          "Opian Total": Number(r.opian_total ?? 0),
          "Observed difference": Number(r.observed_difference ?? 0),
        }));
        setDataset(buildDataset(rows));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

const filteredRows = React.useMemo(() => {
  if (!dataset) return [] as ForecastDataset["rows"];
  const prSet = new Set(selectedPrograms);
  const yrSet = new Set(selectedYears);
  return dataset.rows.filter(
    (r) => (selectedPrograms.length ? prSet.has(r.Program) : true) && (selectedYears.length ? yrSet.has(r.Year) : true)
  );
}, [dataset, selectedPrograms, selectedYears]);

  const programsAgg = React.useMemo(() => {
    const map = new Map<string, { program: string; total: number }>();
    filteredRows.forEach((r) => {
      const key = r.Program;
      const prev = map.get(key)?.total || 0;
      map.set(key, { program: key, total: prev + (r["Forecasted Total"] || 0) });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredRows]);

  const yearsAgg = React.useMemo(() => {
    const map = new Map<string, { year: string; total: number }>();
    filteredRows.forEach((r) => {
      const key = r.Year;
      const prev = map.get(key)?.total || 0;
      map.set(key, { year: key, total: prev + (r["Forecasted Total"] || 0) });
    });
    return Array.from(map.values()).sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredRows]);

const top20ByObserved = React.useMemo(() => {
  const map = new Map<string, {
    product: string;
    unit: string;
    totalObserved: number;
    totalForecasted: number;
    totalQty: number;
    sumPrice: number;
    priceCount: number;
    years: Set<string>;
  }>();

  filteredRows.forEach((r) => {
    const key = r["Product List"];
    const entry = map.get(key) ?? {
      product: key,
      unit: r.Unit,
      totalObserved: 0,
      totalForecasted: 0,
      totalQty: 0,
      sumPrice: 0,
      priceCount: 0,
      years: new Set<string>(),
    };
    entry.totalObserved += r["Opian Total"] || 0;
    entry.totalForecasted += r["Forecasted Total"] || 0;
    entry.totalQty += r["Forecasted Quantity"] || 0;
    entry.sumPrice += r["unit price"] || 0;
    entry.priceCount += 1;
    entry.years.add(r.Year);
    map.set(key, entry);
  });

  const arr = Array.from(map.values()).map((e) => ({
    ...e,
    avgUnitPrice: e.priceCount ? e.sumPrice / e.priceCount : 0,
    yearsLabel: Array.from(e.years).sort().join(", "),
    difference: e.totalObserved - e.totalForecasted,
  }));

  arr.sort((a, b) => b.totalObserved - a.totalObserved);
  return arr.slice(0, 20);
}, [filteredRows]);

const filteredTotals = React.useMemo(() => {
    const programSet = new Set<string>();
    let totalForecastedValue = 0;
    let totalObservedValue = 0;
    let totalObservedDiff = 0;
    filteredRows.forEach((r) => {
      programSet.add(r.Program);
      totalForecastedValue += r["Forecasted Total"] || 0;
      totalObservedValue += r["Opian Total"] || 0;
      totalObservedDiff += r["Observed difference"] || 0;
    });
    return {
      totalForecastedValue,
      totalObservedValue,
      totalObservedDiff,
      totalPrograms: programSet.size,
      totalItems: filteredRows.length,
    };
  }, [filteredRows]);

  return (
    <div className="container mx-auto p-6">
      <Helmet>
        <title>Health Programs Forecast Dashboard</title>
        <meta name="description" content="Analyze forecast data across health programs with import, charts, and drill-down." />
        <link rel="canonical" href={`${window.location.origin}/dashboard`} />
      </Helmet>
      
      <PageHeader
        title="Forecast Validation & Analysis Dashboard"
        description="Import, validate, and analyze forecast data to identify accuracy issues, anomalies, and improvement opportunities."
        actions={
          <div className="flex items-center gap-2">
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
              <DialogTrigger asChild>
                <Button>Import Forecast Data</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Import forecast data</DialogTitle>
                  <DialogDescription>Upload your CSV to analyze and validate forecast accuracy.</DialogDescription>
                </DialogHeader>
                <ImportForecast onData={(d) => { setDataset(d); setImportOpen(false); }} />
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Import Issue Data</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Import Issue Data</DialogTitle>
                  <DialogDescription>Upload issue data to analyze forecast problems.</DialogDescription>
                </DialogHeader>
                <ImportIssueData onData={() => {
                  // Refresh or handle issue data import completion
                }} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="space-y-6 mt-6">{/* Changed from section to div and added mt-6 */}
        {/* Auth CTA when not signed in */}
        {!user && (
          <Card className="surface border-dashed">
            <CardContent className="py-4 flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Sign in to load and see your uploaded forecast data.</div>
              <Button asChild variant="secondary"><Link to="/auth">Sign in</Link></Button>
            </CardContent>
          </Card>
        )}

        

        {dataset && (
          <Card className="surface">
            <CardContent className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Filter by Program</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-[200px] justify-between w-auto">
                        <span className="truncate">{selectedPrograms.length ? selectedPrograms.join(", ") : "All programs"}</span>
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 z-50">
                      <DropdownMenuLabel>Programs</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {dataset.programs.map((p) => (
                        <DropdownMenuCheckboxItem
                          key={p}
                          checked={selectedPrograms.includes(p)}
                          onCheckedChange={(checked) => {
                            setSelectedPrograms((prev) =>
                              checked ? Array.from(new Set([...(prev || []), p])) : (prev || []).filter((v) => v !== p)
                            )
                          }}
                          className="capitalize"
                        >
                          {p}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Filter by Years</label>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="min-w-[200px] justify-between w-auto">
                          <span className="truncate">{selectedYears.length ? selectedYears.join(", ") : "All years"}</span>
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 z-50">
                        <DropdownMenuLabel>Years</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {dataset.years.map((y) => (
                          <DropdownMenuCheckboxItem
                            key={y}
                            checked={selectedYears.includes(y)}
                            onCheckedChange={(checked) => {
                              setSelectedYears((prev) =>
                                checked ? Array.from(new Set([...(prev || []), y])) : (prev || []).filter((v) => v !== y)
                              )
                            }}
                          >
                            {y}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {(selectedPrograms.length > 0 || selectedYears.length > 0) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPrograms([])
                          setSelectedYears([])
                        }}
                        aria-label="Clear all filters"
                      >
                        Reset Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Executive Summary - Validation Health */}
        {dataset && (
          <ValidationSummary 
            rows={filteredRows} 
            onViewIssues={(type) => {
              // Handle viewing specific issue types
              console.log("View issues:", type);
            }} 
          />
        )}

        {/* Progressive Disclosure Sections */}
        {dataset && (
          <div className="space-y-4">
            {/* Level 2: Accuracy Analysis */}
            <Collapsible 
              open={expandedSections.accuracy} 
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, accuracy: open }))}
            >
              <CollapsibleTrigger asChild>
                <Card className="surface cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>Forecast Accuracy Analysis</CardTitle>
                        <Badge variant="outline">{filteredRows.filter(r => (r["Opian Total"] || 0) > 0).length} comparisons</Badge>
                      </div>
                      {expandedSections.accuracy ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Analyze forecast vs. observed performance and identify accuracy issues
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AccuracyMetrics rows={filteredRows} />
              </CollapsibleContent>
            </Collapsible>

            {/* Level 2: Actionable Insights */}
            <Collapsible 
              open={expandedSections.insights} 
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, insights: open }))}
            >
              <CollapsibleTrigger asChild>
                <Card className="surface cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>Priority Actions & Insights</CardTitle>
                        <Badge variant="secondary">AI-powered</Badge>
                      </div>
                      {expandedSections.insights ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recommended actions to improve forecast quality and address critical issues
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ActionableInsights 
                  rows={filteredRows}
                  onTakeAction={(action, data) => {
                    // Handle action implementation
                    console.log("Take action:", action, data);
                  }}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Level 2: Program Analysis */}
            <Collapsible 
              open={expandedSections.programs} 
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, programs: open }))}
            >
              <CollapsibleTrigger asChild>
                <Card className="surface cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>Program-Level Analysis</CardTitle>
                        <Badge variant="outline">{dataset.programs.length} programs</Badge>
                      </div>
                      {expandedSections.programs ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Capacity analysis and program-specific insights for HIV, TB, and Malaria
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4">
                  <ProgramInsights rows={filteredRows} />
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="surface">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Total Forecasted Value</CardTitle></CardHeader>
                      <CardContent className="text-2xl font-semibold">${currency(filteredTotals.totalForecastedValue)}</CardContent>
                    </Card>
                    <Card className="surface">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Observed Value</CardTitle></CardHeader>
                      <CardContent className="text-2xl font-semibold">${currency(filteredTotals.totalObservedValue)}</CardContent>
                    </Card>
                    <Card className="surface">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Forecast Variance</CardTitle></CardHeader>
                      <CardContent className="text-2xl font-semibold">${currency(filteredTotals.totalObservedDiff)}</CardContent>
                    </Card>
                    <Card className="surface">
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Programs / Items</CardTitle></CardHeader>
                      <CardContent className="text-2xl font-semibold">{filteredTotals.totalPrograms} / {filteredTotals.totalItems}</CardContent>
                    </Card>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Level 3: Detailed Charts and Trends */}
        {dataset && (
          <div className="space-y-4">
            <Collapsible 
              open={expandedSections.trends} 
              onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, trends: open }))}
            >
              <CollapsibleTrigger asChild>
                <Card className="surface cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle>Trend Analysis & Charts</CardTitle>
                        <Badge variant="outline">Visual Analysis</Badge>
                      </div>
                      {expandedSections.trends ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Visual trend analysis and forecast accuracy charts
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-6">
                  <ForecastAccuracyChart 
                    selectedPrograms={selectedPrograms}
                    selectedYears={selectedYears}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="surface overflow-hidden">
                      <CardHeader>
                        <CardTitle>Forecasted Total by Program</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={programsAgg} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="program" tickLine={false} axisLine={false} hide={programsAgg.length > 8} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: number) => `$${currency(v)}`} cursor={{ fill: "hsl(var(--muted) / 0.5)" as unknown as string }} />
                            <Bar dataKey="total" fill={`hsl(var(--brand))`} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="surface overflow-hidden">
                      <CardHeader>
                        <CardTitle>Forecasted Total by Year</CardTitle>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={yearsAgg} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: number) => `$${currency(v)}`} cursor={{ fill: "hsl(var(--muted) / 0.5)" as unknown as string }} />
                            <Bar dataKey="total" fill={`hsl(var(--brand))`} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Level 3: Product-Level Details */}
        {dataset && (
          <Collapsible 
            open={expandedSections.details} 
            onOpenChange={(open) => setExpandedSections(prev => ({ ...prev, details: open }))}
          >
            <CollapsibleTrigger asChild>
              <Card className="surface cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>Product-Level Details</CardTitle>
                      <Badge variant="outline">{top20ByObserved.length} products</Badge>
                    </div>
                    {expandedSections.details ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Detailed product analysis including anomalies and high-value items
                  </div>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-6">
                <div id="abrupt-changes">
                  <AbruptChangesTable 
                    rows={filteredRows} 
                    onPickProduct={(product) => { setTrendProduct(product); setTrendOpen(true); }} 
                  />
                </div>
                
                <Card className="surface">
                  <CardHeader>
                    <CardTitle>Top 20 Products by Observed Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Years</TableHead>
                            <TableHead className="text-right">Total Qty</TableHead>
                            <TableHead className="text-right">Avg Unit Price</TableHead>
                            <TableHead className="text-right">Forecasted Total</TableHead>
                            <TableHead className="text-right">Observed Total</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {top20ByObserved.map((p, idx) => {
                            const hasDiff = Math.abs(p.difference || 0) > 0;
                            const diffBorderCls = hasDiff ? "border border-destructive" : "";
                            return (
                              <TableRow
                                key={idx}
                                className={`hover:bg-accent/50 cursor-pointer ${diffBorderCls}`}
                                title={`View yearly trend for ${p.product}`}
                                onClick={() => {
                                  setTrendProduct(p.product);
                                  setTrendOpen(true);
                                }}
                              >
                                <TableCell className="font-medium">{p.product}</TableCell>
                                <TableCell>{p.unit}</TableCell>
                                <TableCell>{p.yearsLabel}</TableCell>
                                <TableCell className="text-right">{currency(p.totalQty)}</TableCell>
                                <TableCell className="text-right">${currency(p.avgUnitPrice)}</TableCell>
                                <TableCell className="text-right">${currency(p.totalForecasted)}</TableCell>
                                <TableCell className="text-right">${currency(p.totalObserved)}</TableCell>
                                <TableCell className="text-right">${currency(p.difference)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Showing top 20 products. Use the <strong>Filters above</strong> to narrow by Program and Years.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        <ProductTrendDialog open={trendOpen} onOpenChange={setTrendOpen} product={trendProduct} rows={filteredRows} />
      </div>
    </div>
  );
};

export default Dashboard;
