import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  CheckCircle,
  FileText,
  TrendingUp,
  ArrowRightLeft,
  Clock,
  User
} from "lucide-react";

interface ApprovalItem {
  id: string;
  type: "GRN" | "RRF" | "Variance" | "Transfer";
  title: string;
  count: number;
  priority: "urgent" | "normal" | "low";
  description: string;
  action: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const InboxPanel: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - in real app this would come from database queries
  const approvalItems: ApprovalItem[] = [
    {
      id: "grn",
      type: "GRN",
      title: "GRN Approvals",
      count: 4,
      priority: "urgent",
      description: "Goods receipt notes pending approval",
      action: "Approve",
      path: "/approvals?type=grn",
      icon: CheckCircle
    },
    {
      id: "rrf",
      type: "RRF",
      title: "RRF Reviews",
      count: 2,
      priority: "normal",
      description: "Request and resupply forms for review",
      action: "Review",
      path: "/approvals?type=rrf",
      icon: FileText
    },
    {
      id: "variance",
      type: "Variance",
      title: "Cycle Variances",
      count: 1,
      priority: "normal",
      description: "Physical count discrepancies",
      action: "Investigate",
      path: "/approvals?type=variance",
      icon: TrendingUp
    },
    {
      id: "transfer",
      type: "Transfer",
      title: "Transfer Requests",
      count: 3,
      priority: "normal",
      description: "Inter-facility transfer approvals",
      action: "Process",
      path: "/approvals?type=transfer",
      icon: ArrowRightLeft
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500/10 text-red-600 border-red-200";
      case "normal": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "low": return "bg-gray-500/10 text-gray-600 border-gray-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getActionVariant = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "normal": return "default";
      default: return "outline";
    }
  };

  const totalPendingItems = approvalItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          Pending Actions
          {totalPendingItems > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalPendingItems}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {approvalItems.map((item) => {
          const isActive = item.count > 0;
          const isUrgent = item.priority === "urgent";
          
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
                  isUrgent ? "text-red-500" : "text-muted-foreground"
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    {isUrgent && isActive && (
                      <span className="text-xs text-red-600 font-medium">Urgent</span>
                    )}
                  </div>
                  {!isActive && (
                    <span className="text-xs text-muted-foreground">All clear</span>
                  )}
                </div>
              </div>
              {isActive && (
                <Badge variant={isUrgent ? "destructive" : "secondary"} className="animate-fade-in">
                  {item.count}
                </Badge>
              )}
            </div>
          );
        })}

        {/* All clear state */}
        {totalPendingItems === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-600 font-medium">All caught up!</p>
          </div>
        )}

        {/* Quick action */}
        {totalPendingItems > 0 && (
          <div className="pt-3 mt-4 border-t border-border/50">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/approvals")}
              className="w-full text-xs"
            >
              View All Approvals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};