import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Upload, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";

interface Facility {
  facility_id: number;
  facility_name: string;
  facility_code?: string;
  facility_type?: string;
  level?: string;
  ownership?: string;
  latitude?: number;
  longitude?: number;
  woreda_id?: number;
  created_at?: string;
  updated_at?: string;
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
    ownership: '',
    latitude: '',
    longitude: '',
    region_id: '',
    zone_id: '',
    woreda_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facilitiesResult, regionsResult, zonesResult, woredasResult] = await Promise.all([
        supabase.from('facility').select('*').order('facility_name'),
        supabase.from('region').select('region_id, region_name').order('region_name'),
        supabase.from('zone').select('zone_id, zone_name, region_id').order('zone_name'),
        supabase.from('woreda').select('woreda_id, woreda_name, zone_id').order('woreda_name')
      ]);

      if (facilitiesResult.data) setFacilities(facilitiesResult.data);
      if (regionsResult.data) setRegions(regionsResult.data);
      if (zonesResult.data) setZones(zonesResult.data);
      if (woredasResult.data) setWoredas(woredasResult.data);
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
      ownership: '',
      latitude: '',
      longitude: '',
      region_id: '',
      zone_id: '',
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
      ownership: facility.ownership || '',
      latitude: facility.latitude?.toString() || '',
      longitude: facility.longitude?.toString() || '',
      region_id: region?.region_id.toString() || '',
      zone_id: zone?.zone_id.toString() || '',
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

  const facilityTypes = ['Hospital', 'Health Center', 'Health Post', 'Clinic', 'Pharmacy'];
  const facilityLevels = ['Primary', 'Secondary', 'Tertiary', 'Specialized'];
  const ownershipTypes = ['Public', 'Private', 'NGO', 'Faith-based'];

  // Handle cascading dropdowns
  const handleRegionChange = (regionId: string) => {
    setFormData({ ...formData, region_id: regionId, zone_id: '', woreda_id: '' });
    setFilteredZones(zones.filter(z => z.region_id === parseInt(regionId)));
    setFilteredWoredas([]);
  };

  const handleZoneChange = (zoneId: string) => {
    setFormData({ ...formData, zone_id: zoneId, woreda_id: '' });
    setFilteredWoredas(woredas.filter(w => w.zone_id === parseInt(zoneId)));
  };

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
                      <Label htmlFor="ownership">Ownership</Label>
                      <Select 
                        value={formData.ownership} 
                        onValueChange={(value) => setFormData({ ...formData, ownership: value })}
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
                      <Label htmlFor="region_id">Region *</Label>
                      <Select 
                        value={formData.region_id} 
                        onValueChange={handleRegionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region.region_id} value={region.region_id.toString()}>
                              {region.region_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zone_id">Zone *</Label>
                      <Select 
                        value={formData.zone_id} 
                        onValueChange={handleZoneChange}
                        disabled={!formData.region_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredZones.map(zone => (
                            <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                              {zone.zone_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="woreda_id">Woreda *</Label>
                      <Select 
                        value={formData.woreda_id} 
                        onValueChange={handleWoredaChange}
                        disabled={!formData.zone_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select woreda" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredWoredas.map(woreda => (
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
      <Card>
        <CardContent className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Ownership</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((facility) => (
                  <TableRow key={facility.facility_id}>
                    <TableCell className="font-medium">{facility.facility_name}</TableCell>
                    <TableCell>{facility.facility_code || '-'}</TableCell>
                    <TableCell>
                      {facility.facility_type && (
                        <Badge variant="outline">{facility.facility_type}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {facility.level && (
                        <Badge variant="secondary">{facility.level}</Badge>
                      )}
                    </TableCell>
                    <TableCell>{facility.ownership || '-'}</TableCell>
                    <TableCell>
                      {(() => {
                        const woreda = woredas.find(w => w.woreda_id === facility.woreda_id);
                        const zone = woreda ? zones.find(z => z.zone_id === woreda.zone_id) : null;
                        const region = zone ? regions.find(r => r.region_id === zone.region_id) : null;
                        return (
                          <div className="text-sm">
                            {region && <div>{region.region_name}</div>}
                            {zone && <div className="text-muted-foreground">{zone.zone_name}</div>}
                            {woreda && <div className="text-muted-foreground">{woreda.woreda_name}</div>}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(facility)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(facility)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(facility.facility_id)}
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
              <Building2 className="h-5 w-5" />
              Facility Details
            </DialogTitle>
          </DialogHeader>
          {viewingFacility && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Name</Label>
                  <p className="mt-1">{viewingFacility.facility_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Code</Label>
                  <p className="mt-1">{viewingFacility.facility_code || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Type</Label>
                  <p className="mt-1">{viewingFacility.facility_type || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Level</Label>
                  <p className="mt-1">{viewingFacility.level || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Ownership</Label>
                  <p className="mt-1">{viewingFacility.ownership || '-'}</p>
                </div>
                <div>
                  <Label className="font-medium">Administrative Location</Label>
                  <div className="mt-1">
                    {(() => {
                      const woreda = woredas.find(w => w.woreda_id === viewingFacility.woreda_id);
                      const zone = woreda ? zones.find(z => z.zone_id === woreda.zone_id) : null;
                      const region = zone ? regions.find(r => r.region_id === zone.region_id) : null;
                      return (
                        <div className="space-y-1">
                          {region && <p><strong>Region:</strong> {region.region_name}</p>}
                          {zone && <p><strong>Zone:</strong> {zone.zone_name}</p>}
                          {woreda && <p><strong>Woreda:</strong> {woreda.woreda_name}</p>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                {viewingFacility.latitude && (
                  <div>
                    <Label className="font-medium">Latitude</Label>
                    <p className="mt-1">{viewingFacility.latitude}</p>
                  </div>
                )}
                {viewingFacility.longitude && (
                  <div>
                    <Label className="font-medium">Longitude</Label>
                    <p className="mt-1">{viewingFacility.longitude}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default FacilitiesManagement;