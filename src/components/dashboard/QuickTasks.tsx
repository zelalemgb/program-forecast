import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Package,
  FileText,
  CheckCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  ClipboardList,
  Truck,
  Shield,
  Globe,
  ArrowRight
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

interface QuickTask {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  priority: "high" | "medium" | "low";
  category: "daily" | "weekly" | "urgent";
}

const QuickTasks: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, loading } = useUserRole();

  const getTasksByRole = (role: string, adminLevel?: string): QuickTask[] => {
    switch (role) {
      case "viewer": // Facility staff
        if (adminLevel === "logistic_officer") {
          return [
            {
              id: "receive-stock",
              title: "Receive EPSS Stock",
              description: "Process incoming deliveries from EPSS",
              icon: Truck,
              path: "/dashboard", // Inventory management section
              priority: "high",
              category: "daily"
            },
            {
              id: "approve-requests",
              title: "Approve Dept. Requests",
              description: "Review and approve product requests from departments",
              icon: CheckCircle,
              path: "/requests", // Request system
              priority: "high",
              category: "daily"
            },
            {
              id: "generate-rrf",
              title: "Generate RRF",
              description: "Create report & requisition forms for program drugs",
              icon: FileText,
              path: "/forecast-home", // Forecasting home
              priority: "medium",
              category: "weekly"
            },
            {
              id: "ask-ai",
              title: "Ask Forlab.AI",
              description: "Get AI assistance for inventory management",
              icon: MessageSquare,
              path: "#ai-assistant", // Special handling for AI Assistant
              priority: "low",
              category: "daily"
            }
          ];
        }
        return [
          {
            id: "submit-request",
            title: "Submit Supply Request",
            description: "Request products from logistics department",
            icon: FileText,
            path: "/requests",
            priority: "medium",
            category: "daily"
          },
          {
            id: "check-stock",
            title: "Check Stock Status",
            description: "View current inventory levels",
            icon: Package,
            path: "/dashboard",
            priority: "low",
            category: "daily"
          },
          {
            id: "view-forecasts",
            title: "View Forecasts",
            description: "Check upcoming demand forecasts",
            icon: TrendingUp,
            path: "/forecast-analysis",
            priority: "low",
            category: "weekly"
          }
        ];

      case "analyst": // Regional/Zone level
        return [
          {
            id: "review-facility-reports",
            title: "Review Facility Reports",
            description: "Analyze RRF submissions from facilities",
            icon: BarChart3,
            path: "/regional-dashboard",
            priority: "high",
            category: "daily"
          },
          {
            id: "approve-forecasts",
            title: "Approve Forecasts",
            description: "Review and approve facility forecasting plans",
            icon: CheckCircle,
            path: "/forecast-analysis",
            priority: "high",
            category: "weekly"
          },
          {
            id: "monitor-stockouts",
            title: "Monitor Stockouts",
            description: "Track critical stock levels across region",
            icon: Shield,
            path: "/dashboard",
            priority: "high",
            category: "daily"
          },
          {
            id: "budget-planning",
            title: "Budget Planning",
            description: "Plan procurement budgets for next period",
            icon: Calendar,
            path: "/budget-alignment",
            priority: "medium",
            category: "weekly"
          }
        ];

      case "admin": // National level
        return [
          {
            id: "national-overview",
            title: "National Overview",
            description: "Monitor country-wide supply chain performance",
            icon: Globe,
            path: "/national-dashboard",
            priority: "high",
            category: "daily"
          },
          {
            id: "policy-review",
            title: "Policy & Guidelines",
            description: "Review and update national supply policies",
            icon: ClipboardList,
            path: "/admin",
            priority: "medium",
            category: "weekly"
          },
          {
            id: "user-management",
            title: "User Management",
            description: "Manage system users and role assignments",
            icon: Users,
            path: "/user-management",
            priority: "medium",
            category: "daily"
          },
          {
            id: "system-analytics",
            title: "System Analytics",
            description: "Review platform usage and performance metrics",
            icon: BarChart3,
            path: "/admin",
            priority: "low",
            category: "weekly"
          }
        ];

      default:
        return [
          {
            id: "getting-started",
            title: "Getting Started",
            description: "Complete your profile and role assignment",
            icon: Users,
            path: "/profile",
            priority: "high",
            category: "urgent"
          }
        ];
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryColor = (category: "daily" | "weekly" | "urgent") => {
    switch (category) {
      case "urgent":
        return "bg-red-500";
      case "daily":
        return "bg-green-500";
      case "weekly":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleTaskClick = (task: QuickTask) => {
    if (task.id === "ask-ai") {
      // Scroll to AI Assistant section
      const aiSection = document.querySelector('[data-ai-assistant]');
      if (aiSection) {
        aiSection.scrollIntoView({ behavior: 'smooth' });
        // Also focus on the AI input if it exists
        const aiInput = aiSection.querySelector('input');
        if (aiInput) {
          setTimeout(() => aiInput.focus(), 300);
        }
      }
    } else {
      // Navigate to the specified path
      navigate(task.path);
    }
  };

  if (loading) {
    return (
      <Card className="border-muted/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border rounded-lg animate-pulse">
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-full bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = getTasksByRole(userRole?.role || "", userRole?.admin_level);
  const urgentTasks = tasks.filter(task => task.category === "urgent");
  const dailyTasks = tasks.filter(task => task.category === "daily");
  const weeklyTasks = tasks.filter(task => task.category === "weekly");

  return (
    <Card className="border-muted/40 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Quick Tasks
            {userRole?.admin_level && (
              <Badge variant="secondary" className="text-xs ml-2">
                {userRole.admin_level.replace('_', ' ')}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Daily</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span>Weekly</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {urgentTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                Urgent Tasks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {urgentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            </div>
          )}

          {dailyTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Daily Tasks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {dailyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            </div>
          )}

          {weeklyTasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                Weekly Tasks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {weeklyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskCardProps {
  task: QuickTask;
  onTaskClick: (task: QuickTask) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskClick }) => {
  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "border-red-200 hover:bg-red-50";
      case "medium":
        return "border-amber-200 hover:bg-amber-50";
      case "low":
        return "border-blue-200 hover:bg-blue-50";
      default:
        return "border-border hover:bg-accent";
    }
  };

  return (
    <div
      className={`p-3 border rounded-lg cursor-pointer transition-colors group ${getPriorityColor(task.priority)}`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <task.icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
            {task.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            {task.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs ${
                task.priority === 'high' ? 'border-red-300 text-red-700' :
                task.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                'border-blue-300 text-blue-700'
              }`}
            >
              {task.priority}
            </Badge>
            <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTasks;