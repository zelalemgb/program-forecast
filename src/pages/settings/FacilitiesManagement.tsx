import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Upload, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { DataTable, TableColumn, TableAction } from "@/components/ui/data-table";

interface Facility {
  facility_id: number;
  facility_name: string;
  facility_code?: string;
  facility_type?: string;
  level?: string;
  ownership_type?: string;
  latitude?: number;
  longitude?: number;
  woreda_id?: number;
  regional_hub_id?: string;
  created_at?: string;
  updated_at?: string;
  // Hierarchical data from woreda relationship
  woreda?: {
    woreda_name: string;
    zone: {
      zone_name: string;
      region: {
        region_name: string;
      };
    };
  } | null;
}

interface Woreda {
  woreda_id: number;
  woreda_name: string;
  zone_id: number;
}

interface Zone {
  zone_id: number;
  zone_name: string;
  region_id: number;
}

interface Region {
  region_id: number;
  region_name: string;
}

const FacilitiesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredZones, setFilteredZones] = useState<Zone[]>([]);
  const [filteredWoredas, setFilteredWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    facility_name: '',
    facility_code: '',
    facility_type: '',
    level: '',
    ownership_type: '',
    latitude: '',
    longitude: '',
    woreda_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load administrative data first
      const [regionsResult, zonesResult, woredasResult] = await Promise.all([
        supabase.from('region').select('region_id, region_name').order('region_name'),
        supabase.from('zone').select('zone_id, zone_name, region_id').order('zone_name'),
        supabase.from('woreda').select('woreda_id, woreda_name, zone_id').order('woreda_name')
      ]);

      if (regionsResult.data) setRegions(regionsResult.data);
      if (zonesResult.data) setZones(zonesResult.data);
      if (woredasResult.data) setWoredas(woredasResult.data);

      // Load facilities (no nested embed to avoid ambiguous relationships)
      const facilitiesResult = await supabase
        .from('facility')
        .select('*')
        .order('facility_name');

      if (facilitiesResult.data) {
        // Attach hierarchy names using the loaded admin data
        const typedFacilities = (facilitiesResult.data as any[]).map((facility) => {
          const w = woredasResult.data?.find(w => w.woreda_id === facility.woreda_id) || null;
          const z = w ? zonesResult.data?.find(z => z.zone_id === w.zone_id) || null : null;
          const r = z ? regionsResult.data?.find(r => r.region_id === z.region_id) || null : null;
          const woreda = w && z && r ? { woreda_name: w.woreda_name, zone: { zone_name: z.zone_name, region: { region_name: r.region_name } } } : null;
          return { ...facility, woreda } as Facility;
        });
        setFacilities(typedFacilities);
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load administrative data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facility_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Facility name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        facility_name: formData.facility_name.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        woreda_id: formData.woreda_id ? parseInt(formData.woreda_id) : null,
        ownership_type: formData.ownership_type as 'public' | 'private' | 'ngo' | null,
      };

      let result;
      if (editingFacility) {
        result = await supabase
          .from('facility')
          .update(payload)
          .eq('facility_id', editingFacility.facility_id);
      } else {
        result = await supabase
          .from('facility')
          .insert([payload]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Facility ${editingFacility ? 'updated' : 'created'} successfully`
      });

      resetForm();
      setIsAddModalOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save facility",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      facility_name: '',
      facility_code: '',
      facility_type: '',
      level: '',
      ownership_type: '',
      latitude: '',
      longitude: '',
      woreda_id: ''
    });
    setEditingFacility(null);
    setFilteredZones([]);
    setFilteredWoredas([]);
  };

  const handleEdit = (facility: Facility) => {
    // Find the administrative hierarchy for this facility
    const woreda = woredas.find(w => w.woreda_id === facility.woreda_id);
    const zone = woreda ? zones.find(z => z.zone_id === woreda.zone_id) : null;
    const region = zone ? regions.find(r => r.region_id === zone.region_id) : null;

    setFormData({
      facility_name: facility.facility_name,
      facility_code: facility.facility_code || '',
      facility_type: facility.facility_type || '',
      level: facility.level || '',
      ownership_type: facility.ownership_type || '',
      latitude: facility.latitude?.toString() || '',
      longitude: facility.longitude?.toString() || '',
      woreda_id: facility.woreda_id?.toString() || ''
    });

    // Set filtered options based on current selection
    if (region) {
      setFilteredZones(zones.filter(z => z.region_id === region.region_id));
    }
    if (zone) {
      setFilteredWoredas(woredas.filter(w => w.zone_id === zone.zone_id));
    }

    setEditingFacility(facility);
    setIsAddModalOpen(true);
  };

  const handleView = (facility: Facility) => {
    setViewingFacility(facility);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (facilityId: number) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('facility')
        .delete()
        .eq('facility_id', facilityId);

      if (error) throw error;

      toast({ title: "Facility deleted successfully" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete facility",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=facilities');
  };

  const handleExport = (data: Facility[]) => {
    const csvContent = [
      ['Name', 'Code', 'Type', 'Level', 'Ownership', 'Region', 'Zone', 'Woreda', 'Latitude', 'Longitude', 'Created', 'Updated'],
      ...data.map(facility => [
        facility.facility_name,
        facility.facility_code || '',
        facility.facility_type || '',
        facility.level || '',
        facility.ownership_type || '',
        facility.woreda?.zone?.region?.region_name || '',
        facility.woreda?.zone?.zone_name || '',
        facility.woreda?.woreda_name || '',
        facility.latitude?.toString() || '',
        facility.longitude?.toString() || '',
        facility.created_at ? new Date(facility.created_at).toLocaleDateString() : '',
        facility.updated_at ? new Date(facility.updated_at).toLocaleDateString() : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facilities.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLocationDisplay = (facility: Facility) => {
    const woreda = woredas.find(w => w.woreda_id === facility.woreda_id);
    const zone = woreda ? zones.find(z => z.zone_id === woreda.zone_id) : null;
    const region = zone ? regions.find(r => r.region_id === zone.region_id) : null;
    
    const parts = [];
    if (region) parts.push(region.region_name);
    if (zone) parts.push(zone.zone_name);
    if (woreda) parts.push(woreda.woreda_name);
    
    return parts.join(', ') || '-';
  };

  const columns: TableColumn<Facility>[] = [
    {
      key: 'facility_name',
      title: 'Name',
      sortable: true,
      filterable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'facility_code',
      title: 'Code',
      sortable: true,
      filterable: true,
      render: (value) => value || '-'
    },
    {
      key: 'facility_type',
      title: 'Type',
      sortable: true,
      filterable: true,
      render: (value) => value ? <Badge variant="outline">{value}</Badge> : '-'
    },
    {
      key: 'level',
      title: 'Level',
      sortable: true,
      filterable: true,
      render: (value) => value ? <Badge variant="secondary">{value}</Badge> : '-'
    },
    {
      key: 'ownership',
      title: 'Ownership',
      sortable: true,
      filterable: true,
      render: (value) => value || '-'
    },
    {
      key: 'region',
      title: 'Region',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <span className="text-sm">
          {row.woreda?.zone?.region?.region_name || '-'}
        </span>
      )
    },
    {
      key: 'zone',
      title: 'Zone',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <span className="text-sm">
          {row.woreda?.zone?.zone_name || '-'}
        </span>
      )
    },
    {
      key: 'woreda',
      title: 'Woreda',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <span className="text-sm">
          {row.woreda?.woreda_name || '-'}
        </span>
      )
    },
    {
      key: 'coordinates',
      title: 'Coordinates',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <div className="text-xs text-muted-foreground">
          {row.latitude && row.longitude 
            ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
            : '-'
          }
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      sortable: true,
      filterable: false,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ];

  const tableActions: TableAction<Facility>[] = [
    {
      label: 'View',
      onClick: (facility) => {
        setViewingFacility(facility);
        setIsViewModalOpen(true);
      },
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: 'Edit',
      onClick: (facility) => {
        setEditingFacility(facility);
        setFormData({
          facility_name: facility.facility_name,
          facility_code: facility.facility_code || '',
          facility_type: facility.facility_type || '',
          level: facility.level || '',
          ownership_type: facility.ownership_type || '',
          latitude: facility.latitude?.toString() || '',
          longitude: facility.longitude?.toString() || '',
          woreda_id: facility.woreda_id?.toString() || ''
        });
        setIsAddModalOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (facility) => handleDelete(facility.facility_id),
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive'
    }
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: async (selectedFacilities: Facility[]) => {
        if (confirm(`Are you sure you want to delete ${selectedFacilities.length} facilities?`)) {
          const ids = selectedFacilities.map(f => f.facility_id);
          const { error } = await supabase
            .from('facility')
            .delete()
            .in('facility_id', ids);

          if (error) {
            toast({
              title: "Error",
              description: "Failed to delete selected facilities",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success",
              description: `Deleted ${selectedFacilities.length} facilities`
            });
            loadData();
          }
        }
      },
      variant: 'destructive' as const
    }
  ];

  const facilityTypes = ['Hospital', 'Health Center', 'Health Post', 'Clinic', 'Pharmacy'];
  const facilityLevels = ['Primary', 'Secondary', 'Tertiary', 'Specialized'];
  const ownershipTypes = ['public', 'private', 'ngo'];

  const handleWoredaChange = (woredaId: string) => {
    setFormData({ ...formData, woreda_id: woredaId });
  };

  const actions = (
    <div className="flex gap-2">
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingFacility(null)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facility_name">Facility Name *</Label>
                      <Input
                        id="facility_name"
                        value={formData.facility_name}
                        onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                        placeholder="Enter facility name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facility_code">Facility Code</Label>
                      <Input
                        id="facility_code"
                        value={formData.facility_code}
                        onChange={(e) => setFormData({ ...formData, facility_code: e.target.value })}
                        placeholder="Enter facility code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facility_type">Facility Type</Label>
                      <Select 
                        value={formData.facility_type} 
                        onValueChange={(value) => setFormData({ ...formData, facility_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                        <SelectContent>
                          {facilityTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="level">Level</Label>
                      <Select 
                        value={formData.level} 
                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {facilityLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownership_type">Ownership Type</Label>
                      <Select 
                        value={formData.ownership_type} 
                        onValueChange={(value) => setFormData({ ...formData, ownership_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ownershipTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="woreda_id">Woreda *</Label>
                      <Select 
                        value={formData.woreda_id} 
                        onValueChange={handleWoredaChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select woreda" />
                        </SelectTrigger>
                        <SelectContent>
                          {woredas.map(woreda => (
                            <SelectItem key={woreda.woreda_id} value={woreda.woreda_id.toString()}>
                              {woreda.woreda_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        placeholder="Enter latitude"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        placeholder="Enter longitude"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      <Plus className="h-4 w-4 mr-2" />
                      {editingFacility ? 'Update' : 'Add'} Facility
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
        <title>Facilities Management | Metadata Organization</title>
        <meta name="description" content="Manage health facilities including hospitals, clinics, and health centers." />
        <link rel="canonical" href="/settings/metadata/facilities" />
      </Helmet>

      {/* Facilities List */}
      <DataTable
        data={facilities}
        columns={columns}
        loading={loading}
        actions={tableActions}
        bulkActions={bulkActions}
        searchPlaceholder="Search facilities by name, code, or type..."
        emptyState={
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No facilities found</h3>
            <p className="text-muted-foreground">Get started by adding your first facility.</p>
          </div>
        }
        customSummary={
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="outline">Total: {facilities.length}</Badge>
            <Badge variant="outline">
              Hospitals: {facilities.filter(f => f.facility_type === 'Hospital').length}
            </Badge>
            <Badge variant="outline">
              Health Centers: {facilities.filter(f => f.facility_type === 'Health Center').length}
            </Badge>
            <Badge variant="outline">
              Health Posts: {facilities.filter(f => f.facility_type === 'Health Post').length}
            </Badge>
          </div>
        }
      />

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Facility Details
            </DialogTitle>
          </DialogHeader>
          {viewingFacility && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Facility Name</Label>
                  <p className="text-sm font-medium">{viewingFacility.facility_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Facility Code</Label>
                  <p className="text-sm">{viewingFacility.facility_code || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <p className="text-sm">
                    {viewingFacility.facility_type ? (
                      <Badge variant="outline">{viewingFacility.facility_type}</Badge>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Level</Label>
                  <p className="text-sm">
                    {viewingFacility.level ? (
                      <Badge variant="secondary">{viewingFacility.level}</Badge>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Ownership</Label>
                  <p className="text-sm">{viewingFacility.ownership_type || '-'}</p>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Administrative Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Region</Label>
                    <p className="text-sm">{viewingFacility.woreda?.zone?.region?.region_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Zone</Label>
                    <p className="text-sm">{viewingFacility.woreda?.zone?.zone_name || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Woreda</Label>
                    <p className="text-sm">{viewingFacility.woreda?.woreda_name || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Geographic Coordinates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Latitude</Label>
                    <p className="text-sm">{viewingFacility.latitude?.toFixed(6) || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Longitude</Label>
                    <p className="text-sm">{viewingFacility.longitude?.toFixed(6) || '-'}</p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Facility ID</Label>
                    <p className="text-sm">{viewingFacility.facility_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                    <p className="text-sm">
                      {viewingFacility.created_at 
                        ? new Date(viewingFacility.created_at).toLocaleDateString()
                        : '-'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">
                      {viewingFacility.updated_at 
                        ? new Date(viewingFacility.updated_at).toLocaleDateString()
                        : '-'
                      }
                    </p>
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

export default FacilitiesManagement;