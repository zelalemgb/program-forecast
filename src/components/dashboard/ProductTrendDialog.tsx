import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Scatter, LabelList } from "recharts";
import type { ForecastDataset } from "@/types/forecast";

export type ProductTrendDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: string | null;
  rows: ForecastDataset["rows"];
};

// Helper to format large numbers nicely
const numberFmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const ProductTrendDialog: React.FC<ProductTrendDialogProps> = ({ open, onOpenChange, product, rows }) => {
  const thresholdUp = 2.0; // +100% or more increase
  const thresholdDown = 0.5; // -50% or more decrease

  const series = React.useMemo(() => {
    if (!product) return [] as { year: string; qty: number; yoyRatio: number | null; flagged: boolean }[];

    const byYear = new Map<string, number>();
    rows
      .filter((r) => r["Product List"] === product)
      .forEach((r) => {
        const y = r.Year || "";
        const prev = byYear.get(y) || 0;
        byYear.set(y, prev + (r["Forecasted Quantity"] || 0));
      });

    const years = Array.from(byYear.keys()).sort((a, b) => parseInt(a) - parseInt(b));
    const data = years.map((y) => ({ year: y, qty: byYear.get(y) || 0 }));

    return data.map((pt, idx) => {
      if (idx === 0) return { ...pt, yoyRatio: null, flagged: false };
      const prev = data[idx - 1].qty;
      const ratio = prev > 0 ? pt.qty / prev : null;
      const flagged = ratio != null && (ratio >= thresholdUp || ratio <= thresholdDown);
      return { ...pt, yoyRatio: ratio, flagged };
    });
  }, [product, rows]);

  const flaggedJumps = React.useMemo(() => series.filter((s) => s.flagged && s.yoyRatio != null), [series]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Trend for {product || ""}</DialogTitle>
          <DialogDescription>
            Forecasted quantity by year; abrupt changes are highlighted. Flags: YoY ≥ +100% or ≤ -50%.
          </DialogDescription>
        </DialogHeader>

        {series.length <= 1 ? (
          <div className="text-sm text-muted-foreground">Not enough yearly data to plot a trend.</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => numberFmt(v)} />
                <Tooltip
                  formatter={(value: number, name, props) => {
                    if (name === "qty") return [numberFmt(value), "Forecasted Qty"];
                    return [value, name];
                  }}
                  labelFormatter={(label: string, payload) => {
                    const pt = payload?.[0]?.payload as any;
                    const pct = pt?.yoyRatio != null ? `${((pt.yoyRatio - 1) * 100).toFixed(0)}%` : "";
                    return pct ? `${label} (YoY: ${pct})` : label;
                  }}
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" as unknown as string }}
                />
                <Line type="monotone" dataKey="qty" stroke={`hsl(var(--brand))`} dot={{ r: 3 }} activeDot={{ r: 5 }}>
                  <LabelList
                    dataKey="qty"
                    position="top"
                    formatter={(value) => numberFmt(value as number)}
                    fill={`hsl(var(--foreground))`}
                  />
                </Line>
                <Scatter data={series.filter((d) => d.flagged)} fill={`hsl(var(--destructive))`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {flaggedJumps.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Detected abrupt changes</div>
            <div className="flex flex-wrap gap-2">
              {flaggedJumps.map((pt, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-destructive/10 text-destructive px-2 py-1 text-xs"
                >
                  {pt.year}: {(pt.yoyRatio! >= 1 ? "+" : "")} {((pt.yoyRatio! - 1) * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        )}

        {flaggedJumps.length === 0 && series.length > 1 && (
          <div className="mt-2 text-sm text-muted-foreground">No abrupt year-to-year jumps detected.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
