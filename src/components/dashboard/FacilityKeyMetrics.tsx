import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  TrendingUp,
  AlertTriangle,
  Trophy,
  CheckCircle,
  XCircle,
  Target,
  MapPin
} from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useUserRole } from "@/hooks/useUserRole";

interface MetricCardProps {
  title: string;
  value: string | number;
  status: "excellent" | "good" | "warning" | "critical";
  description: string;
  icon: React.ComponentType<any>;
  rank?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, status, description, icon: Icon, rank }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-50 border-green-200";
      case "good": return "text-blue-600 bg-blue-50 border-blue-200";
      case "warning": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-muted-foreground bg-muted/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "good": return <Target className="h-4 w-4 text-blue-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Card className={`border transition-colors hover:shadow-sm ${getStatusColor(status)}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {getStatusIcon(status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {rank && (
              <Badge variant="secondary" className="text-xs">
                {rank}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const FacilityKeyMetrics: React.FC = () => {
  const { userRole } = useUserRole();
  const { balances, loading } = useInventoryData(userRole?.facility_id);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!balances || balances.length === 0) {
      return {
        dataCompleteness: 0,
        forecastingScore: 0,
        stockoutRate: 0,
        nationalRank: 0,
        regionalRank: 0
      };
    }

    // Data completeness calculation
    const totalProducts = balances.length;
    const productsWithCompleteData = balances.filter(b => 
      b.current_stock !== null && 
      b.reorder_level > 0 && 
      b.max_level > 0
    ).length;
    const dataCompleteness = totalProducts > 0 ? Math.round((productsWithCompleteData / totalProducts) * 100) : 0;

    // Stockout rate calculation
    const stockouts = balances.filter(b => b.current_stock === 0).length;
    const stockoutRate = totalProducts > 0 ? Math.round((stockouts / totalProducts) * 100) : 0;

    // Mock calculations for demo purposes
    const forecastingScore = Math.max(0, Math.min(100, dataCompleteness - 10 + Math.random() * 20));
    const nationalRank = Math.floor(Math.random() * 500) + 1;
    const regionalRank = Math.floor(Math.random() * 50) + 1;

    return {
      dataCompleteness,
      forecastingScore: Math.round(forecastingScore),
      stockoutRate,
      nationalRank,
      regionalRank
    };
  }, [balances]);

  const getStatus = (value: number, type: "percentage" | "rate") => {
    if (type === "rate") {
      // For stockout rate, lower is better
      if (value <= 5) return "excellent";
      if (value <= 15) return "good";
      if (value <= 30) return "warning";
      return "critical";
    } else {
      // For percentages, higher is better
      if (value >= 90) return "excellent";
      if (value >= 75) return "good";
      if (value >= 50) return "warning";
      return "critical";
    }
  };

  const getRankStatus = (nationalRank: number) => {
    if (nationalRank <= 50) return "excellent";
    if (nationalRank <= 150) return "good";
    if (nationalRank <= 300) return "warning";
    return "critical";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Data Completeness"
        value={`${metrics.dataCompleteness}%`}
        status={getStatus(metrics.dataCompleteness, "percentage")}
        description="Inventory module usage & data quality"
        icon={Database}
      />
      
      <MetricCard
        title="Forecasting Score"
        value={`${metrics.forecastingScore}%`}
        status={getStatus(metrics.forecastingScore, "percentage")}
        description="Inventory analysis-based forecasting readiness"
        icon={TrendingUp}
      />
      
      <MetricCard
        title="Stockout Rate"
        value={`${metrics.stockoutRate}%`}
        status={getStatus(metrics.stockoutRate, "rate")}
        description="Current percentage of products out of stock"
        icon={AlertTriangle}
      />
      
      <MetricCard
        title="Facility Ranking"
        value={`#${metrics.nationalRank}`}
        status={getRankStatus(metrics.nationalRank)}
        description="National performance ranking"
        icon={Trophy}
        rank={`#${metrics.regionalRank} Regional`}
      />
    </div>
  );
};