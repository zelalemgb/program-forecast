import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  status: "completed" | "current" | "pending" | "overdue";
  dueDate?: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

interface WorkflowStatusProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  steps: WorkflowStep[];
  variant?: "facility" | "regional" | "national";
}

const getStatusIcon = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "current":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "overdue":
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: WorkflowStep["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "current":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "overdue":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  steps,
  variant = "facility"
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              step.status === "current" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex-shrink-0">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{step.title}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(step.status)}`}
                >
                  {step.status}
                </Badge>
              </div>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              )}
              {step.dueDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Due: {step.dueDate}
                </p>
              )}
            </div>
            {step.action && step.status === "current" && (
              <Button size="sm" className="flex-shrink-0">
                {step.action.label}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};