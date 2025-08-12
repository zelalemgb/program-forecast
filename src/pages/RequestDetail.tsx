import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StageTimeline from "@/components/requests/StageTimeline";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Request = Database["public"]["Tables"]["procurement_requests"]["Row"];
type Item = Database["public"]["Tables"]["procurement_request_items"]["Row"];
type Transition = Database["public"]["Tables"]["request_transitions"]["Row"];

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [req, setReq] = useState<Request | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [transitions, setTransitions] = useState<Transition[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [{ data: r }, { data: it }, { data: tr }] = await Promise.all([
        supabase.from("procurement_requests").select("*").eq("id", id).maybeSingle(),
        supabase.from("procurement_request_items").select("*").eq("request_id", id),
        supabase.from("request_transitions").select("*").eq("request_id", id).order("created_at", { ascending: true }),
      ]);
      setReq(r || null);
      setItems(it || []);
      setTransitions(tr || []);
    };
    load();
  }, [id]);

  const approve = async () => {
    if (!id || !req) return;
    const next = req.status === "submitted" || req.status === "returned" ? "approved" : "in_procurement";
    const { error } = await supabase.from("procurement_requests").update({ status: next, current_stage: next }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("request_transitions").insert({
      request_id: id,
      from_stage: req.current_stage,
      to_stage: next,
      decision: "Approve",
    });
    toast({ title: "Approved" });
    navigate(0);
  };

  const sendBack = async () => {
    if (!id || !req) return;
    const { error } = await supabase.from("procurement_requests").update({ status: "returned", current_stage: "returned" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("request_transitions").insert({
      request_id: id,
      from_stage: req.current_stage,
      to_stage: "returned",
      decision: "Return",
      comment: "Returned by approver",
    });
    toast({ title: "Returned" });
    navigate(0);
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + Number(i.line_subtotal || 0), 0), [items]);

  if (!req) return (
    <main className="container py-6">
      <div className="text-sm text-muted-foreground">Loading...</div>
    </main>
  );

  return (
    <main className="container py-6 space-y-4">
      <Helmet>
        <title>Request Detail | Procurement Monitoring</title>
        <meta name="description" content="Review and act on a procurement request across stages with a full timeline." />
        <link rel="canonical" href={`/requests/${id}`} />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Request #{req.id?.slice(0, 8)} - <span className="capitalize">{req.status}</span></h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={sendBack}>Return</Button>
          <Button onClick={approve}>Approve</Button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.item_name}</TableCell>
                      <TableCell>{i.unit}</TableCell>
                      <TableCell>{Number(i.requested_quantity || 0).toLocaleString()}</TableCell>
                      <TableCell>{Number(i.updated_unit_price || 0).toLocaleString()}</TableCell>
                      <TableCell>{Number(i.line_subtotal || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">Subtotal</TableCell>
                    <TableCell>{subtotal.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">PSM ({req.psm_percent || 0}%)</TableCell>
                    <TableCell>{Number(req.psm_amount || 0).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
                    <TableCell className="font-semibold">{Number(req.request_total || 0).toLocaleString()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StageTimeline transitions={transitions} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Header</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div><span className="text-muted-foreground">Program:</span> {req.program_id}</div>
              <div><span className="text-muted-foreground">Year:</span> {req.year}</div>
              <div><span className="text-muted-foreground">Funding Source:</span> {req.funding_source_id || 'Undesignated'}</div>
              <div><span className="text-muted-foreground">Created:</span> {new Date(req.created_at!).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
