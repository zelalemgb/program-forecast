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
import { MapPin, Plus, Edit, Trash2, Upload, Download, ArrowLeft, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/layout/PageHeader";

interface Region {
  region_id: number;
  region_name: string;
  created_at?: string;
}

interface Zone {
  zone_id: number;
  zone_name: string;
  region_id: number;
  created_at?: string;
}

interface Woreda {
  woreda_id: number;
  woreda_name: string;
  zone_id: number;
  created_at?: string;
}

const AreasManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'regions' | 'zones' | 'woredas'>('regions');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    parent_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regionsResult, zonesResult, woredasResult] = await Promise.all([
        supabase.from('region').select('*').order('region_name'),
        supabase.from('zone').select('*').order('zone_name'),
        supabase.from('woreda').select('*').order('woreda_name')
      ]);

      if (regionsResult.data) setRegions(regionsResult.data);
      if (zonesResult.data) setZones(zonesResult.data);
      if (woredasResult.data) setWoredas(woredasResult.data);
    } catch (error: any) {
      toast({
        title: "Error loading data",
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
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let payload: any = {};
      let table = '';
      let idField = '';

      if (activeTab === 'regions') {
        payload = { region_name: formData.name.trim() };
        table = 'region';
        idField = 'region_id';
      } else if (activeTab === 'zones') {
        if (!formData.parent_id) {
          toast({
            title: "Validation Error",
            description: "Region is required for zones",
            variant: "destructive"
          });
          return;
        }
        payload = { 
          zone_name: formData.name.trim(),
          region_id: parseInt(formData.parent_id)
        };
        table = 'zone';
        idField = 'zone_id';
      } else if (activeTab === 'woredas') {
        if (!formData.parent_id) {
          toast({
            title: "Validation Error",
            description: "Zone is required for woredas",
            variant: "destructive"
          });
          return;
        }
        payload = { 
          woreda_name: formData.name.trim(),
          zone_id: parseInt(formData.parent_id)
        };
        table = 'woreda';
        idField = 'woreda_id';
      }

      let result;
      if (editingItem) {
        if (activeTab === 'regions') {
          result = await supabase.from('region').update(payload).eq('region_id', editingItem.region_id);
        } else if (activeTab === 'zones') {
          result = await supabase.from('zone').update(payload).eq('zone_id', editingItem.zone_id);
        } else {
          result = await supabase.from('woreda').update(payload).eq('woreda_id', editingItem.woreda_id);
        }
      } else {
        if (activeTab === 'regions') {
          result = await supabase.from('region').insert([payload]);
        } else if (activeTab === 'zones') {
          result = await supabase.from('zone').insert([payload]);
        } else {
          result = await supabase.from('woreda').insert([payload]);
        }
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setIsAddModalOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent_id: ''
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.region_name || item.zone_name || item.woreda_name || '',
      parent_id: item.region_id?.toString() || item.zone_id?.toString() || ''
    });
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;

    setLoading(true);
    try {
      let error;

      if (activeTab === 'regions') {
        const result = await supabase.from('region').delete().eq('region_id', item.region_id);
        error = result.error;
      } else if (activeTab === 'zones') {
        const result = await supabase.from('zone').delete().eq('zone_id', item.zone_id);
        error = result.error;
      } else if (activeTab === 'woredas') {
        const result = await supabase.from('woreda').delete().eq('woreda_id', item.woreda_id);
        error = result.error;
      }

      if (error) throw error;

      toast({ title: `${activeTab.slice(0, -1)} deleted successfully` });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=areas');
  };

  const getCurrentData = () => {
    if (activeTab === 'regions') return regions;
    if (activeTab === 'zones') return zones;
    return woredas;
  };

  const getParentOptions = () => {
    if (activeTab === 'zones') return regions.map(r => ({ value: r.region_id.toString(), label: r.region_name }));
    if (activeTab === 'woredas') return zones.map(z => ({ value: z.zone_id.toString(), label: z.zone_name }));
    return [];
  };

  const getParentName = (item: any) => {
    if (activeTab === 'zones') {
      const region = regions.find(r => r.region_id === item.region_id);
      return region?.region_name || '-';
    }
    if (activeTab === 'woredas') {
      const zone = zones.find(z => z.zone_id === item.zone_id);
      return zone?.zone_name || '-';
    }
    return '-';
  };

  return (
    <>
      <Helmet>
        <title>Administrative Areas | Metadata Organization</title>
        <meta name="description" content="Manage regions, zones, and woredas in the system." />
        <link rel="canonical" href="/settings/metadata/areas" />
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
        title="Administrative Areas"
        description="Manage regions, zones, and woredas"
        actions={
          <div className="flex gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingItem(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {activeTab.slice(0, -1)}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{activeTab.slice(0, -1)} Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={`Enter ${activeTab.slice(0, -1)} name`}
                      required
                    />
                  </div>
                  {activeTab !== 'regions' && (
                    <div className="space-y-2">
                      <Label htmlFor="parent_id">
                        {activeTab === 'zones' ? 'Region' : 'Zone'} *
                      </Label>
                      <Select 
                        value={formData.parent_id} 
                        onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${activeTab === 'zones' ? 'region' : 'zone'}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getParentOptions().map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingItem ? 'Update' : 'Add'} {activeTab.slice(0, -1)}
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

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button 
          variant={activeTab === 'regions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('regions')}
        >
          Regions ({regions.length})
        </Button>
        <Button 
          variant={activeTab === 'zones' ? 'default' : 'outline'}
          onClick={() => setActiveTab('zones')}
        >
          Zones ({zones.length})
        </Button>
        <Button 
          variant={activeTab === 'woredas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('woredas')}
        >
          Woredas ({woredas.length})
        </Button>
      </div>

      {/* Data List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({getCurrentData().length})
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
                  {activeTab !== 'regions' && <TableHead>{activeTab === 'zones' ? 'Region' : 'Zone'}</TableHead>}
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentData().map((item: any) => (
                  <TableRow key={item.region_id || item.zone_id || item.woreda_id}>
                    <TableCell className="font-medium">
                      {item.region_name || item.zone_name || item.woreda_name}
                    </TableCell>
                    {activeTab !== 'regions' && (
                      <TableCell>{getParentName(item)}</TableCell>
                    )}
                    <TableCell>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item)}
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
              <MapPin className="h-5 w-5" />
              {activeTab.slice(0, -1)} Details
            </DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Name</Label>
                  <p className="mt-1">
                    {viewingItem.region_name || viewingItem.zone_name || viewingItem.woreda_name}
                  </p>
                </div>
                {activeTab !== 'regions' && (
                  <div>
                    <Label className="font-medium">{activeTab === 'zones' ? 'Region' : 'Zone'}</Label>
                    <p className="mt-1">{getParentName(viewingItem)}</p>
                  </div>
                )}
                <div>
                  <Label className="font-medium">ID</Label>
                  <p className="mt-1 text-muted-foreground">
                    {viewingItem.region_id || viewingItem.zone_id || viewingItem.woreda_id}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="mt-1">
                    {viewingItem.created_at ? new Date(viewingItem.created_at).toLocaleString() : '-'}
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

export default AreasManagement;