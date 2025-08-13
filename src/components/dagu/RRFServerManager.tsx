import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RRFEditor from "./RRFEditor";

export const RRFServerManager: React.FC = () => {
  const [period, setPeriod] = useState<string>(() => new Date().toISOString().slice(0, 7));
  const [programId, setProgramId] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [headers, setHeaders] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rrf_headers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setHeaders(data || []);
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createHeader = async () => {
    try {
      if (!programId || !facilityId) {
        toast({ title: "Missing fields", description: "Program and facility are required" });
        return;
      }
      setLoading(true);
      const fid = Number(facilityId);
      const { data, error } = await supabase
        .from("rrf_headers")
        .insert({ program_id: programId, facility_id: fid, period, status: "draft" } as any)
        .select()
        .maybeSingle();
      if (error) throw error;
      toast({ title: "RRF created", description: `Period ${period}` });
      setSelected((data as any).id);
      await load();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rrf" className="mt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RRF (Server)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label>Period</Label>
              <Input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Program ID</Label>
              <Input value={programId} onChange={(e) => setProgramId(e.target.value)} placeholder="uuid" />
            </div>
            <div className="space-y-1">
              <Label>Facility ID</Label>
              <Input value={facilityId} onChange={(e) => setFacilityId(e.target.value)} placeholder="numeric" />
            </div>
            <div className="flex items-end">
              <Button onClick={createHeader} disabled={loading}>Create</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(headers || []).map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.period}</TableCell>
                    <TableCell>{h.status}</TableCell>
                    <TableCell>{h.facility_id}</TableCell>
                    <TableCell className="font-mono text-xs break-all">{h.program_id}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelected(h.id)}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selected && <RRFEditor rrfId={selected} />}
    </section>
  );
};

export default RRFServerManager;
