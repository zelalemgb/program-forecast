import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  Truck,
  Package,
  TrendingDown,
  Eye,
  Calendar
} from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface TriageItem {
  id: string;
  title: string;
  count: number;
  priority: "critical" | "high" | "medium" | "low";
  icon: React.ComponentType<any>;
  description: string;
  action: string;
  path: string;
}

export const TodayTriagePanel: React.FC = () => {
  const navigate = useNavigate();
  const { facilityId } = useCurrentUser();
  const { balances, loading } = useInventoryData(facilityId ?? undefined);

  // Calculate real-time counts
  const triageStats = React.useMemo(() => {
    if (!balances || balances.length === 0) {
      return {
        stockouts: 0,
        lowStock: 0,
        nearExpiry: 0,
        overStock: 0
      };
    }

    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const lowStock = balances.filter(b => 
      b.current_stock > 0 && b.current_stock <= (b.reorder_level || 0)
    ).length;
    
    // Mock calculations for demo - in real app these would come from different tables
    const nearExpiry = Math.floor(balances.length * 0.05); // 5% near expiry
    const overStock = balances.filter(b => 
      b.current_stock > (b.max_level || 1000)
    ).length;

    return {
      stockouts,
      lowStock,
      nearExpiry,
      overStock
    };
  }, [balances]);

  const triageItems: TriageItem[] = [
    {
      id: "stockouts",
      title: "Stockouts",
      count: triageStats.stockouts,
      priority: "critical",
      icon: AlertTriangle,
      description: "Items completely out of stock",
      action: "Fix Now",
      path: "/dagu?filter=stockouts"
    },
    {
      id: "lowStock",
      title: "< 15 Days Stock",
      count: triageStats.lowStock,
      priority: "high",
      icon: TrendingDown,
      description: "Items below reorder level",
      action: "Review",
      path: "/dagu?filter=lowstock"
    },
    {
      id: "nearExpiry",
      title: "Near Expiry",
      count: triageStats.nearExpiry,
      priority: "medium",
      icon: Clock,
      description: "Items expiring within 30 days",
      action: "Check",
      path: "/dagu?filter=expiry"
    },
    {
      id: "overStock",
      title: "Over-Stock",
      count: triageStats.overStock,
      priority: "low",
      icon: Package,
      description: "Items above maximum level",
      action: "Review",
      path: "/dagu?filter=overstock"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/10 text-red-600 border-red-200";
      case "high": return "bg-orange-500/10 text-orange-600 border-orange-200";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
      case "low": return "bg-blue-500/10 text-blue-600 border-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getActionVariant = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "default";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Today's Triage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading operational status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Today's Triage
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Critical issues requiring immediate attention
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {triageItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/50 ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/80">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.count}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.count > 0 && (
                <Button
                  size="sm"
                  variant={getActionVariant(item.priority) as any}
                  onClick={() => navigate(item.path)}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {item.action}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {/* Summary footer */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total issues:</span>
            <span className="font-medium">
              {triageItems.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};