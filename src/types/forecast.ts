export type ForecastRow = {
  Program: string;
  "Product List": string;
  Unit: string;
  Year: string; // e.g., "2021/22"
  "Forecasted Quantity": number; // parsed number
  "unit price": number; // parsed number
  "Forecasted Total"?: number; // if missing, compute qty * unit price
  "Opian Total"?: number; // optional actual/observed total
  "Observed difference"?: number; // Opian - Forecasted
};

export type ForecastDataset = {
  rows: ForecastRow[];
  programs: string[];
  years: string[];
  totals: {
    totalForecastedValue: number;
    totalObservedValue: number;
    totalObservedDiff: number;
    totalItems: number;
    totalPrograms: number;
  };
};

export function parseNumber(input: unknown): number {
  if (typeof input === "number") return input;
  if (typeof input === "string") {
    const cleaned = input.replace(/,/g, "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function buildDataset(rows: ForecastRow[]): ForecastDataset {
  const normalized = rows.map((r) => {
    const qty = parseNumber(r["Forecasted Quantity"]);
    const price = parseNumber(r["unit price"]);
    const forecastTotal = r["Forecasted Total"] != null ? parseNumber(r["Forecasted Total"]) : qty * price;
    const opianTotal = r["Opian Total"] != null ? parseNumber(r["Opian Total"]) : forecastTotal;
    const diff = r["Observed difference"] != null ? parseNumber(r["Observed difference"]) : opianTotal - forecastTotal;

    return {
      Program: r.Program?.trim() || "Unknown",
      "Product List": r["Product List"]?.trim() || "Unknown",
      Unit: r.Unit?.trim() || "",
      Year: r.Year?.toString().trim() || "",
      "Forecasted Quantity": qty,
      "unit price": price,
      "Forecasted Total": forecastTotal,
      "Opian Total": opianTotal,
      "Observed difference": diff,
    } as ForecastRow;
  });

  const programs = Array.from(new Set(normalized.map((r) => r.Program))).sort();
  const years = Array.from(new Set(normalized.map((r) => r.Year))).sort();

  const totalForecastedValue = normalized.reduce((s, r) => s + (r["Forecasted Total"] || 0), 0);
  const totalObservedValue = normalized.reduce((s, r) => s + (r["Opian Total"] || 0), 0);
  const totalObservedDiff = normalized.reduce((s, r) => s + (r["Observed difference"] || 0), 0);

  return {
    rows: normalized,
    programs,
    years,
    totals: {
      totalForecastedValue,
      totalObservedValue,
      totalObservedDiff,
      totalItems: normalized.length,
      totalPrograms: programs.length,
    },
  };
}
