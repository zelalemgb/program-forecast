import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertTriangle, Plus, Eye, FileText } from "lucide-react";
import { ReceivingModule } from "./ReceivingModule";
import { StockOverview } from "./StockOverview";
import PageHeader from "@/components/layout/PageHeader";

export const SimpleInventoryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const facilityId = 1; // Would come from user context/auth

  return (
    <div className="container py-6 space-y-6">
      <PageHeader 
        title="Inventory Management"
        description="Simple, efficient inventory management for rural health centers"
        actions={
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              4 Items Need Attention
            </Badge>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Quick Report
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Stock Overview
          </TabsTrigger>
          <TabsTrigger value="receive" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Receive Stock
          </TabsTrigger>
          <TabsTrigger value="issue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Issue Stock
          </TabsTrigger>
          <TabsTrigger value="adjust" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Adjustments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StockOverview facilityId={facilityId} />
        </TabsContent>

        <TabsContent value="receive" className="space-y-6">
          <ReceivingModule />
        </TabsContent>

        <TabsContent value="issue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Issue Stock to Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Stock Issuing Module</p>
                <p className="text-sm">Coming soon - Issue stock to wards and departments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjust" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Adjustment Module</p>
                <p className="text-sm">Coming soon - Record stock adjustments, losses, and corrections</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};