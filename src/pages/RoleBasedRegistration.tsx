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
  woreda_id?: number; // For simple facility data
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
  zone_id?: number;
  zone?: {
    zone_id?: number;
    zone_name: string;
    region?: {
      region_id?: number;
      region_name: string;
    };
  };
}

interface Zone {
  zone_id: number;
  zone_name: string;
  region_id?: number;
  region?: {
    region_id?: number;
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
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
  
  // Search and filter states for all levels
  const [facilitySearch, setFacilitySearch] = useState('');
  const [woredaSearch, setWoredaSearch] = useState('');
  const [zoneSearch, setZoneSearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  
  // Hierarchical filter states
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('');
  const [selectedWoredaFilter, setSelectedWoredaFilter] = useState('');

  const selectedRoleInfo = roleOptions.find(r => r.value === selectedRole);

  // Load location data
  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (selectedRoleInfo) {
      console.log('Role changed to:', selectedRole, 'with level:', selectedRoleInfo.level);
      // Clear previous selections when role changes
      setSelectedFacility('');
      setSelectedWoreda('');
      setSelectedZone('');
      setSelectedRegion('');
      setSelectedRegionFilter('');
      setSelectedZoneFilter('');
      setSelectedWoredaFilter('');
      setFacilitySearch('');
      setWoredaSearch('');
      setZoneSearch('');
      setRegionSearch('');
      
      loadLocationData(selectedRoleInfo.level);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRegionFilter && selectedRegionFilter !== 'all') {
      loadZonesByRegion(parseInt(selectedRegionFilter));
    } else {
      setZones([]);
      setSelectedZoneFilter('');
      setSelectedWoredaFilter('');
    }
    
    // Reload facilities when region filter changes but don't clear selection yet
    if (selectedRoleInfo?.level === 'facility') {
      loadLocationData('facility');
    }
  }, [selectedRegionFilter]);

  useEffect(() => {
    if (selectedZoneFilter && selectedZoneFilter !== 'all') {
      loadWoredasByZone(parseInt(selectedZoneFilter));
    } else {
      setWoredas([]);
      setSelectedWoredaFilter('');
    }
    
    // Reload facilities when zone filter changes but don't clear selection yet
    if (selectedRoleInfo?.level === 'facility') {
      loadLocationData('facility');
    }
  }, [selectedZoneFilter]);

  // Add effect for woreda filter changes
  useEffect(() => {
    // Reload facilities when woreda filter changes but don't clear selection yet
    if (selectedRoleInfo?.level === 'facility') {
      loadLocationData('facility');
    }
  }, [selectedWoredaFilter]);

  // Trigger data loading when search terms change
  useEffect(() => {
    if (selectedRoleInfo) {
      loadLocationData(selectedRoleInfo.level);
    }
  }, [selectedRole, facilitySearch, woredaSearch, zoneSearch, regionSearch]);

  // Clear facility selection only if the selected facility is no longer available in the filtered results
  useEffect(() => {
    if (selectedFacility && facilities.length > 0) {
      const selectedFacilityExists = facilities.some(f => f.facility_id.toString() === selectedFacility);
      if (!selectedFacilityExists) {
        console.log('Selected facility no longer available in filtered results, clearing selection');
        setSelectedFacility('');
      }
    }
  }, [facilities, selectedFacility]);

  const loadRegions = async () => {
    try {
      console.log('Loading regions...');
      const { data, error } = await supabase.from('region').select('region_id, region_name');
      if (error) {
        console.error('Error loading regions:', error);
      } else {
        console.log('Regions loaded successfully:', data?.length || 0);
      }
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

  const loadWoredasByZone = async (zoneId: number) => {
    try {
      const { data } = await supabase
        .from('woreda')
        .select('woreda_id, woreda_name')
        .eq('zone_id', zoneId);
      setWoredas(data || []);
    } catch (error) {
      console.error('Error loading woredas:', error);
    }
  };

  const loadLocationData = async (level: string) => {
    console.log('Loading location data for level:', level);
    try {
      if (level === 'facility') {
        // Load facilities without nested relationships to avoid ambiguous FK errors
        console.log('Loading facilities...');
        console.log('Current user:', (await supabase.auth.getUser()).data.user?.email || 'No user');
        console.log('Filters - Region:', selectedRegionFilter, 'Zone:', selectedZoneFilter, 'Woreda:', selectedWoredaFilter);
        
        // First load administrative data
        const [facilitiesResult, woredasResult, zonesResult, regionsResult] = await Promise.all([
          supabase.from('facility').select('facility_id, facility_name, facility_type, woreda_id').order('facility_name'),
          supabase.from('woreda').select('woreda_id, woreda_name, zone_id').order('woreda_name'),
          supabase.from('zone').select('zone_id, zone_name, region_id').order('zone_name'),
          supabase.from('region').select('region_id, region_name').order('region_name')
        ]);

        if (facilitiesResult.error) {
          console.error('Error loading facilities:', facilitiesResult.error);
          setFacilities([]);
          return;
        }

        if (facilitiesResult.data && woredasResult.data && zonesResult.data && regionsResult.data) {
          // Client-side join to build facility hierarchy
          let facilitiesWithHierarchy = facilitiesResult.data.map((facility: any) => {
            const woreda = woredasResult.data.find(w => w.woreda_id === facility.woreda_id);
            const zone = woreda ? zonesResult.data.find(z => z.zone_id === woreda.zone_id) : null;
            const region = zone ? regionsResult.data.find(r => r.region_id === zone.region_id) : null;
            
            return {
              ...facility,
              woreda: woreda ? {
                woreda_name: woreda.woreda_name,
                zone: zone ? {
                  zone_name: zone.zone_name,
                  zone_id: zone.zone_id,
                  region: region ? {
                    region_name: region.region_name,
                    region_id: region.region_id
                  } : null
                } : null
              } : null
            };
          });

          // Apply client-side filtering
          if (selectedWoredaFilter && selectedWoredaFilter !== 'all') {
            facilitiesWithHierarchy = facilitiesWithHierarchy.filter(f => 
              f.woreda_id === parseInt(selectedWoredaFilter)
            );
          } else if (selectedZoneFilter && selectedZoneFilter !== 'all') {
            facilitiesWithHierarchy = facilitiesWithHierarchy.filter(f => 
              f.woreda?.zone?.zone_id === parseInt(selectedZoneFilter)
            );
          } else if (selectedRegionFilter && selectedRegionFilter !== 'all') {
            facilitiesWithHierarchy = facilitiesWithHierarchy.filter(f => 
              f.woreda?.zone?.region?.region_id === parseInt(selectedRegionFilter)
            );
          }

          // Apply facility search filter
          if (facilitySearch) {
            facilitiesWithHierarchy = facilitiesWithHierarchy.filter(f =>
              f.facility_name.toLowerCase().includes(facilitySearch.toLowerCase())
            );
          }

          // Limit to 100 results
          facilitiesWithHierarchy = facilitiesWithHierarchy.slice(0, 100);
          
          console.log('Facilities loaded:', facilitiesWithHierarchy.length);
          console.log('Sample facilities:', facilitiesWithHierarchy.slice(0, 3));
          setFacilities(facilitiesWithHierarchy);
        } else {
          setFacilities([]);
        }
        
      } else if (level === 'woreda') {
        let query = supabase
          .from('woreda')
          .select(`
            woreda_id, 
            woreda_name,
            zone!inner(
              zone_name,
              region!inner(region_name)
            )
          `);

        // Apply hierarchical filters for woreda selection
        if (selectedRegionFilter && selectedRegionFilter !== 'all') {
          query = query.eq('zone.region_id', parseInt(selectedRegionFilter));
        }
        if (selectedZoneFilter && selectedZoneFilter !== 'all') {
          query = query.eq('zone_id', parseInt(selectedZoneFilter));
        }
        if (woredaSearch) {
          query = query.ilike('woreda_name', `%${woredaSearch}%`);
        }

        const { data } = await query.limit(100);
        setWoredas((data as any) || []);
        
      } else if (level === 'zone') {
        let query = supabase
          .from('zone')
          .select(`
            zone_id, 
            zone_name,
            region!inner(region_name)
          `);

        // Apply hierarchical filters for zone selection
        if (selectedRegionFilter && selectedRegionFilter !== 'all') {
          query = query.eq('region_id', parseInt(selectedRegionFilter));
        }
        if (zoneSearch) {
          query = query.ilike('zone_name', `%${zoneSearch}%`);
        }

        const { data } = await query.limit(100);
        setZones((data as any) || []);
        
      } else if (level === 'regional') {
        let query = supabase.from('region').select('region_id, region_name');
        
        if (regionSearch) {
          query = query.ilike('region_name', `%${regionSearch}%`);
        }
        
        const { data } = await query.limit(100);
        setRegions(data || []);
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission - selectedRole:', selectedRole, 'selectedFacility:', selectedFacility, 'facilitiesCount:', facilities.length);
    
    if (!selectedRole || !fullName || !phoneNumber) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate location selection based on role
    if (selectedRoleInfo?.level === 'facility' && !selectedFacility) {
      console.log('Facility validation failed - role level:', selectedRoleInfo?.level, 'selectedFacility:', selectedFacility);
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

    const toNumberOrNull = (value: string | null | undefined) => {
      if (!value) return null;
      const parsed = parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    setLoading(true);
    try {
      // Create user account
      const { error: signUpError, userId } = await signUp(email, password);
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        // Handle specific error cases
        if (signUpError.message?.includes('User already registered') || 
            signUpError.message?.includes('already exists')) {
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists. Please try signing in instead or use a different email address.",
            variant: "destructive",
          });
          return;
        }
        
        if (signUpError.message?.includes('Invalid email')) {
          toast({
            title: "Registration Failed", 
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
          return;
        }
        
        if (signUpError.message?.includes('Password')) {
          toast({
            title: "Registration Failed",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }
        
        throw signUpError;
      }

      // Determine created user id even if session not active yet
      let createdUserId = userId;
      if (!createdUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('Error getting user after signup:', userError);
          toast({
            title: "Registration Partially Failed",
            description: "Account created but there was an issue retrieving user information. Please check your email to confirm, then sign in.",
            variant: "destructive",
          });
          return;
        }
        createdUserId = user.id;
      }

      // Create or update profile with facility preference when available
      console.log('Creating profile for user:', createdUserId);
      const preferredFacilityId =
        selectedRoleInfo?.level === 'facility'
          ? toNumberOrNull(selectedFacility)
          : null;

      const profilePayload: Record<string, unknown> = {
        user_id: createdUserId,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
      };

      if (preferredFacilityId) {
        profilePayload.preferred_facility_id = preferredFacilityId;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: "Warning",
          description: "Account created but profile setup had issues. You can complete your profile later.",
          variant: "default",
        });
      }

      // Create role request
      console.log('Creating role request for user:', createdUserId, 'role:', selectedRole);
      console.log('Selected locations - facility:', selectedFacility, 'woreda:', selectedWoreda, 'zone:', selectedZone, 'region:', selectedRegion);

      const selectedFacilityId = toNumberOrNull(selectedFacility);
      const selectedFacilityData = selectedFacilityId
        ? facilities.find(f => f.facility_id === selectedFacilityId)
        : undefined;

      let resolvedWoredaId: number | null = null;
      let resolvedZoneId: number | null = null;
      let resolvedRegionId: number | null = null;

      if (selectedRoleInfo?.level === 'facility' && selectedFacilityData) {
        resolvedWoredaId = selectedFacilityData.woreda_id ?? null;
        resolvedZoneId = selectedFacilityData.woreda?.zone?.zone_id ?? null;
        resolvedRegionId = selectedFacilityData.woreda?.zone?.region?.region_id ?? null;
      }

      if (selectedRoleInfo?.level === 'woreda' && selectedWoreda) {
        const woredaId = toNumberOrNull(selectedWoreda);
        if (woredaId !== null) {
          resolvedWoredaId = woredaId;
          const woredaData = woredas.find(w => w.woreda_id === woredaId);
          const zoneIdFromWoreda = woredaData?.zone_id ?? woredaData?.zone?.zone_id;
          if (zoneIdFromWoreda) {
            resolvedZoneId = zoneIdFromWoreda;
            const zoneData = zones.find(z => z.zone_id === zoneIdFromWoreda);
            const regionIdFromZone = zoneData?.region_id ?? zoneData?.region?.region_id;
            if (regionIdFromZone) {
              resolvedRegionId = regionIdFromZone;
            }
          }
        }
      }

      if (selectedRoleInfo?.level === 'zone' && selectedZone) {
        const zoneId = toNumberOrNull(selectedZone);
        if (zoneId !== null) {
          resolvedZoneId = zoneId;
          const zoneData = zones.find(z => z.zone_id === zoneId);
          const regionIdFromZone = zoneData?.region_id ?? zoneData?.region?.region_id;
          if (regionIdFromZone) {
            resolvedRegionId = regionIdFromZone;
          }
        }
      }

      if (selectedRoleInfo?.level === 'regional' && selectedRegion) {
        resolvedRegionId = toNumberOrNull(selectedRegion);
      }

      if (selectedRoleInfo?.level === 'national') {
        resolvedWoredaId = null;
        resolvedZoneId = null;
        resolvedRegionId = null;
      }

      // Allow explicit selections to override derived values when provided
      const overrideWoredaId = toNumberOrNull(selectedWoreda);
      if (overrideWoredaId !== null) {
        resolvedWoredaId = overrideWoredaId;
      }
      const overrideZoneId = toNumberOrNull(selectedZone);
      if (overrideZoneId !== null) {
        resolvedZoneId = overrideZoneId;
      }
      const overrideRegionId = toNumberOrNull(selectedRegion);
      if (overrideRegionId !== null) {
        resolvedRegionId = overrideRegionId;
      }

      const roleRequestData = {
        user_id: createdUserId,
        requested_role: selectedRole as any,
        admin_level: selectedRoleInfo?.level as any,
        facility_id: selectedRoleInfo?.level === 'facility' ? selectedFacilityId : null,
        woreda_id: resolvedWoredaId,
        zone_id: resolvedZoneId,
        region_id: resolvedRegionId,
      };

      console.log('Role request data being submitted:', roleRequestData);

      const { error: requestError } = await supabase
        .from('user_role_requests')
        .insert(roleRequestData);

      if (requestError) {
        console.error('Role request creation error:', requestError);
        toast({
          title: "Registration Partially Failed",
          description: "Account created but role request failed. Please contact an administrator or try requesting a role from your profile.",
          variant: "destructive",
        });
        return;
      }

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
    // Handle both enriched and simple facility data
    if (facility.woreda) {
      const parts = [
        facility.woreda.woreda_name,
        facility.woreda.zone?.zone_name,
        facility.woreda.zone?.region?.region_name
      ].filter(Boolean);
      return parts.join(', ');
    }
    
    // Fallback for simple facility data
    return facility.woreda_id ? `Woreda ID: ${facility.woreda_id}` : 'Location not specified';
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
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+251-9-12345678"
                      required
                    />
                  </div>
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
                    
                    {/* Hierarchical Filters for Facility */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="regionFilter" className="text-sm">Filter by Region</Label>
                        <Select value={selectedRegionFilter} onValueChange={setSelectedRegionFilter}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All regions" />
                          </SelectTrigger>
                           <SelectContent className="bg-background border z-[60] shadow-lg">
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
                           <SelectContent className="bg-background border z-[60] shadow-lg">
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
                        <Label htmlFor="woredaFilter" className="text-sm">Filter by Woreda</Label>
                        <Select value={selectedWoredaFilter} onValueChange={setSelectedWoredaFilter} disabled={!selectedZoneFilter || selectedZoneFilter === 'all'}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All woredas" />
                          </SelectTrigger>
                           <SelectContent className="bg-background border z-[60] shadow-lg">
                            <SelectItem value="all" className="hover:bg-muted">All woredas</SelectItem>
                            {woredas.map(woreda => (
                              <SelectItem key={woreda.woreda_id} value={woreda.woreda_id.toString()} className="hover:bg-muted">
                                {woreda.woreda_name}
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="facility" className="font-medium">Health Facility *</Label>
                        <Badge variant="secondary" className="text-xs">
                          {facilities.length} facilities available
                        </Badge>
                      </div>
                        <Select value={selectedFacility} onValueChange={(value) => {
                          setSelectedFacility(value);
                          if (value) {
                            const selectedFacilityData = facilities.find(f => f.facility_id.toString() === value);
                            console.log('Facility selected:', selectedFacilityData?.facility_name, 'ID:', value);
                          }
                        }}>
                          <SelectTrigger className={`bg-background border ${selectedFacility ? 'border-green-500 bg-green-50' : ''}`}>
                            <SelectValue placeholder="Choose the facility where you work" />
                          </SelectTrigger>
                         <SelectContent className="bg-background border z-[70] max-h-60 overflow-auto shadow-lg">
                           {facilities.length === 0 ? (
                             <SelectItem value="no-facilities" disabled className="text-muted-foreground bg-background">
                               {selectedRegionFilter || selectedZoneFilter || selectedWoredaFilter || facilitySearch 
                                 ? "No facilities found matching your filters. Try adjusting the filters above." 
                                 : "No facilities found. Loading..."}
                             </SelectItem>
                           ) : (
                             facilities.map(facility => (
                               <SelectItem key={facility.facility_id} value={facility.facility_id.toString()} className="hover:bg-muted bg-background">
                                 <div>
                                   <div className="font-medium">{facility.facility_name}</div>
                                   <div className="text-sm text-muted-foreground">
                                     {facility.facility_type} • {getLocationDisplay(facility)}
                                   </div>
                                 </div>
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                       <p className="text-xs text-muted-foreground">
                         Select the health facility where you work and will be managing operations.
                       </p>
                       {selectedFacility && (
                         <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                           <p className="text-sm text-green-700 font-medium">
                             ✓ Facility selected: {facilities.find(f => f.facility_id.toString() === selectedFacility)?.facility_name}
                           </p>
                         </div>
                       )}
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
                    
                    {/* Hierarchical Filters for Woreda */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="regionFilterWoreda" className="text-sm">Filter by Region</Label>
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
                        <Label htmlFor="zoneFilterWoreda" className="text-sm">Filter by Zone</Label>
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
                        <Label htmlFor="woredaSearch" className="text-sm">Search Woreda</Label>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="woredaSearch"
                            value={woredaSearch}
                            onChange={(e) => setWoredaSearch(e.target.value)}
                            placeholder="Search woredas..."
                            className="pl-10"
                          />
                        </div>
                      </div>
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
                    
                    {/* Hierarchical Filters for Zone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="regionFilterZone" className="text-sm">Filter by Region</Label>
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
                        <Label htmlFor="zoneSearch" className="text-sm">Search Zone</Label>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="zoneSearch"
                            value={zoneSearch}
                            onChange={(e) => setZoneSearch(e.target.value)}
                            placeholder="Search zones..."
                            className="pl-10"
                          />
                        </div>
                      </div>
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
                    
                    {/* Search for Region */}
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="regionSearch" className="text-sm">Search Region</Label>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="regionSearch"
                            value={regionSearch}
                            onChange={(e) => setRegionSearch(e.target.value)}
                            placeholder="Search regions..."
                            className="pl-10"
                          />
                        </div>
                      </div>
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
