import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, Package, Plus, Check, X, FileText, Calculator, ChevronsUpDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  canonical_name: string;
  program: string;
  default_unit: string;
  price_benchmark_low: number | null;
  price_benchmark_high: number | null;
  recommended_formulation: string | null;
  strength: string | null;
  form: string | null;
}

interface AdjustmentRequest {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  adjustmentType: 'increase' | 'decrease';
  adjustmentQuantity: number;
  newBalance: number;
  reason: string;
  category: string;
  notes: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  documentPath?: string;
}

export const AdjustmentModule: React.FC = () => {
  const { toast } = useToast();
  const facilityId = 1; // Would come from user context/auth
  const [activeTab, setActiveTab] = useState("submit");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockBalances, setStockBalances] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [adjustmentRequests, setAdjustmentRequests] = useState<AdjustmentRequest[]>([
    {
      id: "ADJ001",
      productId: "prod-1",
      productName: "Amoxicillin 250mg Capsules",
      currentStock: 450,
      adjustmentType: 'decrease',
      adjustmentQuantity: 50,
      newBalance: 400,
      reason: "Expired stock removal",
      category: "expiry",
      notes: "Batch expired on 15/01/2024, physically verified and removed",
      requestedBy: "Dr. Sarah Johnson",
      requestedAt: "2024-01-16 09:30",
      status: "pending",
      priority: "medium"
    },
    {
      id: "ADJ002",
      productId: "prod-2", 
      productName: "Paracetamol 500mg Tablets",
      currentStock: 1200,
      adjustmentType: 'increase',
      adjustmentQuantity: 25,
      newBalance: 1225,
      reason: "Stock count correction",
      category: "correction",
      notes: "Physical count showed 25 units more than system records",
      requestedBy: "John Smith",
      requestedAt: "2024-01-16 08:15",
      status: "pending",
      priority: "low"
    }
  ]);

  const [formData, setFormData] = useState({
    adjustmentType: "" as 'increase' | 'decrease' | "",
    adjustmentQuantity: "",
    reason: "",
    category: "",
    notes: "",
    priority: "" as 'low' | 'medium' | 'high' | ""
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchStockBalances();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reference')
        .select('id, canonical_name, program, default_unit, price_benchmark_low, price_benchmark_high, recommended_formulation, strength, form')
        .eq('active', true)
        .order('canonical_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStockBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_balances')
        .select('product_id, current_stock')
        .eq('facility_id', facilityId);

      if (error) throw error;

      const balancesMap = (data || []).reduce((acc, balance) => {
        acc[balance.product_id] = balance.current_stock || 0;
        return acc;
      }, {} as Record<string, number>);

      setStockBalances(balancesMap);
    } catch (error) {
      console.error('Error fetching stock balances:', error);
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.canonical_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adjustmentCategories = [
    { value: "damage", label: "Damage/Breakage" },
    { value: "expiry", label: "Expired Products" },
    { value: "loss", label: "Loss/Theft" },
    { value: "correction", label: "Stock Count Correction" },
    { value: "transfer", label: "Inter-department Transfer" },
    { value: "disposal", label: "Disposal" },
    { value: "other", label: "Other" }
  ];

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-orange-100 text-orange-800", 
    high: "bg-red-100 text-red-800"
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !formData.adjustmentQuantity || !formData.adjustmentType || !formData.reason || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a product",
        variant: "destructive"
      });
      return;
    }

    const currentStock = stockBalances[selectedProduct.id] || 0;
    const adjustmentQty = parseInt(formData.adjustmentQuantity);
    const newBalance = formData.adjustmentType === 'increase' 
      ? currentStock + adjustmentQty
      : currentStock - adjustmentQty;

    const newRequest: AdjustmentRequest = {
      id: `ADJ${String(adjustmentRequests.length + 3).padStart(3, '0')}`,
      productId: selectedProduct.id,
      productName: selectedProduct.canonical_name,
      currentStock,
      adjustmentType: formData.adjustmentType,
      adjustmentQuantity: adjustmentQty,
      newBalance,
      reason: formData.reason,
      category: formData.category,
      notes: formData.notes,
      requestedBy: "Current User",
      requestedAt: new Date().toLocaleString(),
      status: "pending",
      priority: formData.priority || "medium"
    };

    setAdjustmentRequests([newRequest, ...adjustmentRequests]);
    setFormData({
      adjustmentType: "",
      adjustmentQuantity: "",
      reason: "",
      category: "",
      notes: "",
      priority: ""
    });
    setSelectedProduct(null);
    setSearchQuery("");

    toast({
      title: "Adjustment Request Submitted",
      description: `Request ${newRequest.id} has been submitted for review`
    });

    setActiveTab("review");
  };

  const handleApproval = (requestId: string, action: 'approved' | 'rejected') => {
    setAdjustmentRequests(requests =>
      requests.map(req =>
        req.id === requestId ? { ...req, status: action } : req
      )
    );

    toast({
      title: `Request ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Adjustment request ${requestId} has been ${action}`
    });
  };

  const calculateNewBalance = () => {
    if (!selectedProduct || !formData.adjustmentQuantity || !formData.adjustmentType) return null;
    
    const current = stockBalances[selectedProduct.id] || 0;
    const adjustment = parseInt(formData.adjustmentQuantity);
    
    return formData.adjustmentType === 'increase' ? current + adjustment : current - adjustment;
  };

  const newBalance = calculateNewBalance();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit Adjustment</TabsTrigger>
          <TabsTrigger value="review">Review Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Stock Adjustment Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productSearch">Product *</Label>
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
                      <PopoverContent className="w-full p-0">
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="text"
                      value={selectedProduct ? (stockBalances[selectedProduct.id] || 0).toLocaleString() : ""}
                      disabled
                      placeholder="Select product to see current stock"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">Adjustment Type *</Label>
                    <Select value={formData.adjustmentType} onValueChange={(value: 'increase' | 'decrease') => setFormData({...formData, adjustmentType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="increase">Increase Stock</SelectItem>
                        <SelectItem value="decrease">Decrease Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentQuantity">Adjustment Quantity *</Label>
                    <Input
                      id="adjustmentQuantity"
                      type="number"
                      value={formData.adjustmentQuantity}
                      onChange={(e) => setFormData({...formData, adjustmentQuantity: e.target.value})}
                      placeholder="Quantity to adjust"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {adjustmentCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Adjustment *</Label>
                  <Input
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Brief reason for adjustment"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Detailed explanation, batch numbers, evidence, etc."
                    rows={3}
                  />
                </div>

                {newBalance !== null && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Stock Impact:</span>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Current: {selectedProduct ? (stockBalances[selectedProduct.id] || 0).toLocaleString() : 0} → New: 
                          <span className={`ml-1 font-medium ${formData.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                            {newBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Adjustment Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Adjustment Requests Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Adjustment</TableHead>
                      <TableHead>New Balance</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustmentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.productName}</TableCell>
                        <TableCell>{request.currentStock}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 ${
                            request.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {request.adjustmentType === 'increase' ? '+' : '-'}{request.adjustmentQuantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{request.newBalance}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {adjustmentCategories.find(cat => cat.value === request.category)?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[request.priority]}>
                            {request.priority.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[request.status]}>
                            {request.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproval(request.id, 'approved')}
                                className="h-8 px-2"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproval(request.id, 'rejected')}
                                className="h-8 px-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};