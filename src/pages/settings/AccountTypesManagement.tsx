import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const accountTypeSchema = z.object({
  name: z.string().min(1, "Account type name is required"),
  description: z.string().optional(),
  productIds: z.array(z.string()).min(1, "At least one product must be selected"),
});

type AccountTypeForm = z.infer<typeof accountTypeSchema>;

interface AccountType {
  id: string;
  name: string;
  description?: string;
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
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAccountType, setEditingAccountType] = useState<AccountType | null>(null);

  const form = useForm<AccountTypeForm>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      productIds: [],
    },
  });

  useEffect(() => {
    fetchAccountTypes();
    fetchProducts();
  }, []);

  const fetchAccountTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("account_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccountTypes(data || []);
    } catch (error) {
      console.error("Error fetching account types:", error);
      toast.error("Failed to fetch account types");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("product_reference")
        .select("id, canonical_name, program, ven_classification")
        .eq("active", true)
        .order("canonical_name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountTypeProducts = async (accountTypeId: string) => {
    try {
      const { data, error } = await supabase
        .from("account_type_products")
        .select("product_id")
        .eq("account_type_id", accountTypeId);

      if (error) throw error;
      return data?.map(item => item.product_id) || [];
    } catch (error) {
      console.error("Error fetching account type products:", error);
      return [];
    }
  };

  const handleCreateAccountType = async (data: AccountTypeForm) => {
    try {
      const { data: accountType, error: accountTypeError } = await supabase
        .from("account_types")
        .insert({
          name: data.name,
          description: data.description,
        })
        .select()
        .single();

      if (accountTypeError) throw accountTypeError;

      const productAssociations = data.productIds.map(productId => ({
        account_type_id: accountType.id,
        product_id: productId,
      }));

      const { error: productsError } = await supabase
        .from("account_type_products")
        .insert(productAssociations);

      if (productsError) throw productsError;

      toast.success("Account type created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
      fetchAccountTypes();
    } catch (error) {
      console.error("Error creating account type:", error);
      toast.error("Failed to create account type");
    }
  };

  const handleEditAccountType = async (accountType: AccountType) => {
    const productIds = await fetchAccountTypeProducts(accountType.id);
    setEditingAccountType(accountType);
    form.reset({
      name: accountType.name,
      description: accountType.description || "",
      productIds: productIds,
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdateAccountType = async (data: AccountTypeForm) => {
    if (!editingAccountType) return;

    try {
      const { error: accountTypeError } = await supabase
        .from("account_types")
        .update({
          name: data.name,
          description: data.description,
        })
        .eq("id", editingAccountType.id);

      if (accountTypeError) throw accountTypeError;

      const { error: deleteError } = await supabase
        .from("account_type_products")
        .delete()
        .eq("account_type_id", editingAccountType.id);

      if (deleteError) throw deleteError;

      const productAssociations = data.productIds.map(productId => ({
        account_type_id: editingAccountType.id,
        product_id: productId,
      }));

      const { error: productsError } = await supabase
        .from("account_type_products")
        .insert(productAssociations);

      if (productsError) throw productsError;

      toast.success("Account type updated successfully");
      setIsCreateDialogOpen(false);
      setEditingAccountType(null);
      form.reset();
      fetchAccountTypes();
    } catch (error) {
      console.error("Error updating account type:", error);
      toast.error("Failed to update account type");
    }
  };

  const handleDeleteAccountType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this account type?")) return;

    try {
      const { error } = await supabase
        .from("account_types")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Account type deleted successfully");
      fetchAccountTypes();
    } catch (error) {
      console.error("Error deleting account type:", error);
      toast.error("Failed to delete account type");
    }
  };

  const onSubmit = (data: AccountTypeForm) => {
    if (editingAccountType) {
      handleUpdateAccountType(data);
    } else {
      handleCreateAccountType(data);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingAccountType(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Helmet>
        <title>Account Types Management | System Settings</title>
        <meta name="description" content="Manage account types and their associated drug lists" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Account Types</h1>
            <p className="text-muted-foreground">
              Manage account types and their associated drug lists
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Account Type
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingAccountType ? "Edit Account Type" : "Create Account Type"}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account type name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter description (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="productIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Products</FormLabel>
                        <ScrollArea className="h-64 border rounded-md p-4">
                          <div className="space-y-3">
                            {products.map((product) => (
                              <div key={product.id} className="flex items-start space-x-3">
                                <Checkbox
                                  id={product.id}
                                  checked={field.value?.includes(product.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...field.value, product.id]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter((id) => id !== product.id)
                                      );
                                    }
                                  }}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor={product.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {product.canonical_name}
                                  </label>
                                  <div className="flex gap-2">
                                    {product.program && (
                                      <Badge variant="secondary" className="text-xs">
                                        {product.program}
                                      </Badge>
                                    )}
                                    {product.ven_classification && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          product.ven_classification === 'V' ? 'border-green-500 text-green-700' :
                                          product.ven_classification === 'E' ? 'border-blue-500 text-blue-700' :
                                          product.ven_classification === 'N' ? 'border-gray-500 text-gray-700' :
                                          'border-gray-300'
                                        }`}
                                      >
                                        {product.ven_classification}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAccountType ? "Update" : "Create"} Account Type
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {accountTypes.map((accountType) => (
            <Card key={accountType.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {accountType.name}
                    </CardTitle>
                    {accountType.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {accountType.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditAccountType(accountType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAccountType(accountType.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {accountTypes.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Account Types Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first account type to organize products by category.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default AccountTypesManagement;