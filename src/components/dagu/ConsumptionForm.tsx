import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { db } from "@/local/db";

const schema = z.object({
  item_id: z.string().min(1, "Item ID required"),
  qty: z.coerce.number().positive("Quantity must be > 0"),
  txn_dt: z.string().optional(),
  doc_ref: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const ConsumptionForm: React.FC<{ onSaved?: () => void }>= ({ onSaved }) => {
  const [saving, setSaving] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { item_id: "", qty: 1, txn_dt: new Date().toISOString().slice(0, 10) },
  });

  const canSave = useMemo(() => form.formState.isValid, [form.formState.isValid]);

  async function onSubmit(values: FormValues) {
    try {
      setSaving(true);
      await db.transactions.add({
        type: "issue",
        item_id: values.item_id,
        qty: values.qty,
        txn_dt: `${values.txn_dt ?? new Date().toISOString().slice(0,10)}T00:00:00Z`,
        doc_ref: values.doc_ref,
        created_at: new Date().toISOString(),
      });
      toast({ title: "Consumption recorded", description: `Issued ${values.qty} for ${values.item_id}` });
      onSaved?.();
      form.reset({ item_id: "", qty: 1, txn_dt: new Date().toISOString().slice(0, 10), doc_ref: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? String(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capture Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="item_id">Item ID</Label>
            <Input id="item_id" {...form.register("item_id")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" step="1" {...form.register("qty", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="txn_dt">Transaction Date</Label>
            <Input id="txn_dt" type="date" {...form.register("txn_dt")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc_ref">Reference</Label>
            <Input id="doc_ref" placeholder="Optional doc ref" {...form.register("doc_ref")} />
          </div>
          <div className="md:col-span-4">
            <Button type="submit" disabled={saving || !canSave}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConsumptionForm;
