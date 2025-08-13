import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db, Item, StockBalance, TransactionRow } from "@/local/db";
import { getLastCompletedMonths, monthKey, parseISODate } from "./utils";

interface Row {
  item: Item;
  soh?: number;
  amc?: number;
  mos?: number;
}

async function computeAMCForItem(itemId: string, months = 3): Promise<number | undefined> {
  const keys = getLastCompletedMonths(months);
  const txns: TransactionRow[] = await db.transactions
    .where("item_id").equals(itemId)
    .toArray();
  const byMonth: Record<string, number> = {};
  for (const t of txns) {
    if (t.type !== "issue") continue;
    const d = parseISODate(t.txn_dt);
    if (!d) continue;
    const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
    if (!keys.includes(key)) continue;
    byMonth[key] = (byMonth[key] ?? 0) + (t.qty ?? 0);
  }
  const values = keys.map((k) => byMonth[k] ?? 0);
  const nonZeroMonths = values.filter((v) => v > 0);
  const denom = nonZeroMonths.length || values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  return denom > 0 ? sum / denom : undefined;
}

export const AMCOverview: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const [items, balances] = await Promise.all([
          db.items.toArray(),
          db.stockBalances.toArray(),
        ]);
        const data: Row[] = [];
        for (const it of items) {
          const amc = await computeAMCForItem(it.id, 3);
          const bal = balances.find((b) => b.item_id === it.id);
          const soh = bal?.soh_qty;
          const mos = amc && amc > 0 && typeof soh === "number" ? soh / amc : undefined;
          data.push({ item: it, amc, soh, mos });
        }
        setRows(data);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => { load(); }, [load]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>AMC & MOS</CardTitle>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground">No items found. Add items and transactions to see AMC/MOS.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SOH</TableHead>
                  <TableHead>AMC (3m)</TableHead>
                  <TableHead>MOS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.item.id}>
                    <TableCell>{r.item.canonical_name}</TableCell>
                    <TableCell>{r.soh ?? "-"}</TableCell>
                    <TableCell>{typeof r.amc === "number" ? r.amc.toFixed(2) : "-"}</TableCell>
                    <TableCell>{typeof r.mos === "number" ? r.mos.toFixed(2) : "-"}</TableCell>
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

export default AMCOverview;
