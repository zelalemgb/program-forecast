import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Dagu: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <main>
      <Helmet>
        <title>Dagu LMIS | Facility Inventory</title>
        <meta
          name="description"
          content="Dagu: record receipts, issues, and track stock by batch/expiry at facility level."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">Dagu Facility Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Record received drugs and issues to departments. FEFO-ready, offline-first coming next.
        </p>
      </header>

      <section>
        <Tabs defaultValue="receive">
          <TabsList aria-label="Dagu workflows">
            <TabsTrigger value="receive">Receive</TabsTrigger>
            <TabsTrigger value="issue">Issue</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="receive" role="region" aria-label="Receive">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Capture receipts from EPSA/central store, transfers-in, or internal purchases.
              </p>
              <Button variant="default">Start Receipt</Button>
            </div>
          </TabsContent>

          <TabsContent value="issue" role="region" aria-label="Issue">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Issue stock to departments/wards. FEFO batches will be suggested.
              </p>
              <Button variant="default">Record Issue</Button>
            </div>
          </TabsContent>

          <TabsContent value="stock" role="region" aria-label="Stock">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                View stock by item and batch. Physical count & adjustments coming next.
              </p>
              <Button variant="outline">Refresh</Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
};

export default Dagu;
