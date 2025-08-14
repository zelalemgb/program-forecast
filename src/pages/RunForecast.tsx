import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Play, Brain, Target, Users, Database, FileText } from "lucide-react";
import ForecastingWizard from "@/components/forecast/ForecastingWizard";

const RunForecast: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  const [showWizard, setShowWizard] = useState(false);

  const handleStartForecast = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (data: any) => {
    console.log("Forecasting wizard completed with data:", data);
    setShowWizard(false);
    // TODO: Process the wizard data and generate forecast
    // This could redirect to the ForecastWorkbench with the selected method and parameters
  };

  const methods = [
    {
      name: "Consumption Method",
      description: "Based on historical usage data from your facility",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "text-green-600 bg-green-50 border-green-200",
      recommended: "Best when you have reliable monthly consumption data"
    },
    {
      name: "Service Statistics Method", 
      description: "Based on patient services and treatment protocols",
      icon: <Users className="h-8 w-8" />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      recommended: "Best when you track patient visits and services"
    },
    {
      name: "Demographic Morbidity Method",
      description: "Based on population size and disease patterns",
      icon: <Target className="h-8 w-8" />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      recommended: "Best when you know catchment population"
    },
    {
      name: "Hybrid Method",
      description: "Combines available data with demographic fallback",
      icon: <Database className="h-8 w-8" />,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      recommended: "Best when you have partial data availability"
    }
  ];

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Run Forecast | Forlab+</title>
        <meta
          name="description"
          content="Launch the guided forecasting process to estimate medicine and supply needs for your health facility."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <PageHeader
        title="Run Forecast"
        description="Launch our guided forecasting assistant to estimate your facility's medicine and supply needs. The wizard will help you choose the best method based on your available data."
      />

      {/* Main Action Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Start Smart Forecasting</CardTitle>
          <CardDescription className="text-lg">
            Our intelligent wizard will guide you through a step-by-step process to create accurate forecasts
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Data Assessment</h4>
              <p className="text-sm text-muted-foreground">We'll check what data you have available</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Smart Recommendation</h4>
              <p className="text-sm text-muted-foreground">Get the best forecasting method for your situation</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Generate Forecast</h4>
              <p className="text-sm text-muted-foreground">Create accurate predictions for your needs</p>
            </div>
          </div>
          
          <Button 
            size="lg" 
            onClick={handleStartForecast}
            className="text-lg px-8 py-6 h-auto"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Forecasting Wizard
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              ✓ No expertise required
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✓ Step-by-step guidance
            </Badge>
            <Badge variant="outline" className="text-xs">
              ✓ Smart recommendations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Forecasting Methods Overview */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Available Forecasting Methods</h2>
          <p className="text-muted-foreground">
            The wizard will recommend the best method based on your data availability. Here's what's available:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method, index) => (
            <Card key={index} className={`border-2 ${method.color}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${method.color}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {method.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white/60 border rounded-lg p-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    <span className="font-semibold">Best for:</span> {method.recommended}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">What the Wizard Does:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Assesses your available data sources
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Recommends the optimal forecasting method
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Guides you through the setup process
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Generates accurate forecasts automatically
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">What You'll Need:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Information about your health program area
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Basic knowledge of your data availability
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Desired forecasting timeframe (6-24 months)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  5-10 minutes of your time
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecasting Wizard */}
      {showWizard && (
        <ForecastingWizard
          onClose={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      )}
    </main>
  );
};

export default RunForecast;