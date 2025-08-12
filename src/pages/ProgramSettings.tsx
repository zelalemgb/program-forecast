import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types from Supabase
import type { Database } from "@/integrations/supabase/types";
import PageHeader from "@/components/layout/PageHeader";

type Program = Database["public"]["Tables"]["programs"]["Row"];
type ProgramSettings = Database["public"]["Tables"]["program_settings"]["Row"];
type FundingSource = Database["public"]["Tables"]["funding_sources"]["Row"];
type Allocation = Database["public"]["Tables"]["program_funding_allocations"]["Row"];

const years = Array.from({ length: 6 }, (_, i) => `${2024 + i}`);

const ProgramSettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(years[0]);
  const [psmPercent, setPsmPercent] = useState<string>("0");
  const [budgetTotal, setBudgetTotal] = useState<string>("0");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Load data
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

  // Load settings & allocations when selection changes
  useEffect(() => {
    const load = async () => {
      if (!selectedProgramId || !selectedYear) return;
      const { data: s } = await supabase
        .from("program_settings")
        .select("*")
        .eq("program_id", selectedProgramId)
        .eq("year", selectedYear)
        .maybeSingle();
      if (s) {
        setSettingsId(s.id);
        setPsmPercent(String(s.psm_percent ?? 0));
        setBudgetTotal(String(s.budget_total ?? 0));
      } else {
        setSettingsId(null);
        setPsmPercent("0");
        setBudgetTotal("0");
      }
      const { data: allocs } = await supabase
        .from("program_funding_allocations")
        .select("*")
        .eq("program_id", selectedProgramId)
        .eq("year", selectedYear);
      setAllocations(allocs || []);
    };
    load();
  }, [selectedProgramId, selectedYear]);

  const selectedProgram = useMemo(() => programs.find(p => p.id === selectedProgramId), [programs, selectedProgramId]);

  const handleCreateProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const code = (form.elements.namedItem("code") as HTMLInputElement).value.trim();
    if (!name) return;
    const { data, error } = await supabase.from("programs").insert({ name, code }).select("*");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program created" });
      setPrograms(prev => [...prev, ...(data || [])]);
      form.reset();
    }
  };

  const handleSaveSettings = async () => {
    if (!selectedProgramId) {
      toast({ title: "Select a program" });
      return;
    }
    const payload = {
      program_id: selectedProgramId,
      year: selectedYear,
      psm_percent: Number(psmPercent) || 0,
      budget_total: Number(budgetTotal) || 0,
    } as Partial<ProgramSettings> & { program_id: string; year: string };
    let error;
    if (settingsId) {
      ({ error } = await supabase.from("program_settings").update(payload).eq("id", settingsId));
    } else {
      const res = await supabase.from("program_settings").insert(payload).select("id").maybeSingle();
      error = res.error || undefined;
      if (res.data?.id) setSettingsId(res.data.id);
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  const handleAddFundingSource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("fs_name") as HTMLInputElement).value.trim();
    const code = (form.elements.namedItem("fs_code") as HTMLInputElement).value.trim();
    if (!name) return;
    const { data, error } = await supabase.from("funding_sources").insert({ name, code }).select("*");
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funding source added" });
      setFundingSources(prev => [...prev, ...(data || [])]);
      form.reset();
    }
  };

  const handleUpdateAllocation = async (fsId: string, amount: string) => {
    if (!selectedProgramId) return;
    const payload = {
      program_id: selectedProgramId,
      year: selectedYear,
      funding_source_id: fsId,
      allocated_amount: Number(amount) || 0,
    } as Partial<Allocation> & { program_id: string; year: string; funding_source_id: string };

    const existing = allocations.find(a => a.funding_source_id === fsId);
    let error;
    if (existing) {
      ({ error } = await supabase.from("program_funding_allocations").update({ allocated_amount: payload.allocated_amount }).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("program_funding_allocations").insert(payload));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Allocation saved" });
      // refresh allocations
      const { data } = await supabase
        .from("program_funding_allocations")
        .select("*")
        .eq("program_id", selectedProgramId)
        .eq("year", selectedYear);
      setAllocations(data || []);
    }
  };

  return (
    <>
      <Helmet>
        <title>Program Settings & Budget | Procurement Monitoring</title>
        <meta name="description" content="Configure program budgets, PSM %, and funding sources for the selected forecast year." />
        <link rel="canonical" href="/program-settings" />
      </Helmet>
      <PageHeader
        title="Program Settings"
        description="Configure program budgets, PSM %, and funding sources for the selected forecast year."
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Program</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProgram} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Program Name</Label>
                <Input id="name" name="name" placeholder="e.g., Malaria" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" placeholder="e.g., MAL" />
              </div>
              <Button type="submit" className="w-full">Save Program</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Year Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Program</Label>
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
              <div className="space-y-1">
                <Label>Forecast Year</Label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>PSM %</Label>
                <Input type="number" step="0.01" value={psmPercent} onChange={e => setPsmPercent(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Program Budget</Label>
                <Input type="number" step="0.01" value={budgetTotal} onChange={e => setBudgetTotal(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={!selectedProgramId}>Save Settings</Button>
            </div>

            {selectedProgram && (
              <div className="text-sm text-muted-foreground">Editing settings for {selectedProgram.name} - {selectedYear}</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Funding Source</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFundingSource} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fs_name">Name</Label>
                  <Input id="fs_name" name="fs_name" placeholder="e.g., Global Fund" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fs_code">Code</Label>
                  <Input id="fs_code" name="fs_code" placeholder="e.g., GF" />
                </div>
              </div>
              <Button type="submit">Add Funding Source</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocations for Selected Program & Year</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProgramId ? (
              <div className="text-sm text-muted-foreground">Select a program and year to manage allocations.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funding Source</TableHead>
                    <TableHead>Allocated Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fundingSources.map(fs => {
                    const existing = allocations.find(a => a.funding_source_id === fs.id);
                    const [amount, setAmount] = [existing?.allocated_amount ?? 0, undefined];
                    return (
                      <TableRow key={fs.id}>
                        <TableCell className="font-medium">{fs.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={String(amount)}
                            onBlur={(e) => handleUpdateAllocation(fs.id, e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">Auto-saves on blur</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default ProgramSettingsPage;
