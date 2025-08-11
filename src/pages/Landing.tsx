import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";

const Landing: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <main>
      <Helmet>
        <title>Health Forecasting Platform | Import & Analyze CSV</title>
        <meta name="description" content="Health forecasting platform to import CSVs, analyze trends, and validate assumptions." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <section className="container py-16 sm:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Health Programs Forecasting Platform
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Import forecast CSVs, explore program trends, and validate your data with a modern analytics dashboard.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-16">
        <Card className="surface">
          <CardContent className="pt-6">
            <div className="font-medium">CSV Import</div>
            <p className="text-sm text-muted-foreground mt-1">Upload forecast data with robust parsing.</p>
          </CardContent>
        </Card>
        <Card className="surface">
          <CardContent className="pt-6">
            <div className="font-medium">Trends & Insights</div>
            <p className="text-sm text-muted-foreground mt-1">Visualize programs, years, and product performance.</p>
          </CardContent>
        </Card>
        <Card className="surface">
          <CardContent className="pt-6">
            <div className="font-medium">Validation</div>
            <p className="text-sm text-muted-foreground mt-1">Check data quality and assumptions at a glance.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Landing;
