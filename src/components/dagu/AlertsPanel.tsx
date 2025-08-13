import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db, Batch, Item, StockBalance } from "@/local/db";
import { parseISODate } from "./utils";

const MIN_MOS = 1;
const MAX_MOS = 6;
const EXPIRY_WITHIN_DAYS = 90;

interface AlertRow {
  item: Item;
  type: "stockout" | "understock" | "overstock" | "expiry";
  detail: string;
}

async function getMOS(itemId: string): Promise<number | undefined> {
  // Basic MOS estimation using last known SOH and naive AMC from last 3 months
  const bal = await db.stockBalances.where("item_id").equals(itemId).first();
  const txns = await db.transactions.where("item_id").equals(itemId).toArray();
  const last3 = new Map<string, number>();
  const now = new Date();
  for (const t of txns) {
    if (t.type !== "issue") continue;
    const d = parseISODate(t.txn_dt);
    if (!d) continue;
    // consider only last ~90 days
    if (now.getTime() - d.getTime() > 90 * 86400000) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    last3.set(key, (last3.get(key) ?? 0) + (t.qty ?? 0));
  }
  const values = Array.from(last3.values());
  const amc = values.length ? values.reduce((a, b) => a + b, 0) / values.length : undefined;
  const soh = bal?.soh_qty;
  return amc && amc > 0 && typeof soh === "number" ? soh / amc : undefined;
}

export const AlertsPanel: React.FC = () => {
  const [rows, setRows] = useState<AlertRow[]>([]);

  const load = useMemo(
    () => async () => {
      const items = await db.items.toArray();
      const alerts: AlertRow[] = [];

      for (const it of items) {
        const mos = await getMOS(it.id);
        const bal = await db.stockBalances.where("item_id").equals(it.id).first();
        const soh = bal?.soh_qty ?? 0;

        if (soh === 0 || (typeof mos === "number" && mos <= 0)) {
          alerts.push({ item: it, type: "stockout", detail: "SOH is zero" });
        } else if (typeof mos === "number" && mos < MIN_MOS) {
          alerts.push({ item: it, type: "understock", detail: `MOS ${mos.toFixed(2)} < ${MIN_MOS}` });
        } else if (typeof mos === "number" && mos > MAX_MOS) {
          alerts.push({ item: it, type: "overstock", detail: `MOS ${mos.toFixed(2)} > ${MAX_MOS}` });
        }

        // Expiry alerts
        const batches = await db.batches.where("item_id").equals(it.id).toArray();
        const soon = batches.filter((b) => {
          const d = parseISODate(b.expiry_date);
          if (!d) return false;
          const days = (d.getTime() - Date.now()) / 86400000;
          return days >= 0 && days <= EXPIRY_WITHIN_DAYS;
        });
        if (soon.length > 0) {
          alerts.push({ item: it, type: "expiry", detail: `${soon.length} batch(es) expiring within ${EXPIRY_WITHIN_DAYS} days` });
        }
      }

      setRows(alerts);
    },
    []
  );

  useEffect(() => { load(); }, [load]);

  const badge = (t: AlertRow["type"]) => {
    const map: Record<AlertRow["type"], string> = {
      stockout: "destructive",
      understock: "secondary",
      overstock: "outline",
      expiry: "default",
    };
    return <Badge variant={map[t] as any}>{t}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground">No alerts right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={r.item.id + idx}>
                    <TableCell>{r.item.canonical_name}</TableCell>
                    <TableCell>{badge(r.type)}</TableCell>
                    <TableCell>{r.detail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
