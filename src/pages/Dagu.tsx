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
import { Package, Plus, FileText, Download, HelpCircle, Clock, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
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
        <Tabs defaultValue="goods-received" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="goods-received">Goods Received</TabsTrigger>
            <TabsTrigger value="ward-requests">Ward Requests</TabsTrigger>
            <TabsTrigger value="transfers-out">Transfers Out</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="supply-planning">Supply Planning</TabsTrigger>
          </TabsList>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>New Request</CardTitle>
                  <CardDescription>Submit request from ward or department</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  
                  <div>
                    <Label htmlFor="notes">Request Notes</Label>
                    <Textarea placeholder="Additional notes or special instructions" />
                  </div>
                  
                  <Button className="w-full">Submit Request</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pending Requests
                    <Badge variant="secondary">3</Badge>
                  </CardTitle>
                  <CardDescription>Requests awaiting approval and fulfillment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Maternity Ward</div>
                        <div className="text-sm text-muted-foreground">5 items requested</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Approve & Issue</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Emergency Room</div>
                        <div className="text-sm text-muted-foreground">2 items requested • Urgent</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm">Approve & Issue</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

          {/* Supply Planning Tab */}
          <TabsContent value="supply-planning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Supply Planning Analysis
                </CardTitle>
                <CardDescription>
                  Annual drug consumption analysis based on Ethiopian calendar year starting from Hamle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selector */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="period-type" className="font-medium">Period Type:</Label>
                  <Select value={periodType} onValueChange={setPeriodType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="biannually">Biannually</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="starting-period" className="font-medium">Starting Period:</Label>
                  <Select value={startingPeriod} onValueChange={setStartingPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hamle-2016">Hamle 2016 E.C.</SelectItem>
                      <SelectItem value="hamle-2015">Hamle 2015 E.C.</SelectItem>
                      <SelectItem value="hamle-2014">Hamle 2014 E.C.</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="ml-2">
                    One Year Analysis ({periods.length} {periodType === "monthly" ? "months" : periodType === "quarterly" ? "quarters" : "periods"})
                  </Badge>
                </div>

                {/* Drug-by-Drug Table */}
                <div className="space-y-4">
                  <h4 className="font-medium">Drug-by-Drug Annual Analysis ({periodType} periods)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="sticky left-0 bg-background z-20 border-r min-w-[200px]">Drug Name</TableHead>
                            {periods.map((period, index) => (
                              <TableHead key={index} className="text-center border-l relative" colSpan={collapsedPeriods[index] ? 1 : 9}>
                                <Collapsible>
                                  <CollapsibleTrigger
                                    className="flex items-center gap-1 hover:bg-muted/50 p-1 rounded"
                                    onClick={() => togglePeriod(index)}
                                  >
                                    {collapsedPeriods[index] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    {period}
                                  </CollapsibleTrigger>
                                </Collapsible>
                              </TableHead>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableHead className="sticky left-0 bg-background z-20 border-r"></TableHead>
                            {periods.map((_, periodIndex) => (
                              <React.Fragment key={periodIndex}>
                                {!collapsedPeriods[periodIndex] ? (
                                  <>
                                    <TableHead className="text-right text-xs">Beg.</TableHead>
                                    <TableHead className="text-right text-xs">Rec.</TableHead>
                                    <TableHead className="text-right text-xs">Iss.</TableHead>
                                    <TableHead className="text-right text-xs">Adj.</TableHead>
                                    <TableHead className="text-right text-xs">T.Out</TableHead>
                                    <TableHead className="text-right text-xs">End</TableHead>
                                    <TableHead className="text-right text-xs">S.Days</TableHead>
                                    <TableHead className="text-right text-xs">Exp/Dam</TableHead>
                                    <TableHead className="text-right text-xs border-r">Cons.</TableHead>
                                  </>
                                ) : (
                                  <TableHead className="text-right text-xs border-r">Consumption</TableHead>
                                )}
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {/* Amoxicillin - has inventory data */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Amoxicillin 250mg</TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-xs">500</TableCell>
                                  <TableCell className="text-right text-xs">200</TableCell>
                                  <TableCell className="text-right text-xs">180</TableCell>
                                  <TableCell className="text-right text-xs">-5</TableCell>
                                  <TableCell className="text-right text-xs">10</TableCell>
                                  <TableCell className="text-right text-xs">505</TableCell>
                                  <TableCell className="text-right text-xs">2</TableCell>
                                  <TableCell className="text-right text-xs">5</TableCell>
                                  <TableCell className="text-right text-xs border-r font-medium">195</TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right text-xs border-r font-medium text-primary">195</TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                        
                        {/* Paracetamol - no inventory data, allow manual entry */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Paracetamol 500mg</TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-soh-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-soh-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-received-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-received-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-issued-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-issued-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-adjustments-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-adjustments-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-transfers-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-transfers-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-balance-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-balance-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-losses-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-losses-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Paracetamol-days-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-days-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                      value={getEditableValue(`Paracetamol-consumption-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Paracetamol-consumption-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                  <Input 
                                    type="number" 
                                    placeholder="0"
                                    className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                    value={getEditableValue(`Paracetamol-consumption-${periodIndex}`, 0)}
                                    onChange={(e) => handleValueChange(`Paracetamol-consumption-${periodIndex}`, 0, e.target.value)}
                                  />
                                </TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                        
                        {/* Oxytocin - no inventory data, allow manual entry */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Oxytocin 10IU</TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-soh-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-soh-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-received-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-received-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-issued-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-issued-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-adjustments-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-adjustments-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-transfers-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-transfers-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-balance-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-balance-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-losses-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-losses-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`Oxytocin-days-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-days-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                      value={getEditableValue(`Oxytocin-consumption-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`Oxytocin-consumption-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                  <Input 
                                    type="number" 
                                    placeholder="0"
                                    className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                    value={getEditableValue(`Oxytocin-consumption-${periodIndex}`, 0)}
                                    onChange={(e) => handleValueChange(`Oxytocin-consumption-${periodIndex}`, 0, e.target.value)}
                                  />
                                </TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                        
                        {/* Artemether - has inventory data */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">Artemether 80mg</TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-xs">120</TableCell>
                                  <TableCell className="text-right text-xs">60</TableCell>
                                  <TableCell className="text-right text-xs">45</TableCell>
                                  <TableCell className="text-right text-xs">0</TableCell>
                                  <TableCell className="text-right text-xs">15</TableCell>
                                  <TableCell className="text-right text-xs">120</TableCell>
                                  <TableCell className="text-right text-xs">3</TableCell>
                                  <TableCell className="text-right text-xs">0</TableCell>
                                  <TableCell className="text-right text-xs border-r font-medium">60</TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right text-xs border-r font-medium text-primary">60</TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                        
                        {/* ORS Sachets - no inventory data, allow manual entry */}
                        <TableRow>
                          <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">ORS Sachets</TableCell>
                          {periods.map((_, periodIndex) => (
                            <React.Fragment key={periodIndex}>
                              {!collapsedPeriods[periodIndex] ? (
                                <>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-soh-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-soh-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-received-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-received-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-issued-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-issued-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-adjustments-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-adjustments-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-transfers-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-transfers-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-balance-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-balance-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-losses-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-losses-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted"
                                      value={getEditableValue(`ORS-days-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-days-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                    <Input 
                                      type="number" 
                                      placeholder="0"
                                      className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                      value={getEditableValue(`ORS-consumption-${periodIndex}`, 0)}
                                      onChange={(e) => handleValueChange(`ORS-consumption-${periodIndex}`, 0, e.target.value)}
                                    />
                                  </TableCell>
                                </>
                              ) : (
                                <TableCell className="text-right text-xs border-r font-medium text-primary p-1">
                                  <Input 
                                    type="number" 
                                    placeholder="0"
                                    className="h-6 text-xs text-right border-0 bg-transparent p-1 focus:bg-muted font-medium"
                                    value={getEditableValue(`ORS-consumption-${periodIndex}`, 0)}
                                    onChange={(e) => handleValueChange(`ORS-consumption-${periodIndex}`, 0, e.target.value)}
                                  />
                                </TableCell>
                              )}
                            </React.Fragment>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                </div>

                {/* Forecast Section */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Supply Forecast (Next Year)</h4>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Forecast Based on Historical Consumption
                    </Badge>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-950/30 dark:to-green-950/30">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-blue-100/50 dark:bg-blue-900/30">
                            <TableHead className="sticky left-0 bg-blue-100/50 dark:bg-blue-900/30 z-20 border-r min-w-[200px] font-semibold">Drug Name</TableHead>
                            {periods.map((period, index) => {
                              // Add "2017" to indicate next year in Ethiopian calendar
                              const forecastPeriod = period.includes("2016") ? period.replace("2016", "2017") : `${period} 2017`;
                              return (
                                <TableHead key={index} className="text-center border-l font-semibold text-blue-800 dark:text-blue-200">
                                  {forecastPeriod}
                                </TableHead>
                              );
                            })}
                            <TableHead className="text-center border-l font-semibold text-green-800 dark:text-green-200">
                              Total Forecast
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Amoxicillin Forecast */}
                          <TableRow className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                            <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                              Amoxicillin 250mg
                              <div className="text-xs text-muted-foreground">Avg: 195 units/period</div>
                            </TableCell>
                            {periods.map((_, periodIndex) => (
                              <TableCell key={periodIndex} className="text-center text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                                {Math.round(195 * (0.95 + Math.random() * 0.1))} {/* Add some variance */}
                              </TableCell>
                            ))}
                            <TableCell className="text-center text-sm font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/30">
                              {Math.round(195 * periods.length * 1.02)}
                            </TableCell>
                          </TableRow>

                          {/* Paracetamol Forecast */}
                          <TableRow className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                            <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                              Paracetamol 500mg
                              <div className="text-xs text-muted-foreground">Manual entry required</div>
                            </TableCell>
                            {periods.map((_, periodIndex) => {
                              // Calculate forecast based on manual entries if available
                              const historicalValue = getEditableValue(`Paracetamol-consumption-${periodIndex}`, 0);
                              const baseValue = historicalValue ? parseInt(historicalValue) : 0;
                              const forecast = baseValue > 0 ? Math.round(baseValue * (1.0 + Math.random() * 0.1)) : 0;
                              return (
                                <TableCell key={periodIndex} className="text-center text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                                  {forecast || "-"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center text-sm font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/30">
                              {(() => {
                                const total = periods.reduce((sum, _, idx) => {
                                  const val = getEditableValue(`Paracetamol-consumption-${idx}`, 0);
                                  return sum + (val ? parseInt(val) : 0);
                                }, 0);
                                return total > 0 ? Math.round(total * 1.02) : "-";
                              })()}
                            </TableCell>
                          </TableRow>

                          {/* Oxytocin Forecast */}
                          <TableRow className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                            <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                              Oxytocin 10IU
                              <div className="text-xs text-muted-foreground">Manual entry required</div>
                            </TableCell>
                            {periods.map((_, periodIndex) => {
                              const historicalValue = getEditableValue(`Oxytocin-consumption-${periodIndex}`, 0);
                              const baseValue = historicalValue ? parseInt(historicalValue) : 0;
                              const forecast = baseValue > 0 ? Math.round(baseValue * (1.0 + Math.random() * 0.1)) : 0;
                              return (
                                <TableCell key={periodIndex} className="text-center text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                                  {forecast || "-"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center text-sm font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/30">
                              {(() => {
                                const total = periods.reduce((sum, _, idx) => {
                                  const val = getEditableValue(`Oxytocin-consumption-${idx}`, 0);
                                  return sum + (val ? parseInt(val) : 0);
                                }, 0);
                                return total > 0 ? Math.round(total * 1.02) : "-";
                              })()}
                            </TableCell>
                          </TableRow>

                          {/* Artemether Forecast */}
                          <TableRow className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                            <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                              Artemether 80mg
                              <div className="text-xs text-muted-foreground">Avg: 60 units/period</div>
                            </TableCell>
                            {periods.map((_, periodIndex) => (
                              <TableCell key={periodIndex} className="text-center text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                                {Math.round(60 * (0.95 + Math.random() * 0.1))}
                              </TableCell>
                            ))}
                            <TableCell className="text-center text-sm font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/30">
                              {Math.round(60 * periods.length * 1.02)}
                            </TableCell>
                          </TableRow>

                          {/* ORS Sachets Forecast */}
                          <TableRow className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
                            <TableCell className="font-medium sticky left-0 bg-background z-20 border-r min-w-[200px]">
                              ORS Sachets
                              <div className="text-xs text-muted-foreground">Manual entry required</div>
                            </TableCell>
                            {periods.map((_, periodIndex) => {
                              const historicalValue = getEditableValue(`ORS-consumption-${periodIndex}`, 0);
                              const baseValue = historicalValue ? parseInt(historicalValue) : 0;
                              const forecast = baseValue > 0 ? Math.round(baseValue * (1.0 + Math.random() * 0.1)) : 0;
                              return (
                                <TableCell key={periodIndex} className="text-center text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/20">
                                  {forecast || "-"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center text-sm font-bold text-green-700 dark:text-green-300 bg-green-50/50 dark:bg-green-950/30">
                              {(() => {
                                const total = periods.reduce((sum, _, idx) => {
                                  const val = getEditableValue(`ORS-consumption-${idx}`, 0);
                                  return sum + (val ? parseInt(val) : 0);
                                }, 0);
                                return total > 0 ? Math.round(total * 1.02) : "-";
                              })()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium mb-1">Forecast Methodology:</p>
                    <ul className="text-xs space-y-1">
                      <li>• Historical consumption averages are used as baseline</li>
                      <li>• 2% growth factor applied to account for increased demand</li>
                      <li>• Random variance (±5%) added to simulate real-world fluctuations</li>
                      <li>• Manual entry drugs require historical data input for accurate forecasting</li>
                    </ul>
                  </div>
                </div>

                {/* Summary Cards with Calculations */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Annual Consumption</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {periods.length * 534} units
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Across {periods.length} {periodType} periods
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Average Wastage Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">2.2%</div>
                      <p className="text-xs text-muted-foreground">
                        Annual average across all drugs
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Stockout Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {periods.length * 8} days
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cumulative across all periods
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Annual Analysis
                  </Button>
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Supply Forecast
                  </Button>
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
