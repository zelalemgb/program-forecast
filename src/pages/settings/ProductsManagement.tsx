import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Plus, Edit, Trash2, Upload, Download, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/layout/PageHeader";

interface Product {
  id: string;
  name: string;
  code?: string;
  unit?: string;
  category?: string;
  product_type?: string;
  therapeutic_category?: string;
  dosage_form?: string;
  strength?: string;
  manufacturer?: string;
  generic_name?: string;
  brand_name?: string;
  pack_size?: number;
  cold_chain_required?: boolean;
  controlled_substance?: boolean;
  prescription_required?: boolean;
  essential_medicine?: boolean;
  pediatric_formulation?: boolean;
  active_status?: boolean;
  created_at?: string;
}

const ProductsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const defaultTab = searchParams.get('tab') === 'manage' ? 'manage' : 'add';

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    unit: '',
    category: '',
    product_type: '',
    therapeutic_category: '',
    dosage_form: '',
    strength: '',
    manufacturer: '',
    generic_name: '',
    brand_name: '',
    pack_size: '',
    cold_chain_required: false,
    controlled_substance: false,
    prescription_required: false,
    essential_medicine: false,
    pediatric_formulation: false,
    active_status: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        pack_size: formData.pack_size ? parseInt(formData.pack_size) : null,
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`
      });

      resetForm();
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      unit: '',
      category: '',
      product_type: '',
      therapeutic_category: '',
      dosage_form: '',
      strength: '',
      manufacturer: '',
      generic_name: '',
      brand_name: '',
      pack_size: '',
      cold_chain_required: false,
      controlled_substance: false,
      prescription_required: false,
      essential_medicine: false,
      pediatric_formulation: false,
      active_status: true
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      code: product.code || '',
      unit: product.unit || '',
      category: product.category || '',
      product_type: product.product_type || '',
      therapeutic_category: product.therapeutic_category || '',
      dosage_form: product.dosage_form || '',
      strength: product.strength || '',
      manufacturer: product.manufacturer || '',
      generic_name: product.generic_name || '',
      brand_name: product.brand_name || '',
      pack_size: product.pack_size?.toString() || '',
      cold_chain_required: product.cold_chain_required || false,
      controlled_substance: product.controlled_substance || false,
      prescription_required: product.prescription_required || false,
      essential_medicine: product.essential_medicine || false,
      pediatric_formulation: product.pediatric_formulation || false,
      active_status: product.active_status !== false
    });
    setEditingProduct(product);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({ title: "Product deleted successfully" });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Medicines', 'Medical Supplies', 'Laboratory Supplies', 'Equipment', 'Vaccines'];
  const productTypes = ['Pharmaceutical', 'Medical Device', 'Consumable', 'Equipment', 'Reagent'];
  const dosageForms = ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Ointment', 'Drops', 'Powder'];
  const units = ['Tablet', 'Capsule', 'Vial', 'Bottle', 'Tube', 'Pack', 'Box', 'ml', 'mg', 'g'];

  return (
    <>
      <Helmet>
        <title>Products Management | Metadata Organization</title>
        <meta name="description" content="Manage pharmaceutical products, medical supplies, and equipment in the system." />
        <link rel="canonical" href="/settings/metadata/products" />
      </Helmet>

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/settings/metadata')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Metadata
        </Button>
      </div>

      <PageHeader
        title="Products & Medicines Management"
        description="Add, edit, and manage pharmaceutical products and medical supplies"
      />

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">Add Product</TabsTrigger>
          <TabsTrigger value="manage">Manage Products</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Product Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="Enter product code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generic_name">Generic Name</Label>
                      <Input
                        id="generic_name"
                        value={formData.generic_name}
                        onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                        placeholder="Enter generic name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand_name">Brand Name</Label>
                      <Input
                        id="brand_name"
                        value={formData.brand_name}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>
                </div>

                {/* Classification */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Classification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_type">Product Type</Label>
                      <Select 
                        value={formData.product_type} 
                        onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="therapeutic_category">Therapeutic Category</Label>
                      <Input
                        id="therapeutic_category"
                        value={formData.therapeutic_category}
                        onChange={(e) => setFormData({ ...formData, therapeutic_category: e.target.value })}
                        placeholder="Enter therapeutic category"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Properties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Physical Properties</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dosage_form">Dosage Form</Label>
                      <Select 
                        value={formData.dosage_form} 
                        onValueChange={(value) => setFormData({ ...formData, dosage_form: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select form" />
                        </SelectTrigger>
                        <SelectContent>
                          {dosageForms.map(form => (
                            <SelectItem key={form} value={form}>{form}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="strength">Strength</Label>
                      <Input
                        id="strength"
                        value={formData.strength}
                        onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select 
                        value={formData.unit} 
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pack_size">Pack Size</Label>
                      <Input
                        id="pack_size"
                        type="number"
                        value={formData.pack_size}
                        onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                        placeholder="Enter pack size"
                      />
                    </div>
                  </div>
                </div>

                {/* Manufacturer */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Manufacturer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        placeholder="Enter manufacturer name"
                      />
                    </div>
                  </div>
                </div>

                {/* Flags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Flags</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cold_chain_required"
                        checked={formData.cold_chain_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, cold_chain_required: !!checked })}
                      />
                      <Label htmlFor="cold_chain_required">Cold Chain Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="controlled_substance"
                        checked={formData.controlled_substance}
                        onCheckedChange={(checked) => setFormData({ ...formData, controlled_substance: !!checked })}
                      />
                      <Label htmlFor="controlled_substance">Controlled Substance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prescription_required"
                        checked={formData.prescription_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, prescription_required: !!checked })}
                      />
                      <Label htmlFor="prescription_required">Prescription Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="essential_medicine"
                        checked={formData.essential_medicine}
                        onCheckedChange={(checked) => setFormData({ ...formData, essential_medicine: !!checked })}
                      />
                      <Label htmlFor="essential_medicine">Essential Medicine</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pediatric_formulation"
                        checked={formData.pediatric_formulation}
                        onCheckedChange={(checked) => setFormData({ ...formData, pediatric_formulation: !!checked })}
                      />
                      <Label htmlFor="pediatric_formulation">Pediatric Formulation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active_status"
                        checked={formData.active_status}
                        onCheckedChange={(checked) => setFormData({ ...formData, active_status: !!checked })}
                      />
                      <Label htmlFor="active_status">Active Status</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingProduct ? 'Update' : 'Add'} Product
                  </Button>
                  {editingProduct && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products ({products.length})
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{product.name}</div>
                            {product.generic_name && (
                              <div className="text-xs text-muted-foreground">{product.generic_name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.code || '-'}</TableCell>
                        <TableCell>
                          {product.category && (
                            <Badge variant="outline">{product.category}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.product_type && (
                            <Badge variant="secondary">{product.product_type}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{product.unit || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={product.active_status !== false ? "default" : "secondary"}>
                            {product.active_status !== false ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Import multiple products from Excel or CSV files. Download the template to ensure proper formatting.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProductsManagement;