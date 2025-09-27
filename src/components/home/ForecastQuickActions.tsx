import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Package,
  Download,
  Upload,
  CheckCircle,
  Send,
  FileText,
  ArrowRightLeft,
  TrendingUp,
  Users,
  Globe,
  Building
} from "lucide-react";

interface QuickTask {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  description?: string;
  variant?: "default" | "outline" | "secondary";
}

const CriticalQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();

  const getTasksByRole = (): QuickTask[] => {
    const role = userRole?.role;
    const adminLevel = userRole?.admin_level;

    // Facility Logistic Officer tasks
    if (role === "viewer" && adminLevel === "logistic_officer") {
      return [
        {
          title: "Request EPSS Stock",
          icon: Send,
          path: "/requests",
          description: "Submit stock requests to EPSS",
          variant: "default"
        },
        {
          title: "Receive EPSS Stock",
          icon: Download,
          path: "/dagu",
          description: "Process incoming stock deliveries"
        },
        {
          title: "Approve Dept. Requests",
          icon: CheckCircle,
          path: "/approvals",
          description: "Review department requisitions"
        },
        {
          title: "Transfer Stock",
          icon: ArrowRightLeft,
          path: "/dagu",
          description: "Transfer to other facilities"
        },
        {
          title: "Generate RRF",
          icon: FileText,
          path: "/run-forecast",
          description: "Create program drug reports"
        },
        {
          title: "Issue to Departments",
          icon: Upload,
          path: "/dagu",
          description: "Distribute stock internally"
        }
      ];
    }

    // Regional/Zone Manager tasks
    if (role === "analyst") {
      return [
        {
          title: "Review Facility Reports",
          icon: FileText,
          path: "/validation",
          description: "Validate facility submissions",
          variant: "default"
        },
        {
          title: "Regional Dashboard",
          icon: TrendingUp,
          path: "/regional-dashboard",
          description: "Monitor regional metrics"
        },
        {
          title: "Approve Transfers",
          icon: CheckCircle,
          path: "/approvals",
          description: "Review inter-facility transfers"
        },
        {
          title: "Stock Distribution",
          icon: ArrowRightLeft,
          path: "/supply-planning",
          description: "Plan regional distribution"
        },
        {
          title: "Generate Reports",
          icon: FileText,
          path: "/forecast-analysis",
          description: "Create regional reports"
        }
      ];
    }

    // National Administrator tasks
    if (role === "admin") {
      return [
        {
          title: "National Overview",
          icon: Globe,
          path: "/national-dashboard",
          description: "Monitor national metrics",
          variant: "default"
        },
        {
          title: "Approve Budgets",
          icon: CheckCircle,
          path: "/budget-alignment",
          description: "Review budget allocations"
        },
        {
          title: "System Analytics",
          icon: TrendingUp,
          path: "/super-admin-dashboard",
          description: "Platform performance"
        },
        {
          title: "User Management",
          icon: Users,
          path: "/user-management",
          description: "Manage system users"
        },
        {
          title: "Policy Review",
          icon: FileText,
          path: "/validation",
          description: "Review national policies"
        }
      ];
    }

    // Default/General user tasks
    return [
      {
        title: "View Dashboard",
        icon: TrendingUp,
        path: "/dashboard",
        description: "Access your dashboard",
        variant: "default"
      },
      {
        title: "Check Stock Status",
        icon: Package,
        path: "/dagu",
        description: "Monitor inventory levels"
      },
      {
        title: "Submit Request",
        icon: Send,
        path: "/requests",
        description: "Request supplies"
      },
      {
        title: "View Reports",
        icon: FileText,
        path: "/forecast-analysis",
        description: "Access reports"
      }
    ];
  };

  const quickTasks = getTasksByRole();

  const handleTaskClick = (path: string) => {
    navigate(path);
  };

  const getRoleTitle = () => {
    const role = userRole?.role;
    const adminLevel = userRole?.admin_level;
    
    if (role === "viewer" && adminLevel === "logistic_officer") {
      return "Logistic Officer Daily Tasks";
    }
    if (role === "analyst") {
      return "Regional Manager Tasks";
    }
    if (role === "admin") {
      return "National Administrator Tasks";
    }
    return "Quick Tasks";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <CardTitle className="text-lg">{getRoleTitle()}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickTasks.map((task) => {
            const Icon = task.icon;
            return (
              <Button
                key={task.title}
                variant={task.variant || "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2 text-left justify-start"
                onClick={() => handleTaskClick(task.path)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">{task.title}</span>
                </div>
                {task.description && (
                  <span className="text-xs text-muted-foreground">
                    {task.description}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CriticalQuickActions;