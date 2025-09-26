import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable, TableColumn, TableAction } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Edit, Trash2, Upload, Download, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  created_at?: string;
}

const UsersManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name and email are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      let result;
      if (editingUser) {
        result = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', editingUser.id);
      } else {
        // For new users, we would typically handle this through auth signup
        toast({
          title: "Info",
          description: "New user creation should be handled through the registration process",
          variant: "default"
        });
        return;
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "User profile updated successfully"
      });

      resetForm();
      setIsAddModalOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: ''
    });
    setEditingUser(null);
  };

  const handleEdit = (user: UserProfile) => {
    setFormData({
      full_name: user.full_name || '',
      email: user.email || ''
    });
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleView = (user: UserProfile) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({ title: "User profile deleted successfully" });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=users');
  };

  const columns: TableColumn<UserProfile>[] = [
    {
      key: 'full_name',
      title: 'Full Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium">{value || '-'}</span>
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      filterable: true,
      render: (value) => value || '-'
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      filterable: false,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  const tableActions: TableAction<UserProfile>[] = [
    {
      label: 'View',
      onClick: (user) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
      },
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: 'Edit',
      onClick: (user) => {
        setFormData({
          full_name: user.full_name || '',
          email: user.email || ''
        });
        setEditingUser(user);
        setIsAddModalOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (user) => handleDelete(user.id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive'
    }
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: async (selectedUsers: UserProfile[]) => {
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} user profiles?`)) {
          const ids = selectedUsers.map(u => u.id);
          const { error } = await supabase
            .from('profiles')
            .delete()
            .in('id', ids);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to delete selected users",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success",
              description: `Deleted ${selectedUsers.length} user profiles`
            });
            loadUsers();
          }
        }
      },
      variant: 'destructive' as const
    }
  ];

  return (
    <>
      <Helmet>
        <title>Users Management | Metadata Organization</title>
        <meta name="description" content="Manage user profiles and staff information in the system." />
        <link rel="canonical" href="/settings/metadata/users" />
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Users & Staff</h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">Manage user profiles and staff information</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)} disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {editingUser ? 'Edit User Profile' : 'Add New User'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingUser ? 'Update' : 'Add'} User
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

      {/* Users List */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        actions={tableActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search users by name or email..."
        emptyState={
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              User profiles will appear here as they register.
            </p>
          </div>
        }
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Full Name</Label>
                  <p className="mt-1">{viewingUser.full_name || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="mt-1">{viewingUser.email || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">User ID</Label>
                  <p className="mt-1 text-muted-foreground font-mono text-xs">{viewingUser.user_id}</p>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="mt-1">
                    {viewingUser.created_at ? new Date(viewingUser.created_at).toLocaleString() : '-'}
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

export default UsersManagement;