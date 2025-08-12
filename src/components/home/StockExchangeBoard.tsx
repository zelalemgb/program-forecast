import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type StockPost = {
  id: string;
  type: "excess" | "need";
  facility: string;
  product: string;
  qty: number;
  unit?: string;
  expiry?: string;
  contact?: string;
  notes?: string;
  createdAt: string;
};

interface Props {
  posts?: StockPost[];
  onCreate?: () => void;
}

const StockExchangeBoard: React.FC<Props> = ({ posts = [], onCreate }) => {
  const excess = posts.filter(p => p.type === "excess");
  const needs = posts.filter(p => p.type === "need");

  const renderTable = (rows: StockPost[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Facility</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.facility}</TableCell>
              <TableCell>{r.product}</TableCell>
              <TableCell>{r.qty} {r.unit}</TableCell>
              <TableCell>{r.expiry || "-"}</TableCell>
              <TableCell>{r.contact || "-"}</TableCell>
              <TableCell className="max-w-[260px] truncate">{r.notes || ""}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground">
                No posts yet. {onCreate && (<Button variant="link" className="px-1" onClick={onCreate}>Announce excess stock</Button>)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card className="surface">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Stock Exchange</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="excess">
          <TabsList>
            <TabsTrigger value="excess">Excess available</TabsTrigger>
            <TabsTrigger value="need">Need / Request</TabsTrigger>
          </TabsList>
          <TabsContent value="excess" className="mt-4">
            {renderTable(excess)}
          </TabsContent>
          <TabsContent value="need" className="mt-4">
            {renderTable(needs)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StockExchangeBoard;
