import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Database, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";


const ProgramSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Settings | System Configuration</title>
        <meta name="description" content="System configuration and metadata management." />
        <link rel="canonical" href="/program-settings" />
      </Helmet>
      
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">Manage system configuration and metadata</p>
        </div>
        <Button 
          onClick={() => navigate('/settings/metadata')}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Metadata Organization
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default ProgramSettingsPage;