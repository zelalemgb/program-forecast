import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Plus, Trash2, Package, Truck, FileText, ScanLine } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";

interface ReceivedItem {
  id: string;
  productName: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  supplier?: string;
}

export const ReceivingModule: React.FC = () => {
  const [source, setSource] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState<string>("");
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<ReceivedItem>>({});
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const facilityId = 1; // Would come from user context
  const { addTransaction } = useInventoryData(facilityId);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentImage(file);
      // TODO: Implement OCR processing here
      toast({
        title: "Document uploaded",
        description: "Processing document with AI extraction...",
      });
    }
  };

  const addItemToList = () => {
    if (newItem.productName && newItem.quantity) {
      const item: ReceivedItem = {
        id: Date.now().toString(),
        productName: newItem.productName,
        quantity: newItem.quantity,
        batchNumber: newItem.batchNumber,
        expiryDate: newItem.expiryDate,
        unitCost: newItem.unitCost,
        supplier: newItem.supplier
      };
      
      setReceivedItems([...receivedItems, item]);
      setNewItem({});
      
      toast({
        title: "Item added",
        description: `${item.productName} added to receiving list`,
      });
    }
  };

  const removeItem = (itemId: string) => {
    setReceivedItems(receivedItems.filter(item => item.id !== itemId));
  };

  const processReceiving = async () => {
    setIsProcessing(true);
    try {
      // Process each item as an inventory transaction
      for (const item of receivedItems) {
        await addTransaction({
          facility_id: facilityId,
          product_id: "placeholder-id", // Would map from product name
          transaction_type: "receipt",
          quantity: item.quantity,
          batch_number: item.batchNumber,
          expiry_date: item.expiryDate,
          unit_cost: item.unitCost,
          transaction_date: new Date().toISOString().split('T')[0],
          reference_number: deliveryNote,
          notes: `Received from ${source}. Driver: ${driverName}`
        });
      }
      
      // Reset form
      setReceivedItems([]);
      setSource("");
      setDriverName("");
      setDeliveryNote("");
      setDocumentImage(null);
      
      toast({
        title: "Stock received successfully",
        description: `${receivedItems.length} items processed and added to inventory`,
      });
    } catch (error) {
      toast({
        title: "Error processing stock",
        description: "Failed to process received items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Receive Stock</h2>
      </div>

      <Tabs defaultValue="scan-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scan-upload" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Scan Document
          </TabsTrigger>
          <TabsTrigger value="manual-entry" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="barcode" className="flex items-center gap-2">
            <ScanLine className="h-4 w-4" />
            Barcode Scan
          </TabsTrigger>
        </TabsList>

        {/* Document Scanning Tab */}
        <TabsContent value="scan-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Delivery Document
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source">Supply Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central-store">Central Medical Store</SelectItem>
                      <SelectItem value="facility">Other Health Facility</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="procurement">Internal Procurement</SelectItem>
                      <SelectItem value="emergency">Emergency Supply</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver">Driver Name</Label>
                  <Input
                    id="driver"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery-note">Delivery Note Number</Label>
                <Input
                  id="delivery-note"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Enter delivery note reference"
                />
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="document-upload"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  {documentImage ? (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">Document uploaded</p>
                      <p className="text-xs text-muted-foreground">{documentImage.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium">Take photo or upload document</p>
                      <p className="text-xs text-muted-foreground">AI will extract item details automatically</p>
                    </div>
                  )}
                </label>
              </div>

              {documentImage && (
                <Button className="w-full" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Extract Items from Document"}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Entry Tab */}
        <TabsContent value="manual-entry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Items Manually</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source-manual">Supply Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="central-store">Central Medical Store</SelectItem>
                      <SelectItem value="facility">Other Health Facility</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="procurement">Internal Procurement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="driver-manual">Driver Name</Label>
                  <Input
                    id="driver-manual"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery-note-manual">Delivery Note Number</Label>
                <Input
                  id="delivery-note-manual"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Enter delivery note reference"
                />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Add New Item</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      value={newItem.productName || ""}
                      onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                      placeholder="Type to search products..."
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity || ""}
                      onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <Label>Batch Number</Label>
                    <Input
                      value={newItem.batchNumber || ""}
                      onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                      placeholder="Enter batch number"
                    />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={newItem.expiryDate || ""}
                      onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={addItemToList} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barcode Scanning Tab */}
        <TabsContent value="barcode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScanLine className="h-5 w-5" />
                Barcode Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <ScanLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm font-medium">Barcode scanning will be available soon</p>
                <p className="text-xs text-muted-foreground">Camera-based barcode detection for quick item entry</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Items List */}
      {receivedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items to Receive ({receivedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.quantity.toLocaleString()}</TableCell>
                    <TableCell>{item.batchNumber || "-"}</TableCell>
                    <TableCell>{item.expiryDate || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Badge variant="outline">
                Total Items: {receivedItems.length}
              </Badge>
              <Button 
                onClick={processReceiving}
                disabled={receivedItems.length === 0 || isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Processing..." : "Complete Receiving"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};