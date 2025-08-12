import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ContextPanel from "@/components/requests/ContextPanel";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

const years = Array.from({ length: 6 }, (_, i) => `${2024 + i}`);

type Program = Database["public"]["Tables"]["programs"]["Row"];
type ForecastRow = Database["public"]["Tables"]["forecast_rows"]["Row"];
type ProgramSettings = Database["public"]["Tables"]["program_settings"]["Row"];
type FundingSource = Database["public"]["Tables"]["funding_sources"]["Row"];

type SelectedLine = {
  row: ForecastRow;
  requestedQty: number;
  unitPrice: number;
  subtotal: number;
};

export default function RequestWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [forecastRows, setForecastRows] = useState<ForecastRow[]>([]);
  const [programSettings, setProgramSettings] = useState<ProgramSettings | null>(null);
  const [selectedLines, setSelectedLines] = useState<Record<string, SelectedLine>>({});
  const [fundingSourceId, setFundingSourceId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Load reference lists
  useEffect(() => {
    const load = async () => {
      const [{ data: progs }, { data: fs }] = await Promise.all([
        supabase.from("programs").select("*").order("name"),
        supabase.from("funding_sources").select("*").order("name"),
      ]);
      setPrograms(progs || []);
      setFundingSources(fs || []);
    };
    load();
  }, []);

  // Load forecast rows and settings
  useEffect(() => {
    const run = async () => {
      if (!selectedProgramId || !selectedYear) return;
      // Settings
      const { data: s } = await supabase
        .from("program_settings")
        .select("*")
        .eq("program_id", selectedProgramId)
        .eq("year", selectedYear)
        .maybeSingle();
      setProgramSettings(s || null);

      // Forecast
      const { data: rows } = await supabase
        .from("forecast_rows")
        .select("*")
        .eq("program", programs.find(p => p.id === selectedProgramId)?.name || "")
        .eq("year", selectedYear);
      setForecastRows(rows || []);
      setSelectedLines({});
    };
    run();
  }, [selectedProgramId, selectedYear, programs]);

  const toggleSelect = (r: ForecastRow) => {
    setSelectedLines(prev => {
      const next = { ...prev };
      if (next[r.id!]) delete next[r.id!];
      else {
        const unitPrice = Number(r.unit_price) || 0;
        const qty = Number(r.forecasted_quantity) || 0;
        next[r.id!] = {
          row: r,
          requestedQty: qty,
          unitPrice,
          subtotal: qty * unitPrice,
        };
      }
      return next;
    });
  };

  const updateLine = (id: string, patch: Partial<SelectedLine>) => {
    setSelectedLines(prev => {
      const cur = prev[id];
      if (!cur) return prev;
      const requestedQty = patch.requestedQty ?? cur.requestedQty;
      const unitPrice = patch.unitPrice ?? cur.unitPrice;
      const subtotal = requestedQty * unitPrice;
      return { ...prev, [id]: { ...cur, ...patch, subtotal } };
    });
  };

  const lines = useMemo(() => Object.values(selectedLines), [selectedLines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.subtotal, 0), [lines]);
  const psmPercent = programSettings?.psm_percent ?? 0;
  const psmAmount = (subtotal * (psmPercent || 0)) / 100;
  const total = subtotal + psmAmount;

  const handleSave = async (submit = false) => {
    if (!selectedProgramId) {
      toast({ title: "Select a program" });
      return;
    }
    if (lines.length === 0) {
      toast({ title: "No items selected" });
      return;
    }
    const status = submit ? "submitted" : "draft";
    const { data: req, error } = await supabase
      .from("procurement_requests")
      .insert({
        program_id: selectedProgramId,
        year: selectedYear,
        funding_source_id: (fundingSourceId === "pooled" || fundingSourceId === "") ? null : fundingSourceId,
        psm_percent: psmPercent || 0,
        status,
        current_stage: status,
        notes,
      })
      .select("id")
      .maybeSingle();

    if (error || !req?.id) {
      toast({ title: "Error", description: error?.message || "Failed to create request", variant: "destructive" });
      return;
    }

    const items = lines.map(l => ({
      request_id: req.id,
      forecast_row_id: l.row.id!,
      item_name: l.row.product_list || "",
      unit: l.row.unit || "",
      requested_quantity: l.requestedQty,
      updated_unit_price: l.unitPrice,
      line_subtotal: l.subtotal,
    }));

    const { error: itemErr } = await supabase.from("procurement_request_items").insert(items);
    if (itemErr) {
      toast({ title: "Error", description: itemErr.message, variant: "destructive" });
      return;
    }

    if (submit) {
      await supabase.from("request_transitions").insert({
        request_id: req.id,
        from_stage: "draft",
        to_stage: "submitted",
        decision: "Submit",
        comment: "",
      });
    }

    toast({ title: submit ? "Request submitted" : "Draft saved" });
    navigate(`/requests/${req.id}`);
  };

  return (
    <main className="container py-6 space-y-4">
      <Helmet>
        <title>Create Procurement Request | Procurement Monitoring</title>
        <meta name="description" content="Create a procurement request from forecast items with auto-calculated totals and PSM." />
        <link rel="canonical" href="/requests/new" />
      </Helmet>

      <h1 className="text-2xl font-semibold tracking-tight">Create Procurement Request</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Program & Year</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm">Program</label>
                <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Funding Source</label>
                <Select value={fundingSourceId} onValueChange={setFundingSourceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Undesignated (pooled)" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="pooled">Undesignated (pooled)</SelectItem>
                    {fundingSources.map(fs => (
                      <SelectItem key={fs.id} value={fs.id}>{fs.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Items from Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Forecast Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastRows.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <input type="checkbox" checked={!!selectedLines[r.id!]} onChange={() => toggleSelect(r)} />
                      </TableCell>
                      <TableCell className="font-medium">{r.product_list}</TableCell>
                      <TableCell>{r.unit}</TableCell>
                      <TableCell>{Number(r.forecasted_quantity || 0).toLocaleString()}</TableCell>
                      <TableCell>{Number(r.unit_price || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {lines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Adjust Quantities & Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Requested Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map(l => (
                      <TableRow key={l.row.id}>
                        <TableCell className="font-medium">{l.row.product_list}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            defaultValue={String(l.requestedQty)}
                            onBlur={(e) => updateLine(l.row.id!, { requestedQty: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            defaultValue={String(l.unitPrice)}
                            onBlur={(e) => updateLine(l.row.id!, { unitPrice: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell>{l.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                      <TableCell>{subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">PSM ({psmPercent || 0}%)</TableCell>
                      <TableCell>{psmAmount.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                      <TableCell className="font-semibold">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 space-y-2">
                  <label className="text-sm">Internal Notes</label>
                  <Input placeholder="Short notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => handleSave(false)}>Save Draft</Button>
                  <Button onClick={() => handleSave(true)}>Submit</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <ContextPanel
            budgetRemaining={programSettings?.budget_total || 0}
            forecastBalance={forecastRows.reduce((s, r) => s + Number(r.forecasted_total || 0), 0)}
            psmPercent={programSettings?.psm_percent || 0}
          />
        </div>
      </div>
    </main>
  );
}
