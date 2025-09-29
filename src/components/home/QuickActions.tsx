import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Package,
  TrendingUp,
  FileText,
  BarChart3,
  AlertTriangle,
  Plus,
  Search
} from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import type { LucideIcon } from "lucide-react";

type ButtonVariant = "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";

interface QuickAction {
  title: string;
  description?: string;
  icon: LucideIcon;
  color?: string;
  stats?: string;
  path?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: 'card' | 'button';
}

interface Props {
  onAnnounce?: () => void;
  actions?: QuickAction[];
}

const QuickActions: React.FC<Props> = ({ onAnnounce, actions }) => {
  const navigate = useNavigate();
  const { facilityId } = useCurrentUser();
  const { balances, loading: inventoryLoading } = useInventoryData(facilityId ?? undefined);

  // Calculate inventory stats from real data
  const inventoryStats = React.useMemo(() => {
    if (!balances || balances.length === 0) {
      return { lowStock: 0, stockouts: 0, goodStock: 0 };
    }

    const lowStock = balances.filter(b => 
      b.current_stock > 0 && b.current_stock <= b.reorder_level
    ).length;

    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const goodStock = balances.filter(b => b.current_stock > b.reorder_level).length;

    return { lowStock, stockouts, goodStock };
  }, [balances]);

  const defaultActions: QuickAction[] = React.useMemo(() => [
    {
      title: "Inventory Management",
      description: "Check stock levels and manage inventory",
      icon: Package,
      path: "/dagu",
      color: "bg-blue-500/10 text-blue-600",
      stats: inventoryLoading ? "Loading..." : `${inventoryStats.stockouts} stockouts, ${inventoryStats.lowStock} low stock`,
      type: 'card'
    },
    {
      title: "Forecast Analysis",
      description: "View and analyze demand forecasts",
      icon: TrendingUp,
      path: "/forecast-analysis",
      color: "bg-green-500/10 text-green-600",
      stats: "View trends and predictions",
      type: 'card'
    },
    {
      title: "Supply Requests",
      description: "Create and manage supply requests",
      icon: FileText,
      path: "/requests",
      color: "bg-purple-500/10 text-purple-600",
      stats: "Submit procurement requests",
      type: 'card'
    },
    {
      title: "Budget Alignment",
      description: "Align forecasts with available budget",
      icon: BarChart3,
      path: "/budget-alignment",
      color: "bg-orange-500/10 text-orange-600",
      stats: "CDSS budget optimization",
      type: 'card'
    },
    {
      title: "New Request",
      icon: Plus,
      path: "/requests/new",
      variant: "default",
      type: 'button'
    },
    {
      title: "Stock Search",
      icon: Search,
      path: "/dagu",
      variant: "outline",
      type: 'button'
    },
    {
      title: "Reports",
      icon: BarChart3,
      path: "/forecast-analysis",
      variant: "outline",
      type: 'button'
    }
  ], [inventoryStats.lowStock, inventoryStats.stockouts, inventoryLoading]);

  const resolvedActions = actions && actions.length > 0 ? actions : defaultActions;

  const handleActionClick = (action: QuickAction) => {
    if (action.onClick) {
      action.onClick();
      return;
    }

    if (action.path) {
      navigate(action.path);
    }
  };

  // Separate actions by type
  const cardActions = resolvedActions.filter(action => action.type === 'card' || !action.type);
  const buttonActions = resolvedActions.filter(action => action.type === 'button');

  return (
    <div className="space-y-6">
      <Card className="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card-style actions */}
          {cardActions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cardActions.map((action) => (
                <div
                  key={action.title}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleActionClick(action)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${action.color ?? "bg-muted"}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      {action.description && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {action.description}
                        </p>
                      )}
                      {action.stats && (
                        <p className="text-xs text-muted-foreground font-medium">
                          {action.stats}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Button-style actions */}
          {buttonActions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">Quick Tasks</h4>
              <div className="flex flex-wrap gap-2">
                {buttonActions.map((action) => (
                  <Button
                    key={action.title}
                    variant={action.variant ?? "outline"}
                    size="sm"
                    onClick={() => handleActionClick(action)}
                    className="flex items-center gap-2"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Alerts - if any stockouts */}
      {inventoryStats.stockouts > 0 && (
        <Card className="surface border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Critical Stock Alert</p>
                <p className="text-sm text-red-700">
                  {inventoryStats.stockouts} items are out of stock. Immediate action required.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => navigate("/dagu")}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legacy announce button */}
      {onAnnounce && (
        <Button onClick={onAnnounce} variant="secondary" className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Announce Excess Stock
        </Button>
      )}
    </div>
  );
};

export default QuickActions;
export type { QuickAction };
