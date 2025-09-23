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

  return (
    <div className="space-y-6">
      {/* Main Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">
            Receive Stock
            {!receivingMethod && <span className="text-lg text-muted-foreground font-normal ml-2">- Select Method</span>}
          </h2>
        </div>
        {receivingMethod && (
          <Button variant="outline" onClick={handleBackToMethods} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Methods
          </Button>
        )}
      </div>

      {/* Method Selection */}
      {!receivingMethod && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Document Scanning Method */}
              <div 
                className="p-4 border-2 rounded-lg cursor-pointer hover:border-primary/50 transition-colors text-center"
                onClick={() => handleMethodSelect("document")}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-1">Scan Document</h4>
                <p className="text-sm text-muted-foreground mb-2">AI extraction from delivery document</p>
                <Badge variant="outline" className="text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>

              {/* Manual Entry Method */}
              <div 
                className="p-4 border-2 rounded-lg cursor-pointer hover:border-primary/50 transition-colors text-center"
                onClick={() => handleMethodSelect("manual")}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-1">Manual Entry</h4>
                <p className="text-sm text-muted-foreground mb-2">Enter details manually</p>
                <Badge variant="outline" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Traditional
                </Badge>
              </div>

              {/* Barcode Scanning Method */}
              <div 
                className="p-4 border-2 rounded-lg opacity-60 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <ScanLine className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-1">Barcode Scan</h4>
                <p className="text-sm text-muted-foreground mb-2">Scan product barcodes</p>
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Scanning Interface */}
      {receivingMethod === "document" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Document Upload</h3>
          
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

          {/* Extracted delivery info */}
          {deliveryInfo.source && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Extracted Delivery Information</h4>
              <div className="text-sm space-y-1">
                <div><strong>Source:</strong> {deliveryInfo.source === "central-store" ? "Central Medical Store" : deliveryInfo.source}</div>
                <div><strong>Driver:</strong> {deliveryInfo.driverName}</div>
                <div><strong>Delivery Note:</strong> {deliveryInfo.deliveryNote}</div>
              </div>
            </div>
          )}

          {/* Items table for document method */}
          {receivedItems.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Extracted Items ({receivedItems.length})</h4>
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
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Interface */}
      {receivingMethod === "manual" && (
        <div className="space-y-6">
          {/* Delivery Information Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Delivery Information</h3>
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
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Items to Receive</h3>
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
          </div>
        </div>
      )}

      {/* Complete Receiving Section */}
      {receivedItems.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <Badge variant="outline" className="text-sm">
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
  );
};