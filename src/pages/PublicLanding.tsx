import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OSMFacilitiesMap from "@/components/map/OSMFacilitiesMap";
import { supabase } from "@/integrations/supabase/client";

const PublicLanding: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  const [regionMetrics, setRegionMetrics] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from('ethiopia_2025_2026').select('region,cost');
        if (error) return;
        const map: Record<string, number> = {};
        for (const row of data || []) {
          const name = (row as any).region as string | null;
          const cost = Number((row as any).cost) || 0;
          if (!name) continue;
          map[name] = (map[name] || 0) + cost;
        }
        setRegionMetrics(map);
      } catch {}
    };
    load();
  }, []);

  return (
    <main className="min-h-screen">
      <Helmet>
        <title>Health Facilities Map | OpenStreetMap View</title>
        <meta name="description" content="Explore health facilities on an interactive OpenStreetMap and sign in or create an account to access the platform." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">Health Forecasting Platform</h1>
          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/auth?mode=signup">Sign up</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative h-screen w-full">
        {/* Spacer for header height */}
        <div className="h-14" />
        <div className="fixed inset-0 top-14">
          <OSMFacilitiesMap regionMetrics={regionMetrics} metricLabel="Total Cost" />
        </div>
      </section>
    </main>
  );
};

export default PublicLanding;
