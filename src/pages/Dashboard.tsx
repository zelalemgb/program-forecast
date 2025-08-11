import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ImportForecast } from "@/components/forecast/ImportForecast";
import { ForecastDataset } from "@/types/forecast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const currency = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const Dashboard: React.FC = () => {
  const [dataset, setDataset] = React.useState<ForecastDataset | null>(null);
const [selectedPrograms, setSelectedPrograms] = React.useState<string[]>([]);
const [selectedYears, setSelectedYears] = React.useState<string[]>([]);

  React.useEffect(() => {
    document.title = "Health Programs Forecast Dashboard";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Analyze forecast data across health programs with import, charts, and drill-down.");
  }, []);

  const onMouseMoveGlow = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--mx", `${mx}%`);
    e.currentTarget.style.setProperty("--my", `${my}%`);
    e.currentTarget.style.setProperty("--glow-alpha", `1`);
  };
  const onMouseLeaveGlow = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--glow-alpha", `0`);
  };

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

const top20ByPrice = React.useMemo(() => {
  const arr = [...filteredRows];
  arr.sort((a, b) => Number((b as any)["unit price"] ?? 0) - Number((a as any)["unit price"] ?? 0));
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
    <main className="min-h-screen bg-background">
      <header
        className="pointer-glow relative overflow-hidden"
        onMouseMove={onMouseMoveGlow}
        onMouseLeave={onMouseLeaveGlow}
      >
        <div className="container py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Health Programs Forecast Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Import forecast CSVs and analyze from program-level trends down to individual products.
          </p>
          <div className="mt-4">
            <Button asChild variant="secondary">
              <Link to="/validation">Open Validation Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="container space-y-6 pb-10">
        <ImportForecast onData={setDataset} />

        {dataset && (
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Observed Difference</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">${currency(filteredTotals.totalObservedDiff)}</CardContent>
            </Card>
            <Card className="surface">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Programs / Items</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">{filteredTotals.totalPrograms} / {filteredTotals.totalItems}</CardContent>
            </Card>
          </div>
        )}

        {dataset && (
          <Card className="surface">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
<CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div>
    <label className="text-sm text-muted-foreground">Programs</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-1 min-w-[160px] justify-start">
          {selectedPrograms.length ? `Selected (${selectedPrograms.length})` : "All programs"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPrograms(dataset.programs)}>Select all</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPrograms([])}>Clear</Button>
        </div>
        <div className="max-h-64 overflow-auto space-y-2">
          {dataset.programs.map((p) => (
            <label key={p} className="flex items-center gap-2">
              <Checkbox
                checked={selectedPrograms.includes(p)}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setSelectedPrograms((prev) =>
                    isChecked ? (prev.includes(p) ? prev : [...prev, p]) : prev.filter((v) => v !== p)
                  );
                }}
              />
              <span className="text-sm">{p}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  </div>
  <div>
    <label className="text-sm text-muted-foreground">Years</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-1 min-w-[160px] justify-start">
          {selectedYears.length ? `Selected (${selectedYears.length})` : "All years"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedYears(dataset.years)}>Select all</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedYears([])}>Clear</Button>
        </div>
        <div className="max-h-64 overflow-auto space-y-2">
          {dataset.years.map((y) => (
            <label key={y} className="flex items-center gap-2">
              <Checkbox
                checked={selectedYears.includes(y)}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setSelectedYears((prev) =>
                    isChecked ? (prev.includes(y) ? prev : [...prev, y]) : prev.filter((v) => v !== y)
                  );
                }}
              />
              <span className="text-sm">{y}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  </div>
  <div className="flex items-end">
    {(selectedPrograms.length > 0 || selectedYears.length > 0) && (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedPrograms([]); setSelectedYears([]); }}>
        Clear all filters
      </Button>
    )}
  </div>
</CardContent>
          </Card>
        )}

        {dataset && (
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
        )}

        {dataset && (
          <Card className="surface">
            <CardHeader>
              <CardTitle>Top 20 Products by Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Forecasted</TableHead>
                      <TableHead className="text-right">Observed</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top20ByPrice.map((r, idx) => (
                      <TableRow key={idx} className="hover:bg-accent/50">
                        <TableCell>{r.Program}</TableCell>
                        <TableCell>{r["Product List"]}</TableCell>
                        <TableCell>{r.Unit}</TableCell>
                        <TableCell>{r.Year}</TableCell>
                        <TableCell className="text-right">{currency(r["Forecasted Quantity"])}</TableCell>
                        <TableCell className="text-right">${currency(r["unit price"])}</TableCell>
                        <TableCell className="text-right">${currency(r["Forecasted Total"] || 0)}</TableCell>
                        <TableCell className="text-right">${currency(r["Opian Total"] || 0)}</TableCell>
                        <TableCell className="text-right">${currency(r["Observed difference"] || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator className="my-4" />
              <div className="text-sm text-muted-foreground">
                Tip: Use the filters above to analyze by multiple programs and years.
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
};

export default Dashboard;
