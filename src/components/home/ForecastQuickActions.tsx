import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useOutstandingRequests } from "@/hooks/useOutstandingRequests";
import OutstandingRequestsModal from "./OutstandingRequestsModal";
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
  Building,
  AlertTriangle
} from "lucide-react";

interface QuickTask {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  description?: string;
  variant?: "default" | "outline" | "secondary";
  badge?: number;
  onClick?: () => void;
}

const CriticalQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useUserRole();
  const { requests } = useOutstandingRequests();
  const [showOutstandingModal, setShowOutstandingModal] = useState(false);

  const getTasksByRole = (): QuickTask[] => {
    const role = userRole?.role;
    const adminLevel = userRole?.admin_level;
    
    // Debug logging to see current user role
    console.log('Current user role:', role, 'admin level:', adminLevel);

    // Facility Logistic Officer tasks - reordered as requested
    if (role === "viewer" && adminLevel === "logistic_officer") {
      return [
        {
          title: "Receive Stock",
          icon: Download,
          path: "/dagu",
          description: "Process incoming stock deliveries",
          variant: "default"
        },
        {
          title: "Issue Stock to Wards",
          icon: Upload,
          path: "/dagu",
          description: "Distribute stock to departments",
          badge: requests.length,
          onClick: () => setShowOutstandingModal(true)
        },
        {
          title: "Submit Procurement Request",
          icon: Send,
          path: "/requests",
          description: "Request supplies from EPSS"
        },
        {
          title: "View Reports",
          icon: FileText,
          path: "/run-forecast",
          description: "Generate and view reports"
        },
        {
          title: "View Dashboard",
          icon: TrendingUp,
          path: "/dashboard",
          description: "Access your dashboard"
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

    // Default/General user tasks - Updated with new arrangement
    return [
      {
        title: "Receive Stock",
        icon: Download,
        path: "/dagu",
        description: "Process incoming stock deliveries",
        variant: "default"
      },
      {
        title: "Issue Stock to Wards",
        icon: Upload,
        path: "/dagu",
        description: "Distribute stock to departments",
        badge: requests.length,
        onClick: () => setShowOutstandingModal(true)
      },
      {
        title: "Submit Procurement Request",
        icon: Send,
        path: "/requests",
        description: "Request supplies from EPSS"
      },
      {
        title: "View Reports",
        icon: FileText,
        path: "/run-forecast",
        description: "Generate and view reports"
      },
      {
        title: "View Dashboard",
        icon: TrendingUp,
        path: "/dashboard",
        description: "Access your dashboard"
      }
    ];
  };

  const quickTasks = getTasksByRole();

  const handleTaskClick = (task: QuickTask) => {
    if (task.onClick) {
      task.onClick();
    } else {
      navigate(task.path);
    }
  };

  const handleApproveRequest = (requestId: string) => {
    // Handle quick approval
    console.log('Quick approving request:', requestId);
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
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <CardTitle className="text-lg">{getRoleTitle()}</CardTitle>
          </div>
        </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {quickTasks.map((task) => {
            const Icon = task.icon;
            return (
              <Button
                key={task.title}
                variant={task.variant || "outline"}
                className="h-auto min-h-[120px] p-4 flex flex-col items-start gap-3 text-left justify-start relative hover:shadow-md transition-shadow w-full overflow-hidden"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-start justify-between w-full mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="font-medium text-sm leading-snug truncate">{task.title}</span>
                  </div>
                  {task.badge && task.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="shrink-0 flex items-center gap-1 text-xs"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {task.badge}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <span className="block text-xs text-muted-foreground leading-relaxed truncate">
                    {task.description}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
      </Card>
      
      <OutstandingRequestsModal
        open={showOutstandingModal}
        onOpenChange={setShowOutstandingModal}
        onApproveRequest={handleApproveRequest}
      />
    </>
  );
};

export default CriticalQuickActions;