import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { db, RrfHeaderLocal } from "@/local/db";

const schema = z.object({
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/i, "Use YYYY-MM format"),
  program_id: z.string().min(1, "Program is required"),
  facility_id: z
    .string()
    .transform((v) => Number(v))
    .refine((n) => Number.isFinite(n) && n > 0, { message: "Enter a valid facility ID" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function currentMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export const RRFManager: React.FC = () => {
  const [drafts, setDrafts] = useState<RrfHeaderLocal[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { period: currentMonth(), program_id: "", facility_id: "" as unknown as any },
  });

  const loadDrafts = useMemo(
    () => async () => {
      const rows = await db.rrfHeaders.orderBy("created_at").reverse().toArray();
      setDrafts(rows);
    },
    []
  );

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      const payload: RrfHeaderLocal = {
        facility_id: values.facility_id as unknown as number,
        program_id: values.program_id,
        period: values.period,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // notes field exists on server rrf_headers, locally we can store in future if needed
      };
      await db.rrfHeaders.add(payload);
      toast({ title: "Draft created", description: `RRF for ${values.period} saved locally.` });
      form.reset({ period: values.period, program_id: "", facility_id: "" as unknown as any, notes: "" });
      await loadDrafts();
    } catch (e: any) {
      toast({ title: "Failed to save draft", description: e?.message ?? String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="rrf" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create RRF Draft</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 md:grid-cols-4"
            aria-label="Create RRF Draft Form"
          >
            <div className="space-y-2">
              <Label htmlFor="period">Period (YYYY-MM)</Label>
              <Input
                id="period"
                type="month"
                value={form.watch("period")}
                onChange={(e) => form.setValue("period", e.target.value)}
                aria-invalid={!!form.formState.errors.period}
              />
              {form.formState.errors.period && (
                <p className="text-sm text-destructive">{form.formState.errors.period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="program_id">Program ID</Label>
              <Input
                id="program_id"
                placeholder="uuid of program"
                {...form.register("program_id")}
                aria-invalid={!!form.formState.errors.program_id}
              />
              {form.formState.errors.program_id && (
                <p className="text-sm text-destructive">{form.formState.errors.program_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="facility_id">Facility ID</Label>
              <Input
                id="facility_id"
                inputMode="numeric"
                placeholder="numeric facility id"
                {...form.register("facility_id")}
                aria-invalid={!!form.formState.errors.facility_id}
              />
              {form.formState.errors.facility_id && (
                <p className="text-sm text-destructive">{form.formState.errors.facility_id.message as string}</p>
              )}
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local RRF Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <p className="text-muted-foreground">No local drafts yet.</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.period}</TableCell>
                      <TableCell className="font-mono text-xs break-all">{d.program_id}</TableCell>
                      <TableCell>{d.facility_id}</TableCell>
                      <TableCell>{d.status}</TableCell>
                      <TableCell>{new Date(d.created_at ?? "").toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default RRFManager;
