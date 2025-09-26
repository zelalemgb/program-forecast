import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera, Brain, CheckCircle, Upload, FileText, MessageSquare, TrendingUp, ShoppingCart } from "lucide-react";


const Guides = () => {
  return (
    <div className="space-y-8">

      {/* Infographics Section: Sense-Think-Act Approach */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">How the Platform Works</h2>
          <p className="text-muted-foreground">A three-step approach to supply chain intelligence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section 1: Sense */}
          <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div>
                  <CardTitle className="text-blue-900">SENSE</CardTitle>
                  <p className="text-sm text-blue-700">Capture & Validate Data</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Mobile forms & SnapToStock photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">File uploads & system integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Auto-validation & anomaly detection</span>
                </div>
              </div>
              <div className="bg-blue-200/50 p-3 rounded-lg">
                <p className="text-xs text-blue-800 font-medium">
                  Ensures decision-making starts from accurate, real-time, facility-level information
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Data Collection
              </Badge>
            </CardContent>
            <div className="absolute top-4 right-4">
              <ArrowRight className="w-6 h-6 text-blue-600 opacity-30" />
            </div>
          </Card>

          {/* Section 2: Think */}
          <Card className="relative overflow-hidden border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div>
                  <CardTitle className="text-green-900">THINK</CardTitle>
                  <p className="text-sm text-green-700">Analyze & Forecast</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span className="text-sm">AI-assisted forecasting engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Interactive chat guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Trend analysis & outlier detection</span>
                </div>
              </div>
              <div className="bg-green-200/50 p-3 rounded-lg">
                <p className="text-xs text-green-800 font-medium">
                  Compares models (consumption vs. morbidity) and suggests adjustments using national frameworks
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Intelligence Layer
              </Badge>
            </CardContent>
            <div className="absolute top-4 right-4">
              <ArrowRight className="w-6 h-6 text-green-600 opacity-30" />
            </div>
          </Card>

          {/* Section 3: Act */}
          <Card className="relative overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div>
                  <CardTitle className="text-purple-900">ACT</CardTitle>
                  <p className="text-sm text-purple-700">Plan & Align Supply</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Budget-aligned facility requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Digital contracts with EPSS hubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">ERP integration & tracking</span>
                </div>
              </div>
              <div className="bg-purple-200/50 p-3 rounded-lg">
                <p className="text-xs text-purple-800 font-medium">
                  Improves prioritization, lead-time tracking, and reduces stockouts and wastage
                </p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Action & Execution
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Flow Arrows for Large Screens */}
        <div className="hidden lg:block relative">
          <div className="absolute top-0 left-1/3 transform -translate-x-1/2 -translate-y-8">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="absolute top-0 left-2/3 transform -translate-x-1/2 -translate-y-8">
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Quick Start Guides */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Quick Start Guides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn the basics of navigating and using the platform
              </p>
              <Button variant="outline" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Data Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Master different ways to capture and upload data
              </p>
              <Button variant="outline" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use AI tools to generate accurate demand forecasts
              </p>
              <Button variant="outline" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Guides;