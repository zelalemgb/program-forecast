import React from "react";
import { WorkflowStatus } from "./WorkflowStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, TrendingUp, FileText, Truck } from "lucide-react";

const facilityWorkflowSteps = [
  {
    id: "inventory",
    title: "Update Inventory Data",
    status: "completed" as const,
    dueDate: "Feb 28, 2024",
    description: "Record current stock levels and consumption data in Dagu Mini",
    action: {
      label: "View Inventory",
      href: "/dagu"
    }
  },
  {
    id: "forecast",
    title: "Create Quarterly Forecast",
    status: "current" as const,
    dueDate: "Mar 15, 2024",
    description: "Generate forecast based on consumption patterns and stock levels",
    action: {
      label: "Start Forecast",
      href: "/forecast"
    }
  },
  {
    id: "request",
    title: "Submit Procurement Request",
    status: "pending" as const,
    dueDate: "Mar 20, 2024",
    description: "Submit request to Regional Medical Store based on forecast",
    action: {
      label: "Create Request",
      href: "/supply-planning"
    }
  },
  {
    id: "delivery",
    title: "Receive & Record Delivery",
    status: "pending" as const,
    dueDate: "Apr 10, 2024",
    description: "Record incoming stock and update inventory levels",
    action: {
      label: "Record Receipt",
      href: "/dagu?tab=goods-received"
    }
  }
];

const upcomingTasks = [
  {
    title: "Monthly Stock Count",
    dueDate: "Mar 1, 2024",
    priority: "high" as const,
    description: "Conduct physical stock count for all essential medicines"
  },
  {
    title: "Ward Request Review",
    dueDate: "Feb 25, 2024",
    priority: "medium" as const,
    description: "Approve pending ward requests (3 pending)"
  },
  {
    title: "Expiry Date Check",
    dueDate: "Feb 28, 2024",
    priority: "medium" as const,
    description: "Review items expiring in next 30 days"
  }
];

const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "bg-destructive text-destructive-foreground";
    case "medium":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
  }
};

export const FacilityWorkflow: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Current Cycle Status */}
      <WorkflowStatus
        title="Q1 2024 Supply Cycle"
        description="Track your quarterly supply planning and procurement cycle"
        currentStep={2}
        totalSteps={4}
        steps={facilityWorkflowSteps}
        variant="facility"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Dagu Mini</h3>
            <p className="text-sm text-muted-foreground">Inventory Management</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Forecast</h3>
            <p className="text-sm text-muted-foreground">Demand Planning</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Requests</h3>
            <p className="text-sm text-muted-foreground">Procurement Requests</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Deliveries</h3>
            <p className="text-sm text-muted-foreground">Track Shipments</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Tasks
          </CardTitle>
          <CardDescription>
            Important tasks and deadlines to keep your facility running smoothly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};