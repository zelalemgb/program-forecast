import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, TableColumn, TableAction } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2, Upload, Download, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface Supplier {
  id: string;
  name: string;
  contact_info?: any;
  created_at?: string;
}

const SuppliersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading suppliers",
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
        description: "Supplier name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        contact_info: {
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          contact_person: formData.contact_person.trim() || undefined,
        }
      };

      let result;
      if (editingSupplier) {
        result = await supabase
          .from('suppliers')
          .update(payload)
          .eq('id', editingSupplier.id);
      } else {
        result = await supabase
          .from('suppliers')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Supplier ${editingSupplier ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setIsAddModalOpen(false);
      loadSuppliers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save supplier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contact_person: ''
    });
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.contact_info?.email || '',
      phone: supplier.contact_info?.phone || '',
      address: supplier.contact_info?.address || '',
      contact_person: supplier.contact_info?.contact_person || ''
    });
    setEditingSupplier(supplier);
    setIsAddModalOpen(true);
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      toast({ title: "Supplier deleted successfully" });
      loadSuppliers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete supplier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=suppliers');
  };

  const columns: TableColumn<Supplier>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'contact_person',
      title: 'Contact Person',
      sortable: true,
      filterable: true,
      render: (_, row) => row.contact_info?.contact_person || '-'
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (_, row) => row.contact_info?.email || '-'
    },
    {
      key: 'phone',
      title: 'Phone',
      sortable: true,
      filterable: true,
      render: (_, row) => row.contact_info?.phone || '-'
    }
  ];

  const tableActions: TableAction<Supplier>[] = [
    {
      label: 'View',
      onClick: (supplier) => {
        setViewingSupplier(supplier);
        setIsViewModalOpen(true);
      },
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: 'Edit',
      onClick: (supplier) => {
        setFormData({
          name: supplier.name,
          email: supplier.contact_info?.email || '',
          phone: supplier.contact_info?.phone || '',
          address: supplier.contact_info?.address || '',
          contact_person: supplier.contact_info?.contact_person || ''
        });
        setEditingSupplier(supplier);
        setIsAddModalOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (supplier) => handleDelete(supplier.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive'
    }
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: async (selectedSuppliers: Supplier[]) => {
        if (confirm(`Are you sure you want to delete ${selectedSuppliers.length} suppliers?`)) {
          const ids = selectedSuppliers.map(s => s.id);
          const { error } = await supabase
            .from('suppliers')
            .delete()
            .in('id', ids);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to delete selected suppliers",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success",
              description: `Deleted ${selectedSuppliers.length} suppliers`
            });
            loadSuppliers();
          }
        }
      },
      variant: 'destructive' as const
    }
  ];

  return (
    <>
      <Helmet>
        <title>Suppliers Management | Metadata Organization</title>
        <meta name="description" content="Manage supplier and vendor information in the system." />
        <link rel="canonical" href="/settings/metadata/suppliers" />
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Suppliers & Vendors</h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">Manage supplier and vendor information</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSupplier(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Enter contact person name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingSupplier ? 'Update' : 'Add'} Supplier
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
      </div>

      {/* Suppliers List */}
      <DataTable
        data={suppliers}
        columns={columns}
        loading={loading}
        actions={tableActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search suppliers by name, contact person, or email..."
        emptyState={
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first supplier.
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </div>
        }
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Supplier Details
            </DialogTitle>
          </DialogHeader>
          {viewingSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Name</Label>
                  <p className="mt-1">{viewingSupplier.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Contact Person</Label>
                  <p className="mt-1">{viewingSupplier.contact_info?.contact_person || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="mt-1">{viewingSupplier.contact_info?.email || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Phone</Label>
                  <p className="mt-1">{viewingSupplier.contact_info?.phone || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Address</Label>
                  <p className="mt-1">{viewingSupplier.contact_info?.address || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="mt-1">
                    {viewingSupplier.created_at ? new Date(viewingSupplier.created_at).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuppliersManagement;