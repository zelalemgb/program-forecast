import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Shield, TrendingUp, ArrowLeft, Search, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  woreda?: {
    woreda_name: string;
    zone?: {
      zone_name: string;
      region?: {
        region_name: string;
      };
    };
  };
}

interface Woreda {
  woreda_id: number;
  woreda_name: string;
  zone?: {
    zone_name: string;
    region?: {
      region_name: string;
    };
  };
}

interface Zone {
  zone_id: number;
  zone_name: string;
  region?: {
    region_name: string;
  };
}

interface Region {
  region_id: number;
  region_name: string;
}

const roleOptions = [
  { value: 'facility_logistic_officer', label: 'Facility Logistic Officer', level: 'facility', description: 'Manages inventory and forecast generation, adjustment, and submission' },
  { value: 'facility_admin', label: 'Facility Admin', level: 'facility', description: 'Manages users, metadata, and system management' },
  { value: 'facility_manager', label: 'Facility Manager', level: 'facility', description: 'Approves supply requests and anything requiring approval' },
  { value: 'woreda_user', label: 'Woreda User', level: 'woreda', description: 'Manages health facilities within the woreda' },
  { value: 'zone_user', label: 'Zone User', level: 'zone', description: 'Manages woreda-level data within the zone' },
  { value: 'regional_user', label: 'Regional User', level: 'regional', description: 'Manages all zones and data within the region' },
  { value: 'national_user', label: 'National User', level: 'national', description: 'Views and manages national-level data' },
  { value: 'program_officer', label: 'Program Officer', level: 'national', description: 'Manages health program forecasts and national data access' },
];

const RoleBasedRegistration: React.FC = () => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [justification, setJustification] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Location states
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [woredas, setWoredas] = useState<Woreda[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  
  // Selected location states
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedWoreda, setSelectedWoreda] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  
  // Search and filter states
  const [facilitySearch, setFacilitySearch] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('');

  const selectedRoleInfo = roleOptions.find(r => r.value === selectedRole);

  // Load location data
  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedRoleInfo) {
      loadLocationData(selectedRoleInfo.level);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRegionFilter && selectedRegionFilter !== 'all') {
      loadZonesByRegion(parseInt(selectedRegionFilter));
    } else {
      setZones([]);
    }
  }, [selectedRegionFilter]);

  const loadRegions = async () => {
    try {
      const { data } = await supabase.from('region').select('region_id, region_name');
      setRegions(data || []);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const loadZonesByRegion = async (regionId: number) => {
    try {
      const { data } = await supabase
        .from('zone')
        .select('zone_id, zone_name')
        .eq('region_id', regionId);
      setZones(data || []);
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadLocationData = async (level: string) => {
    try {
      if (level === 'facility') {
        let query = supabase
          .from('facility')
          .select(`
            facility_id, 
            facility_name, 
            facility_type,
            woreda!inner(
              woreda_name,
              zone!inner(
                zone_name,
                region!inner(region_name)
              )
            )
          `);

        // Apply filters
        if (selectedRegionFilter && selectedRegionFilter !== 'all') {
          query = query.eq('woreda.zone.region_id', parseInt(selectedRegionFilter));
        }
        if (selectedZoneFilter && selectedZoneFilter !== 'all') {
          query = query.eq('woreda.zone_id', parseInt(selectedZoneFilter));
        }
        if (facilitySearch) {
          query = query.ilike('facility_name', `%${facilitySearch}%`);
        }

        const { data } = await query.limit(100);
        setFacilities((data as any) || []);
      } else if (level === 'woreda') {
        const { data } = await supabase
          .from('woreda')
          .select(`
            woreda_id, 
            woreda_name,
            zone(
              zone_name,
              region(region_name)
            )
          `);
        setWoredas((data as any) || []);
      } else if (level === 'zone') {
        const { data } = await supabase
          .from('zone')
          .select(`
            zone_id, 
            zone_name,
            region(region_name)
          `);
        setZones((data as any) || []);
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
    if (!selectedRole || !justification || !fullName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate location selection based on role
    if (selectedRoleInfo?.level === 'facility' && !selectedFacility) {
      toast({
        title: "Error",
        description: "Please select a facility",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoleInfo?.level === 'woreda' && !selectedWoreda) {
      toast({
        title: "Error",
        description: "Please select a woreda",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoleInfo?.level === 'zone' && !selectedZone) {
      toast({
        title: "Error",
        description: "Please select a zone",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoleInfo?.level === 'regional' && !selectedRegion) {
      toast({
        title: "Error",
        description: "Please select a region",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const { error: signUpError } = await signUp(email, password);
      if (signUpError) throw signUpError;

      // Get the user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to get user after signup');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          email: email,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the registration if profile creation fails
      }

      // Create role request
      const roleRequestData = {
        user_id: user.id,
        requested_role: selectedRole as any,
        admin_level: selectedRoleInfo?.level as any,
        justification,
        facility_id: selectedFacility ? parseInt(selectedFacility) : null,
        woreda_id: selectedWoreda ? parseInt(selectedWoreda) : null,
        zone_id: selectedZone ? parseInt(selectedZone) : null,
        region_id: selectedRegion ? parseInt(selectedRegion) : null,
      };

      const { error: requestError } = await supabase
        .from('user_role_requests')
        .insert(roleRequestData);

      if (requestError) throw requestError;

      toast({
        title: "Registration Successful",
        description: `Account created successfully! Your ${selectedRoleInfo?.label} role request has been submitted for approval. Check your email to confirm your account.`,
      });

      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationDisplay = (facility: Facility) => {
    const parts = [
      facility.woreda?.woreda_name,
      facility.woreda?.zone?.zone_name,
      facility.woreda?.zone?.region?.region_name
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Register Account | MoH Health Supply Management</title>
        <meta name="description" content="Register for access to the MoH Health Supply Management System" />
      </Helmet>

      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Registration</h1>
          <p className="text-muted-foreground">Ministry of Health - Health Supply Management System</p>
        </div>

        {/* Registration Card */}
        <Card className="surface">
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
            <p className="text-muted-foreground text-sm">
              Register for access to the health supply management system. Your role request will be reviewed by the appropriate administrator.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.name@moh.gov.et"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Role Request</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Requested Role *</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select your desired role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {roleOptions.map(role => (
                        <SelectItem key={role.value} value={role.value} className="hover:bg-muted">
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Administrative Level Selection Based on Role */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <Label className="text-blue-900 font-medium">
                      Administrative Level Assignment
                    </Label>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    Based on your selected role ({selectedRoleInfo?.label}), please specify your {selectedRoleInfo?.level}-level assignment:
                  </p>
                </div>
                {/* Facility Level Selection */}
                {selectedRoleInfo?.level === 'facility' && (
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Select Your Facility *</Label>
                    </div>
                    
                    {/* Facility Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="regionFilter" className="text-sm">Filter by Region</Label>
                        <Select value={selectedRegionFilter} onValueChange={setSelectedRegionFilter}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All regions" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            <SelectItem value="all" className="hover:bg-muted">All regions</SelectItem>
                            {regions.map(region => (
                              <SelectItem key={region.region_id} value={region.region_id.toString()} className="hover:bg-muted">
                                {region.region_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zoneFilter" className="text-sm">Filter by Zone</Label>
                        <Select value={selectedZoneFilter} onValueChange={setSelectedZoneFilter} disabled={!selectedRegionFilter || selectedRegionFilter === 'all'}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All zones" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border z-50">
                            <SelectItem value="all" className="hover:bg-muted">All zones</SelectItem>
                            {zones.map(zone => (
                              <SelectItem key={zone.zone_id} value={zone.zone_id.toString()} className="hover:bg-muted">
                                {zone.zone_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="facilitySearch" className="text-sm">Search Facility</Label>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="facilitySearch"
                            value={facilitySearch}
                            onChange={(e) => setFacilitySearch(e.target.value)}
                            placeholder="Search facilities..."
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facility" className="font-medium">Health Facility *</Label>
                      <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose the facility where you work" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50 max-h-60 overflow-auto">
                          {facilities.map(facility => (
                            <SelectItem key={facility.facility_id} value={facility.facility_id.toString()} className="hover:bg-muted">
                              <div>
                                <div className="font-medium">{facility.facility_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {facility.facility_type} • {getLocationDisplay(facility)}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the health facility where you work and will be managing operations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Woreda Level Selection */}
                {selectedRoleInfo?.level === 'woreda' && (
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Select Your Woreda *</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="woreda">Woreda (District) *</Label>
                      <Select value={selectedWoreda} onValueChange={setSelectedWoreda}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose the woreda you will manage" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {woredas.map(woreda => (
                            <SelectItem key={woreda.woreda_id} value={woreda.woreda_id.toString()} className="hover:bg-muted">
                              <div>
                                <div className="font-medium">{woreda.woreda_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {woreda.zone?.zone_name} Zone • {woreda.zone?.region?.region_name} Region
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the woreda (district) where you will oversee health facilities and manage supply operations.
                      </p>
                    </div>
                  </div>
                )}

                {/* Zone Level Selection */}
                {selectedRoleInfo?.level === 'zone' && (
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Select Your Zone *</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zone">Zone *</Label>
                      <Select value={selectedZone} onValueChange={setSelectedZone}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose the zone you will manage" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {zones.map(zone => (
                            <SelectItem key={zone.zone_id} value={zone.zone_id.toString()} className="hover:bg-muted">
                              <div>
                                <div className="font-medium">{zone.zone_name}</div>
                                <div className="text-sm text-muted-foreground">{zone.region?.region_name} Region</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the zone where you will oversee woreda-level operations and coordinate with regional authorities.
                      </p>
                    </div>
                  </div>
                )}

                {/* Regional Level Selection */}
                {selectedRoleInfo?.level === 'regional' && (
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Select Your Region *</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Choose the region you will manage" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {regions.map(region => (
                            <SelectItem key={region.region_id} value={region.region_id.toString()} className="hover:bg-muted">
                              {region.region_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the region where you will oversee all zones and coordinate with national authorities.
                      </p>
                    </div>
                  </div>
                )}

                {/* National Level Selection */}
                {selectedRoleInfo?.level === 'national' && (
                  <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="font-medium">National Level Assignment</Label>
                    </div>
                    <div className="space-y-2">
                      <Label>Country: Ethiopia 🇪🇹</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          As a {selectedRoleInfo?.label}, you will have national-level access to manage health supply operations across all regions of Ethiopia.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification *</Label>
                  <Textarea
                    id="justification"
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Please explain why you need this role and how you plan to use it..."
                    required
                    className="min-h-20"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 hero-gradient">
                {loading ? 'Creating Account...' : 'Create Account & Submit Role Request'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link to="/auth" className="text-sm text-blue-600 hover:underline">
                  Already have an account? Sign in
                </Link>
              </div>

              <div className="pt-4 border-t">
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Shield className="w-3 h-3 mr-2" />
                  Secure registration • Your request will be reviewed
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RoleBasedRegistration;
