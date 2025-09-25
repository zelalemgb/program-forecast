import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSection, FormField, FormGrid } from '@/components/ui/form-section';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RoleRequestFormProps {
  onSuccess?: () => void;
}

interface Facility {
  facility_id: number;
  facility_name: string;
}

interface Woreda {
  woreda_id: number;
  woreda_name: string;
}

interface Zone {
  zone_id: number;
  zone_name: string;
}

interface Region {
  region_id: number;
  region_name: string;
}

const roleOptions = [
  { value: 'facility_logistic_officer', label: 'Facility Logistic Officer', level: 'facility' },
  { value: 'facility_admin', label: 'Facility Admin', level: 'facility' },
  { value: 'facility_manager', label: 'Facility Manager', level: 'facility' },
  { value: 'woreda_user', label: 'Woreda User', level: 'woreda' },
  { value: 'zone_user', label: 'Zone User', level: 'zone' },
  { value: 'regional_user', label: 'Regional User', level: 'regional' },
  { value: 'national_user', label: 'National User', level: 'national' },
  { value: 'program_officer', label: 'Program Officer', level: 'national' },
];

export const RoleRequestForm: React.FC<RoleRequestFormProps> = ({ onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedWoreda, setSelectedWoreda] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedRoleInfo = roleOptions.find(r => r.value === selectedRole);

  useEffect(() => {
    // Load location data based on role selection
    if (selectedRoleInfo) {
      loadLocationData(selectedRoleInfo.level);
    }
  }, [selectedRole]);

  const loadLocationData = async (level: string) => {
    try {
      if (level === 'facility') {
        const { data } = await supabase.from('facility').select('facility_id, facility_name');
        setFacilities(data || []);
      } else if (level === 'woreda') {
        const { data } = await supabase.from('woreda').select('woreda_id, woreda_name');
        setWoredas(data || []);
      } else if (level === 'zone') {
        const { data } = await supabase.from('zone').select('zone_id, zone_name');
        setZones(data || []);
      } else if (level === 'regional') {
        const { data } = await supabase.from('region').select('region_id, region_name');
        setRegions(data || []);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !justification) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const adminLevel = selectedRoleInfo?.level as any;
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const requestData = {
        user_id: user.id,
        requested_role: selectedRole as any,
        admin_level: adminLevel,
        justification,
        facility_id: selectedFacility ? parseInt(selectedFacility) : null,
        woreda_id: selectedWoreda ? parseInt(selectedWoreda) : null,
        zone_id: selectedZone ? parseInt(selectedZone) : null,
        region_id: selectedRegion ? parseInt(selectedRegion) : null,
      };

      const { error } = await supabase
        .from('user_role_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role request submitted successfully. It will be reviewed by the appropriate administrator.",
      });

      // Reset form
      setSelectedRole('');
      setJustification('');
      setSelectedFacility('');
      setSelectedWoreda('');
      setSelectedZone('');
      setSelectedRegion('');

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormSection>
        <FormGrid columns={1}>
          <FormField>
            <Label htmlFor="role">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Location selector based on role */}
          {selectedRoleInfo?.level === 'facility' && (
            <FormField>
              <Label htmlFor="facility">Facility</Label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(facility => (
                    <SelectItem key={facility.facility_id} value={facility.facility_id.toString()}>
                      {facility.facility_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {selectedRoleInfo?.level === 'woreda' && (
            <FormField>
              <Label htmlFor="woreda">Woreda</Label>
              <Select value={selectedWoreda} onValueChange={setSelectedWoreda}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a woreda" />
                </SelectTrigger>
                <SelectContent>
                  {woredas.map(woreda => (
                    <SelectItem key={woreda.woreda_id} value={woreda.woreda_id.toString()}>
                      {woreda.woreda_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {selectedRoleInfo?.level === 'zone' && (
            <FormField>
              <Label htmlFor="zone">Zone</Label>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone.zone_id} value={zone.zone_id.toString()}>
                      {zone.zone_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          {selectedRoleInfo?.level === 'regional' && (
            <FormField>
              <Label htmlFor="region">Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.region_id} value={region.region_id.toString()}>
                      {region.region_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField>
            <Label htmlFor="justification">Justification</Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Please explain why you need this role..."
              required
            />
          </FormField>
        </FormGrid>

        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </FormSection>
    </form>
  );
};