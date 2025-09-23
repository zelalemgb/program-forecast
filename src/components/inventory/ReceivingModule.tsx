import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, Upload, Plus, Trash2, Package, Truck, FileText, ScanLine, ArrowLeft, Smartphone, Search, Check, ChevronsUpDown } from "lucide-react";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  canonical_name: string;
  program: string;
  default_unit: string;
  base_unit: string;
  pack_size: number | null;
  price_benchmark_low: number | null;
  price_benchmark_high: number | null;
  recommended_formulation: string | null;
  strength: string | null;
  form: string | null;
}

interface ReceivedItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  packSize?: number;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: string;
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
  
  // Product search states
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [programFilter, setProgramFilter] = useState<string>("all");
  
  const facilityId = 1; // Would come from user context
  const { addTransaction } = useInventoryData(facilityId);
  const { toast } = useToast();

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = supabase
          .from('product_reference')
          .select('*')
          .eq('active', true);
        
        if (programFilter !== "all") {
          query = query.eq('program', programFilter);
        }
        
        const { data, error } = await query
          .order('canonical_name')
          .limit(100);
        
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      }
    };

    fetchProducts();
  }, [programFilter, toast]);

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.canonical_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.program && product.program.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.recommended_formulation && product.recommended_formulation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            productId: "10000000-0000-0000-0000-000000000001",
            productName: "Paracetamol 500mg",
            quantity: 500,
            unit: "tablet",
            batchNumber: "PAR240301",
            expiryDate: "2025-12-31",
            unitCost: 0.25
          },
          {
            id: "2",
            productId: "10000000-0000-0000-0000-000000000002",
            productName: "Amoxicillin 250mg",
            quantity: 200,
            unit: "tablet",
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
    if (selectedProduct && newItem.quantity) {
      const item: ReceivedItem = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        productName: selectedProduct.canonical_name,
        quantity: newItem.quantity,
        unit: selectedProduct.default_unit,
        packSize: selectedProduct.pack_size || undefined,
        batchNumber: newItem.batchNumber,
        expiryDate: newItem.expiryDate,
        unitCost: newItem.unitCost || selectedProduct.price_benchmark_low || undefined,
        supplier: newItem.supplier
      };
      
      setReceivedItems([...receivedItems, item]);
      setNewItem({});
      setSelectedProduct(null);
      setSearchQuery("");
      
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
            product_id: item.productId,
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
                <TableHead>Unit</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receivedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    {item.packSize && <div className="text-sm text-muted-foreground">Pack: {item.packSize}</div>}
                  </TableCell>
                  <TableCell>{item.quantity.toLocaleString()}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : "-"}</TableCell>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Items to Receive</h4>
                <div className="flex items-center gap-2">
                  <Label htmlFor="program-filter" className="text-sm">Program:</Label>
                  <Select value={programFilter} onValueChange={setProgramFilter}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="CH">CH</SelectItem>
                      <SelectItem value="HIV">HIV</SelectItem>
                      <SelectItem value="TB">TB</SelectItem>
                      <SelectItem value="MAL">MAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Entry form row */}
                  <TableRow className="border-b-2 border-primary/20">
                    <TableCell>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {selectedProduct ? selectedProduct.canonical_name : "Select product..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search products..." 
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup>
                                {filteredProducts.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.canonical_name}
                                    onSelect={() => {
                                      setSelectedProduct(product);
                                      setNewItem({
                                        ...newItem,
                                        unitCost: product.price_benchmark_low || undefined
                                      });
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium">{product.canonical_name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {product.program} • {product.default_unit}
                                        {product.recommended_formulation && ` • ${product.recommended_formulation}`}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedProduct && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedProduct.default_unit}
                          {selectedProduct.pack_size && ` • Pack: ${selectedProduct.pack_size}`}
                          {selectedProduct.price_benchmark_low && ` • Est: $${selectedProduct.price_benchmark_low}-${selectedProduct.price_benchmark_high}`}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={newItem.quantity || ""}
                        onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                        placeholder="Quantity"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.unitCost || ""}
                        onChange={(e) => setNewItem({...newItem, unitCost: Number(e.target.value)})}
                        placeholder="Cost"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newItem.batchNumber || ""}
                        onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                        placeholder="Batch"
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={newItem.expiryDate || ""}
                        onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newItem.supplier || ""}
                        onChange={(e) => setNewItem({...newItem, supplier: e.target.value})}
                        placeholder="Supplier"
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        onClick={addItemToList} 
                        size="sm"
                        disabled={!selectedProduct || !newItem.quantity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Added items displayed below */}
                  {receivedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.unit}{item.packSize && ` • Pack: ${item.packSize}`}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity.toLocaleString()}</TableCell>
                      <TableCell>{item.unitCost ? `$${item.unitCost.toFixed(2)}` : "-"}</TableCell>
                      <TableCell>{item.batchNumber || "-"}</TableCell>
                      <TableCell>{item.expiryDate || "-"}</TableCell>
                      <TableCell>{item.supplier || "-"}</TableCell>
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

              {receivedItems.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
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
              )}
            </div>
          </CardContent>
        </Card>
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