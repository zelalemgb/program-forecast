import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Camera, 
  Scan, 
  FileText, 
  Truck, 
  Package2, 
  CheckCircle2, 
  Plus, 
  Minus,
  AlertCircle,
  Upload,
  Calendar,
  Building2
} from "lucide-react";

// Form schemas
const deliveryInfoSchema = z.object({
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryNote: z.string().min(1, "Delivery note number is required"),
  supplier: z.string().min(1, "Supplier/source is required"),
  receivedBy: z.string().min(1, "Received by is required"),
  notes: z.string().optional()
});

const itemSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  unitCost: z.number().optional()
});

type DeliveryInfo = z.infer<typeof deliveryInfoSchema>;
type ItemInfo = z.infer<typeof itemSchema>;

interface ReceivedItem extends ItemInfo {
  id: string;
}

type ReceivingMethod = "photo" | "manual" | "barcode" | null;
type ReceivingStep = "method" | "delivery" | "items" | "review" | "complete";

export const FacilityReceivingModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<ReceivingStep>("method");
  const [receivingMethod, setReceivingMethod] = useState<ReceivingMethod>(null);
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState<ItemInfo>({
    productName: "",
    quantity: 1,
    unit: "",
    batchNumber: "",
    expiryDate: "",
    unitCost: 0
  });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deliveryForm = useForm<DeliveryInfo>({
    resolver: zodResolver(deliveryInfoSchema),
    defaultValues: {
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryNote: "",
      supplier: "",
      receivedBy: "",
      notes: ""
    }
  });

  const handleMethodSelect = (method: ReceivingMethod) => {
    setReceivingMethod(method);
    setCurrentStep("delivery");
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Simulate AI processing of delivery note
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data
      const extractedData = {
        deliveryNote: "DN-2024-001234",
        supplier: "Regional Hub - Addis Ababa",
        items: [
          { id: "1", productName: "Paracetamol 500mg", quantity: 100, unit: "tablets", batchNumber: "PAR2024001", expiryDate: "2026-12-31" },
          { id: "2", productName: "ORS Sachets", quantity: 50, unit: "sachets", batchNumber: "ORS2024002", expiryDate: "2025-06-30" },
          { id: "3", productName: "Amoxicillin 250mg", quantity: 75, unit: "capsules", batchNumber: "AMX2024001", expiryDate: "2025-11-15" }
        ]
      };

      // Update form with extracted data
      deliveryForm.setValue("deliveryNote", extractedData.deliveryNote);
      deliveryForm.setValue("supplier", extractedData.supplier);
      setReceivedItems(extractedData.items);
      
      toast({
        title: "Photo processed successfully",
        description: `Extracted ${extractedData.items.length} items from delivery note`,
      });

      setCurrentStep("review");
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Could not extract data from photo. Please try manual entry.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addItem = () => {
    if (!currentItem.productName || currentItem.quantity <= 0) {
      toast({
        title: "Missing information",
        description: "Please enter product name and quantity",
        variant: "destructive"
      });
      return;
    }

    const newItem: ReceivedItem = {
      ...currentItem,
      id: Date.now().toString()
    };

    setReceivedItems([...receivedItems, newItem]);
    setCurrentItem({
      productName: "",
      quantity: 1,
      unit: "",
      batchNumber: "",
      expiryDate: "",
      unitCost: 0
    });

    toast({
      title: "Item added",
      description: "Item has been added to the delivery list",
    });
  };

  const removeItem = (id: string) => {
    setReceivedItems(receivedItems.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, change: number) => {
    setReceivedItems(items => 
      items.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const processReceiving = async () => {
    if (receivedItems.length === 0) {
      toast({
        title: "No items to receive",
        description: "Please add items to receive before completing",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Stock received successfully",
        description: `${receivedItems.length} items have been added to inventory`,
      });

      setCurrentStep("complete");
    } catch (error) {
      toast({
        title: "Failed to process receiving",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCurrentStep("method");
    setReceivingMethod(null);
    setReceivedItems([]);
    deliveryForm.reset();
  };

  // Method Selection Screen
  if (currentStep === "method") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-brand" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Receive Stock Delivery</h2>
          <p className="text-muted-foreground">
            Choose how you'd like to record your delivery from the regional hub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Capture Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-brand/50" 
                onClick={() => handleMethodSelect("photo")}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Photo Capture</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo of your delivery note and let AI extract the information
              </p>
              <Badge variant="outline" className="bg-brand/5 text-brand border-brand/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Fastest
              </Badge>
            </CardContent>
          </Card>

          {/* Manual Entry Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50" 
                onClick={() => handleMethodSelect("manual")}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Type in the delivery information manually from your delivery note
              </p>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                <FileText className="h-3 w-3 mr-1" />
                Most Accurate
              </Badge>
            </CardContent>
          </Card>

          {/* Barcode Scanning Method */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-muted-foreground/20 opacity-60">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-muted/10 rounded-full flex items-center justify-center">
                <Scan className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Barcode Scan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Scan product barcodes to automatically add items
              </p>
              <Badge variant="outline" className="bg-muted/5 text-muted-foreground border-muted-foreground/20">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Delivery Information Step
  if (currentStep === "delivery") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Delivery Information</h2>
            <p className="text-muted-foreground">Enter details about this delivery</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentStep("method")}>
            Change Method
          </Button>
        </div>

        {receivingMethod === "photo" && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-brand" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Take Photo of Delivery Note</h3>
                <p className="text-muted-foreground mb-6">
                  Position your delivery note clearly in good lighting
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  size="lg"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Photo...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Delivery Note
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Form {...deliveryForm}>
          <form onSubmit={deliveryForm.handleSubmit(() => setCurrentStep("items"))} className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={deliveryForm.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Delivery Date
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deliveryForm.control}
                    name="deliveryNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Delivery Note Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., DN-2024-001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={deliveryForm.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Source/Supplier
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regional Hub - Addis Ababa">Regional Hub - Addis Ababa</SelectItem>
                              <SelectItem value="Regional Hub - Bahir Dar">Regional Hub - Bahir Dar</SelectItem>
                              <SelectItem value="Regional Hub - Mekelle">Regional Hub - Mekelle</SelectItem>
                              <SelectItem value="PFSA Central">PFSA Central</SelectItem>
                              <SelectItem value="Emergency Supply">Emergency Supply</SelectItem>
                              <SelectItem value="Donation">Donation</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deliveryForm.control}
                    name="receivedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Received By</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={deliveryForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any special handling, conditions, or observations..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit" size="lg">
                Continue to Items
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Items Entry Step (Manual Method)
  if (currentStep === "items" && receivingMethod === "manual") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Add Items</h2>
            <p className="text-muted-foreground">Enter each item from your delivery note</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentStep("delivery")}>
            Back to Delivery Info
          </Button>
        </div>

        {/* Add Item Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input 
                  placeholder="e.g., Paracetamol 500mg"
                  value={currentItem.productName}
                  onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})}
                />
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input 
                  type="number"
                  min="1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseInt(e.target.value) || 1})}
                />
              </div>
              <div>
                <Label>Unit *</Label>
                <Select value={currentItem.unit} onValueChange={(value) => setCurrentItem({...currentItem, unit: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="capsules">Capsules</SelectItem>
                    <SelectItem value="vials">Vials</SelectItem>
                    <SelectItem value="sachets">Sachets</SelectItem>
                    <SelectItem value="bottles">Bottles</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Batch Number</Label>
                <Input 
                  placeholder="Optional"
                  value={currentItem.batchNumber}
                  onChange={(e) => setCurrentItem({...currentItem, batchNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input 
                  type="date"
                  value={currentItem.expiryDate}
                  onChange={(e) => setCurrentItem({...currentItem, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Unit Cost (ETB)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  value={currentItem.unitCost || ""}
                  onChange={(e) => setCurrentItem({...currentItem, unitCost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item to Delivery
            </Button>
          </CardContent>
        </Card>

        {/* Items List */}
        {receivedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Items to Receive ({receivedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receivedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.quantity} {item.unit}</span>
                        {item.batchNumber && <span>Batch: {item.batchNumber}</span>}
                        {item.expiryDate && <span>Exp: {item.expiryDate}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateItemQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateItemQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {receivedItems.length > 0 && (
          <div className="flex justify-end">
            <Button size="lg" onClick={() => setCurrentStep("review")}>
              Review & Complete
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Review Step
  if (currentStep === "review") {
    const deliveryInfo = deliveryForm.getValues();
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Review Delivery</h2>
            <p className="text-muted-foreground">Confirm all information before completing</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(receivingMethod === "photo" ? "delivery" : "items")}
          >
            Edit Items
          </Button>
        </div>

        {/* Delivery Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Delivery Date</Label>
                <p className="font-medium">{deliveryInfo.deliveryDate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Delivery Note</Label>
                <p className="font-medium">{deliveryInfo.deliveryNote}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Source</Label>
                <p className="font-medium">{deliveryInfo.supplier}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Received By</Label>
                <p className="font-medium">{deliveryInfo.receivedBy}</p>
              </div>
            </div>
            {deliveryInfo.notes && (
              <div>
                <Label className="text-muted-foreground">Notes</Label>
                <p className="font-medium">{deliveryInfo.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Items Summary</span>
              <Badge variant="outline">{receivedItems.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receivedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.productName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.quantity} {item.unit}</span>
                      {item.batchNumber && <span>Batch: {item.batchNumber}</span>}
                      {item.expiryDate && <span>Exp: {item.expiryDate}</span>}
                      {item.unitCost && <span>Cost: {item.unitCost} ETB</span>}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-status-ok" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button 
            size="lg" 
            onClick={processReceiving}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Receiving
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Success Step
  if (currentStep === "complete") {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-status-ok/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-status-ok" />
        </div>
        <h2 className="text-2xl font-semibold text-status-ok">Stock Received Successfully!</h2>
        <p className="text-muted-foreground">
          {receivedItems.length} items have been added to your inventory. 
          All stock levels have been updated.
        </p>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-status-ok">{receivedItems.length}</div>
                <div className="text-sm text-muted-foreground">Items Received</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand">
                  {receivedItems.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Units</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">1</div>
                <div className="text-sm text-muted-foreground">Delivery</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={resetForm}>
            Receive Another Delivery
          </Button>
          <Button onClick={() => window.location.href = "/dagu"}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return null;
};