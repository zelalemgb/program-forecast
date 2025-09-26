import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetadataSummary } from "@/hooks/useMetadataSummary";
import { 
  Building2, 
  Package, 
  Users, 
  TrendingUp,
  BarChart3,
  AlertCircle 
} from "lucide-react";

const MetadataSummaryDashboard: React.FC = () => {
  const { 
    totalFacilities, 
    facilityTypes, 
    totalProducts, 
    totalUsers, 
    loading, 
    error 
  } = useMetadataSummary();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mb-8 border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Failed to load summary: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summaryCards = [
    {
      title: "Health Facilities",
      value: totalFacilities,
      icon: Building2,
      description: "Total registered facilities",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Medical Products",
      value: totalProducts,
      icon: Package,
      description: "Products in catalog",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "System Users",
      value: totalUsers,
      icon: Users,
      description: "Active user accounts",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className={`${card.borderColor} border-2 hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-foreground">
                  {card.value.toLocaleString()}
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Facility Types Breakdown */}
      {facilityTypes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Facility Types Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {facilityTypes.map((type, index) => (
                <div 
                  key={type.type} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {type.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {((type.count / totalFacilities) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0">
                    {type.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetadataSummaryDashboard;