import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useForecastIntegration } from "@/hooks/useForecastIntegration";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Package, TrendingUp, TrendingDown, CheckCircle, Calculator, Save, Database } from "lucide-react";
import { InventoryForecastModal } from "@/components/forecast/InventoryForecastModal";

interface StockItem {
  id: string;
  productName: string;
  currentStock: number;
  unit: string;
  reorderLevel: number;
  maxLevel: number;
  lastIssued: string;
  expiryDate?: string;
  batchNumber?: string;
  unitCost?: number;
  consumption30Days: number;
  status: "good" | "low" | "out" | "expiring" | "overstock";
}

const mockInventoryData: StockItem[] = [
  {
    id: "1",
    productName: "Artemether 20mg",
    currentStock: 450,
    unit: "tablets",
    reorderLevel: 200,
    maxLevel: 1000,
    lastIssued: "2024-02-15",
    expiryDate: "2025-06-15",
    batchNumber: "ART240215",
    unitCost: 2.50,
    consumption30Days: 85,
    status: "good"
  },
  {
    id: "2", 
    productName: "Paracetamol 500mg",
    currentStock: 0,
    unit: "tablets",
    reorderLevel: 500,
    maxLevel: 2000,
    lastIssued: "2024-02-20",
    consumption30Days: 150,
    status: "out"
  },
  {
    id: "3",
    productName: "ORS Sachets",
    currentStock: 25,
    unit: "sachets",
    reorderLevel: 100,
    maxLevel: 500,
    lastIssued: "2024-02-18",
    expiryDate: "2024-12-31",
    batchNumber: "ORS241201",
    unitCost: 0.75,
    consumption30Days: 45,
    status: "low"
  },
  {
    id: "4",
    productName: "Amoxicillin 250mg",
    currentStock: 120,
    unit: "capsules",
    reorderLevel: 150,
    maxLevel: 800,
    lastIssued: "2024-02-10",
    expiryDate: "2024-03-01",
    batchNumber: "AMX240110",
    unitCost: 0.85,
    consumption30Days: 60,
    status: "expiring"
  }
];

const getStatusColor = (status: StockItem["status"]) => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800 border-green-200";
    case "low":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "out":
      return "bg-destructive text-destructive-foreground";
    case "expiring":
      return "bg-red-100 text-red-800 border-red-200";
    case "overstock":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: StockItem["status"]) => {
  switch (status) {
    case "good":
      return <CheckCircle className="h-4 w-4" />;
    case "low":
      return <TrendingDown className="h-4 w-4" />;
    case "out":
      return <AlertTriangle className="h-4 w-4" />;
    case "expiring":
      return <AlertTriangle className="h-4 w-4" />;
    case "overstock":
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const calculateMonthsOfStock = (currentStock: number, consumption30Days: number) => {
  if (consumption30Days === 0) return "N/A";
  const months = currentStock / consumption30Days;
  return months.toFixed(1);
};

const calculateAMC = (consumption30Days: number) => {
  return (consumption30Days / 30).toFixed(1);
};

export const InventoryManager: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingValues, setEditingValues] = useState<{ [key: string]: number }>({});
  const [showForecastModal, setShowForecastModal] = useState(false);
  
  // Using mock facility ID - in real app, this would come from user context
  const facilityId = 1; // Replace with actual facility ID from user context
  const { balances, transactions, consumption, loading, error, addTransaction } = useInventoryData(facilityId);
  const { generateForecastFromInventory, loading: forecastLoading } = useForecastIntegration();
  
  // Use real data when available, fallback to mock data
  const inventoryData = balances.length > 0 ? balances.map(balance => ({
    id: balance.id,
    productName: balance.products?.name || 'Unknown Product',
    currentStock: balance.current_stock,
    unit: balance.products?.unit || 'units',
    reorderLevel: balance.reorder_level,
    maxLevel: balance.max_level,
    lastIssued: balance.last_transaction_date || '2024-02-15',
    expiryDate: undefined,
    batchNumber: undefined,
    unitCost: 2.50,
    consumption30Days: consumption.find(c => c.product_id === balance.product_id)?.amc || 0,
    status: balance.current_stock <= 0 ? "out" as const :
           balance.current_stock <= balance.reorder_level ? "low" as const : "good" as const
  })) : mockInventoryData;

  const handleStockUpdate = (itemId: string, newStock: number) => {
    setEditingValues(prev => ({
      ...prev,
      [itemId]: newStock
    }));
  };

  const calculateReorderQuantity = (item: StockItem) => {
    const amc = parseFloat(calculateAMC(item.consumption30Days));
    const leadTime = 30; // days
    const safetyStock = amc * 15; // 15 days safety stock
    const reorderQuantity = (amc * leadTime) + safetyStock - item.currentStock;
    return Math.max(0, Math.ceil(reorderQuantity));
  };

  return (
    <div className="space-y-6">
      {/* Inventory Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Inventory Management</h2>
          <Button 
            onClick={() => setShowForecastModal(true)}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Generate Forecast from Inventory
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">In Stock</span>
            </div>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Good stock levels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-muted-foreground">Need reorder</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Stock Out</span>
            </div>
            <div className="text-2xl font-bold text-destructive">4</div>
            <p className="text-xs text-muted-foreground">Urgent action needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Expiring Soon</span>
            </div>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Inventory Management Tabs */}
      <Tabs defaultValue="stock-levels" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stock-levels">Stock Levels</TabsTrigger>
          <TabsTrigger value="consumption">Consumption</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Analysis</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="stock-levels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Stock Levels</CardTitle>
                  <CardDescription>Real-time inventory status and stock positions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={isEditing ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Done" : "Edit Stock"}
                  </Button>
                  {isEditing && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Months on Hand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editingValues[item.id] ?? item.currentStock}
                            onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        ) : (
                          item.currentStock.toLocaleString()
                        )}
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        <div className="w-full">
                          <Progress 
                            value={(item.currentStock / item.maxLevel) * 100} 
                            className="w-16 h-2"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round((item.currentStock / item.maxLevel) * 100)}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {calculateMonthsOfStock(item.currentStock, item.consumption30Days)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.expiryDate ? (
                          <span className={item.status === "expiring" ? "text-red-600 font-medium" : ""}>
                            {item.expiryDate}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumption Analysis</CardTitle>
              <CardDescription>Track usage patterns and calculate Average Monthly Consumption (AMC)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>30-Day Consumption</TableHead>
                    <TableHead>Daily Average</TableHead>
                    <TableHead>AMC</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Issue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.consumption30Days} {item.unit}</TableCell>
                      <TableCell>{(item.consumption30Days / 30).toFixed(1)} {item.unit}/day</TableCell>
                      <TableCell className="font-mono">{calculateAMC(item.consumption30Days)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">+12%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.lastIssued}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Reorder Analysis
              </CardTitle>
              <CardDescription>Automated calculations for optimal reorder quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Suggested Quantity</TableHead>
                    <TableHead>Days Until Stockout</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item) => {
                    const reorderQty = calculateReorderQuantity(item);
                    const daysUntilStockout = item.consumption30Days > 0 
                      ? Math.floor((item.currentStock / item.consumption30Days) * 30)
                      : 999;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.currentStock} {item.unit}</TableCell>
                        <TableCell>{item.reorderLevel} {item.unit}</TableCell>
                        <TableCell className="font-semibold">
                          {reorderQty > 0 ? `${reorderQty} ${item.unit}` : "-"}
                        </TableCell>
                        <TableCell>
                          {daysUntilStockout < 999 ? `${daysUntilStockout} days` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.currentStock <= item.reorderLevel ? (
                            <Badge variant="destructive">High</Badge>
                          ) : daysUntilStockout < 30 ? (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium</Badge>
                          ) : (
                            <Badge variant="outline">Low</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {reorderQty > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const forecasts = await generateForecastFromInventory(facilityId, 6, 12);
                                  console.log('Generated forecasts from inventory:', forecasts);
                                  // TODO: Navigate to forecast page or show modal with results
                                } catch (error) {
                                  console.error('Failed to generate forecast:', error);
                                }
                              }}
                              disabled={forecastLoading}
                            >
                              {forecastLoading ? 'Generating...' : 'Add to Forecast'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Adjustments</CardTitle>
              <CardDescription>Record stock adjustments, losses, and corrections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adjustment-type">Adjustment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive Adjustment</SelectItem>
                      <SelectItem value="negative">Negative Adjustment</SelectItem>
                      <SelectItem value="loss">Loss/Damage</SelectItem>
                      <SelectItem value="expired">Expired Stock</SelectItem>
                      <SelectItem value="correction">Count Correction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    Record Adjustment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <InventoryForecastModal
        open={showForecastModal}
        onOpenChange={setShowForecastModal}
        facilityId={facilityId}
        facilityName="Demo Health Center"
      />
    </div>
  );
};