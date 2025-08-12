import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const years = Array.from({ length: 6 }, (_, i) => `${2024 + i}`);

type Program = Database["public"]["Tables"]["programs"]["Row"];
type Request = Database["public"]["Tables"]["procurement_requests"]["Row"];

export default function RequestsPage() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [rows, setRows] = useState<Request[]>([]);

  useEffect(() => {
    supabase.from("programs").select("*").order("name").then(({ data }) => setPrograms(data || []));
  }, []);

  useEffect(() => {
    const fetchRows = async () => {
      let q = supabase.from("procurement_requests").select("*").order("created_at", { ascending: false });
      if (selectedProgramId && selectedProgramId !== "__all__") q = q.eq("program_id", selectedProgramId);
      if (selectedYear) q = q.eq("year", selectedYear);
      const { data } = await q;
      setRows(data || []);
    };
    fetchRows();
  }, [selectedProgramId, selectedYear]);

  const programMap = useMemo(() => Object.fromEntries(programs.map(p => [p.id, p.name])), [programs]);

  return (
    <main className="container py-6 space-y-4">
      <Helmet>
        <title>Procurement Requests | Procurement Monitoring</title>
        <meta name="description" content="Create and track procurement requests by program and year." />
        <link rel="canonical" href="/requests" />
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Procurement Requests</h1>
        <Button onClick={() => navigate("/requests/new")}>New Request</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm">Program</label>
            <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="__all__">All</SelectItem>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at!).toLocaleDateString()}</TableCell>
                  <TableCell>{programMap[r.program_id] || r.program_id}</TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell>{(r.request_total ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/requests/${r.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">No requests yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
