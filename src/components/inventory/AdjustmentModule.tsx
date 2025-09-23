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
import { useInventoryData } from "@/hooks/useInventoryData";
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
  const [adjustmentRequests, setAdjustmentRequests] = useState<AdjustmentRequest[]>([]);
  const [formData, setFormData] = useState({
    adjustmentType: "" as 'increase' | 'decrease' | "",
    adjustmentQuantity: "",
    category: "",
    notes: ""
  });
  const [loading, setLoading] = useState(true);
  const { addTransaction } = useInventoryData(facilityId);

  // Fetch products and adjustment requests on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('product_reference')
        .select('id, canonical_name, program, default_unit, price_benchmark_low, price_benchmark_high, recommended_formulation, strength, form')
        .eq('active', true)
        .order('canonical_name');

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch current stock balances
      const { data: balancesData, error: balancesError } = await supabase
        .from('inventory_balances')
        .select('product_id, current_stock')
        .eq('facility_id', facilityId);

      if (balancesError) throw balancesError;

      const balancesMap = (balancesData || []).reduce((acc, balance) => {
        acc[balance.product_id] = balance.current_stock || 0;
        return acc;
      }, {} as Record<string, number>);

      setStockBalances(balancesMap);

      // Fetch recent adjustment transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('facility_id', facilityId)
        .in('transaction_type', ['adjustment', 'loss', 'expired'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsError) throw transactionsError;

      // Get product names for transactions
      if (transactionsData && transactionsData.length > 0) {
        const productIds = [...new Set(transactionsData.map(t => t.product_id))];
        const { data: productDetails, error: productError } = await supabase
          .from('product_reference')
          .select('id, canonical_name, default_unit')
          .in('id', productIds);

        if (productError) throw productError;

        const productMap = (productDetails || []).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {} as Record<string, any>);

        // Transform transactions to adjustment requests format
        const adjustments: AdjustmentRequest[] = transactionsData.map(transaction => {
          const currentStock = balancesMap[transaction.product_id] || 0;
          const adjustmentQuantity = Math.abs(transaction.quantity);
          const isIncrease = transaction.quantity > 0;
          const newBalance = currentStock; // Current balance already reflects the adjustment
          
          return {
            id: transaction.id,
            productId: transaction.product_id,
            productName: productMap[transaction.product_id]?.canonical_name || 'Unknown Product',
            currentStock: currentStock,
            adjustmentType: isIncrease ? 'increase' : 'decrease',
            adjustmentQuantity: adjustmentQuantity,
            newBalance: newBalance,
            reason: transaction.notes || '',
            category: transaction.transaction_type === 'adjustment' ? 'count-correction' : 
                     transaction.transaction_type === 'expired' ? 'expired' : 'loss',
            notes: transaction.notes || '',
            requestedBy: "System User",
            requestedAt: new Date(transaction.created_at).toLocaleString(),
            status: "pending" as const
          };
        });

        setAdjustmentRequests(adjustments);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    { value: "loss", label: "Loss" },
    { value: "correction", label: "Stock Count Correction" },
    { value: "transfer", label: "Inter-department Transfer" },
    { value: "disposal", label: "Disposal" },
    { value: "other", label: "Other" }
  ];

  const priorityColors = {};

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !formData.adjustmentQuantity || !formData.adjustmentType || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a product",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const currentStock = stockBalances[selectedProduct.id] || 0;
      const adjustmentQty = parseInt(formData.adjustmentQuantity);
      const newBalance = formData.adjustmentType === 'increase' 
        ? currentStock + adjustmentQty
        : currentStock - adjustmentQty;

      // Determine transaction type and quantity based on adjustment type and category
      let transactionType: string;
      let quantity: number = adjustmentQty;
      
      if (formData.category === 'expired') {
        transactionType = 'expired';
        quantity = -Math.abs(quantity);
      } else if (formData.category === 'loss') {
        transactionType = 'loss';
        quantity = -Math.abs(quantity);
      } else {
        transactionType = 'adjustment';
        quantity = formData.adjustmentType === 'increase' ? Math.abs(quantity) : -Math.abs(quantity);
      }

      // Create the inventory transaction
      await addTransaction({
        facility_id: facilityId,
        product_id: selectedProduct.id,
        transaction_type: transactionType as any,
        quantity: quantity,
        transaction_date: new Date().toISOString().split('T')[0],
        notes: `${formData.category}: ${formData.notes}`,
        reference_number: `ADJ-${Date.now()}`
      });

      // Create local request record
      const newRequest: AdjustmentRequest = {
        id: `ADJ${String(adjustmentRequests.length + 3).padStart(3, '0')}`,
        productId: selectedProduct.id,
        productName: selectedProduct.canonical_name,
        currentStock,
        adjustmentType: formData.adjustmentType,
        adjustmentQuantity: adjustmentQty,
        newBalance,
        reason: adjustmentCategories.find(cat => cat.value === formData.category)?.label || formData.category,
        category: formData.category,
        notes: formData.notes,
        requestedBy: "Current User",
        requestedAt: new Date().toLocaleString(),
        status: "pending"
      };

      setAdjustmentRequests([newRequest, ...adjustmentRequests]);
      
      // Update stock balance locally
      setStockBalances(prev => ({
        ...prev,
        [selectedProduct.id]: newBalance
      }));

      // Reset form
      setFormData({
        adjustmentType: "",
        adjustmentQuantity: "",
        category: "",
        notes: ""
      });
      setSelectedProduct(null);
      setSearchQuery("");

      toast({
        title: "Adjustment processed successfully",
        description: `${formData.adjustmentType === 'increase' ? 'Increased' : 'Decreased'} ${selectedProduct.canonical_name} by ${adjustmentQty}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process adjustment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }

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
                    <Label htmlFor="category">Reason for Adjustment *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {adjustmentCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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