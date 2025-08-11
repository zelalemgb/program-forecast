import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface RequestRow {
  id: string;
  user_id: string;
  is_new_facility: boolean;
  facility_id: number | null;
  facility_name: string | null;
  facility_type: string | null;
  woreda_id: number;
  status: string;
  created_at: string;
}

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = React.useState<RequestRow[]>([]);
  const [woredaMap, setWoredaMap] = React.useState<Record<number, string>>({});
  const [facilityMap, setFacilityMap] = React.useState<Record<number, string>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: reqs, error } = await supabase
        .from("registration_requests")
        .select("id, user_id, is_new_facility, facility_id, facility_name, facility_type, woreda_id, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const r = reqs || [];
      setRows(r as any);

      const woredaIds = Array.from(new Set(r.map((it: any) => it.woreda_id)));
      if (woredaIds.length) {
        const { data: w, error: wErr } = await supabase.from("woreda").select("woreda_id, woreda_name").in("woreda_id", woredaIds);
        if (wErr) throw wErr;
        setWoredaMap(Object.fromEntries((w || []).map((x: any) => [x.woreda_id, x.woreda_name])));
      } else {
        setWoredaMap({});
      }

      const facilityIds = Array.from(new Set(r.map((it: any) => it.facility_id).filter(Boolean)));
      if (facilityIds.length) {
        const { data: f, error: fErr } = await supabase.from("facility").select("facility_id, facility_name").in("facility_id", facilityIds as number[]);
        if (fErr) throw fErr;
        setFacilityMap(Object.fromEntries((f || []).map((x: any) => [x.facility_id, x.facility_name])));
      } else {
        setFacilityMap({});
      }
    } catch (err: any) {
      toast({ title: "Failed to load approvals", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const approve = async (id: string) => {
    try {
      const { error } = await supabase.rpc("approve_registration_request", { request_id: id });
      if (error) throw error;
      toast({ title: "Approved" });
      setRows(prev => prev.filter(x => x.id !== id));
    } catch (err: any) {
      toast({ title: "Approval failed", description: err.message, variant: "destructive" });
    }
  };

  const reject = async (id: string) => {
    try {
      const { error } = await supabase.from("registration_requests").update({ status: "rejected" }).eq("id", id);
      if (error) throw error;
      toast({ title: "Rejected" });
      setRows(prev => prev.filter(x => x.id !== id));
    } catch (err: any) {
      toast({ title: "Rejection failed", description: err.message, variant: "destructive" });
    }
  };

  const canonical = `${window.location.origin}/approvals`;

  return (
    <main>
      <Helmet>
        <title>Approvals | Health Forecasts</title>
        <meta name="description" content="Review and approve facility registration requests." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <section className="container py-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground mt-2">Review pending facility registration requests in your scope.</p>
      </section>

      <section className="container pb-16">
        <Card className="surface">
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending requests.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Woreda</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{woredaMap[r.woreda_id] || r.woreda_id}</TableCell>
                      <TableCell className="text-sm">{r.is_new_facility ? (r.facility_name || "(new)") : (r.facility_id ? facilityMap[r.facility_id] : "")}</TableCell>
                      <TableCell className="text-sm">{r.is_new_facility ? (r.facility_type || "") : (r.facility_id ? "existing" : "")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => reject(r.id)}>Reject</Button>
                          <Button size="sm" onClick={() => approve(r.id)}>Approve</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Approvals;
