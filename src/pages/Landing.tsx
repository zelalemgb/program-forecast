import React from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";

const Landing: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Dashboard | Forlab+ Platform</title>
        <meta name="description" content="Health supply chain management dashboard for monitoring stock levels, forecasts, and facility operations." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <DashboardWidgets />
    </main>
  );
};

export default Landing;
