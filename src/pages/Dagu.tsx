import React from "react";
import { Helmet } from "react-helmet-async";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dagu: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Dagu Module — Facility Inventory & RRF</title>
        <meta name="description" content="Dagu: master data, inventory control, RRF and alerts. Barcode-enabled, offline-first with Dexie." />
        <link rel="canonical" href="/dagu" />
      </Helmet>
      <PageHeader
        title="Dagu: Supply Chain Module"
        description="Master data, inventory, RRF and alerts — offline-first, barcode-ready."
      />
      <main className="grid gap-4 md:grid-cols-3">
        <Link to="#master-data">
          <Card>
            <CardHeader>
              <CardTitle>Master Data</CardTitle>
            </CardHeader>
            <CardContent>
              Manage items, programs, suppliers and facilities.
            </CardContent>
          </Card>
        </Link>
        <Link to="#inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Control</CardTitle>
            </CardHeader>
            <CardContent>
              Stock cards, transactions, counts, FEFO enforcement.
            </CardContent>
          </Card>
        </Link>
        <Link to="#rrf">
          <Card>
            <CardHeader>
              <CardTitle>RRF</CardTitle>
            </CardHeader>
            <CardContent>
              Auto-populate, validate, approve and submit.
            </CardContent>
          </Card>
        </Link>
      </main>
    </>
  );
};

export default Dagu;
