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
          path: "/dagu?tab=receiving",
          description: "Process incoming stock deliveries",
          variant: "default"
        },
        {
          title: "Request from Wards",
          icon: Upload,
          path: "/dagu",
          description: "Review ward requisitions",
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
          title: "Generate Forecast",
          icon: TrendingUp,
          path: "/run-forecast",
          description: "Create demand forecasts"
        },
        {
          title: "View Reports",
          icon: FileText,
          path: "/forecast-analysis",
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
        path: "/dagu?tab=receiving",
        description: "Process incoming stock deliveries",
        variant: "default"
      },
      {
        title: "Request from Wards",
        icon: Upload,
        path: "/dagu",
        description: "Review ward requisitions",
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
        title: "Generate Forecast",
        icon: TrendingUp,
        path: "/run-forecast",
        description: "Create demand forecasts"
      },
      {
        title: "View Reports",
        icon: FileText,
        path: "/forecast-analysis",
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
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Quick Actions</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {quickTasks.map((task, index) => {
              const Icon = task.icon;
              const isFirst = index === 0;
              
              return (
                <Button
                  key={task.title}
                  variant={isFirst ? "default" : "outline"}
                  className={`
                    relative h-12 px-6 py-3 rounded-full flex items-center gap-3 text-sm font-medium
                    hover:shadow-md transition-all duration-200 border
                    ${isFirst ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background hover:bg-muted'}
                  `}
                  onClick={() => handleTaskClick(task)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="whitespace-nowrap">{task.title}</span>
                  
                  {task.badge && task.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 flex items-center gap-1 text-xs h-5 rounded-full px-2"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {task.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Additional info row if needed */}
          <div className="text-sm text-muted-foreground">
            {quickTasks.find(t => t.badge && t.badge > 0) && (
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Outstanding requests require attention
              </span>
            )}
          </div>
        </div>
      </div>
      
      <OutstandingRequestsModal
        open={showOutstandingModal}
        onOpenChange={setShowOutstandingModal}
        onApproveRequest={handleApproveRequest}
      />
    </>
  );
};

export default CriticalQuickActions;