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
import { useUserRole } from "@/hooks/useUserRole";

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
  const { userRole } = useUserRole();
  const { balances, loading } = useInventoryData(userRole?.facility_id);

  // Calculate real-time counts
  const triageStats = React.useMemo(() => {
    if (!balances || balances.length === 0) {
      return {
        stockouts: 0,
        lowStock: 0,
        incomingASN: 0,
        nearExpiry: 0,
        overStock: 0,
        cycleDue: 0
      };
    }

    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const lowStock = balances.filter(b => 
      b.current_stock > 0 && b.current_stock <= (b.reorder_level || 0)
    ).length;
    
    // Mock calculations for demo - in real app these would come from different tables
    const incomingASN = 3; // From ASN table
    const nearExpiry = Math.floor(balances.length * 0.05); // 5% near expiry
    const overStock = balances.filter(b => 
      b.current_stock > (b.max_level || 1000)
    ).length;
    const cycleDue = Math.floor(balances.length * 0.1); // 10% due for cycle count

    return {
      stockouts,
      lowStock,
      incomingASN,
      nearExpiry,
      overStock,
      cycleDue
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
      id: "incoming",
      title: "Incoming ASN",
      count: triageStats.incomingASN,
      priority: "medium",
      icon: Truck,
      description: "Advance shipment notifications",
      action: "Prepare",
      path: "/dagu?filter=incoming"
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
    },
    {
      id: "cycleDue",
      title: "Cycle Count Due",
      count: triageStats.cycleDue,
      priority: "medium",
      icon: Calendar,
      description: "Items due for physical count",
      action: "Schedule",
      path: "/dagu?filter=cycle"
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
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          Today's Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {triageItems.map((item) => {
          const isActive = item.count > 0;
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-accent/40 hover:bg-accent/60 cursor-pointer' 
                  : 'bg-muted/20'
              }`}
              onClick={isActive ? () => navigate(item.path) : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${
                  item.priority === "critical" ? "text-red-500" :
                  item.priority === "high" ? "text-orange-500" :
                  item.priority === "medium" ? "text-yellow-600" :
                  "text-muted-foreground"
                }`} />
                <div>
                  <span className="text-sm font-medium">{item.title}</span>
                  {!isActive && (
                    <span className="text-xs text-muted-foreground ml-2">All clear</span>
                  )}
                </div>
              </div>
              {isActive && (
                <Badge variant="secondary" className="animate-fade-in">
                  {item.count}
                </Badge>
              )}
            </div>
          );
        })}
        
        {/* Clean summary */}
        <div className="pt-3 mt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total issues</span>
            <span className="font-medium">
              {triageItems.reduce((sum, item) => sum + item.count, 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};