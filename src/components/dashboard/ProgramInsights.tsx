import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { ForecastDataset } from "@/types/forecast";

export type ProgramInsightsProps = {
  rows: ForecastDataset["rows"]; // already filtered by program/year upstream
};

const numberFmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const parseYearKey = (y: string) => {
  // supports formats like "2024", "2024/25"
  const m = /^(\d{4})/.exec(y);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
};

const sumBy = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export const ProgramInsights: React.FC<ProgramInsightsProps> = ({ rows }) => {
  const [showSettings, setShowSettings] = React.useState(false);
  const [hivUnitsPerPatient, setHivUnitsPerPatient] = React.useState<number>(6);
  const [hivBaselineOnTx, setHivBaselineOnTx] = React.useState<number | "">(510000);
  const [tbCapacityPerYear, setTbCapacityPerYear] = React.useState<number | "">("");
  const [malariaBaselineNeed, setMalariaBaselineNeed] = React.useState<number | "">(4500000);

  // Persist minimal settings
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("program-insights-settings-v1");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.hivUnitsPerPatient === "number") setHivUnitsPerPatient(v.hivUnitsPerPatient);
        if (typeof v.hivBaselineOnTx === "number") setHivBaselineOnTx(v.hivBaselineOnTx);
        if (typeof v.tbCapacityPerYear === "number" || v.tbCapacityPerYear === "") setTbCapacityPerYear(v.tbCapacityPerYear);
        if (typeof v.malariaBaselineNeed === "number" || v.malariaBaselineNeed === "") setMalariaBaselineNeed(v.malariaBaselineNeed);
      }
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem(
        "program-insights-settings-v1",
        JSON.stringify({ hivUnitsPerPatient, hivBaselineOnTx, tbCapacityPerYear, malariaBaselineNeed })
      );
    } catch {}
  }, [hivUnitsPerPatient, hivBaselineOnTx, tbCapacityPerYear, malariaBaselineNeed]);

  // Build per-program/year summaries
  const byProgramYear = React.useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    rows.forEach((r) => {
      const program = (r.Program || "").toLowerCase();
      const year = r.Year || "";
      const qty = r["Forecasted Quantity"] || 0;
      if (!map.has(program)) map.set(program, new Map());
      const inner = map.get(program)!;
      inner.set(year, (inner.get(year) || 0) + qty);
    });
    return map;
  }, [rows]);

  // HIV
  const hivYears = React.useMemo(() => {
    const map = byProgramYear.get("hiv") || new Map<string, number>();
    const entries = Array.from(map.entries()).sort((a, b) => parseYearKey(a[0]) - parseYearKey(b[0]));
    const impliedOnTx = entries.map(([y, qty]) => ({ year: y, qty, onTx: hivUnitsPerPatient > 0 ? qty / hivUnitsPerPatient : 0 }));
    const first = impliedOnTx[0]?.onTx || 0;
    const last = impliedOnTx[impliedOnTx.length - 1]?.onTx || 0;
    const growth = first > 0 ? (last - first) / first : 0;
    return { impliedOnTx, first, last, growth };
  }, [byProgramYear, hivUnitsPerPatient]);

  // TB tests (heuristic by product name)
  const tbYears = React.useMemo(() => {
    const map = byProgramYear.get("tb") || new Map<string, number>();
    // refine using product filter on the fly
    const yearMap = new Map<string, number>();
    rows.forEach((r) => {
      const prog = (r.Program || "").toLowerCase();
      if (!prog.startsWith("tb")) return;
      const name = (r["Product List"] || "").toLowerCase();
      if (!/(test|cartridge|xpert|lam)/.test(name)) return;
      const y = r.Year || "";
      yearMap.set(y, (yearMap.get(y) || 0) + (r["Forecasted Quantity"] || 0));
    });
    const entries = Array.from(yearMap.entries()).sort((a, b) => parseYearKey(a[0]) - parseYearKey(b[0]));
    const total = sumBy(entries.map(([, v]) => v));
    const maxYear = entries[entries.length - 1]?.[0] || "";
    const maxVal = entries[entries.length - 1]?.[1] || 0;
    return { entries, total, maxYear, maxVal };
  }, [byProgramYear, rows]);

  // Malaria treatment courses (heuristic by molecules)
  const malariaYears = React.useMemo(() => {
    const yearMap = new Map<string, number>();
    rows.forEach((r) => {
      const prog = (r.Program || "").toLowerCase();
      if (!prog.startsWith("malaria")) return;
      const name = (r["Product List"] || "").toLowerCase();
      if (!/(artemether|lumefantrine|artesunate|amodiaquine|dihydroartemisinin|piperaquine|quinine|sulfadoxine|pyrimethamine|\bact\b)/.test(name)) return;
      const y = r.Year || "";
      yearMap.set(y, (yearMap.get(y) || 0) + (r["Forecasted Quantity"] || 0));
    });
    const entries = Array.from(yearMap.entries()).sort((a, b) => parseYearKey(a[0]) - parseYearKey(b[0]));
    const first = entries[0]?.[1] || 0;
    const second = entries[1]?.[1] || 0;
    const change = first > 0 ? (second - first) / first : 0;
    return { entries, first, second, change };
  }, [rows]);

  const flag = (ok: boolean, label: string) => (
    <Badge variant={ok ? "secondary" : "destructive"}>{label}</Badge>
  );

  return (
    <Card className="surface">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Program Insights</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Checks compare forecasted quantities to rough capacity/need assumptions.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowSettings((s) => !s)} aria-expanded={showSettings}>
            {showSettings ? "Hide settings" : "Settings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showSettings && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="hivUnits">HIV: units per patient-year</Label>
              <Input
                id="hivUnits"
                type="number"
                value={hivUnitsPerPatient}
                onChange={(e) => setHivUnitsPerPatient(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div>
              <Label htmlFor="hivBaseline">HIV: current on treatment (baseline)</Label>
              <Input
                id="hivBaseline"
                type="number"
                value={hivBaselineOnTx}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Number(e.target.value);
                  setHivBaselineOnTx(v);
                }}
              />
            </div>
            <div>
              <Label htmlFor="tbCapacity">TB: testing capacity per year</Label>
              <Input
                id="tbCapacity"
                type="number"
                placeholder="e.g. 1,800,000"
                value={tbCapacityPerYear}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Number(e.target.value);
                  setTbCapacityPerYear(v);
                }}
              />
            </div>
            <div>
              <Label htmlFor="malNeed">Malaria: expected courses needed</Label>
              <Input
                id="malNeed"
                type="number"
                placeholder="e.g. 5,000,000"
                value={malariaBaselineNeed}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Number(e.target.value);
                  setMalariaBaselineNeed(v);
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">HIV</h3>
              {flag(hivYears.growth <= 0.5, `${Math.round(hivYears.growth * 100)}% growth over range`)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Implied people on treatment: {numberFmt(hivYears.first)} → {numberFmt(hivYears.last)}
              {typeof hivBaselineOnTx === "number" && hivBaselineOnTx > 0 && (
                <>. Baseline today: {numberFmt(hivBaselineOnTx)} ({hivYears.first >= hivBaselineOnTx ? "≥" : "<"} baseline)</>
              )}
            </p>
          </section>

          <Separator />

          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Tuberculosis (TB)</h3>
              {typeof tbCapacityPerYear === "number" && tbCapacityPerYear > 0
                ? flag(tbYears.maxVal <= tbCapacityPerYear, `peak ${numberFmt(tbYears.maxVal)} vs cap ${numberFmt(tbCapacityPerYear)}`)
                : <Badge variant="secondary">add capacity to check</Badge>
              }
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Forecasted rapid tests (heuristic): {tbYears.entries.map(([y, v]) => `${y}: ${numberFmt(v)}`).join("; ")}
            </p>
          </section>

          <Separator />

          <section>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Malaria</h3>
              {flag(!(malariaYears.change >= 1 || malariaYears.change <= -0.5), `${Math.round((malariaYears.change||0)*100)}% YoY change (first→second)`) }
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Treatment courses: {malariaYears.entries.map(([y, v]) => `${y}: ${numberFmt(v)}`).join("; ")}
              {typeof malariaBaselineNeed === "number" && malariaBaselineNeed > 0 && malariaYears.entries.length > 0 && (
                <>. Compared to need: {numberFmt(malariaYears.entries[0][1])} vs need {numberFmt(malariaBaselineNeed)}</>
              )}
            </p>
          </section>

          <div className="flex gap-3 pt-2">
            <Button asChild variant="link" size="sm">
              <a href="#abrupt-changes">View products with abrupt changes</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramInsights;
