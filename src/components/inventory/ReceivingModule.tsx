import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Upload, Plus, Trash2, Package, Truck, FileText, ScanLine, ArrowLeft, Smartphone } from "lucide-react";
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

interface DeliveryInfo {
  source: string;
  driverName: string;
  deliveryNote: string;
}

type ReceivingMethod = "document" | "manual" | "barcode" | null;

export const ReceivingModule: React.FC = () => {
  const [receivingMethod, setReceivingMethod] = useState<ReceivingMethod>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    source: "",
    driverName: "",
    deliveryNote: ""
  });
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<ReceivedItem>>({});
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const facilityId = 1; // Would come from user context
  const { addTransaction } = useInventoryData(facilityId);
  const { toast } = useToast();

  const handleMethodSelect = (method: ReceivingMethod) => {
    setReceivingMethod(method);
  };

  const handleBackToMethods = () => {
    setReceivingMethod(null);
    setDocumentImage(null);
    setReceivedItems([]);
    setDeliveryInfo({ source: "", driverName: "", deliveryNote: "" });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentImage(file);
      setIsProcessing(true);
      
      // Simulate AI processing - in real app, this would call an AI service
      setTimeout(() => {
        // Mock extracted data from document
        setDeliveryInfo({
          source: "central-store",
          driverName: "Ahmed Hassan",
          deliveryNote: "DN-2024-03-001"
        });
        
        // Mock extracted items
        const mockExtractedItems: ReceivedItem[] = [
          {
            id: "1",
            productName: "Paracetamol 500mg",
            quantity: 500,
            batchNumber: "PAR240301",
            expiryDate: "2025-12-31",
            unitCost: 0.25
          },
          {
            id: "2", 
            productName: "Amoxicillin 250mg",
            quantity: 200,
            batchNumber: "AMX240301",
            expiryDate: "2025-06-30",
            unitCost: 0.85
          }
        ];
        
        setReceivedItems(mockExtractedItems);
        setIsProcessing(false);
        
        toast({
          title: "Document processed successfully",
          description: `Extracted ${mockExtractedItems.length} items from delivery document`,
        });
      }, 3000);
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
          reference_number: deliveryInfo.deliveryNote,
          notes: `Received from ${deliveryInfo.source}. Driver: ${deliveryInfo.driverName}`
        });
      }
      
      // Reset form
      setReceivedItems([]);
      setDeliveryInfo({ source: "", driverName: "", deliveryNote: "" });
      setDocumentImage(null);
      setReceivingMethod(null);
      
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

  // Items List Component
  const ItemsList = () => {
    if (receivedItems.length === 0) return null;

    return (
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
    );
  };

  // Method Selection Screen
  if (!receivingMethod) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">How would you like to receive stock?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {/* Document Scanning Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => handleMethodSelect("document")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Scan Document</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Upload delivery document for AI extraction of items and details
              </p>
              <Badge variant="outline" className="mb-2">
                <Smartphone className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </CardContent>
          </Card>

          {/* Manual Entry Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20" onClick={() => handleMethodSelect("manual")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Manual Entry</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Manually enter delivery details and items from the hard copy
              </p>
              <Badge variant="outline" className="mb-2">
                <Plus className="h-3 w-3 mr-1" />
                Traditional
              </Badge>
            </CardContent>
          </Card>

          {/* Barcode Scanning Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 opacity-60" onClick={() => handleMethodSelect("barcode")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <ScanLine className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Barcode Scan</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Scan product barcodes for quick item entry
              </p>
              <Badge variant="secondary" className="mb-2">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Document Scanning Interface
  if (receivingMethod === "document") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Scan Delivery Document</h3>
          </div>
          <Button variant="outline" onClick={handleBackToMethods} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Delivery Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    {isProcessing && (
                      <p className="text-xs text-blue-600 animate-pulse">Processing with AI...</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium">Take photo or upload delivery document</p>
                    <p className="text-xs text-muted-foreground">AI will extract delivery details and items automatically</p>
                  </div>
                )}
              </label>
            </div>

            {/* Show extracted delivery info */}
            {deliveryInfo.source && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm text-green-800">Extracted Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div><strong>Source:</strong> {deliveryInfo.source === "central-store" ? "Central Medical Store" : deliveryInfo.source}</div>
                  <div><strong>Driver:</strong> {deliveryInfo.driverName}</div>
                  <div><strong>Delivery Note:</strong> {deliveryInfo.deliveryNote}</div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <ItemsList />
      </div>
    );
  }

  // Manual Entry Interface  
  if (receivingMethod === "manual") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Manual Stock Entry</h3>
          </div>
          <Button variant="outline" onClick={handleBackToMethods} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="source">Supply Source</Label>
                <Select value={deliveryInfo.source} onValueChange={(value) => setDeliveryInfo(prev => ({...prev, source: value}))}>
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
                  value={deliveryInfo.driverName}
                  onChange={(e) => setDeliveryInfo(prev => ({...prev, driverName: e.target.value}))}
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <Label htmlFor="delivery-note">Delivery Note</Label>
                <Input
                  id="delivery-note"
                  value={deliveryInfo.deliveryNote}
                  onChange={(e) => setDeliveryInfo(prev => ({...prev, deliveryNote: e.target.value}))}
                  placeholder="Enter delivery note reference"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add New Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <ItemsList />
      </div>
    );
  }

  // Barcode Interface (placeholder)
  if (receivingMethod === "barcode") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Barcode Scanning</h3>
          </div>
          <Button variant="outline" onClick={handleBackToMethods} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <ScanLine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">Barcode Scanning</h4>
            <p className="text-muted-foreground">This feature will be available soon</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};