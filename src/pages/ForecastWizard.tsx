import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { GuidedForecastWizard } from "@/components/forecast/GuidedForecastWizard";

const ForecastWizard: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <main className="container py-6">
      <Helmet>
        <title>Guided Forecast Wizard | Forlab+ Platform</title>
        <meta name="description" content="Step-by-step forecast creation using inventory and consumption data for health facilities." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <GuidedForecastWizard />
    </main>
  );
};

export default ForecastWizard;