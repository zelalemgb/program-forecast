import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";

interface AccountType {
  id: string;
  name: string;
  description: string;
  created_at: string;
  product_count?: number;
}

interface Product {
  id: string;
  canonical_name: string;
  program?: string;
  ven_classification?: string;
}

const AccountTypesManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState({ name: "", description: "" });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Fetch account types
  const { data: accountTypes = [], isLoading: isLoadingAccountTypes } = useQuery({
    queryKey: ["accountTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("account_types")
        .select(`
          *,
          account_type_products(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(item => ({
        ...item,
        product_count: item.account_type_products?.[0]?.count || 0
      }));
    },
  });

  // Fetch products for selection
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", productSearchTerm],
    queryFn: async () => {
      let query = supabase
        .from("product_reference")
        .select("id, canonical_name, program, ven_classification")
        .eq("active", true)
        .order("canonical_name");

      if (productSearchTerm.trim()) {
        query = query.ilike("canonical_name", `%${productSearchTerm}%`);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Create account type mutation
  const createAccountTypeMutation = useMutation({
    mutationFn: async ({ accountType, productIds }: { accountType: typeof newAccountType, productIds: string[] }) => {
      // Create account type
      const { data: createdAccountType, error: accountTypeError } = await supabase
        .from("account_types")
        .insert([accountType])
        .select()
        .single();

      if (accountTypeError) throw accountTypeError;

      // Add products to account type
      if (productIds.length > 0) {
        const productMappings = productIds.map(productId => ({
          account_type_id: createdAccountType.id,
          product_id: productId
        }));

        const { error: mappingError } = await supabase
          .from("account_type_products")
          .insert(productMappings);

        if (mappingError) throw mappingError;
      }

      return createdAccountType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      toast({ title: "Account type created successfully" });
      setIsCreateModalOpen(false);
      setNewAccountType({ name: "", description: "" });
      setSelectedProducts([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating account type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete account type mutation
  const deleteAccountTypeMutation = useMutation({
    mutationFn: async (accountTypeId: string) => {
      const { error } = await supabase
        .from("account_types")
        .delete()
        .eq("id", accountTypeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      toast({ title: "Account type deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting account type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAccountType = () => {
    if (!newAccountType.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an account type name",
        variant: "destructive",
      });
      return;
    }

    createAccountTypeMutation.mutate({
      accountType: newAccountType,
      productIds: selectedProducts
    });
  };

  const handleProductSelection = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const filteredProducts = products.filter(product =>
    product.canonical_name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <PageLayout>
      <Helmet>
        <title>Account Types Management | Metadata Settings</title>
        <meta name="description" content="Manage account types and their associated product lists for organized inventory management." />
        <link rel="canonical" href="/settings/metadata/account-types" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Account Types Management</h1>
            <p className="text-muted-foreground">
              Create and manage account types with specific product lists for organized inventory management.
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Account Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Create New Account Type</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Type Name *</Label>
                    <Input
                      id="name"
                      value={newAccountType.name}
                      onChange={(e) => setNewAccountType(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Essential Medicines"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newAccountType.description}
                      onChange={(e) => setNewAccountType(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this account type"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Select Products</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <ScrollArea className="h-64 border rounded-md p-4">
                      {isLoadingProducts ? (
                        <div className="text-center text-muted-foreground">Loading products...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="text-center text-muted-foreground">No products found</div>
                      ) : (
                        <div className="space-y-2">
                          {filteredProducts.map((product) => (
                            <div key={product.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={product.id}
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => handleProductSelection(product.id, checked as boolean)}
                              />
                              <label htmlFor={product.id} className="flex-1 text-sm cursor-pointer">
                                <div className="font-medium">{product.canonical_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.program && <span className="mr-2">Program: {product.program}</span>}
                                  {product.ven_classification && (
                                    <Badge variant="outline" className="text-xs">
                                      {product.ven_classification}
                                    </Badge>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    {selectedProducts.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {selectedProducts.length} product(s) selected
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateAccountType}
                    disabled={createAccountTypeMutation.isPending}
                  >
                    {createAccountTypeMutation.isPending ? "Creating..." : "Create Account Type"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingAccountTypes ? (
          <div className="text-center py-8">Loading account types...</div>
        ) : accountTypes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No account types created yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first account type to organize products by categories.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountTypes.map((accountType) => (
              <Card key={accountType.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{accountType.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAccountTypeMutation.mutate(accountType.id)}
                    disabled={deleteAccountTypeMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {accountType.description && (
                    <p className="text-sm text-muted-foreground mb-3">{accountType.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{accountType.product_count} products</Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(accountType.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AccountTypesManagement;