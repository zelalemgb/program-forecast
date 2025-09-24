import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Plus, Edit, Trash2, Upload, Download, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/layout/PageHeader";

interface Product {
  id: string;
  canonical_name: string;
  code?: string;
  base_unit: string;
  program?: string;
  atc_code?: string;
  strength?: string;
  form?: string;
  pack_size?: number;
  tracer_flag?: boolean;
  active?: boolean;
  created_at?: string;
}

const ProductsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    canonical_name: '',
    code: '',
    base_unit: '',
    program: '',
    atc_code: '',
    strength: '',
    form: '',
    pack_size: '',
    tracer_flag: false,
    active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reference')
        .select('*')
        .order('canonical_name');

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
    if (!formData.canonical_name.trim() || !formData.base_unit.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name and base unit are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        canonical_name: formData.canonical_name.trim(),
        base_unit: formData.base_unit.trim(),
        pack_size: formData.pack_size ? parseInt(formData.pack_size) : null,
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('product_reference')
          .update(payload)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('product_reference')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setIsAddModalOpen(false);
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
      canonical_name: '',
      code: '',
      base_unit: '',
      program: '',
      atc_code: '',
      strength: '',
      form: '',
      pack_size: '',
      tracer_flag: false,
      active: true
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      canonical_name: product.canonical_name,
      code: product.code || '',
      base_unit: product.base_unit,
      program: product.program || '',
      atc_code: product.atc_code || '',
      strength: product.strength || '',
      form: product.form || '',
      pack_size: product.pack_size?.toString() || '',
      tracer_flag: product.tracer_flag || false,
      active: product.active !== false
    });
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_reference')
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

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=products');
  };

  const programs = ['Essential Medicines', 'TB Program', 'HIV/AIDS Program', 'Malaria Program', 'Maternal Health'];
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
        title="Products & Medicines"
        description="Manage pharmaceutical products and medical supplies"
        actions={
          <div className="flex gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProduct(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="canonical_name">Product Name *</Label>
                      <Input
                        id="canonical_name"
                        value={formData.canonical_name}
                        onChange={(e) => setFormData({ ...formData, canonical_name: e.target.value })}
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
                      <Label htmlFor="base_unit">Base Unit *</Label>
                      <Select 
                        value={formData.base_unit} 
                        onValueChange={(value) => setFormData({ ...formData, base_unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select base unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Select 
                        value={formData.program} 
                        onValueChange={(value) => setFormData({ ...formData, program: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map(program => (
                            <SelectItem key={program} value={program}>{program}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="atc_code">ATC Code</Label>
                      <Input
                        id="atc_code"
                        value={formData.atc_code}
                        onChange={(e) => setFormData({ ...formData, atc_code: e.target.value })}
                        placeholder="Enter ATC code"
                      />
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
                      <Label htmlFor="form">Form</Label>
                      <Select 
                        value={formData.form} 
                        onValueChange={(value) => setFormData({ ...formData, form: value })}
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tracer_flag"
                        checked={formData.tracer_flag}
                        onCheckedChange={(checked) => setFormData({ ...formData, tracer_flag: !!checked })}
                      />
                      <Label htmlFor="tracer_flag">Tracer Product</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingProduct ? 'Update' : 'Add'} Product
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleBulkImport}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        }
      />

      {/* Products List */}
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
                  <TableHead>Unit</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.canonical_name}</TableCell>
                    <TableCell>{product.code || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.base_unit}</Badge>
                    </TableCell>
                    <TableCell>{product.program || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={product.active !== false ? "default" : "secondary"}>
                        {product.active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Name</Label>
                  <p className="mt-1">{viewingProduct.canonical_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Code</Label>
                  <p className="mt-1">{viewingProduct.code || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Base Unit</Label>
                  <p className="mt-1">{viewingProduct.base_unit}</p>
                </div>
                <div>
                  <Label className="font-medium">Program</Label>
                  <p className="mt-1">{viewingProduct.program || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">ATC Code</Label>
                  <p className="mt-1">{viewingProduct.atc_code || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Strength</Label>
                  <p className="mt-1">{viewingProduct.strength || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Form</Label>
                  <p className="mt-1">{viewingProduct.form || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Pack Size</Label>
                  <p className="mt-1">{viewingProduct.pack_size || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Tracer Product</Label>
                  <p className="mt-1">{viewingProduct.tracer_flag ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <p className="mt-1">{viewingProduct.active !== false ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsManagement;