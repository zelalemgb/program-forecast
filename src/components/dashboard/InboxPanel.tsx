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
    <Card className="border-secondary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Inbox className="h-5 w-5 text-secondary" />
            Inbox & Approvals
          </CardTitle>
          <Badge variant="secondary" className="bg-secondary/10">
            {totalPendingItems} pending
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Tasks requiring your immediate action
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvalItems.map((item) => (
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
                  {item.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  )}
                  {item.priority === "urgent" && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {item.count > 0 ? (
                <Button
                  size="sm"
                  variant={getActionVariant(item.priority) as any}
                  onClick={() => navigate(item.path)}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {item.action}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  All clear
                </span>
              )}
            </div>
          </div>
        ))}

        {/* No pending items state */}
        {totalPendingItems === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-600">All caught up!</p>
            <p className="text-xs text-muted-foreground">
              No pending approvals at this time
            </p>
          </div>
        )}

        {/* Quick actions footer */}
        {totalPendingItems > 0 && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Quick actions:</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/approvals")}
                className="text-xs flex-1"
              >
                <Inbox className="h-3 w-3 mr-1" />
                View All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/approvals?urgent=true")}
                className="text-xs flex-1"
              >
                <Clock className="h-3 w-3 mr-1" />
                Urgent Only
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};