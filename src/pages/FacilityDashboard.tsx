import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Package,
  FileText,
  BarChart3,
  Calendar,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { TodayTriagePanel } from "@/components/dashboard/TodayTriagePanel";
import { InboxPanel } from "@/components/dashboard/InboxPanel";
import { TodayQuickStats } from "@/components/inventory/TodayQuickStats";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface SecondaryAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
}

export default function FacilityDashboard() {
  const navigate = useNavigate();
  const { facilityName, locationDisplay, loading } = useCurrentUser();

  const secondaryActions: SecondaryAction[] = [
    {
      title: "Forecasting & Planning",
      description: "Create demand forecasts and supply plans",
      icon: TrendingUp,
      path: "/forecast-home",
      color: "bg-blue-500/10 text-blue-600"
    },
    {
      title: "Supply Chain Analytics",
      description: "Analyze consumption patterns and trends",
      icon: BarChart3,
      path: "/forecast-analysis",
      color: "bg-green-500/10 text-green-600"
    },
    {
      title: "Procurement Requests",
      description: "Submit and track supply requests",
      icon: FileText,
      path: "/requests",
      color: "bg-purple-500/10 text-purple-600"
    },
    {
      title: "Budget Alignment",
      description: "Align forecasts with available budget",
      icon: Calendar,
      path: "/budget-alignment",
      color: "bg-orange-500/10 text-orange-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading facility dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        

        {/* Primary Triage Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayTriagePanel />
          <InboxPanel />
        </div>

        {/* Today's Stats Overview */}
        <TodayQuickStats />

        {/* Secondary Actions */}
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Additional Tools & Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Access forecasting, analytics, and planning tools when operational issues are resolved
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {secondaryActions.map((action) => (
                <div
                  key={action.title}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {action.description}
                      </p>
                      <div className="flex items-center text-xs text-primary group-hover:text-primary/80">
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <Card className="border-muted/40 bg-muted/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Need help getting started?</p>
                <p className="text-xs text-muted-foreground">
                  Focus on the red and orange alerts in "Today's Triage" first, then check your inbox for pending approvals.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate("/guides")}
              >
                View Guides
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
