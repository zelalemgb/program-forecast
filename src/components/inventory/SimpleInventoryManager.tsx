import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Plus, Eye, FileText, ArrowLeft, Truck, BarChart3, ShoppingCart } from "lucide-react";
import { ReceivingModule } from "./ReceivingModule";
import { IssuingModule } from "./IssuingModule";
import { StockOverview } from "./StockOverview";
import { AdjustmentModule } from "./AdjustmentModule";
import PageHeader from "@/components/layout/PageHeader";

type InventoryAction = "overview" | "receive" | "issue" | "adjust" | null;

export const SimpleInventoryManager: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<InventoryAction>(null);
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
        <PageHeader 
          title="Inventory Management"
          description="Choose an action to get started"
        />
        
        {/* Process Flow Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Inventory Management Process Flow</h2>
          <p className="text-muted-foreground">Follow the numbered steps to complete your inventory cycle</p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Forecast Analysis */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-info rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-info to-accent"></div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-info/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-info" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Forecast Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Analyze consumption patterns and predict future stock needs
                    </p>
                    <Badge variant="outline">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trend Analysis
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Request Supply */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-accent to-brand"></div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Request Supply</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create procurement requests and place orders for supplies
                    </p>
                    <Badge variant="outline">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Place Order
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Receive Stock */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-brand to-status-ok"></div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in" onClick={() => handleActionSelect("receive")}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-brand" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Receive Stock</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Record incoming deliveries from suppliers, donations, or transfers
                    </p>
                    <Badge variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Multiple Sources
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 4: Stock Review */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-status-ok rounded-full flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-status-ok to-status-warning"></div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in" onClick={() => handleActionSelect("overview")}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-status-ok/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-status-ok" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Stock Review</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Check current stock levels, critical items, and inventory status
                    </p>
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      4 Critical Items
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 5: Issue Stock */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-status-warning rounded-full flex items-center justify-center text-white font-bold text-sm">
                5
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-status-warning to-status-critical"></div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in" onClick={() => handleActionSelect("issue")}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-status-warning/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-status-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Issue Stock</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Dispense stock to wards, departments, or other facilities
                    </p>
                    <Badge variant="outline">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Ward Requests
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 6: Cycle Count */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-status-critical rounded-full flex items-center justify-center text-white font-bold text-sm">
                6
              </div>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-status-critical to-info opacity-50"></div>
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-info" />
              </div>
            </div>
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 surface animate-fade-in" onClick={() => handleActionSelect("adjust")}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-status-critical/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 sm:h-8 sm:w-8 text-status-critical" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Cycle Count</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Systematic inventory counts, corrections, and reconciliation
                    </p>
                    <Badge variant="outline">
                      <Package className="h-3 w-3 mr-1" />
                      Count & Correct
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="text-center mt-4">
              <p className="text-xs text-muted-foreground">↗ Cycle continues with updated forecasting</p>
            </div>
          </div>
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
      <PageHeader 
        title={
          selectedAction === "overview" ? "Stock Review" :
          selectedAction === "receive" ? "Receive Stock" :
          selectedAction === "issue" ? "Issue Stock" :
          "Stock Adjustments"
        }
        description={
          selectedAction === "overview" ? "Review current stock levels and inventory status" :
          selectedAction === "receive" ? "Record incoming stock deliveries" :
          selectedAction === "issue" ? "Issue stock to departments and wards" :
          "Record stock adjustments and corrections"
        }
        actions={
          <Button variant="outline" onClick={handleBackToActions} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Actions
          </Button>
        }
      />

      {selectedAction === "overview" && <StockOverview facilityId={facilityId} />}
      
      {selectedAction === "receive" && <ReceivingModule />}
      
      {selectedAction === "issue" && <IssuingModule />}
      
      {selectedAction === "adjust" && <AdjustmentModule />}
    </div>
  );
};