import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { supabase } from "@/integrations/supabase/client";

interface RegionalHub {
  id: string;
  hub_code: string;
  hub_name: string;
  region_id: number | null;
  contact_person: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  active_status: boolean;
  created_at: string;
  updated_at: string;
  region?: {
    region_name: string;
  };
}

interface Region {
  region_id: number;
  region_name: string;
}

const RegionalHubsManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [hubs, setHubs] = useState<RegionalHub[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHub, setSelectedHub] = useState<RegionalHub | null>(null);
  const [formData, setFormData] = useState({
    hub_code: "",
    hub_name: "",
    region_id: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch regional hubs with region information
      const { data: hubsData, error: hubsError } = await supabase
        .from('epss_regional_hubs')
        .select(`
          *,
          region:region_id (
            region_name
          )
        `)
        .order('hub_code');

      if (hubsError) throw hubsError;

      // Fetch regions for dropdown
      const { data: regionsData, error: regionsError } = await supabase
        .from('region')
        .select('region_id, region_name')
        .order('region_name');

      if (regionsError) throw regionsError;

      setHubs(hubsData || []);
      setRegions(regionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hub_code: "",
      hub_name: "",
      region_id: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      address: "",
      latitude: "",
      longitude: ""
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleEdit = (hub: RegionalHub) => {
    setSelectedHub(hub);
    setFormData({
      hub_code: hub.hub_code,
      hub_name: hub.hub_name,
      region_id: hub.region_id?.toString() || "",
      contact_person: hub.contact_person || "",
      contact_phone: hub.contact_phone || "",
      contact_email: hub.contact_email || "",
      address: hub.address || "",
      latitude: hub.latitude?.toString() || "",
      longitude: hub.longitude?.toString() || ""
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const hubData = {
        hub_code: formData.hub_code,
        hub_name: formData.hub_name,
        region_id: formData.region_id ? parseInt(formData.region_id) : null,
        contact_person: formData.contact_person || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        address: formData.address || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (selectedHub) {
        // Update existing hub
        const { error } = await supabase
          .from('epss_regional_hubs')
          .update(hubData)
          .eq('id', selectedHub.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Regional hub updated successfully"
        });
      } else {
        // Create new hub
        const { error } = await supabase
          .from('epss_regional_hubs')
          .insert([hubData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Regional hub created successfully"
        });
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedHub(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save regional hub",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (hub: RegionalHub) => {
    if (!confirm(`Are you sure you want to delete ${hub.hub_name}?`)) return;

    try {
      const { error } = await supabase
        .from('epss_regional_hubs')
        .delete()
        .eq('id', hub.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Regional hub deleted successfully"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete regional hub",
        variant: "destructive"
      });
    }
  };

  const handleBulkImport = () => {
    navigate('/settings/metadata/bulk-import?type=regional_hubs');
  };

  const filteredHubs = hubs.filter(hub =>
    hub.hub_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.hub_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hub.region?.region_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const HubFormModal = ({ isOpen, onClose, title }: { isOpen: boolean; onClose: () => void; title: string }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hub_code">Hub Code *</Label>
            <Input
              id="hub_code"
              value={formData.hub_code}
              onChange={(e) => setFormData({...formData, hub_code: e.target.value})}
              placeholder="EPSS-XXX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hub_name">Hub Name *</Label>
            <Input
              id="hub_name"
              value={formData.hub_name}
              onChange={(e) => setFormData({...formData, hub_name: e.target.value})}
              placeholder="Regional Hub Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region_id">Region</Label>
            <Select
              value={formData.region_id}
              onValueChange={(value) => setFormData({...formData, region_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No region</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region.region_id} value={region.region_id.toString()}>
                    {region.region_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              placeholder="Dr. John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              placeholder="+251-11-123-4567"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
              placeholder="contact@epss.gov.et"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Full address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({...formData, latitude: e.target.value})}
              placeholder="9.0320"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({...formData, longitude: e.target.value})}
              placeholder="38.7469"
            />
          </div>
        </div>
        
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.hub_code || !formData.hub_name}
          >
            Save Hub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageLayout>
      <Helmet>
        <title>EPSS Regional Hubs | Metadata Organization</title>
        <meta name="description" content="Manage EPSS regional distribution hubs and their configurations" />
        <link rel="canonical" href="/settings/metadata/regional-hubs" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">EPSS Regional Hubs</h1>
            <p className="text-muted-foreground">Manage regional distribution hubs serving health facilities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Regional Hub
            </Button>
            <Button variant="outline" onClick={handleBulkImport}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search hubs by name, code, or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Hubs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Regional Hubs ({filteredHubs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading regional hubs...</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hub Code</TableHead>
                      <TableHead>Hub Name</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHubs.map((hub) => (
                      <TableRow key={hub.id}>
                        <TableCell className="font-medium">{hub.hub_code}</TableCell>
                        <TableCell>{hub.hub_name}</TableCell>
                        <TableCell>{hub.region?.region_name || "Not specified"}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {hub.contact_person && (
                              <div className="text-sm">{hub.contact_person}</div>
                            )}
                            {hub.contact_phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {hub.contact_phone}
                              </div>
                            )}
                            {hub.contact_email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {hub.contact_email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hub.address && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {hub.address}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hub.active_status ? "default" : "secondary"}>
                            {hub.active_status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(hub)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(hub)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredHubs.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No regional hubs found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modals */}
      <HubFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Regional Hub"
      />
      
      <HubFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Regional Hub"
      />
    </PageLayout>
  );
};

export default RegionalHubsManagement;