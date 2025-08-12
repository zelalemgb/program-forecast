import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import KPICards from "@/components/home/KPICards";
import StockExchangeBoard from "@/components/home/StockExchangeBoard";
import QuickActions from "@/components/home/QuickActions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Landing: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  const { toast } = useToast();

  return (
    <main>
      <Helmet>
        <title>Health Forecasting Platform | Import & Analyze CSV</title>
        <meta name="description" content="Health forecasting platform to import CSVs, analyze trends, and validate assumptions." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <section className="container py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Health Programs Forecasting Platform</h1>
            <p className="mt-3 text-lg text-muted-foreground">
              A common home for facility, woreda, zonal, regional and national actors to prevent stockouts and expiries,
              improve data readiness, and keep forecasts and procurement on track.
            </p>
          </div>

          {/* Quick actions + Announce dialog */}
          <div className="sm:min-w-[320px]">
            <Dialog>
              <DialogTrigger asChild>
                <div>
                  <QuickActions onAnnounce={() => { /* handled by DialogTrigger */ }} />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Announce Excess Stock</DialogTitle>
                  <DialogDescription>Share details so nearby facilities can coordinate transfers.</DialogDescription>
                </DialogHeader>
                <form
                  className="grid gap-3 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const data = Object.fromEntries(new FormData(form).entries());
                    toast({ title: "Posted", description: "Your excess stock announcement will be visible within your scope soon." });
                  }}
                >
                  <div className="space-y-1">
                    <Label>Facility</Label>
                    <Input name="facility" placeholder="e.g., Addis Ababa HC" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Product</Label>
                    <Input name="product" placeholder="e.g., Amoxicillin 500mg" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Quantity</Label>
                    <Input name="qty" type="number" min={0} step="1" placeholder="e.g., 1200" required />
                  </div>
                  <div className="space-y-1">
                    <Label>Unit</Label>
                    <Input name="unit" placeholder="e.g., tabs, vials, packs" />
                  </div>
                  <div className="space-y-1">
                    <Label>Expiry (optional)</Label>
                    <Input name="expiry" type="date" />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Contact</Label>
                    <Input name="contact" placeholder="Phone or email" />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="w-full">Post Announcement</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="container space-y-8 pb-16">
        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StockExchangeBoard onCreate={() => {}} />
          </div>
          <Card className="surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Procurement Snapshot</CardTitle>
              <CardDescription>Your requests by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><Link className="story-link" to="/requests">Open requests</Link></li>
                <li><Link className="story-link" to="/requests">Awaiting approval</Link></li>
                <li><Link className="story-link" to="/requests">With supplier</Link></li>
                <li><Link className="story-link" to="/requests">In transit</Link></li>
                <li><Link className="story-link" to="/requests">Received / GRV</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Data Quality & Coverage</CardTitle>
              <CardDescription>Late/missing reports and key flags</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Connect your data and view guardrails and coverage here.</p>
              <div className="mt-3"><Button asChild variant="outline"><Link to="/validation">Open Guardrails</Link></Button></div>
            </CardContent>
          </Card>
          <Card className="surface">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Snapshot</CardTitle>
              <CardDescription>Allocated vs committed vs available</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Set up budgets and PSM % in Program Settings to populate this widget.</p>
              <div className="mt-3"><Button asChild variant="outline"><Link to="/program-settings">Program Settings</Link></Button></div>
            </CardContent>
          </Card>
        </div>

        <Card className="surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity & Announcements</CardTitle>
            <CardDescription>Recent updates in your scope</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity. Actions you or your team take (requests, comments, approvals) will appear here.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Landing;
