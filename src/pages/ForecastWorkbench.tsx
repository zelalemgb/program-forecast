import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import ImportCommodityIssues from "@/components/forecast/ImportCommodityIssues";

// Types from Supabase
type Program = Database["public"]["Tables"]["programs"]["Row"];
type ProgramSettings = Database["public"]["Tables"]["program_settings"]["Row"];

type ForecastRow = Database["public"]["Tables"]["forecast_rows"]["Row"];

type ValidationResult = Database["public"]["Tables"]["validation_results"]["Row"];

const years = Array.from({ length: 6 }, (_, i) => `${2024 + i}`);

const ForecastWorkbench: React.FC = () => {
  const { toast } = useToast();

  // Selections
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [productType, setProductType] = useState<"program" | "rdf">("program"); // UI only for now

  // Data
  const [rows, setRows] = useState<ForecastRow[]>([]);
  const [validations, setValidations] = useState<Record<string, ValidationResult[]>>({});
  const [settings, setSettings] = useState<ProgramSettings | null>(null);

  // Local edits map
  const [edits, setEdits] = useState<Record<string, { qty: number; price: number }>>({});

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );

  const totalSubtotal = useMemo(() => {
    return rows.reduce((sum, r) => {
      const e = edits[r.id!];
      const qty = Number(e?.qty ?? r.forecasted_quantity ?? 0);
      const price = Number(e?.price ?? r.unit_price ?? 0);
      return sum + qty * price;
    }, 0);
  }, [rows, edits]);

  const psmAmount = useMemo(() => {
    const p = Number(settings?.psm_percent ?? 0);
    return (totalSubtotal * p) / 100;
  }, [settings, totalSubtotal]);

  const totalWithPsm = useMemo(() => totalSubtotal + psmAmount, [totalSubtotal, psmAmount]);

  // Load programs
  useEffect(() => {
    const loadPrograms = async () => {
      const { data } = await supabase.from("programs").select("*").order("name");
      setPrograms(data || []);
    };
    loadPrograms();
  }, []);

  // Load settings for program/year
  useEffect(() => {
    const loadSettings = async () => {
      if (!selectedProgramId || !selectedYear) {
        setSettings(null);
        return;
      }
      const { data } = await supabase
        .from("program_settings")
        .select("*")
        .eq("program_id", selectedProgramId)
        .eq("year", selectedYear)
        .maybeSingle();
      setSettings(data ?? null);
    };
    loadSettings();
  }, [selectedProgramId, selectedYear]);

  // Load forecast rows by program name and year (programs.name == forecast_rows.program)
  useEffect(() => {
    const loadRows = async () => {
      if (!selectedProgram || !selectedYear) {
        setRows([]);
        setValidations({});
        return;
      }
      const { data: fr } = await supabase
        .from("forecast_rows")
        .select("*")
        .eq("program", selectedProgram.name)
        .eq("year", selectedYear)
        .order("product_list", { ascending: true });
      setRows(fr || []);
      setEdits({});

      // load validations mapped by row id
      const rowIds = (fr || []).map((r) => r.id).filter(Boolean) as string[];
      if (rowIds.length) {
        const { data: vr } = await supabase
          .from("validation_results")
          .select("*")
          .in("forecast_row_id", rowIds);
        const grouped = (vr || []).reduce<Record<string, ValidationResult[]>>((acc, v) => {
          const key = v.forecast_row_id || "";
          if (!acc[key]) acc[key] = [];
          acc[key].push(v);
          return acc;
        }, {});
        setValidations(grouped);
      } else {
        setValidations({});
      }
    };
    loadRows();
  }, [selectedProgram, selectedYear]);

  const handleEdit = (id: string, patch: Partial<{ qty: number; price: number }>) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        qty: patch.qty ?? prev[id]?.qty ?? (rows.find((r) => r.id === id)?.forecasted_quantity as number) ?? 0,
        price: patch.price ?? prev[id]?.price ?? (rows.find((r) => r.id === id)?.unit_price as number) ?? 0,
      },
    }));
  };

  const runModel = (model: "ai" | "ma" | "reg") => {
    toast({ title: "Model run queued", description: `${model.toUpperCase()} assistant will be added soon.` });
  };

  return (
    <main>
      <Helmet>
        <title>Forecast Workbench | Build, Review, Budget</title>
        <meta name="description" content="Create or adjust facility forecasts, review flags, and compare against budget." />
        <link rel="canonical" href="/forecast" />
      </Helmet>


      <section className="space-y-6">
        <ImportCommodityIssues onDataImported={() => {
          toast({ title: "Data imported", description: "Commodity issue data has been imported successfully." });
        }} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Modeling & Methods</CardTitle>
            <CardDescription>Select a method and run adjustments (preview only)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="space-y-1">
                <Label>Program</Label>
                <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Forecast Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Product Type</Label>
                <Select value={productType} onValueChange={(v) => setProductType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="rdf">RDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="ai">
              <TabsList>
                <TabsTrigger value="ai">AI Assist</TabsTrigger>
                <TabsTrigger value="ma">Moving Average</TabsTrigger>
                <TabsTrigger value="reg">Regression</TabsTrigger>
              </TabsList>
              <TabsContent value="ai" className="space-y-3">
                <p className="text-sm text-muted-foreground">Use AI to suggest adjustments based on past demand and seasonality. Coming soon.</p>
                <Button onClick={() => runModel("ai")} disabled={!rows.length}>Run AI Assist</Button>
              </TabsContent>
              <TabsContent value="ma" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Window</Label>
                    <Input type="number" defaultValue={3} min={1} />
                  </div>
                  <div className="space-y-1">
                    <Label>Weighting</Label>
                    <Select defaultValue="simple">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="weighted">Weighted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => runModel("ma")} disabled={!rows.length}>Run Moving Average</Button>
              </TabsContent>
              <TabsContent value="reg" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Target</Label>
                    <Select defaultValue="qty">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="qty">Quantity</SelectItem>
                        <SelectItem value="price">Unit Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Include seasonality</Label>
                    <Select defaultValue="yes">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-popover">
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => runModel("reg")} disabled={!rows.length}>Run Regression</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Budget Panel</CardTitle>
            <CardDescription>Compare edited subtotal vs program budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedProgram ? (
              <p className="text-sm text-muted-foreground">Select a program and year to view budget.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Program</div>
                  <div className="font-medium">{selectedProgram?.name}</div>
                  <div className="text-muted-foreground">Year</div>
                  <div className="font-medium">{selectedYear}</div>
                  <div className="text-muted-foreground">Budget Total</div>
                  <div className="font-medium">{Number(settings?.budget_total ?? 0).toLocaleString()}</div>
                  <div className="text-muted-foreground">PSM %</div>
                  <div className="font-medium">{Number(settings?.psm_percent ?? 0)}%</div>
                </div>
                <div className="border-t my-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Edited Subtotal</div>
                  <div className="font-medium">{totalSubtotal.toLocaleString()}</div>
                  <div className="text-muted-foreground">PSM Amount</div>
                  <div className="font-medium">{psmAmount.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total (incl. PSM)</div>
                  <div className="font-medium">{totalWithPsm.toLocaleString()}</div>
                  <div className="text-muted-foreground">Budget Gap</div>
                  <div className="font-medium">{(Number(settings?.budget_total ?? 0) - totalWithPsm).toLocaleString()}</div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button disabled title="Coming soon">Commit budget</Button>
                  <Button asChild variant="outline">
                    <a href="/requests/new">Create procurement request</a>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Forecast Lines</CardTitle>
            <CardDescription>Edit quantities and unit prices (local preview)</CardDescription>
          </CardHeader>
          <CardContent>
            {!rows.length ? (
              <div className="text-sm text-muted-foreground">No forecast data found for the selected program and year.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="w-[140px]">Quantity</TableHead>
                    <TableHead className="w-[140px]">Unit Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const e = edits[r.id!];
                    const qty = Number(e?.qty ?? r.forecasted_quantity ?? 0);
                    const price = Number(e?.price ?? r.unit_price ?? 0);
                    const subtotal = qty * price;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.product_list}</TableCell>
                        <TableCell>{r.unit}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={String(qty)}
                            onBlur={(ev) => handleEdit(r.id!, { qty: Number(ev.target.value || 0) })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={String(price)}
                            onBlur={(ev) => handleEdit(r.id!, { price: Number(ev.target.value || 0) })}
                          />
                        </TableCell>
                        <TableCell className="text-right">{subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assumptions & Flags</CardTitle>
            <CardDescription>Document assumptions and review guardrails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Assumptions (notes)</Label>
              <Input placeholder="e.g., 5% growth, RSV seasonality Q4" />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Validation flags</div>
              {Object.keys(validations).length === 0 ? (
                <div className="text-sm text-muted-foreground">No flags available for current selection.</div>
              ) : (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {Object.entries(validations).slice(0, 10).map(([rid, arr]) => (
                    <li key={rid}>{arr.length} flag(s) on item {rid}</li>
                  ))}
                  {Object.keys(validations).length > 10 && (
                    <li className="text-muted-foreground">… and more</li>
                  )}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default ForecastWorkbench;
