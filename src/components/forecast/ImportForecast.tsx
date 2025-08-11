import React from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ForecastRow, buildDataset, parseNumber } from "@/types/forecast";
import { supabase } from "@/integrations/supabase/client";

interface ImportForecastProps {
  onData(dataset: ReturnType<typeof buildDataset>): void;
}

const SAMPLE_CSV_HEADERS = [
  "Program",
  "Product List",
  "Unit",
  "Year",
  "Forecasted Quantity",
  "unit price",
  "Forecasted Total",
  "Opian Total",
  "Observed difference",
];

const SAMPLE_CSV = `Program,Product List,Unit,Year,Forecasted Quantity,unit price,Forecasted Total,Opian Total,Observed difference\nChild Health,Amoxicillin 125 mg Dispersible Tablet,10X10,2021/22,44141,1.2,52969.2,52969.2,0\nChild Health,Amoxicilline 250 mg Dispersible Tablet,10X10,2021/22,545823,1.34,731402.82,731402.82,0\nChild Health,Gentamicin - 40mg/ml in 2ml - Injection,10,2021/22,170465,0.63,107392.95,107392.95,0\nChild Health,Vitamin K1 (Phytomenadione) - 1mg/ml in 0.5ml ampoule - Injection,3,2021/22,396532,0.3,118959.6,118959.6,0\nChild Health,"Chlorhexidine 4% Gel, 21gm",Each,2021/22,1285474,0.31,398496.94,398496.94,0\nChild Health,ORS,"1,000",2021/22,9313,70,651880,651910,-30\nChild Health,Zinc 20mg Dispersable Tablet,10X10,2021/22,104527,1.15,120206.05,120206.05,0\nChild Health,Zinc- ORS Co-pack(2 sachet ORS + 10 tab Zinc),Kit,2021/22,9741652,0.21,2045746.92,2045746.92,0\nChild Health,Albendazole 400mg Tablet,50X2,2021/22,609456,2.57,1566301.92,1566301.92,0\nChild Health,Ampiciline 250mg Powder for Injection,50,2021/22,100697,2.3,231603.1,231603.1,0`;


export const ImportForecast: React.FC<ImportForecastProps> = ({ onData }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    Papa.parse<ForecastRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors?.length) {
          console.error(results.errors);
          toast({
            title: "Import warning",
            description: `Some rows had issues. Processed ${results.data.length} rows.`,
          });
        }

        // Validate headers
        const headers = results.meta.fields || [];
        const missing = SAMPLE_CSV_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length) {
          toast({
            title: "Invalid file format",
            description: `Missing columns: ${missing.join(", ")}`,
          });
          return;
        }

        // Persist rows into Supabase (in parallel with local dataset build)
        const rows = (results.data as ForecastRow[]).map((r) => ({
          program: String(r["Program"] || "").trim(),
          product_list: String(r["Product List"] || "").trim(),
          unit: r["Unit"] ? String(r["Unit"]) : null,
          year: r["Year"] ? String(r["Year"]) : null,
          forecasted_quantity: parseNumber((r as any)["Forecasted Quantity"]),
          unit_price: parseNumber((r as any)["unit price"]),
          forecasted_total: parseNumber((r as any)["Forecasted Total"]),
          opian_total: parseNumber((r as any)["Opian Total"]),
          observed_difference: parseNumber((r as any)["Observed difference"]),
        }));

        (async () => {
          const { error } = await supabase.from("forecast_rows").insert(rows);
          if (error) {
            toast({ title: "Database insert failed", description: error.message });
          } else {
            toast({ title: "Saved to database", description: `${rows.length} rows stored in Supabase.` });
          }
        })().catch((e) => console.error(e));

        const dataset = buildDataset(results.data as ForecastRow[]);
        onData(dataset);
        toast({
          title: "Import successful",
          description: `${dataset.rows.length} rows loaded across ${dataset.totals.totalPrograms} programs` ,
        });
      },
    });
  };

  const onUploadClick = () => fileInputRef.current?.click();

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forecast-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearData = async () => {
    const { error } = await supabase.from("forecast_rows").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      toast({ title: "Clear failed", description: error.message });
    } else {
      toast({ title: "Table cleared", description: "All forecast rows have been deleted." });
    }
  };

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle>Bulk Import Forecast Data</CardTitle>
        <CardDescription>Upload CSV matching the provided template to analyze programs and products.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <Button variant="default" onClick={onUploadClick}>
          Upload CSV
        </Button>
        <Button variant="secondary" onClick={downloadTemplate}>
          Download Template
        </Button>
        <Button variant="destructive" onClick={clearData}>
          Clear Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImportForecast;
