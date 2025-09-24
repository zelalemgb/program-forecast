import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, BarChart3, Globe, Shield, Clock, TrendingUp, MapPin } from "lucide-react";

const PublicLanding: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <Helmet>
        <title>Forlab+ | Ministry of Health Supply Chain Platform</title>
        <meta name="description" content="From facilities to the nation: better forecasts, better medicines. Secure platform for health supply chain management and forecasting." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 hero-gradient rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Forlab+</h1>
              <p className="text-xs text-muted-foreground">Ministry of Health - Ethiopia</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/role-registration">Register</Link>
            </Button>
            <Button asChild size="sm" className="hero-gradient">
              <Link to="/auth">Continue with MoH Account</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - messaging */}
          <div className="space-y-8">
            <div>
              <Badge variant="secondary" className="mb-4">
                <MapPin className="w-3 h-3 mr-1" />
                National Health Supply Chain Platform
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                From facilities to the nation:
                <span className="hero-gradient bg-clip-text text-transparent"> better forecasts, better medicines</span>
              </h2>
              <p className="text-xl text-muted-foreground mt-4 max-w-xl">
                Unified platform connecting health facilities nationwide for coordinated supply planning, real-time tracking, and data-driven forecasting.
              </p>
            </div>

            {/* Micro-messages */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="micro-message">
                <Clock className="micro-message-icon" />
                <span>Report & track stock in seconds</span>
              </div>
              <div className="micro-message">
                <TrendingUp className="micro-message-icon" />
                <span>AI guidance to forecast and plan</span>
              </div>
              <div className="micro-message">
                <Globe className="micro-message-icon" />
                <span>National view of medicine availability</span>
              </div>
              <div className="micro-message">
                <BarChart3 className="micro-message-icon" />
                <span>Aligned budgets and supply plans</span>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Encrypted & MoH cloud hosted</span>
            </div>
          </div>

          {/* Right side - login card */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md surface-brand">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Access Your Dashboard</h3>
                  <p className="text-muted-foreground mt-1">Sign in to manage your facility's supply chain</p>
                </div>

                <div className="space-y-3">
                  <Button asChild className="w-full hero-gradient">
                    <Link to="/auth">Continue with MoH Account</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/role-registration">Register</Link>
                  </Button>
                </div>

                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground">
                    Need help? Contact <a href="mailto:support@moh.gov.et" className="text-blue-600 hover:underline">MoH Support</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ministry of Health, Ethiopia. All rights reserved.
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Desk</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default PublicLanding;