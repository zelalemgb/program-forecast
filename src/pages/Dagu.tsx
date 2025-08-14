import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, FileText, Download, HelpCircle, Clock, AlertTriangle } from "lucide-react";

const Dagu: React.FC = () => {
  const location = useLocation();
  const canonical = `${window.location.origin}${location.pathname}`;

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
            Dagu – Facility Supply Operations
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
            <TabsTrigger value="period-end">Period-End</TabsTrigger>
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

          {/* Period-End Tab */}
          <TabsContent value="period-end" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Period-End Summary & EPSS Request
                </CardTitle>
                <CardDescription>
                  Drug-by-drug consumption analysis and period summary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selector */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Label htmlFor="period-type" className="font-medium">Period Type:</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="bimonthly">Bi-monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Label htmlFor="specific-period" className="font-medium">Period:</Label>
                  <Select defaultValue="feb-2024">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feb-2024">February 2024</SelectItem>
                      <SelectItem value="jan-2024">January 2024</SelectItem>
                      <SelectItem value="dec-2023">December 2023</SelectItem>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="h1-2024">Jan-Feb 2024</SelectItem>
                      <SelectItem value="fy-2024">FY 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Drug-by-Drug Table */}
                <div className="space-y-4">
                  <h4 className="font-medium">Drug-by-Drug Period Analysis</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug Name</TableHead>
                          <TableHead className="text-right">Beginning</TableHead>
                          <TableHead className="text-right">Received</TableHead>
                          <TableHead className="text-right">Issued</TableHead>
                          <TableHead className="text-right">Adjustments</TableHead>
                          <TableHead className="text-right">Ending Balance</TableHead>
                          <TableHead className="text-right">Consumption</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Amoxicillin 250mg</TableCell>
                          <TableCell className="text-right">500</TableCell>
                          <TableCell className="text-right">200</TableCell>
                          <TableCell className="text-right">180</TableCell>
                          <TableCell className="text-right">-5</TableCell>
                          <TableCell className="text-right">515</TableCell>
                          <TableCell className="text-right font-medium">185</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Paracetamol 500mg</TableCell>
                          <TableCell className="text-right">300</TableCell>
                          <TableCell className="text-right">150</TableCell>
                          <TableCell className="text-right">120</TableCell>
                          <TableCell className="text-right">0</TableCell>
                          <TableCell className="text-right">330</TableCell>
                          <TableCell className="text-right font-medium">120</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Oxytocin 10IU</TableCell>
                          <TableCell className="text-right">80</TableCell>
                          <TableCell className="text-right">40</TableCell>
                          <TableCell className="text-right">35</TableCell>
                          <TableCell className="text-right">-2</TableCell>
                          <TableCell className="text-right">83</TableCell>
                          <TableCell className="text-right font-medium">37</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Artemether 80mg</TableCell>
                          <TableCell className="text-right">120</TableCell>
                          <TableCell className="text-right">60</TableCell>
                          <TableCell className="text-right">45</TableCell>
                          <TableCell className="text-right">0</TableCell>
                          <TableCell className="text-right">135</TableCell>
                          <TableCell className="text-right font-medium">45</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ORS Sachets</TableCell>
                          <TableCell className="text-right">200</TableCell>
                          <TableCell className="text-right">100</TableCell>
                          <TableCell className="text-right">85</TableCell>
                          <TableCell className="text-right">-5</TableCell>
                          <TableCell className="text-right">210</TableCell>
                          <TableCell className="text-right font-medium">90</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2 font-medium bg-muted/50">
                          <TableCell className="font-semibold">TOTAL</TableCell>
                          <TableCell className="text-right">1,200</TableCell>
                          <TableCell className="text-right">550</TableCell>
                          <TableCell className="text-right">465</TableCell>
                          <TableCell className="text-right">-12</TableCell>
                          <TableCell className="text-right">1,273</TableCell>
                          <TableCell className="text-right font-semibold">477</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Period Summary Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Period Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Beginning Balance:</span>
                        <span className="font-medium">1,200 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Received:</span>
                        <span className="font-medium">550 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Issued:</span>
                        <span className="font-medium">465 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Adjustments:</span>
                        <span className="font-medium">-12 units</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Ending Balance:</span>
                        <span className="font-medium">1,273 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Consumption:</span>
                        <span className="font-medium text-primary">477 units</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Key Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Stockout Days:</span>
                        <span className="font-medium">8 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expired/Damaged:</span>
                        <span className="font-medium">12 units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items Below Min:</span>
                        <span className="font-medium text-destructive">3 drugs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consumption Rate:</span>
                        <span className="font-medium">37.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Turnover:</span>
                        <span className="font-medium">2.7x</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Summary
                  </Button>
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate EPSS Request
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
