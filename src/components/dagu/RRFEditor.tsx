import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type RrfHeader = {
  id: string;
  facility_id: number;
  program_id: string;
  period: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type RrfLine = {
  id: string;
  rrf_id: string;
  item_id: string;
  soh?: number | null;
  amc?: number | null;
  pipeline?: number | null;
  suggested_order?: number | null;
  final_order?: number | null;
  comments?: string | null;
};

function suggestOrder(soh?: number | null, amc?: number | null, pipeline?: number | null) {
  const s = Number(soh || 0);
  const a = Number(amc || 0);
  const p = Number(pipeline || 0);
  const targetMonths = 3; // simple policy
  const need = a * targetMonths + p - s;
  return Math.max(0, Math.round(need));
}

function dqChecks(lines: RrfLine[]): string[] {
  const issues: string[] = [];
  lines.forEach((l, idx) => {
    if (!l.item_id) issues.push(`Line ${idx + 1}: Missing item_id`);
    if (l.soh != null && l.soh < 0) issues.push(`Line ${idx + 1}: Negative SOH`);
    if (l.amc != null && l.amc < 0) issues.push(`Line ${idx + 1}: Negative AMC`);
    if (l.final_order != null && l.final_order < 0) issues.push(`Line ${idx + 1}: Negative final order`);
    if (l.soh == null || l.amc == null) issues.push(`Line ${idx + 1}: Missing SOH/AMC`);
  });
  return issues;
}

export const RRFEditor: React.FC<{ rrfId: string }>= ({ rrfId }) => {
  const [header, setHeader] = useState<RrfHeader | null>(null);
  const [lines, setLines] = useState<RrfLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: h, error: he }, { data: ls, error: le }] = await Promise.all([
        supabase.from("rrf_headers").select("*").eq("id", rrfId).maybeSingle(),
        supabase.from("rrf_lines").select("*").eq("rrf_id", rrfId),
      ]);
      if (he) throw he;
      if (le) throw le;
      setHeader(h as any);
      setLines((ls as any[]) || []);
      const roleRes = await supabase.rpc("get_current_user_role");
      if (!roleRes.error) setRole((roleRes.data as any) ?? null);
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  }, [rrfId]);

  useEffect(() => { load(); }, [load]);

  const onUpdateLine = async (id: string, patch: Partial<RrfLine>) => {
    const updated = lines.map((l) => (l.id === id ? { ...l, ...patch } : l));
    setLines(updated);
  };

  const saveLine = async (line: RrfLine) => {
    const { error } = await supabase.from("rrf_lines").update({
      soh: line.soh,
      amc: line.amc,
      pipeline: line.pipeline,
      suggested_order: suggestOrder(line.soh, line.amc, line.pipeline),
      final_order: line.final_order,
      comments: line.comments,
    }).eq("id", line.id);
    if (error) throw error;
  };

  const onSaveAll = async () => {
    try {
      setLoading(true);
      for (const l of lines) {
        await saveLine(l);
      }
      toast({ title: "Saved", description: "All lines updated" });
      await load();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  const onAddLine = async (newLine: Partial<RrfLine>) => {
    try {
      if (!newLine.item_id) {
        toast({ title: "Item required", description: "Provide an item_id" });
        return;
      }
      const payload = {
        rrf_id: rrfId,
        item_id: newLine.item_id,
        soh: newLine.soh ?? 0,
        amc: newLine.amc ?? 0,
        pipeline: newLine.pipeline ?? 0,
        suggested_order: suggestOrder(newLine.soh ?? 0, newLine.amc ?? 0, newLine.pipeline ?? 0),
        final_order: newLine.final_order ?? null,
        comments: newLine.comments ?? null,
      };
      const { error } = await supabase.from("rrf_lines").insert(payload as any);
      if (error) throw error;
      toast({ title: "Line added" });
      await load();
    } catch (e: any) {
      toast({ title: "Add failed", description: e.message ?? String(e) });
    }
  };

  const issues = useMemo(() => dqChecks(lines), [lines]);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("submit_rrf", { p_rrf_id: rrfId });
      if (error) throw error;
      toast({ title: "Submitted" });
      await load();
    } catch (e: any) {
      toast({ title: "Submit failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  const onDecision = async (decision: "approved" | "returned") => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc("approve_rrf", { p_rrf_id: rrfId, p_decision: decision });
      if (error) throw error;
      toast({ title: decision === "approved" ? "Approved" : "Returned" });
      await load();
    } catch (e: any) {
      toast({ title: "Action failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  const [newItemId, setNewItemId] = useState("");
  const [newSOH, setNewSOH] = useState<number>(0);
  const [newAMC, setNewAMC] = useState<number>(0);
  const [newPipe, setNewPipe] = useState<number>(0);

  return (
    <Card className="mt-6">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>RRF Editor {header ? `— ${header.period} (${header.status})` : ""}</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>Reload</Button>
          <Button size="sm" onClick={onSaveAll} disabled={loading}>Save All</Button>
          {header?.status && (header.status === "draft" || header.status === "returned") && (
            <Button size="sm" variant="secondary" onClick={onSubmit} disabled={loading || issues.length > 0}>
              Submit
            </Button>
          )}
          {(role === "admin" || role === "analyst") && header?.status === "submitted" && (
            <>
              <Button size="sm" variant="outline" onClick={() => onDecision("returned")} disabled={loading}>Return</Button>
              {role === "admin" && (
                <Button size="sm" onClick={() => onDecision("approved")} disabled={loading}>Approve</Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length > 0 && (
          <div className="rounded-md border border-destructive/30 p-3 text-sm">
            <strong>Data quality issues:</strong>
            <ul className="list-disc ml-5 mt-2">
              {issues.map((m, i) => (<li key={i}>{m}</li>))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-2 items-end">
          <div className="space-y-1">
            <Label>Item ID</Label>
            <Input value={newItemId} onChange={(e) => setNewItemId(e.target.value)} placeholder="item uuid" />
          </div>
          <div className="space-y-1">
            <Label>SOH</Label>
            <Input type="number" value={newSOH} onChange={(e) => setNewSOH(Number(e.target.value || 0))} />
          </div>
          <div className="space-y-1">
            <Label>AMC</Label>
            <Input type="number" value={newAMC} onChange={(e) => setNewAMC(Number(e.target.value || 0))} />
          </div>
          <div className="space-y-1">
            <Label>Pipeline</Label>
            <Input type="number" value={newPipe} onChange={(e) => setNewPipe(Number(e.target.value || 0))} />
          </div>
          <Button onClick={() => onAddLine({ item_id: newItemId, soh: newSOH, amc: newAMC, pipeline: newPipe })}>Add line</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SOH</TableHead>
                <TableHead>AMC</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Final</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs break-all">{l.item_id}</TableCell>
                  <TableCell>
                    <Input type="number" value={l.soh ?? 0} onChange={(e) => onUpdateLine(l.id, { soh: Number(e.target.value || 0) })} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={l.amc ?? 0} onChange={(e) => onUpdateLine(l.id, { amc: Number(e.target.value || 0) })} />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={l.pipeline ?? 0} onChange={(e) => onUpdateLine(l.id, { pipeline: Number(e.target.value || 0) })} />
                  </TableCell>
                  <TableCell>{suggestOrder(l.soh, l.amc, l.pipeline)}</TableCell>
                  <TableCell>
                    <Input type="number" value={l.final_order ?? 0} onChange={(e) => onUpdateLine(l.id, { final_order: Number(e.target.value || 0) })} />
                  </TableCell>
                  <TableCell>
                    <Input value={l.comments ?? ""} onChange={(e) => onUpdateLine(l.id, { comments: e.target.value })} onBlur={() => saveLine(lines.find(li => li.id === l.id)!)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RRFEditor;
