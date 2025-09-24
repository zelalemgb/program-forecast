import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Database, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";

const ProgramSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Settings | System Configuration</title>
        <meta name="description" content="System configuration and metadata management." />
        <link rel="canonical" href="/program-settings" />
      </Helmet>
      
      <PageHeader
        title="Settings"
        description="Manage system configuration and metadata"
        actions={
          <Button 
            onClick={() => navigate('/settings/metadata')}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Metadata Organization
            <ArrowRight className="h-4 w-4" />
          </Button>
        }
      />
    </>
  );
};

export default ProgramSettingsPage;