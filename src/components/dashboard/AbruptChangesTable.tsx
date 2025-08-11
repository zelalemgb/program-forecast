import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ForecastDataset } from "@/types/forecast";

export type AbruptChangesTableProps = {
  rows: ForecastDataset["rows"];
  onPickProduct: (product: string) => void;
  limit?: number;
};

const numberFmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const AbruptChangesTable: React.FC<AbruptChangesTableProps> = ({ rows, onPickProduct, limit = 50 }) => {
  const thresholdUp = 2.0; // +100% or more increase
  const thresholdDown = 0.5; // -50% or more decrease

  const items = React.useMemo(() => {
    const byProduct = new Map<string, Map<string, number>>();

    rows.forEach((r) => {
      const p = r["Product List"];
      const y = r.Year || "";
      const qty = r["Forecasted Quantity"] || 0;
      if (!byProduct.has(p)) byProduct.set(p, new Map());
      const map = byProduct.get(p)!;
      map.set(y, (map.get(y) || 0) + qty);
    });

    type Flag = { fromYear: string; toYear: string; ratio: number; fromQty: number; toQty: number };

    const results: { product: string; years: string[]; flags: Flag[]; score: number }[] = [];

    for (const [product, yearMap] of byProduct.entries()) {
      const years = Array.from(yearMap.keys()).sort((a, b) => parseInt(a) - parseInt(b));
      const data = years.map((y) => ({ year: y, qty: yearMap.get(y) || 0 }));
      const flags: Flag[] = [];
      for (let i = 1; i < data.length; i++) {
        const prev = data[i - 1];
        const curr = data[i];
        if (prev.qty <= 0) continue;
        const ratio = curr.qty / prev.qty;
        if (ratio >= thresholdUp || ratio <= thresholdDown) {
          flags.push({ fromYear: prev.year, toYear: curr.year, ratio, fromQty: prev.qty, toQty: curr.qty });
        }
      }
      if (flags.length) {
        const maxAbs = Math.max(...flags.map((f) => Math.abs(f.ratio - 1)));
        results.push({ product, years, flags, score: maxAbs });
      }
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit);
  }, [rows, limit]);

  if (!items.length) return null;

  const formatChange = (f: { fromYear: string; toYear: string; ratio: number; fromQty: number; toQty: number }) => {
    const pct = ((f.ratio - 1) * 100).toFixed(0);
    const sign = f.ratio >= 1 ? "+" : "";
    return `${f.fromYear}→${f.toYear}: ${sign}${pct}% ( ${numberFmt(f.fromQty)} → ${numberFmt(f.toQty)} )`;
  };

  return (
    <Card className="surface">
      <CardHeader>
        <CardTitle>Products with Abrupt Year-to-Year Changes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Years</TableHead>
                <TableHead>Notable change</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it, idx) => {
                const top = it.flags
                  .slice()
                  .sort((a, b) => Math.abs(b.ratio - 1) - Math.abs(a.ratio - 1))[0];
                const others = it.flags.length > 1 ? ` +${it.flags.length - 1} more` : "";
                return (
                  <TableRow
                    key={idx}
                    className="hover:bg-accent/50 cursor-pointer"
                    title={`View yearly trend for ${it.product}`}
                    onClick={() => onPickProduct(it.product)}
                  >
                    <TableCell className="font-medium">{it.product}</TableCell>
                    <TableCell>{it.years.join(", ")}</TableCell>
                    <TableCell className="text-destructive">{top ? formatChange(top) : ""}{others}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      Abrupt change detected based on YoY threshold (≥ +100% or ≤ -50%). Click to see the trend.
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Showing up to {items.length} products. Use the Filters above to narrow by Program and Years.
        </p>
      </CardContent>
    </Card>
  );
};
