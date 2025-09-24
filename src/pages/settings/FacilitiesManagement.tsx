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
import { Building2, Plus, Edit, Trash2, Upload, Download, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/layout/PageHeader";

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

const FacilitiesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  
  const defaultTab = searchParams.get('tab') === 'manage' ? 'manage' : 'add';

  // Form state
  const [formData, setFormData] = useState({
    facility_name: '',
    facility_code: '',
    facility_type: '',
    level: '',
    ownership: '',
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
      const [facilitiesResult, woredasResult] = await Promise.all([
        supabase.from('facility').select('*').order('facility_name'),
        supabase.from('woreda').select('woreda_id, woreda_name, zone_id').order('woreda_name')
      ]);

      if (facilitiesResult.data) setFacilities(facilitiesResult.data);
      if (woredasResult.data) setWoredas(woredasResult.data);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load facilities and woredas",
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
      woreda_id: ''
    });
    setEditingFacility(null);
  };

  const handleEdit = (facility: Facility) => {
    setFormData({
      facility_name: facility.facility_name,
      facility_code: facility.facility_code || '',
      facility_type: facility.facility_type || '',
      level: facility.level || '',
      ownership: facility.ownership || '',
      latitude: facility.latitude?.toString() || '',
      longitude: facility.longitude?.toString() || '',
      woreda_id: facility.woreda_id?.toString() || ''
    });
    setEditingFacility(facility);
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

  const facilityTypes = ['Hospital', 'Health Center', 'Health Post', 'Clinic', 'Pharmacy'];
  const facilityLevels = ['Primary', 'Secondary', 'Tertiary', 'Specialized'];
  const ownershipTypes = ['Public', 'Private', 'NGO', 'Faith-based'];

  return (
    <>
      <Helmet>
        <title>Facilities Management | Metadata Organization</title>
        <meta name="description" content="Manage health facilities including hospitals, clinics, and health centers." />
        <link rel="canonical" href="/settings/metadata/facilities" />
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
        title="Health Facilities Management"
        description="Add, edit, and manage health facilities in the system"
      />

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">Add Facility</TabsTrigger>
          <TabsTrigger value="manage">Manage Facilities</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {editingFacility ? 'Edit Facility' : 'Add New Facility'}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    <Label htmlFor="woreda_id">Woreda</Label>
                    <Select 
                      value={formData.woreda_id} 
                      onValueChange={(value) => setFormData({ ...formData, woreda_id: value })}
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
                  {editingFacility && (
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
                  <Building2 className="h-5 w-5" />
                  Facilities ({facilities.length})
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
                      <TableHead>Type</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Ownership</TableHead>
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
                          <div className="flex gap-2">
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
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Facilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Import multiple facilities from Excel or CSV files. Download the template to ensure proper formatting.
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

export default FacilitiesManagement;