import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye, FileText, ArrowLeft, Truck, BarChart3, ShoppingCart } from "lucide-react";
import { ReceivingModule } from "./ReceivingModule";
import { IssuingModule } from "./IssuingModule";
import { StockOverview } from "./StockOverview";
import { AdjustmentModule } from "./AdjustmentModule";
import { TodayQuickStats } from "./TodayQuickStats";


type InventoryAction = "overview" | "receive" | "issue" | "adjust" | null;

export const SimpleInventoryManager: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<InventoryAction>(null);
  const navigate = useNavigate();
  const facilityId = 1; // Would come from user context/auth

  const handleActionSelect = (action: InventoryAction) => {
    setSelectedAction(action);
  };

  const handleBackToActions = () => {
    setSelectedAction(null);
  };

  // Action Selection Screen
  if (!selectedAction) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
        <TodayQuickStats />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Stock Review Action */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface" onClick={() => handleActionSelect("overview")}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-status-ok/10 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-status-ok" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Stock Review</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check current stock levels, critical items, and inventory status
              </p>
              <Badge variant="outline" className="mb-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                4 Critical Items
              </Badge>
            </CardContent>
          </Card>

          {/* Receive Stock Action */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface" onClick={() => handleActionSelect("receive")}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-brand/10 rounded-full flex items-center justify-center">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive Stock</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Record incoming deliveries from suppliers, donations, or transfers
              </p>
              <Badge variant="outline" className="mb-2">
                <Plus className="h-3 w-3 mr-1" />
                Multiple Sources
              </Badge>
            </CardContent>
          </Card>

          {/* Issue Stock Action */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface" onClick={() => handleActionSelect("issue")}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-status-warning/10 rounded-full flex items-center justify-center">
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-status-warning" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Issue Stock</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dispense stock to wards, departments, or other facilities
              </p>
              <Badge variant="outline" className="mb-2">
                <TrendingDown className="h-3 w-3 mr-1" />
                Ward Requests
              </Badge>
            </CardContent>
          </Card>

          {/* Stock Adjustments Action */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface" onClick={() => handleActionSelect("adjust")}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-status-critical/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-status-critical" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cycle Count</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Systematic inventory counts, corrections, and reconciliation
              </p>
              <Badge variant="outline" className="mb-2">
                <Package className="h-3 w-3 mr-1" />
                Count & Correct
              </Badge>
            </CardContent>
          </Card>

          {/* Forecast Analysis Action */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface" onClick={() => navigate('/forecast-analysis')}>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-info/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-info" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Forecast Analysis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze consumption patterns and predict future stock needs
              </p>
              <Badge variant="outline" className="mb-2">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trend Analysis
              </Badge>
            </CardContent>
          </Card>

        </div>

        {/* Quick Stats */}
        <Card className="surface">
          <CardHeader>
            <CardTitle className="text-center text-lg sm:text-xl">Today's Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-center">
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-bold text-status-ok">23</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Items in Stock</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-bold text-status-warning">4</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Low Stock Items</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-bold text-status-critical">2</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Stock Outs</div>
              </div>
              <div className="p-2">
                <div className="text-xl sm:text-2xl font-bold text-brand">15</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Recent Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Action-specific screens
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {selectedAction === "overview" ? "Stock Review" :
            selectedAction === "receive" ? "Receive Stock" :
            selectedAction === "issue" ? "Issue Stock" :
            "Stock Adjustments"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedAction === "overview" ? "Review current stock levels and inventory status" :
            selectedAction === "receive" ? "Record incoming stock deliveries" :
            selectedAction === "issue" ? "Issue stock to departments and wards" :
            "Record stock adjustments and corrections"}
          </p>
        </div>
        <Button variant="outline" onClick={handleBackToActions} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Actions
        </Button>
      </div>

      {selectedAction === "overview" && <StockOverview facilityId={facilityId} />}
      
      {selectedAction === "receive" && <ReceivingModule />}
      
      {selectedAction === "issue" && <IssuingModule />}
      
      {selectedAction === "adjust" && <AdjustmentModule />}
    </div>
  );
};