import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface ForecastRowDb {
  program: string;
  product_list: string;
  unit: string | null;
  year: string | null;
  forecasted_quantity: number | null;
  unit_price: number | null;
  forecasted_total: number | null;
}

interface EpiAssumptionDb {
  year: number;
  indicator: string;
  value: number;
  unit: string | null;
  program: string | null;
}

const numberFmt = (n: number | null | undefined) =>
  typeof n === "number" && isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-";

const Validation: React.FC = () => {
  const [rows, setRows] = React.useState<ForecastRowDb[]>([]);
  const [assumptions, setAssumptions] = React.useState<EpiAssumptionDb[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    document.title = "Forecast Validation Dashboard";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Validate forecast data quality, mapping coverage, and assumptions.");
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ data: fr }, { data: ea }] = await Promise.all([
          supabase.from("forecast_rows").select("program,product_list,unit,year,forecasted_quantity,unit_price,forecasted_total"),
          supabase.from("epi_assumptions").select("year,indicator,value,unit,program"),
        ]);
        if (!mounted) return;
        setRows(fr || []);
        setAssumptions(ea || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = React.useMemo(() => {
    const programs = new Set(rows.map((r) => r.program));
    const years = new Set(rows.map((r) => r.year || ""));
    const uniqueProducts = new Set(rows.map((r) => r.product_list));
    const totalForecast = rows.reduce((s, r) => s + (r.forecasted_total || 0), 0);
    return {
      programs: programs.size,
      years: years.size,
      products: uniqueProducts.size,
      rows: rows.length,
      totalForecast,
    };
  }, [rows]);

  const issues = React.useMemo(() => {
    const missingUnit = rows.filter((r) => !r.unit || String(r.unit).trim() === "");
    const noYear = rows.filter((r) => !r.year || String(r.year).trim() === "");
    const zeroOrNegPrice = rows.filter((r) => (r.unit_price ?? 0) <= 0);
    const zeroOrNegTotal = rows.filter((r) => (r.forecasted_total ?? 0) <= 0);
    return { missingUnit, noYear, zeroOrNegPrice, zeroOrNegTotal };
  }, [rows]);

  return (
    <main className="min-h-screen bg-background">
      <header className="relative">
        <div className="container py-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Forecast Validation Dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Overview of data quality checks, mapping coverage, and key assumptions for forecast data.
          </p>
        </div>
      </header>

      <section className="container space-y-6 pb-10">
        <Card className="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>High-level snapshot of imported forecast data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Programs</div>
                  <div className="text-2xl font-semibold">{stats.programs}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Years</div>
                  <div className="text-2xl font-semibold">{stats.years}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Unique Products</div>
                  <div className="text-2xl font-semibold">{stats.products}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rows</div>
                  <div className="text-2xl font-semibold">{stats.rows}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Forecasted</div>
                  <div className="text-2xl font-semibold">${numberFmt(stats.totalForecast)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Quality Checks</CardTitle>
            <CardDescription>Basic validations on the imported forecast rows</CardDescription>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No forecast data found. Import data to see validations.</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="font-medium">Missing Unit</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Year</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.missingUnit.slice(0, 8).map((r, i) => (
                        <TableRow key={`mu-${i}`}>
                          <TableCell>{r.program}</TableCell>
                          <TableCell>{r.product_list}</TableCell>
                          <TableCell>{r.year || "-"}</TableCell>
                        </TableRow>
                      ))}
                      {issues.missingUnit.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">No issues</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                <div>
                  <div className="font-medium">Zero/Negative Price</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.zeroOrNegPrice.slice(0, 8).map((r, i) => (
                        <TableRow key={`zp-${i}`}>
                          <TableCell>{r.program}</TableCell>
                          <TableCell>{r.product_list}</TableCell>
                          <TableCell className="text-right">{numberFmt(r.unit_price)}</TableCell>
                        </TableRow>
                      ))}
                      {issues.zeroOrNegPrice.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">No issues</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                <div>
                  <div className="font-medium">Zero/Negative Total</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Forecasted Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.zeroOrNegTotal.slice(0, 8).map((r, i) => (
                        <TableRow key={`zt-${i}`}>
                          <TableCell>{r.program}</TableCell>
                          <TableCell>{r.product_list}</TableCell>
                          <TableCell className="text-right">{numberFmt(r.forecasted_total)}</TableCell>
                        </TableRow>
                      ))}
                      {issues.zeroOrNegTotal.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-muted-foreground">No issues</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assumptions</CardTitle>
            <CardDescription>Epidemiology inputs currently stored</CardDescription>
          </CardHeader>
          <CardContent>
            {assumptions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No assumptions found.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Indicator</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Program</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assumptions.slice(0, 12).map((a, i) => (
                      <TableRow key={`ea-${i}`}>
                        <TableCell>{a.year}</TableCell>
                        <TableCell>{a.indicator}</TableCell>
                        <TableCell className="text-right">{numberFmt(a.value)}</TableCell>
                        <TableCell>{a.unit || "-"}</TableCell>
                        <TableCell>{a.program || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Validation;
