import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Target,
  TrendingUp,
  Database,
  Upload,
  Package
} from "lucide-react";

interface QuickAction {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  variant?: "default" | "outline" | "secondary";
  primary?: boolean;
}

const ForecastQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Guided Forecast Wizard",
      icon: BarChart3,
      path: "/forecast-home",
      variant: "default",
      primary: true
    },
    {
      title: "Generate RRF",
      icon: FileText,
      path: "/run-forecast",
      variant: "outline"
    },
    {
      title: "CDSS Forecast",
      icon: Target,
      path: "/forecast-analysis",
      variant: "outline"
    },
    {
      title: "Non-CDSS Forecast",
      icon: TrendingUp,
      path: "/supply-planning",
      variant: "outline"
    },
    {
      title: "Program Forecast",
      icon: Database,
      path: "/saved-forecasts",
      variant: "outline"
    },
    {
      title: "Import Forecast",
      icon: Upload,
      path: "/forecast-workbench",
      variant: "outline"
    }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Tasks</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant={action.variant || "outline"}
                className={`h-auto p-4 flex items-center gap-3 justify-start text-left ${
                  action.primary ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                }`}
                onClick={() => handleActionClick(action.path)}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{action.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastQuickActions;