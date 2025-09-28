import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

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
  const { userRole } = useUserRole();
  const [realExcess, setRealExcess] = useState<StockPost[]>([]);
  const [realNeeds, setRealNeeds] = useState<StockPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Get all inventory balances and filter in JS
        const { data: allBalances } = await supabase
          .from('inventory_balances')
          .select(`
            id,
            current_stock,
            max_level,
            reorder_level,
            product_id,
            facility_id,
            products (name),
            facility (facility_name)
          `)
          .limit(50);

        if (!allBalances) return;

        // Filter overstocked items (excess)
        const excessItems = allBalances.filter(item => 
          item.current_stock > (item.max_level * 1.2)
        ).slice(0, 5);

        // Filter low stock/stockout items (needs)
        const needItems = allBalances.filter(item => 
          item.current_stock < item.reorder_level
        ).slice(0, 5);

        // Convert to StockPost format
        const excessPosts: StockPost[] = (excessItems || []).map(item => ({
          id: item.id,
          type: "excess" as const,
          facility: item.facility?.facility_name || 'Unknown Facility',
          product: item.products?.name || 'Unknown Product',
          qty: Math.floor((item.current_stock - item.max_level) * 0.7), // Available excess
          unit: 'units',
          expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 months
          contact: 'Logistics Officer',
          notes: 'Overstocked - available for transfer',
          createdAt: new Date().toISOString()
        }));

        const needPosts: StockPost[] = (needItems || []).map(item => ({
          id: item.id,
          type: "need" as const,
          facility: item.facility?.facility_name || 'Unknown Facility',
          product: item.products?.name || 'Unknown Product',
          qty: Math.max(item.reorder_level - item.current_stock, 1), // Needed quantity
          unit: 'units',
          contact: 'Logistics Officer',
          notes: item.current_stock === 0 ? 'Stockout - urgent need' : 'Below reorder level',
          createdAt: new Date().toISOString()
        }));

        setRealExcess(excessPosts);
        setRealNeeds(needPosts);
      } catch (error) {
        console.error('Error fetching stock exchange data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Use real data if available, otherwise fall back to props
  const excess = posts.length > 0 ? posts.filter(p => p.type === "excess") : realExcess;
  const needs = posts.length > 0 ? posts.filter(p => p.type === "need") : realNeeds;

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
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground text-center py-4">
                Loading stock exchange data...
              </TableCell>
            </TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-sm text-muted-foreground text-center py-4">
                No {excess.length > 0 ? 'excess stock available' : 'requests posted'} yet. 
                {onCreate && (
                  <Button variant="link" className="px-1" onClick={onCreate}>
                    Announce {excess.length > 0 ? 'excess' : 'need for'} stock
                  </Button>
                )}
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
