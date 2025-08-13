import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { db, StockBalance, TransactionRow } from "@/local/db";

export const CountsVariance: React.FC = () => {
  const [itemId, setItemId] = useState("");
  const [facilityId, setFacilityId] = useState<string>("");
  const [counted, setCounted] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const onApply = useMemo(
    () => async () => {
      if (!itemId || !facilityId) {
        toast({ title: "Missing fields", description: "Provide item and facility" });
        return;
      }
      setLoading(true);
      try {
        const fid = Number(facilityId);
        const bal = await db.stockBalances
          .where("item_id")
          .equals(itemId)
          .and((b) => b.facility_id === fid)
          .first();
        const current = bal?.soh_qty ?? 0;
        const delta = counted - current;
        if (delta === 0) {
          toast({ title: "No variance", description: "Count matches SOH" });
          setLoading(false);
          return;
        }
        const type: TransactionRow["type"] = delta > 0 ? "adjustment+" : "adjustment-";
        await db.transactions.add({
          type,
          item_id: itemId,
          qty: Math.abs(delta),
          reason: "Stock count variance",
          txn_dt: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
        if (bal?.id) {
          await db.stockBalances.update(bal.id, { soh_qty: counted });
        } else {
          await db.stockBalances.add({ facility_id: fid, item_id: itemId, soh_qty: counted });
        }
        toast({ title: "Variance posted", description: `Adjusted ${Math.abs(delta)} as ${type}` });
        setItemId("");
        setFacilityId("");
        setCounted(0);
      } catch (e: any) {
        toast({ title: "Error", description: e?.message ?? String(e) });
      } finally {
        setLoading(false);
      }
    },
    [itemId, facilityId, counted]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Counts & Variance</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="facility">Facility ID</Label>
          <Input id="facility" value={facilityId} onChange={(e) => setFacilityId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item">Item ID</Label>
          <Input id="item" value={itemId} onChange={(e) => setItemId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="counted">Counted Qty</Label>
          <Input id="counted" type="number" value={counted} onChange={(e) => setCounted(Number(e.target.value || 0))} />
        </div>
        <div className="flex items-end">
          <Button onClick={onApply} disabled={loading}>{loading ? "Posting..." : "Post Variance"}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountsVariance;
