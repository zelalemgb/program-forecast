import React, { useEffect, useState } from "react";
import { WorkflowStatus } from "./WorkflowStatus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, TrendingUp, FileText, Truck, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface UpcomingTask {
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  description: string;
  count?: number;
}

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
  const { facilityId } = useCurrentUser();
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState([
    {
      id: "inventory",
      title: "Update Inventory Data",
      status: "completed" as const,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: "Record current stock levels and consumption data",
      action: {
        label: "View Inventory",
        href: "/dagu"
      }
    },
    {
      id: "forecast",
      title: "Create Quarterly Forecast",
      status: "current" as const,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: "Generate forecast based on consumption patterns",
      action: {
        label: "Start Forecast",
        href: "/run-forecast"
      }
    },
    {
      id: "request",
      title: "Submit Procurement Request",
      status: "pending" as const,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: "Submit request to Regional Hub based on forecast",
      action: {
        label: "Create Request",
        href: "/requests"
      }
    },
    {
      id: "delivery",
      title: "Receive & Record Delivery",
      status: "pending" as const,
      dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      description: "Record incoming stock and update inventory levels",
      action: {
        label: "Record Receipt",
        href: "/receive-stock"
      }
    }
  ]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!facilityId) return;

      try {
        // Get real data about pending tasks
        const [
          { data: stockoutItems },
          { data: lowStockItems },
          { data: recentTransactions },
          { data: nearExpiryItems }
        ] = await Promise.all([
          // Stockout items
          supabase
            .from('inventory_balances')
            .select('id')
            .eq('facility_id', facilityId)
            .eq('current_stock', 0),
          
          // Low stock items  
          supabase
            .from('inventory_balances')
            .select('current_stock, reorder_level')
            .eq('facility_id', facilityId)
            .gt('current_stock', 0),
          
          // Recent transactions
          supabase
            .from('inventory_transactions')
            .select('id')
            .eq('facility_id', facilityId)
            .gte('transaction_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          
          // Near expiry (this would need product expiry data)
          supabase
            .from('inventory_transactions')
            .select('id')
            .eq('facility_id', facilityId)
            .lt('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ]);

        const stockouts = stockoutItems?.length || 0;
        const lowStock = lowStockItems?.filter(item => 
          item.current_stock <= item.reorder_level
        )?.length || 0;

        const tasks: UpcomingTask[] = [];

        // Add critical tasks based on real data
        if (stockouts > 0) {
          tasks.push({
            title: "Urgent Stock Replenishment",
            dueDate: "Today",
            priority: "high",
            description: `${stockouts} items are out of stock`,
            count: stockouts
          });
        }

        if (lowStock > 0) {
          tasks.push({
            title: "Low Stock Review",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            priority: "medium",
            description: `${lowStock} items below reorder level`,
            count: lowStock
          });
        }

        // Add regular monthly tasks
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        tasks.push({
          title: "Monthly Stock Count",
          dueDate: nextMonth.toLocaleDateString(),
          priority: "medium",
          description: "Conduct physical stock count for all items"
        });

        const expiryCheck = new Date(now.getFullYear(), now.getMonth(), 28);
        if (expiryCheck > now) {
          tasks.push({
            title: "Expiry Date Check",
            dueDate: expiryCheck.toLocaleDateString(),
            priority: "medium",
            description: "Review items expiring in next 30 days"
          });
        }

        setUpcomingTasks(tasks);

      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [facilityId]);

  return (
    <div className="space-y-6">
      {/* Current Cycle Status */}
      <WorkflowStatus
        title="Quarterly Supply Cycle"
        description="Track your supply planning and procurement cycle"
        currentStep={2}
        totalSteps={4}
        steps={workflowSteps}
        variant="facility"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium">Inventory</h3>
            <p className="text-sm text-muted-foreground">Stock Management</p>
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
            {upcomingTasks.filter(t => t.priority === 'high').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {upcomingTasks.filter(t => t.priority === 'high').length} urgent
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Important tasks and deadlines based on your facility's current status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingTasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No urgent tasks at the moment. All systems running smoothly!
            </div>
          ) : (
            upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    {task.count && (
                      <Badge variant="secondary">
                        {task.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate}</p>
                </div>
                <Button size="sm" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};