import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ForecastRow } from "@/types/forecast";

type ProgramInsightsProps = {
  rows: ForecastRow[];
};

const ProgramInsights: React.FC<ProgramInsightsProps> = ({ rows }) => {
  const programSet = React.useMemo(() => new Set(rows.map((r) => r.Program)), [rows]);

  const abruptChanges = React.useMemo(() => {
    const byProgramYear = new Map<string, Map<string, number>>();
    rows.forEach((r) => {
      const p = r.Program;
      const y = r.Year;
      const t = r["Forecasted Total"] || 0;
      if (!byProgramYear.has(p)) byProgramYear.set(p, new Map());
      const ym = byProgramYear.get(p)!;
      ym.set(y, (ym.get(y) || 0) + t);
    });

    const flags: string[] = [];
    for (const [p, ym] of byProgramYear.entries()) {
      const years = Array.from(ym.keys()).sort();
      for (let i = 1; i < years.length; i++) {
        const prevY = years[i - 1];
        const y = years[i];
        const prev = ym.get(prevY) || 0;
        const curr = ym.get(y) || 0;
        if (prev > 0) {
          const ratio = curr / prev;
          if (ratio >= 3 || ratio <= 1 / 3) {
            const sign = ratio >= 1 ? "+" : "-";
            const pct = Math.round((ratio - 1) * 100);
            flags.push(`${p}: ${prevY}→${y} ${sign}${Math.abs(pct)}%`);
          }
        }
      }
    }
    return flags.slice(0, 6);
  }, [rows]);

  return (
    <section className="container space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programSet.has("HIV") && (
          <Card className="surface">
            <CardHeader>
              <CardTitle>HIV — Expansion assumptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                The current forecast suggests Ethiopia will be treating about 690,000 people in 2024, rising to nearly
                780,000 by 2028.
              </p>
              <p>
                Today, only around 510,000 people are on HIV treatment nationally. This means the plan assumes a 35–50%
                jump in four years.
              </p>
              <div>
                <Badge variant="destructive">High risk if funding/capacity lag</Badge>
              </div>
              <p>
                Such a rapid expansion is possible only with major new funding, expanded testing, and stronger patient
                follow-up systems. Without these, the forecasted numbers are unrealistic.
              </p>
            </CardContent>
          </Card>
        )}

        {(programSet.has("TB") || programSet.has("Tuberculosis")) && (
          <Card className="surface">
            <CardHeader>
              <CardTitle>Tuberculosis — Test volume vs capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>The forecast includes over 3 million TB rapid tests a year by 2026.</p>
              <p>
                Ethiopia sees about 175,000 new TB cases each year. Even allowing for multiple tests per patient, 3
                million tests a year is far beyond current laboratory capacity.
              </p>
              <div>
                <Badge variant="destructive">Capacity risk</Badge>
              </div>
              <p>
                Without more testing machines, trained staff, and maintenance budgets, the forecasted number of tests
                cannot be used effectively.
              </p>
            </CardContent>
          </Card>
        )}

        {programSet.has("Malaria") && (
          <Card className="surface lg:col-span-2">
            <CardHeader>
              <CardTitle>Malaria — Treatment sufficiency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                For 2024, the forecast has only 280,000 malaria treatment courses — far below the 4–5 million courses
                needed given recent malaria case numbers.
              </p>
              <p>
                From 2025 onwards, the forecast rises to about 3.2 million courses a year, but even this may be too low
                if high transmission continues.
              </p>
              <div>
                <Badge variant="secondary">Shortfall risk</Badge>
              </div>
              <p>
                If we don’t plan for enough treatment medicines, patients will be left without proper care during
                outbreaks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="surface">
        <CardHeader>
          <CardTitle>Cross-cutting concerns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Some year-to-year changes are unexplained and abrupt (for example, malaria treatments jump 10-fold from
              2024 to 2025).
            </li>
            <li>
              The numbers do not clearly show how they match the country’s health system capacity — for example, can
              clinics store, distribute, and use these quantities in time?
            </li>
            <li>
              Without realistic links between disease numbers, program capacity, and procurement plans, there’s a risk of
              over-buying some medicines and under-supplying others.
            </li>
          </ul>
          {abruptChanges.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {abruptChanges.map((t, i) => (
                <Badge key={i} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export { ProgramInsights };
