import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Plus, Edit, Trash2, Upload, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { DataTable, TableColumn, TableAction } from "@/components/ui/data-table";

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
  // Inventory management fields
  minimum_order_quantity?: number;
  buffer_stock_level?: number;
  maximum_stock_level?: number;
  reorder_point?: number;
  lead_time_days?: number;
  storage_temperature_min?: number;
  storage_temperature_max?: number;
  storage_humidity_min?: number;
  storage_humidity_max?: number;
  shelf_life_months?: number;
  abc_classification?: string;
  criticality_level?: string;
  controlled_substance?: boolean;
  refrigeration_required?: boolean;
  narcotics_classification?: string;
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
    active: true,
    // Inventory management fields
    minimum_order_quantity: '',
    buffer_stock_level: '',
    maximum_stock_level: '',
    reorder_point: '',
    lead_time_days: '',
    storage_temperature_min: '',
    storage_temperature_max: '',
    storage_humidity_min: '',
    storage_humidity_max: '',
    shelf_life_months: '',
    abc_classification: '',
    criticality_level: '',
    controlled_substance: false,
    refrigeration_required: false,
    narcotics_classification: ''
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
        // Convert string numbers to numbers for inventory fields
        minimum_order_quantity: formData.minimum_order_quantity ? parseFloat(formData.minimum_order_quantity) : 0,
        buffer_stock_level: formData.buffer_stock_level ? parseFloat(formData.buffer_stock_level) : 0,
        maximum_stock_level: formData.maximum_stock_level ? parseFloat(formData.maximum_stock_level) : 0,
        reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : 0,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : 0,
        storage_temperature_min: formData.storage_temperature_min ? parseFloat(formData.storage_temperature_min) : null,
        storage_temperature_max: formData.storage_temperature_max ? parseFloat(formData.storage_temperature_max) : null,
        storage_humidity_min: formData.storage_humidity_min ? parseFloat(formData.storage_humidity_min) : null,
        storage_humidity_max: formData.storage_humidity_max ? parseFloat(formData.storage_humidity_max) : null,
        shelf_life_months: formData.shelf_life_months ? parseInt(formData.shelf_life_months) : null,
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
      active: true,
      // Inventory management fields
      minimum_order_quantity: '',
      buffer_stock_level: '',
      maximum_stock_level: '',
      reorder_point: '',
      lead_time_days: '',
      storage_temperature_min: '',
      storage_temperature_max: '',
      storage_humidity_min: '',
      storage_humidity_max: '',
      shelf_life_months: '',
      abc_classification: '',
      criticality_level: '',
      controlled_substance: false,
      refrigeration_required: false,
      narcotics_classification: ''
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
      active: product.active !== false,
      // Inventory management fields
      minimum_order_quantity: product.minimum_order_quantity?.toString() || '',
      buffer_stock_level: product.buffer_stock_level?.toString() || '',
      maximum_stock_level: product.maximum_stock_level?.toString() || '',
      reorder_point: product.reorder_point?.toString() || '',
      lead_time_days: product.lead_time_days?.toString() || '',
      storage_temperature_min: product.storage_temperature_min?.toString() || '',
      storage_temperature_max: product.storage_temperature_max?.toString() || '',
      storage_humidity_min: product.storage_humidity_min?.toString() || '',
      storage_humidity_max: product.storage_humidity_max?.toString() || '',
      shelf_life_months: product.shelf_life_months?.toString() || '',
      abc_classification: product.abc_classification || '',
      criticality_level: product.criticality_level || '',
      controlled_substance: product.controlled_substance || false,
      refrigeration_required: product.refrigeration_required || false,
      narcotics_classification: product.narcotics_classification || ''
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

  const handleExport = (data: Product[]) => {
    const csvContent = [
      ['Name', 'Code', 'Program', 'ATC Code', 'Strength', 'Form', 'Base Unit', 'Pack Size', 'Status', 'Tracer'],
      ...data.map(product => [
        product.canonical_name,
        product.code || '',
        product.program || '',
        product.atc_code || '',
        product.strength || '',
        product.form || '',
        product.base_unit,
        product.pack_size?.toString() || '',
        product.active !== false ? 'Active' : 'Inactive',
        product.tracer_flag ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'canonical_name',
      title: 'Product Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'code',
      title: 'Code',
      sortable: true,
      filterable: true,
      render: (value) => value || '-'
    },
    {
      key: 'program',
      title: 'Program',
      sortable: true,
      filterable: true,
      render: (value) => value || '-'
    },
    {
      key: 'base_unit',
      title: 'Base Unit',
      sortable: true,
      filterable: true,
      render: (value) => <Badge variant="outline">{value}</Badge>
    },
    {
      key: 'pack_size',
      title: 'Pack Size',
      sortable: true,
      filterable: false,
      render: (value) => value?.toString() || '-'
    },
    {
      key: 'active',
      title: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={value !== false ? "default" : "secondary"}>
          {value !== false ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: 'tracer_flag',
      title: 'Tracer',
      sortable: true,
      filterable: false,
      render: (value) => (
        <Badge variant={value ? "default" : "outline"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    }
  ];

  const tableActions: TableAction<Product>[] = [
    {
      label: 'View',
      onClick: (product) => {
        setViewingProduct(product);
        setIsViewModalOpen(true);
      },
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: 'Edit',
      onClick: (product) => {
        setEditingProduct(product);
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
          active: product.active !== false,
          minimum_order_quantity: product.minimum_order_quantity?.toString() || '',
          buffer_stock_level: product.buffer_stock_level?.toString() || '',
          maximum_stock_level: product.maximum_stock_level?.toString() || '',
          reorder_point: product.reorder_point?.toString() || '',
          lead_time_days: product.lead_time_days?.toString() || '',
          storage_temperature_min: product.storage_temperature_min?.toString() || '',
          storage_temperature_max: product.storage_temperature_max?.toString() || '',
          storage_humidity_min: product.storage_humidity_min?.toString() || '',
          storage_humidity_max: product.storage_humidity_max?.toString() || '',
          shelf_life_months: product.shelf_life_months?.toString() || '',
          abc_classification: product.abc_classification || '',
          criticality_level: product.criticality_level || '',
          controlled_substance: product.controlled_substance || false,
          refrigeration_required: product.refrigeration_required || false,
          narcotics_classification: product.narcotics_classification || ''
        });
        setIsAddModalOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (product) => handleDelete(product.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive'
    }
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: async (selectedProducts: Product[]) => {
        if (confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          const ids = selectedProducts.map(p => p.id);
          const { error } = await supabase
            .from('product_reference')
            .delete()
            .in('id', ids);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to delete selected products",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success",
              description: `Deleted ${selectedProducts.length} products`
            });
            loadProducts();
          }
        }
      },
      variant: 'destructive' as const
    },
    {
      label: 'Activate Selected',
      onClick: async (selectedProducts: Product[]) => {
        const ids = selectedProducts.map(p => p.id);
        const { error } = await supabase
          .from('product_reference')
          .update({ active: true })
          .in('id', ids);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to activate selected products",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: `Activated ${selectedProducts.length} products`
          });
          loadProducts();
        }
      }
    },
    {
      label: 'Deactivate Selected',
      onClick: async (selectedProducts: Product[]) => {
        const ids = selectedProducts.map(p => p.id);
        const { error } = await supabase
          .from('product_reference')
          .update({ active: false })
          .in('id', ids);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to deactivate selected products",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: `Deactivated ${selectedProducts.length} products`
          });
          loadProducts();
        }
      }
    }
  ];

  const programs = ['Essential Medicines', 'TB Program', 'HIV/AIDS Program', 'Malaria Program', 'Maternal Health'];
  const dosageForms = ['Tablet', 'Capsule', 'Injection', 'Syrup', 'Ointment', 'Drops', 'Powder'];
  const units = ['Tablet', 'Capsule', 'Vial', 'Bottle', 'Tube', 'Pack', 'Box', 'ml', 'mg', 'g'];

  const actions = (
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

                  {/* Inventory Management Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Inventory Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minimum_order_quantity">Minimum Order Quantity</Label>
                        <Input
                          id="minimum_order_quantity"
                          type="number"
                          value={formData.minimum_order_quantity}
                          onChange={(e) => setFormData({ ...formData, minimum_order_quantity: e.target.value })}
                          placeholder="Enter minimum order quantity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buffer_stock_level">Buffer Stock Level</Label>
                        <Input
                          id="buffer_stock_level"
                          type="number"
                          value={formData.buffer_stock_level}
                          onChange={(e) => setFormData({ ...formData, buffer_stock_level: e.target.value })}
                          placeholder="Enter buffer stock level"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maximum_stock_level">Maximum Stock Level</Label>
                        <Input
                          id="maximum_stock_level"
                          type="number"
                          value={formData.maximum_stock_level}
                          onChange={(e) => setFormData({ ...formData, maximum_stock_level: e.target.value })}
                          placeholder="Enter maximum stock level"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reorder_point">Reorder Point</Label>
                        <Input
                          id="reorder_point"
                          type="number"
                          value={formData.reorder_point}
                          onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                          placeholder="Enter reorder point"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                        <Input
                          id="lead_time_days"
                          type="number"
                          value={formData.lead_time_days}
                          onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                          placeholder="Enter lead time in days"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shelf_life_months">Shelf Life (Months)</Label>
                        <Input
                          id="shelf_life_months"
                          type="number"
                          value={formData.shelf_life_months}
                          onChange={(e) => setFormData({ ...formData, shelf_life_months: e.target.value })}
                          placeholder="Enter shelf life in months"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="abc_classification">ABC Classification</Label>
                        <Select 
                          value={formData.abc_classification} 
                          onValueChange={(value) => setFormData({ ...formData, abc_classification: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ABC classification" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - High Value/High Usage</SelectItem>
                            <SelectItem value="B">B - Medium Value/Medium Usage</SelectItem>
                            <SelectItem value="C">C - Low Value/Low Usage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="criticality_level">Criticality Level</Label>
                        <Select 
                          value={formData.criticality_level} 
                          onValueChange={(value) => setFormData({ ...formData, criticality_level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select criticality level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Critical">Critical</SelectItem>
                            <SelectItem value="Essential">Essential</SelectItem>
                            <SelectItem value="Non-Essential">Non-Essential</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Storage Requirements Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Storage Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storage_temperature_min">Min Temperature (°C)</Label>
                        <Input
                          id="storage_temperature_min"
                          type="number"
                          step="0.1"
                          value={formData.storage_temperature_min}
                          onChange={(e) => setFormData({ ...formData, storage_temperature_min: e.target.value })}
                          placeholder="e.g., 2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storage_temperature_max">Max Temperature (°C)</Label>
                        <Input
                          id="storage_temperature_max"
                          type="number"
                          step="0.1"
                          value={formData.storage_temperature_max}
                          onChange={(e) => setFormData({ ...formData, storage_temperature_max: e.target.value })}
                          placeholder="e.g., 8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storage_humidity_min">Min Humidity (%)</Label>
                        <Input
                          id="storage_humidity_min"
                          type="number"
                          step="0.1"
                          value={formData.storage_humidity_min}
                          onChange={(e) => setFormData({ ...formData, storage_humidity_min: e.target.value })}
                          placeholder="e.g., 30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storage_humidity_max">Max Humidity (%)</Label>
                        <Input
                          id="storage_humidity_max"
                          type="number"
                          step="0.1"
                          value={formData.storage_humidity_max}
                          onChange={(e) => setFormData({ ...formData, storage_humidity_max: e.target.value })}
                          placeholder="e.g., 70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="narcotics_classification">Narcotics Classification</Label>
                        <Input
                          id="narcotics_classification"
                          value={formData.narcotics_classification}
                          onChange={(e) => setFormData({ ...formData, narcotics_classification: e.target.value })}
                          placeholder="e.g., Schedule II"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 flex-wrap">
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
                        id="refrigeration_required"
                        checked={formData.refrigeration_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, refrigeration_required: !!checked })}
                      />
                      <Label htmlFor="refrigeration_required">Refrigeration Required</Label>
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
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        );

  return (
    <PageLayout actions={actions}>
      <Helmet>
        <title>Products Management | Metadata Organization</title>
        <meta name="description" content="Manage pharmaceutical products, medical supplies, and equipment in the system." />
        <link rel="canonical" href="/settings/metadata/products" />
      </Helmet>

      {/* Products List */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        actions={tableActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search products by name, code, program, or ATC code..."
        emptyState={
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No products found</h3>
            <p className="text-muted-foreground">Get started by adding your first product.</p>
          </div>
        }
        customSummary={
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="outline">Total: {products.length}</Badge>
            <Badge variant="outline">
              Active: {products.filter(p => p.active !== false).length}
            </Badge>
            <Badge variant="outline">
              Tracers: {products.filter(p => p.tracer_flag).length}
            </Badge>
            <Badge variant="outline">
              Essential Medicines: {products.filter(p => p.program === 'Essential Medicines').length}
            </Badge>
          </div>
        }
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
          </DialogHeader>
          {viewingProduct && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-3">Basic Information</h3>
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
                </div>
              </div>

              {/* Inventory Management */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Inventory Management</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Minimum Order Quantity</Label>
                    <p className="mt-1">{viewingProduct.minimum_order_quantity || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Buffer Stock Level</Label>
                    <p className="mt-1">{viewingProduct.buffer_stock_level || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Maximum Stock Level</Label>
                    <p className="mt-1">{viewingProduct.maximum_stock_level || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Reorder Point</Label>
                    <p className="mt-1">{viewingProduct.reorder_point || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Lead Time (Days)</Label>
                    <p className="mt-1">{viewingProduct.lead_time_days || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Shelf Life (Months)</Label>
                    <p className="mt-1">{viewingProduct.shelf_life_months || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">ABC Classification</Label>
                    <p className="mt-1">{viewingProduct.abc_classification || '-'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Criticality Level</Label>
                    <p className="mt-1">{viewingProduct.criticality_level || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Storage Requirements */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Storage Requirements</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Temperature Range</Label>
                    <p className="mt-1">
                      {viewingProduct.storage_temperature_min && viewingProduct.storage_temperature_max
                        ? `${viewingProduct.storage_temperature_min}°C - ${viewingProduct.storage_temperature_max}°C`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Humidity Range</Label>
                    <p className="mt-1">
                      {viewingProduct.storage_humidity_min && viewingProduct.storage_humidity_max
                        ? `${viewingProduct.storage_humidity_min}% - ${viewingProduct.storage_humidity_max}%`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Narcotics Classification</Label>
                    <p className="mt-1">{viewingProduct.narcotics_classification || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Flags and Status */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Flags and Status</h3>
                <div className="flex flex-wrap gap-3">
                  <div>
                    <Label className="font-medium">Tracer Product</Label>
                    <Badge variant={viewingProduct.tracer_flag ? "default" : "secondary"} className="ml-2">
                      {viewingProduct.tracer_flag ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge variant={viewingProduct.active !== false ? "default" : "secondary"} className="ml-2">
                      {viewingProduct.active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Controlled Substance</Label>
                    <Badge variant={viewingProduct.controlled_substance ? "destructive" : "secondary"} className="ml-2">
                      {viewingProduct.controlled_substance ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Refrigeration Required</Label>
                    <Badge variant={viewingProduct.refrigeration_required ? "default" : "secondary"} className="ml-2">
                      {viewingProduct.refrigeration_required ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ProductsManagement;