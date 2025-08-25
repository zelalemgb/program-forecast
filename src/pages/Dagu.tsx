import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, FileText, Download, HelpCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import KPICards from "@/components/home/KPICards";
import * as ethiopianDate from "ethiopian-date";

const Dagu: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;
  
  const [periodType, setPeriodType] = useState<string>("monthly");
  const [startingPeriod, setStartingPeriod] = useState<string>("hamle-2016");

  // Generate periods based on selection
  const generatePeriods = () => {
    // Since the ethiopian-date library is for conversion only, 
    // we'll use predefined Ethiopian month names
    if (periodType === "monthly") {
      // 12 months starting from Hamle (Ethiopian calendar)
      const hamleMonths = ["Hamle", "Nehase", "Meskerem", "Tekemet", "Hedar", "Tahsas", 
                          "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene"];
      return hamleMonths;
    } else if (periodType === "quarterly") {
      // 4 quarters
      return ["Q1 (Hamle-Meskerem)", "Q2 (Tekemet-Tahsas)", "Q3 (Tir-Miazia)", "Q4 (Ginbot-Sene)"];
    } else if (periodType === "biannually") {
      // 2 halves
      return ["H1 (Hamle-Tahsas)", "H2 (Tir-Sene)"];
    }
    return [];
  };

  const periods = generatePeriods();

  // Initialize all periods as collapsed by default
  const [collapsedPeriods, setCollapsedPeriods] = useState<{ [key: number]: boolean }>(() => {
    const initialState: { [key: number]: boolean } = {};
    periods.forEach((_, index) => {
      initialState[index] = true; // Start collapsed
    });
    return initialState;
  });

  // State for manual entry - only for drugs without inventory data
  const [editableValues, setEditableValues] = useState<{ [key: string]: string }>({});
  
  // Define which drugs have existing inventory data
  const drugsWithInventory = ["Artemether", "Amoxicillin"]; // Drugs with existing data
  const drugsWithoutInventory = ["Paracetamol", "ORS", "Iron Tablets"]; // Drugs needing manual entry

  const handleValueChange = (drugName: string, periodIndex: number, value: string) => {
    const key = `${drugName}-${periodIndex}`;
    setEditableValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getEditableValue = (drugName: string, periodIndex: number) => {
    const key = `${drugName}-${periodIndex}`;
    return editableValues[key] || "";
  };

  const togglePeriod = (index: number) => {
    setCollapsedPeriods(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Dagu – Facility Supply Operations | Forlab+</title>
        <meta
          name="description"
          content="Dagu supply operations module for facility inventory management, receipts, issues, and EPSS integration."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Dagu Mini
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Facility: Main Health Center</span>
            <span>•</span>
            <span>Period: Feb 2024</span>
            <span>•</span>
            <span>Last Stock Take: 15 Feb 2024</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            3 Pending Requests
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            2 Low Stock
          </Badge>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <section>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goods-received">Goods Received</TabsTrigger>
            <TabsTrigger value="ward-requests">Ward Requests</TabsTrigger>
            <TabsTrigger value="transfers-out">Transfers Out</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Inventory KPIs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Inventory Status</h2>
              <KPICards stockouts={4} lowStock={8} nearExpiry={12} overstock={3} />
            </div>

            {/* Critical Alerts & Current Stock Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Critical Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div>
                      <div className="font-medium text-destructive">Paracetamol 500mg</div>
                      <div className="text-sm text-muted-foreground">Stockout - 0 units available</div>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <div className="font-medium text-orange-800">Amoxicillin 250mg</div>
                      <div className="text-sm text-muted-foreground">Expires in 5 days - 120 units</div>
                    </div>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">Expiring</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div>
                      <div className="font-medium text-yellow-800">ORS Sachets</div>
                      <div className="text-sm text-muted-foreground">Low stock - 25 units (5 days remaining)</div>
                    </div>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">Low Stock</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Current Stock Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Essential Stock Status</CardTitle>
                  <CardDescription>Top priority items status overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Artemether</TableCell>
                        <TableCell>450 units</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Good
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Iron Tablets</TableCell>
                        <TableCell>180 units</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Good
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Paracetamol</TableCell>
                        <TableCell>0 units</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stockout
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">ORS Sachets</TableCell>
                        <TableCell>25 units</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                            Low Stock
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium">Goods Received</div>
                      <div className="text-sm text-muted-foreground">EPSS delivery - 15 items</div>
                    </div>
                    <div className="text-sm text-muted-foreground">2 days ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium">Ward Request Fulfilled</div>
                      <div className="text-sm text-muted-foreground">Maternity Ward - 8 items</div>
                    </div>
                    <div className="text-sm text-muted-foreground">1 day ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div className="flex-1">
                      <div className="font-medium">Stock Adjustment</div>
                      <div className="text-sm text-muted-foreground">Expired items removed - 3 batches</div>
                    </div>
                    <div className="text-sm text-muted-foreground">3 days ago</div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg border">
                    <Package className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <div className="font-medium">Transfer Out</div>
                      <div className="text-sm text-muted-foreground">Health Post A - Emergency support</div>
                    </div>
                    <div className="text-sm text-muted-foreground">5 days ago</div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Actions</CardTitle>
                  <CardDescription>Priority tasks requiring attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <div>
                        <div className="font-medium">Stockout Items</div>
                        <div className="text-sm text-muted-foreground">4 items need immediate reorder</div>
                      </div>
                    </div>
                    <Button size="sm" variant="destructive">Urgent</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-medium">Ward Requests</div>
                        <div className="text-sm text-muted-foreground">3 requests awaiting approval</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Near Expiry</div>
                        <div className="text-sm text-muted-foreground">12 items expiring within 30 days</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Check</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium">Stock Count</div>
                        <div className="text-sm text-muted-foreground">Monthly count due in 5 days</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Month's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">156</div>
                    <div className="text-sm text-muted-foreground">Items Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">89</div>
                    <div className="text-sm text-muted-foreground">Items Issued</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-purple-600">7</div>
                    <div className="text-sm text-muted-foreground">Adjustments Made</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-orange-600">3</div>
                    <div className="text-sm text-muted-foreground">Transfers Out</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goods Received Tab */}
          <TabsContent value="goods-received" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Record Incoming Stock</CardTitle>
                <CardDescription>
                  Capture stock received from EPSS, internal procurement, transfers, or donations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="epss">EPSS Scheduled Delivery</SelectItem>
                        <SelectItem value="procurement">Internal Procurement</SelectItem>
                        <SelectItem value="transfer">Transfer from Other Facility</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delivery-note">Delivery Note #</Label>
                    <Input placeholder="Enter delivery note number" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Items Received</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Product Name</span>
                    <span>Batch/Lot</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Expiry Date</span>
                    <span>Notes</span>
                  </div>
                  <div className="py-4 text-center text-muted-foreground">
                    No items added yet. Click "Add Item" to start recording received goods.
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Complete Receipt</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ward Requests Tab */}
          <TabsContent value="ward-requests" className="space-y-4">
            {/* New Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>New Ward Request</CardTitle>
                <CardDescription>Submit request from ward or department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Requesting Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maternity">Maternity Ward</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="outpatient">Outpatient Department</SelectItem>
                        <SelectItem value="emergency">Emergency Room</SelectItem>
                        <SelectItem value="laboratory">Laboratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Items Requested</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Product Name</span>
                    <span>Requested Qty</span>
                    <span>Unit</span>
                    <span>Available Stock</span>
                    <span>Notes</span>
                  </div>
                  <div className="py-4 text-center text-muted-foreground">
                    No items added yet. Click "Add Item" to specify requested items.
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Request Notes</Label>
                  <Textarea placeholder="Additional notes or special instructions" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Submit Request</Button>
                </div>
              </CardContent>
            </Card>

            {/* Pending Requests with Item Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pending Ward Requests
                  <Badge variant="secondary">3</Badge>
                </CardTitle>
                <CardDescription>Requests awaiting approval and fulfillment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Maternity Ward Request */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Maternity Ward</div>
                          <div className="text-sm text-muted-foreground">5 items requested • Submitted 2 hours ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Normal Priority</Badge>
                        <Button size="sm" variant="outline">View Full</Button>
                        <Button size="sm">Approve & Issue</Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t mt-4 pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Paracetamol 500mg</TableCell>
                          <TableCell>50 tablets</TableCell>
                          <TableCell>0 tablets</TableCell>
                          <TableCell>
                            <Badge variant="destructive">Out of Stock</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Gloves (Medium)</TableCell>
                          <TableCell>2 boxes</TableCell>
                          <TableCell>15 boxes</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Gauze Pads</TableCell>
                          <TableCell>10 packs</TableCell>
                          <TableCell>25 packs</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Antiseptic Solution</TableCell>
                          <TableCell>3 bottles</TableCell>
                          <TableCell>8 bottles</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Syringes 5ml</TableCell>
                          <TableCell>100 pieces</TableCell>
                          <TableCell>350 pieces</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <strong>Request Notes:</strong> Weekly restocking for maternity unit. Urgent need for gloves and gauze for deliveries this week.
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Emergency Room Request */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Emergency Room</div>
                          <div className="text-sm text-muted-foreground">2 items requested • Submitted 30 mins ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Urgent</Badge>
                        <Button size="sm" variant="outline">View Full</Button>
                        <Button size="sm">Approve & Issue</Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t mt-4 pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">IV Fluids (Normal Saline)</TableCell>
                          <TableCell>10 bags</TableCell>
                          <TableCell>45 bags</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Adrenaline 1mg</TableCell>
                          <TableCell>5 vials</TableCell>
                          <TableCell>12 vials</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-3 p-3 bg-destructive/10 rounded-lg text-sm border border-destructive/20">
                      <strong>Request Notes:</strong> <span className="text-destructive font-medium">URGENT:</span> Multiple trauma cases in ER. Need immediate restocking of emergency supplies.
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Pediatrics Request */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Pediatrics Ward</div>
                          <div className="text-sm text-muted-foreground">3 items requested • Submitted 1 day ago</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Normal Priority</Badge>
                        <Button size="sm" variant="outline">View Full</Button>
                        <Button size="sm">Approve & Issue</Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-t mt-4 pt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">ORS Sachets</TableCell>
                          <TableCell>50 sachets</TableCell>
                          <TableCell>25 sachets</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-yellow-300 text-yellow-700">Partial Stock</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Amoxicillin Suspension</TableCell>
                          <TableCell>20 bottles</TableCell>
                          <TableCell>35 bottles</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Thermometers (Digital)</TableCell>
                          <TableCell>5 pieces</TableCell>
                          <TableCell>8 pieces</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Available</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <strong>Request Notes:</strong> Monthly supply for pediatric unit. High demand for ORS due to current diarrhea cases.
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Out Tab */}
          <TabsContent value="transfers-out" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer to Other Facility</CardTitle>
                <CardDescription>
                  Send items to another facility for emergency support or planned distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destination">Destination Facility</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="district">District Hospital</SelectItem>
                        <SelectItem value="health-post-1">Health Post A</SelectItem>
                        <SelectItem value="health-post-2">Health Post B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Transfer Reason</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Support</SelectItem>
                        <SelectItem value="planned">Planned Transfer</SelectItem>
                        <SelectItem value="redistribution">Stock Redistribution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Items to Transfer</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Product Name</span>
                    <span>Batch/Lot</span>
                    <span>Quantity</span>
                    <span>Unit</span>
                    <span>Stock on Hand</span>
                    <span>Notes</span>
                  </div>
                  <div className="py-4 text-center text-muted-foreground">
                    No items added yet. Click "Add Item" to specify items for transfer.
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="transfer-notes">Transfer Notes</Label>
                  <Textarea placeholder="Reason for transfer and additional notes" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Record Transfer</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adjustments Tab */}
          <TabsContent value="adjustments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Adjustments</CardTitle>
                <CardDescription>
                  Record stock changes outside normal receipt/issue processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adjustment-type">Adjustment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive Adjustment</SelectItem>
                        <SelectItem value="negative">Negative Adjustment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="found">Found Stock</SelectItem>
                        <SelectItem value="return">Return from Ward</SelectItem>
                        <SelectItem value="correction">Data Correction</SelectItem>
                        <SelectItem value="expired">Expired Items</SelectItem>
                        <SelectItem value="damaged">Damaged Items</SelectItem>
                        <SelectItem value="loss">Loss/Theft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Items Being Adjusted</h4>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-sm font-medium text-muted-foreground pb-2 border-b">
                    <span>Product Name</span>
                    <span>Batch/Lot</span>
                    <span>Adjustment Qty</span>
                    <span>Unit</span>
                    <span>Current Stock</span>
                    <span>Notes</span>
                  </div>
                  <div className="py-4 text-center text-muted-foreground">
                    No items added yet. Click "Add Item" to specify adjustments.
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="attachment">Attachment (Optional)</Label>
                  <Input type="file" accept=".pdf,.jpg,.png" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Save Draft</Button>
                  <Button>Record Adjustment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </section>
    </main>
  );
};

export default Dagu;
